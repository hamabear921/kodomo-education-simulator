const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const context=vm.createContext({window:{},console});
for(const file of ['assumptions.js','simulator.js'])vm.runInContext(fs.readFileSync(file,'utf8'),context,{filename:file});
const assumptions=context.window.EducationAssumptions;
const simulator=context.window.EducationSimulator;
const {presets,educationCosts,UNIVERSITY_AWAY_ANNUAL}=assumptions;
const {clone,createChild,defaults,matchingPreset,schoolRecords,calculate,migrate}=simulator;
const plain=value=>JSON.parse(JSON.stringify(value));

function modelAtCurrentPrices(){const model=defaults();model.common.inflation=0;model.benefits.highSupport=false;return model}
function record(model,child,stage,grade){return schoolRecords(model,child,0).find(item=>item.stage===stage&&item.grade===grade)}

const expectedPresets={
  allPublic:{el:'public',j:'public',h:'public'},
  highPrivate:{el:'public',j:'public',h:'private'},
  middlePrivate:{el:'public',j:'private',h:'private'},
  allPrivate:{el:'private',j:'private',h:'private'}
};
for(const [key,paths] of Object.entries(expectedPresets)){
  assert.deepEqual(plain(presets[key].paths),paths);
  assert.equal(matchingPreset(paths),key);
}
assert.equal(matchingPreset({el:'private',j:'public',h:'private'}),null);

{
  const fresh=defaults();
  assert.equal(fresh.children.length,1);assert.equal(fresh.children[0].birth,'');
  assert.equal(fresh.setupComplete,false);assert.equal(fresh.setupStep,0);
  fresh.setupStep=2;
  const draft=migrate(fresh);
  assert.equal(draft.setupComplete,false);assert.equal(draft.setupStep,2);assert.equal(draft.children[0].birth,'');
  const legacy=defaults();legacy.children[0].birth='2023-12-01';legacy.page='investment';delete legacy.setupComplete;delete legacy.setupStep;
  const migratedLegacy=migrate(legacy);
  assert.equal(migratedLegacy.setupComplete,true);assert.equal(migratedLegacy.page,'dashboard');
}

{
  const model=modelAtCurrentPrices();model.children.push(createChild('2026-09-01','お子さま 2'));
  const first=model.children[0],second=clone(model.children[1]);
  first.paths.u='privateScience';first.paths.home='away';first.paths.years=6;
  Object.assign(first.paths,presets.highPrivate.paths);
  assert.deepEqual({el:first.paths.el,j:first.paths.j,h:first.paths.h},expectedPresets.highPrivate);
  assert.deepEqual({u:first.paths.u,home:first.paths.home,years:first.paths.years},{u:'privateScience',home:'away',years:6});
  assert.deepEqual(plain(model.children[1]),plain(second));
}

const normalCram={
  el:{public:[40000,40000,40000,100000,100000,155000],private:[170000,170000,170000,340000,340000,470000]},
  j:{public:[140000,225000,360000],private:[160000,160000,215000]},
  h:{public:[95000,160000,220000],private:[115000,190000,230000]}
};
for(const [stage,schools] of Object.entries(normalCram))for(const [school,amounts] of Object.entries(schools)){
  const model=modelAtCurrentPrices(),child=model.children[0];child.paths[stage]=school;
  assert.deepEqual(amounts.map((_,i)=>record(model,child,stage,i+1).cram),amounts);
}

{
  const model=modelAtCurrentPrices(),child=model.children[0];
  child.examModes={middle:true,high:true,university:true};
  assert.deepEqual([1,2,3,4,5,6].map(grade=>record(model,child,'el',grade).cram),[40000,40000,40000,600000,800000,1300000]);
  assert.deepEqual([1,2,3].map(grade=>record(model,child,'j',grade).cram),[300000,400000,550000]);
  assert.deepEqual([1,2,3].map(grade=>record(model,child,'h',grade).cram),[500000,600000,900000]);
  const middle3=record(model,child,'j',3);
  assert.equal(middle3.tuition+middle3.cram+middle3.lesson+middle3.other,810000);
}

for(const [stage,schools] of Object.entries(educationCosts))for(const [school,cost] of Object.entries(schools)){
  const model=modelAtCurrentPrices(),child=model.children[0];child.paths[stage]=school;
  const first=record(model,child,stage,1),second=record(model,child,stage,2);
  assert.equal(first.tuition,cost.annual);assert.equal(first.entry,cost.entry);
  assert.equal(first.lesson,cost.lesson);assert.equal(first.other,cost.other);
  assert.equal(second.entry,0);
}

{
  const model=modelAtCurrentPrices(),child=model.children[0];child.paths.home='away';
  assert.equal(record(model,child,'u',1).other,educationCosts.u.national.other+UNIVERSITY_AWAY_ANNUAL);
  child.paths.home='home';
  assert.equal(record(model,child,'u',1).other,educationCosts.u.national.other);
}

{
  const model=defaults(),child=model.children[0],first=record(model,child,'el',1);
  const years=first.year-assumptions.CURRENT_YEAR;
  assert.equal(first.tuition,Math.round(educationCosts.el.public.annual*1.02**years));
  assert.equal(model.common.inflation,2);
}

{
  const model=modelAtCurrentPrices(),result=calculate(model);
  assert.equal(result.totals.gross,result.records.reduce((sum,item)=>sum+item.tuition+item.entry+item.cram+item.lesson+item.other,0));
  assert.ok(result.annual.length>0);assert.equal(result.funds.length,model.children.length);
}

{
  const saved=defaults();saved.version=7;saved.common.preset='standard';saved.children[0].paths.u='privateHuman';saved.children[0].overrides.el0={cram:123456};
  const migrated=migrate(saved);
  assert.equal(migrated.version,8);assert.equal(migrated.common.preset,undefined);
  assert.equal(migrated.children[0].paths.u,'privateHuman');assert.equal(migrated.children[0].overrides.el0.cram,123456);
  assert.deepEqual(plain(migrated.children[0].examModes),{middle:false,high:false,university:false});
}

function renderApp(saved){
  const appElement={innerHTML:'',querySelector:()=>null,querySelectorAll:()=>[]};
  const dialog={open:false,showModal(){this.open=true},close(){this.open=false}};
  const listeners={},document={getElementById:()=>appElement,addEventListener:(type,handler)=>(listeners[type]??=[]).push(handler),querySelector:selector=>selector==='[data-cost-preset-dialog]'?dialog:null,querySelectorAll:()=>[]};
  let persisted=saved?plain(saved):null;
  const localStorage={getItem:()=>persisted?JSON.stringify(persisted):null,setItem:(_,value)=>{persisted=JSON.parse(value)}};
  const browserContext=vm.createContext({window:{innerWidth:1920},document,localStorage,Intl,console,Blob:global.Blob,URL:global.URL,confirm:()=>true});
  for(const file of ['assumptions.js','simulator.js','app.js'])vm.runInContext(fs.readFileSync(file,'utf8'),browserContext,{filename:file});
  return {
    get html(){return appElement.innerHTML},
    get state(){return persisted},
    get dialogOpen(){return dialog.open},
    click(dataset){const target={dataset,closest:selector=>selector.includes('[data-action]')?target:null};for(const handler of listeners.click||[])handler({target,clientX:0,clientY:0})},
    change(dataset,value,type='select-one',checked=false){const target={dataset,value,type,checked,matches:()=>false};for(const handler of listeners.change||[])handler({target})}
  };
}

{
  const app=renderApp(defaults());app.click({action:'setup-next'});
  assert.equal(app.state.setupStep,0);assert.equal(app.state.setupComplete,false);
  assert.ok(app.html.includes('生年月日を選択してください。'));
  const invalid=defaults();invalid.setupStep=2;invalid.children[0].birth='2023-12-01';invalid.children[0].investment.base=-1000;
  const finish=renderApp(invalid);finish.click({action:'setup-next'});
  assert.equal(finish.state.setupComplete,false);
  assert.ok(finish.html.includes('月額は0〜100万円で入力してください。'));
}

{
  const educationModel=defaults();educationModel.setupComplete=true;educationModel.children[0].birth='2023-12-01';educationModel.children.push(createChild('2026-09-01','お子さま 2'));
  educationModel.children[0].paths.u='privateScience';educationModel.children[0].paths.home='away';educationModel.children[0].paths.years=6;
  const app=renderApp(educationModel);app.click({page:'education'});const html=app.html;
  for(const label of ['小中高 公立','高校から私立','中学から私立','小学校から私立','中学受験','高校受験','大学受験','年間学校費'])assert.ok(html.includes(label),label);
  assert.ok(html.includes('data-preset="allPublic"'));
  assert.ok(html.includes('data-child-bind="0.examModes.middle"'));
  assert.ok(html.includes('data-action="show-cost-presets"'));
  assert.ok(html.includes('教育費の基準額'));
  for(const amount of ['9.5万円','97万円','13.5万円','101.8万円','33.3万円','75.2万円','53.6万円','99.2万円','135.7万円','120万円'])assert.ok(html.includes(amount));
  for(const total of ['223.1万円','1,055.4万円','165.5万円','471.3万円','182.2万円','357.2万円','282.5万円','293.4万円','458.8万円','607.3万円'])assert.ok(html.includes(total));
  assert.ok(html.includes('<th>小学校</th><td>公立</td><td class="preset-total-cell">'));
  assert.ok(html.includes('修業期間の総額'));
  assert.ok(!html.includes('cost-total-grid'));
  for(const source of ['令和5年度 子供の学習費調査','公立大学基礎データ','私立大学等の学生納付金等調査','学生生活調査','計画用プリセット'])assert.ok(html.includes(source));
  assert.ok(html.includes('受験を選ぶと、その期間の塾費へ置き換えます。'));
  assert.ok(!html.includes('受験モード'));
  for(const years of ['6年間','3年間','4年間'])assert.ok(html.includes(years));
  app.click({action:'show-cost-presets'});assert.equal(app.dialogOpen,true);
  app.click({action:'close-cost-presets'});assert.equal(app.dialogOpen,false);
  const beforeSecond=plain(app.state.children[1]);
  app.click({action:'preset',preset:'allPrivate'});
  assert.deepEqual({el:app.state.children[0].paths.el,j:app.state.children[0].paths.j,h:app.state.children[0].paths.h},expectedPresets.allPrivate);
  assert.deepEqual({u:app.state.children[0].paths.u,home:app.state.children[0].paths.home,years:app.state.children[0].paths.years},{u:'privateScience',home:'away',years:6});
  assert.deepEqual(app.state.children[1],beforeSecond);
  assert.match(app.html,/class="active" data-action="preset" data-preset="allPrivate"/);
  app.change({childBind:'0.paths.j'},'public');
  assert.doesNotMatch(app.html,/class="active" data-action="preset"/);
  app.change({childBind:'0.paths.el'},'public');
  assert.match(app.html,/class="active" data-action="preset" data-preset="highPrivate"/);
  app.change({childBind:'0.examModes.high'},'', 'checkbox',true);
  assert.equal(app.state.children[0].examModes.high,true);
}

{
  const model=defaults();model.setupComplete=true;model.children[0].birth='2023-12-01';
  const html=renderApp(model).html;
  assert.ok(html.includes('class="trend-chart"'));
  assert.ok(html.includes('年ごとの内訳'));
  assert.ok(html.includes('大学入学前の準備見込み'));
}

console.log('教育費プリセット・進路・受験期の塾費・CF計算のテストに合格しました。');
