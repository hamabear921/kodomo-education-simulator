(()=>{
  'use strict';
  const CURRENT_YEAR=2026,NISA_START=2027,NISA_ANNUAL_LIMIT=600000,NISA_LIFETIME_LIMIT=6000000;
  const UNIVERSITY_AWAY_ANNUAL=1200000;
  const stageNames={el:'小学校',j:'中学校',h:'高校',u:'大学'},stageShort={el:'小',j:'中',h:'高',u:'大'};
  const schoolChoices={el:[['public','公立'],['private','私立']],j:[['public','公立'],['private','私立']],h:[['public','公立'],['private','私立']],u:[['national','国立'],['public','公立'],['privateHuman','私立・文系'],['privateScience','私立・理系']]};
  const presets={
    allPublic:{label:'小中高 公立',paths:{el:'public',j:'public',h:'public'}},
    highPrivate:{label:'高校から私立',paths:{el:'public',j:'public',h:'private'}},
    middlePrivate:{label:'中学から私立',paths:{el:'public',j:'private',h:'private'}},
    allPrivate:{label:'小学校から私立',paths:{el:'private',j:'private',h:'private'}}
  };
  const educationCosts={
    el:{
      public:{annual:95000,entry:100000,cram:[40000,40000,40000,100000,100000,155000],lesson:144000,other:37000},
      private:{annual:970000,entry:374000,cram:[170000,170000,170000,340000,340000,470000],lesson:343000,other:107000}
    },
    j:{
      public:{annual:135000,entry:150000,cram:[140000,225000,360000],lesson:84000,other:41000},
      private:{annual:1018000,entry:359000,cram:[160000,160000,215000],lesson:186000,other:69000}
    },
    h:{
      public:{annual:333000,entry:54000,cram:[95000,160000,220000],lesson:44000,other:54000},
      private:{annual:752000,entry:241000,cram:[115000,190000,230000],lesson:108000,other:72000}
    },
    u:{
      national:{annual:535800,entry:282000,cram:[0],lesson:0,other:100000},
      public:{annual:536000,entry:390000,cram:[0],lesson:0,other:100000},
      privateHuman:{annual:992000,entry:220000,cram:[0],lesson:0,other:100000},
      privateScience:{annual:1357000,entry:245000,cram:[0],lesson:0,other:100000}
    }
  };
  const examCram={
    middle:{stage:'el',grades:{4:600000,5:800000,6:1300000}},
    high:{stage:'j',grades:{1:300000,2:400000,3:550000}},
    university:{stage:'h',grades:{1:500000,2:600000,3:900000}}
  };
  const sources={
    childNisa:'https://www.fsa.go.jp/access/r7/270.html',
    childAllowance:'https://www.cfa.go.jp/policies/kokoseido/jidouteate/mottoouen',
    universitySupport:'https://www.mext.go.jp/kyufu/qa/index.html',
    educationK12:'https://www.mext.go.jp/b_menu/toukei/chousa03/gakushuuhi/kekka/k_detail/mext_00002.html',
    educationK12Data:'https://www.e-stat.go.jp/statistics/00400201',
    publicUniversityFees:'https://www.mext.go.jp/a_menu/koutou/kouritsu/detail/1284429.htm',
    privateUniversityFees:'https://www.mext.go.jp/a_menu/koutou/shinkou/mext_02654.html',
    studentLivingCosts:'https://www.jasso.go.jp/statistics/gakusei_chosa/index.html'
  };
  window.EducationAssumptions={CURRENT_YEAR,NISA_START,NISA_ANNUAL_LIMIT,NISA_LIFETIME_LIMIT,UNIVERSITY_AWAY_ANNUAL,stageNames,stageShort,schoolChoices,presets,educationCosts,examCram,sources};
})();
