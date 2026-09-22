(()=>{
  'use strict';
    const CURRENT_YEAR=2026,NISA_START=2027,NISA_ANNUAL_LIMIT=600000,NISA_LIFETIME_LIMIT=6000000;
    const stageNames={el:'小学校',j:'中学校',h:'高校',u:'大学'},stageShort={el:'小',j:'中',h:'高',u:'大'};
    const schoolChoices={el:[['public','公立'],['private','私立']],j:[['public','公立'],['private','私立']],h:[['public','公立'],['private','私立']],u:[['national','国立'],['public','公立'],['privateHuman','私立・文系'],['privateScience','私立・理系']]};
    const tuition={el:{public:100000,private:1200000},j:{public:150000,private:900000},h:{public:118800,private:457200},u:{national:535800,public:536000,privateHuman:827000,privateScience:1130000}};
    const entry={el:{public:30000,private:200000},j:{public:0,private:180000},h:{public:0,private:200000},u:{national:282000,public:390000,privateHuman:227000,privateScience:250000}};
    const presets={standard:{label:'公立中心',paths:{el:'public',j:'public',h:'public'}},highPrivate:{label:'高校から私立',paths:{el:'public',j:'public',h:'private'}},middlePrivate:{label:'中学から私立',paths:{el:'public',j:'private',h:'private'}}};
    const educationExtras={el:{cram:80000,lesson:120000,other:60000},j:{cram:240000,lesson:0,other:70000},h:{cram:180000,lesson:0,other:80000},u:{cram:0,lesson:0,other:100000}};
    const sources={childNisa:'https://www.fsa.go.jp/access/r7/270.html',childAllowance:'https://www.cfa.go.jp/policies/kokoseido/jidouteate/mottoouen',universitySupport:'https://www.mext.go.jp/kyufu/qa/index.html'};
    window.EducationAssumptions={CURRENT_YEAR,NISA_START,NISA_ANNUAL_LIMIT,NISA_LIFETIME_LIMIT,stageNames,stageShort,schoolChoices,tuition,entry,presets,educationExtras,sources};
  })();
