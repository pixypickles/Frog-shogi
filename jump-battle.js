(() => {
  const screens = {
    title: document.getElementById('titleScreen'),
    select: document.getElementById('selectScreen'),
    game: document.getElementById('gameScreen')
  };
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const playerHpEl = document.getElementById('playerHp');
  const enemyHpEl = document.getElementById('enemyHp');
  const comboEl = document.getElementById('comboText');
  const restartButton = document.getElementById('restartButton');
  const titleReturnButton=document.getElementById('titleReturnButton');
  const beelzebubCard=document.getElementById('beelzebubCard');
  const beelzebubOpponent=document.getElementById('beelzebubOpponent');
  const bossTeaser=document.getElementById('bossTeaser');
  const samaelCard=document.querySelector('#selectScreen .fighter-card[data-fighter="samael"]');
  const seraphielCard=document.querySelector('#selectScreen .fighter-card[data-fighter="seraphiel"]');
  const satanaelCard=document.querySelector('#selectScreen .fighter-card[data-fighter="satanael"]');
  let kawazuCard=document.getElementById('kawazuCard');
  let kawazuOpponent=document.getElementById('kawazuOpponent');
  const storyNarrative=document.getElementById('storyNarrative');
  const storyNarrativeText=document.getElementById('storyNarrativeText');
  const storyNarrativeNext=document.getElementById('storyNarrativeNext');
  const pauseButton=document.getElementById('pauseButton');
  const pauseOverlay=document.getElementById('pauseOverlay');
  const pauseFighterName=document.getElementById('pauseFighterName');
  const pauseMoveList=document.getElementById('pauseMoveList');
  const resumeButton=document.getElementById('resumeButton');
  const practiceHelp=document.getElementById('practiceHelp');
  const practiceSpecialTitle=document.getElementById('practiceSpecialTitle');
  const practiceSpecialMoves=document.getElementById('practiceSpecialMoves');
  const practiceExitButton = document.getElementById('practiceExitButton');
  const leafMiniHud=document.getElementById('leafMiniHud');
  const leafMiniTimeEl=document.getElementById('leafMiniTime');
  const leafMiniScoreEl=document.getElementById('leafMiniScore');
  const guardMiniHud=document.getElementById('guardMiniHud');
  const guardMiniTimeEl=document.getElementById('guardMiniTime');
  const guardMiniScoreEl=document.getElementById('guardMiniScore');
  const guardMiniMissEl=document.getElementById('guardMiniMiss');
  const raceMiniHud=document.getElementById('raceMiniHud');
  const raceMiniTimeEl=document.getElementById('raceMiniTime');
  const raceMiniBestEl=document.getElementById('raceMiniBest');
  const basketMiniHud=document.getElementById('basketMiniHud');
  const basketPlayerScoreEl=document.getElementById('basketPlayerScore');
  const basketEnemyScoreEl=document.getElementById('basketEnemyScore');
  const basketTimeEl=document.getElementById('basketTime');
  const opponentSelect=document.getElementById('opponentSelect');
  const storyHud=document.getElementById('storyHud');
  const difficultyButtons=[...document.querySelectorAll('.difficulty-btn')];

  let selectedFighter = 'green';
  let selectedOpponent = 'blue';
  // MIX戦闘連携
  const mixBattleMode=new URLSearchParams(location.search).get('mix')==='1' && new URLSearchParams(location.search).get('battle')==='1';
  const mixPracticeParams=new URLSearchParams(location.search);
  const mixPracticeMode=mixPracticeParams.get('mixpractice')==='1';
  const mixPracticeFighter=mixPracticeParams.get('fighter')||'green';
  let mixBattleContext=null;
  try{ if(mixBattleMode) mixBattleContext=JSON.parse(sessionStorage.getItem('mixBattle')||'null'); }catch(e){}

  let difficulty='normal';
  try{
    const savedDifficulty=localStorage.getItem('kaeru_difficulty');
    if(['easy','normal','hard'].includes(savedDifficulty)) difficulty=savedDifficulty;
  }catch(e){}
  let stageTheme=0;
  let storyQueue=[];
  let storyFightIndex=0;
  let storyTransitionLocked=false;
  let storyLosses=0;
  let storyWins=0;
  let storyFinished=false;
  let storyPhase='tournament';
  let storyTournament=[];
  let storyDay=1;
  let storyLastWon=true;
  let allBattleQueue=[];
  let allBattleIndex=0;
  let allBattleWins=0;


  let running = false;
  let gamePaused=false;
  let last = performance.now();
  let bubbles = [];
  let refereeFrog={x:0,dir:1,t:0};
  let particles = [];
  let hitRings = [];
  let guardWaves = [];
  let aquaTornadoes = [];
  let aquaVortices = [];
  let engineerShots = [];
  let michaelAuraShots = [];
  let water2Shots = [];
  let iceWalls = [];
  let samaelGates = [];
  let seraphielRays = [];
  let remielMirages = [];
  let lunarSlashes=[]; let bloodMoons=[];
  let gravityBalls=[]; let gravityZones=[]; let meteorDrops=[];
  let jihalBolts=[];
  let jihalBursts=[];
  let remielFakeShots = [];
  let toxicWaters=[];
  let bossFish=[];
  let abyssShocks=[];
  let kawazuShots=[];
  let kawazuGhosts=[];
  let flaurosPillars=[];
  let flaurosClaws=[];
  let satanaelFlares=[];
  let satanaelRays=[];
  let satanaelPressures=[];
  let satanaelWaves=[];
  let siltClouds = [];
  let catfishCharges = [];
  let pressureBlades = [];
  let burstWaves = [];
  let leafTargets=[];
  let leafMiniActive=false;
  let leafMiniTime=60;
  let leafMiniScore=0;
  let leafSpawnTimer=0;
  let guardTargets=[];
  let guardMiniActive=false;
  let guardMiniTime=60, guardMiniScore=0, guardMiniMiss=0, guardSpawnTimer=0;
  let guardMiniGuardTapTime=-9999;
  let raceMiniActive=false, raceMiniStart=0, raceMiniElapsed=0, raceMiniBest=0;
  let raceCheckpoints=[], raceCheckpointIndex=0, raceEnemyCheckpointIndex=0, raceObstacles=[];
  let basketMiniActive=false, basketMiniTime=60, basketPlayerScore=0, basketEnemyScore=0;
  let basketBall=null, basketHoops=[], basketShotCooldown=0;
  let gameOver = false;
  let comboTimer = 0;
  let comboHits = 0;

  // FROG FIGHTER 2 JUMP: portrait lotus-stadium physics.
  const JUMP_GRAVITY=1220;
  const JUMP_SPEED=900;
  const JUMP_DRAG=.24;
  function jumpFloorY(){ return innerHeight-Math.min(205,Math.max(145,innerHeight*.16))-50; }

  const stats = {
    green:  { speed: 160, tongue: 210, damage: 1.00, defense:1.00, sink:7, hue:0, scale:1.00 },
    mob:    { speed: 154, tongue: 195, damage: 0.88, defense:0.92, sink:6, hue:0, scale:0.84 },
    blue:   { speed: 182, tongue: 260, damage: 0.88, defense:1.00, sink:5, hue:95, scale:1.00 },
    black:  { speed: 148, tongue: 225, damage: 1.22, defense:1.00, sink:9, hue:0, scale:1.00 },
    purple: { speed: 174, tongue: 245, damage: 0.92, defense:1.00, sink:5, hue:0, scale:1.00 },
    yellow:  { speed: 190, tongue: 225, damage: 0.92, defense:0.96, sink:4, hue:0, scale:1.00 },
    orange:  { speed: 142, tongue: 215, damage: 1.05, defense:1.28, sink:9, hue:0, scale:1.10 },
    piranha: { speed: 198, tongue: 0,   damage: 1.08, defense:0.90, sink:3, hue:0, scale:0.95 },
    crayfish:{ speed: 138, tongue: 0,   damage: 1.18, defense:1.20, sink:10,hue:0, scale:1.08 },
    beelzebub:{speed: 154, tongue: 350, damage: 1.12, defense:1.10, sink:8, hue:0, scale:1.10},
    sariel:{speed:160,tongue:190,damage:1.01,defense:1.00,sink:7,hue:0,scale:1.02},
    kokabiel:{speed:152,tongue:190,damage:1.00,defense:1.04,sink:8,hue:0,scale:1.04},
    awakenedKokabiel: { speed: 174, tongue: 230, damage: 1.16, defense:1.10, sink:6, hue:42, scale:1.04 },
    jihal:{speed:184,tongue:190,damage:1.02,defense:.97,sink:5,hue:0,scale:1.00},
    remiel:{speed: 170, tongue: 205, damage: .98, defense:1.00, sink:5, hue:0, scale:1.00},
    seraphiel:{speed: 178, tongue: 205, damage: 1.24, defense:.84, sink:5, hue:0, scale:1.02},
    samael: {speed: 158, tongue: 210, damage: 1.10, defense:1.06, sink:7, hue:0, scale:1.08},
    satanael:{speed:166,tongue:225,damage:1.20,defense:1.10,sink:8,hue:0,scale:1.10},
    kawazu: {speed: 205, tongue: 225, damage: 0.98, defense:0.90, sink:4, hue:0, scale:0.90},
    pascal: {speed: 176, tongue: 185, damage: 0.68, defense:0.86, sink:4, hue:0, scale:0.78},
    malphas:{speed: 174, tongue: 185, damage: 0.68, defense:0.86, sink:4, hue:0, scale:0.78}
  };

  function show(name) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[name].classList.add('active');
  }

  function canUseLandscape() {
    return window.innerWidth > window.innerHeight;
  }

  let portraitPlayMode=false;

  function enterPortraitPlay(){
    portraitPlayMode=true;
    document.body.classList.add('portrait-play');
    show('select');
    setTimeout(()=>resize(),40);
  }

  window.addEventListener('orientationchange', () => { setTimeout(()=>resize(),80); });
  window.addEventListener('resize', () => { resize(); });

  const portraitStart=document.getElementById('portraitStart');
  const portraitOverlayStart=document.getElementById('portraitOverlayStart');
  if(portraitStart){
    portraitStart.addEventListener('pointerup',e=>{
      e.preventDefault();e.stopPropagation();
      enterPortraitPlay();
    });
    portraitStart.addEventListener('click',e=>{
      if(window.PointerEvent)return;
      enterPortraitPlay();
    });
  }

  if(portraitOverlayStart){
    portraitOverlayStart.addEventListener('pointerup',e=>{
      e.preventDefault();e.stopPropagation();
      enterPortraitPlay();
    });
    portraitOverlayStart.addEventListener('click',e=>{
      if(window.PointerEvent)return;
      enterPortraitPlay();
    });
  }

  const desktopStart=document.getElementById('desktopStart');
  if(desktopStart){
    desktopStart.onclick = () => {
      portraitPlayMode=true;
      document.body.classList.add('portrait-play');
      show('select');
      setTimeout(()=>resize(),40);
    };
  }

  // v0.3: normal launches always begin at the title screen.
  if(!mixPracticeMode && !(mixBattleMode && mixBattleContext)){
    portraitPlayMode=false;
    document.body.classList.remove('portrait-play');
    show('title');
  }


  // v6.43 軽量SE:
  // 外部音源なし。短いOscillatorのみ。同時発音4、種類ごとのクールタイム付き。
  let sfxEnabled=true;
  try{
    const savedSfx=localStorage.getItem('kaeru_sfx');
    if(savedSfx==='0') sfxEnabled=false;
  }catch(e){}

  let sfxCtx=null;
  const sfxVoices=new Set();
  const sfxLast={};
  const SFX_MAX_VOICES=4;
  const sfxCooldown={
    hit:90,
    guard:120,
    tongue:130,
    special:180,
    ko:900,
    menu:120
  };

  function ensureSfxContext(){
    if(!sfxEnabled) return null;
    try{
      const AC=window.AudioContext||window.webkitAudioContext;
      if(!AC) return null;
      if(!sfxCtx) sfxCtx=new AC();
      if(sfxCtx.state==='suspended') sfxCtx.resume().catch(()=>{});
      return sfxCtx;
    }catch(e){
      return null;
    }
  }

  function playSfx(name,power=1){
    if(!sfxEnabled) return;
    const nowMs=performance.now();
    const cd=sfxCooldown[name]||100;
    if(nowMs-(sfxLast[name]||0)<cd) return;
    if(sfxVoices.size>=SFX_MAX_VOICES) return;

    const ac=ensureSfxContext();
    if(!ac) return;
    sfxLast[name]=nowMs;

    const presets={
      hit:    {f1:150,f2:82,d:.075,type:'square',vol:.040},
      guard:  {f1:520,f2:310,d:.11,type:'sine',vol:.035},
      tongue: {f1:290,f2:155,d:.09,type:'triangle',vol:.030},
      special:{f1:220,f2:610,d:.16,type:'sawtooth',vol:.028},
      ko:     {f1:125,f2:48,d:.28,type:'triangle',vol:.050},
      menu:   {f1:420,f2:620,d:.065,type:'sine',vol:.025}
    };
    const p=presets[name]||presets.menu;
    const t=ac.currentTime;
    try{
      const osc=ac.createOscillator();
      const gain=ac.createGain();
      osc.type=p.type;
      osc.frequency.setValueAtTime(p.f1,t);
      osc.frequency.exponentialRampToValueAtTime(Math.max(30,p.f2),t+p.d);
      gain.gain.setValueAtTime(.0001,t);
      gain.gain.exponentialRampToValueAtTime(Math.max(.0002,p.vol*Math.min(1.25,power)),t+.008);
      gain.gain.exponentialRampToValueAtTime(.0001,t+p.d);
      osc.connect(gain);
      gain.connect(ac.destination);
      sfxVoices.add(osc);
      osc.onended=()=>{
        sfxVoices.delete(osc);
        try{osc.disconnect();gain.disconnect();}catch(e){}
      };
      osc.start(t);
      osc.stop(t+p.d+.015);
    }catch(e){}
  }

  const soundToggle=document.getElementById('soundToggle');
  function refreshSoundToggle(){
    if(!soundToggle)return;
    soundToggle.textContent=sfxEnabled?'SE ON':'SE OFF';
    soundToggle.classList.toggle('off',!sfxEnabled);
  }
  if(soundToggle){
    const toggleSound=(e)=>{
      if(e){e.preventDefault();e.stopPropagation();}
      sfxEnabled=!sfxEnabled;
      try{localStorage.setItem('kaeru_sfx',sfxEnabled?'1':'0');}catch(err){}
      refreshSoundToggle();
      if(sfxEnabled) playSfx('menu');
    };
    soundToggle.addEventListener('pointerup',toggleSound);
    soundToggle.addEventListener('click',e=>{if(window.PointerEvent)return;toggleSound(e);});
  }
  refreshSoundToggle();

  function refreshDifficultyButtons(){
    difficultyButtons.forEach(btn=>{
      btn.classList.toggle('selected',btn.dataset.difficulty===difficulty);
    });
  }

  difficultyButtons.forEach(btn=>{
    const choose=(e)=>{
      if(e){e.preventDefault();e.stopPropagation();}
      difficulty=btn.dataset.difficulty||'normal';
      try{localStorage.setItem('kaeru_difficulty',difficulty);}catch(err){}
      refreshDifficultyButtons();
    };
    btn.addEventListener('pointerup',choose);
    btn.addEventListener('click',e=>{if(window.PointerEvent)return;choose(e);});
  });
  refreshDifficultyButtons();

  function difficultyProfile(){
    if(difficulty==='easy') return {move:.82,attack:.58,tongue:.55,guard:.55,projectileGuard:.26,special:.55,damage:.80};
    if(difficulty==='hard') return {move:1.14,attack:1.42,tongue:1.35,guard:1.45,projectileGuard:.78,special:1.5,damage:1.14};
    return {move:1,attack:1,tongue:1,guard:1,projectileGuard:.52,special:1,damage:1};
  }

  const selectCardCommands={
    mob:[
      'バブルショット：前 ＋ パンチ',
      'かえる跳びアッパー：上 ＋ パンチ',
      'トリプルキック：前 ＋ キック'
    ],
    green:[
      'バーニングアッパー：上 ＋ パンチ',
      'バーニングキック：前 ＋ キック',
      'バーニングショット：後ろ ＋ パンチ',
      'バーニングサイクロン：下 → 後ろ ＋ キック'
    ],
    blue:[
      'アクアトルネード：上 ＋ パンチ',
      'アクアストリーム：下 ＋ キック',
      'アクアボルテックス：後ろ ＋ パンチ',
      'アクアショット：前 ＋ パンチ'
    ],
    yellow:[
      'エアカッター（2連）：前 ＋ パンチ',
      'エアカッター（2連・斜め下）：前 ＋ キック',
      'エアーギロチン（真上 → 真下）：後ろ ＋ パンチ',
      'エアブレード（真下 → 真上）：後ろ ＋ キック',
      'ヒーリングバブル：ガード ×2',
      'エアホバー（約5秒）：上 ＋ ガード'
    ],
    orange:[
      'ホワイトカウンター：後ろ ＋ ガード',
      'ガーディアンタックル：前 ＋ ガード',
      'ホワイトオーラ：ガード長押し',
      '白い長リーチ攻撃：オーラ中 パンチ / キック',
      'ホワイトショット：ガード ＋ パンチ'
    ],
    black:[
      'ヘルクラッシュ：前 ＋ キック',
      'アビスチャージ：後ろ ＋ パンチ長押し → 離す',
      'アイスショット：前 ＋ パンチ',
      'アイスウォール：後ろ ＋ ガード'
    ],
    purple:[
      '舌ラッシュ：舌連打',
      'バブルショット：後ろ ＋ パンチ / 下 ＋ パンチ',
      'ギロチンキック：下 ＋ キック',
      'バックスピンキック：後ろ ＋ キック（追加入力で追加回転）'
    ],
    beelzebub:[
      'ヴェノム・ウォーター：下 → 後ろ ＋ ガード',
      'アビスショック（上弧）：上 ＋ パンチ',
      'アビスショック（下弧）：下 ＋ キック',
      'ベノムショット：前 ＋ パンチ'
    ],
    sariel:[
      'ルナ・スラッシュ（上弧）：上 ＋ パンチ',
      'ルナ・スラッシュ（下弧）：下 ＋ パンチ',
      'イーブルアイ：前 ＋ ガード',
      'ブラッドムーン：後ろ ＋ ガード',
      'ムーンサルトキック：上 ＋ キック'
    ],
    kokabiel:[
      'グラビティボール：前 ＋ パンチ',
      'グラビティゾーン：後ろ ＋ ガード',
      'メテオレイン：下 ＋ パンチ',
      'グラビティダイブ：下 ＋ キック'
    ],
    jihal:[
      'ボルトショット：前 ＋ パンチ',
      'ライトニングダッシュ：前 ＋ キック',
      'サンダーチャージ：後ろ ＋ キック長押し → 離す',
      'スパークバースト：下 ＋ パンチ'
    ],
    remiel:[
      'ミラージュ（上）：上 ＋ ガード','ミラージュ（下）：下 ＋ ガード','ミラージュカウンター：後ろ ＋ ガード','アクアパリィ：前 ＋ ガード / ジャストガード','フロストショット：前 ＋ パンチ','ミラージュキック：前 ＋ キック'
    ],
    seraphiel:[
      'セラフィックアッパー：上 ＋ パンチ',
      'セラフィックキック：前 ＋ キック',
      'セラフィックショット：後ろ ＋ パンチ',
      'セラフィックサイクロン：下 → 後ろ ＋ キック',
      'セラフィックレイ：下 → 前 ＋ パンチ（セラフィエル独自技）'
    ],
    satanael:[
      'ディザスターフレア：後ろ ＋ パンチ',
      'ダークレイ：前 ＋ パンチ',
      'ダークプレッシャー：下 ＋ ガード',
      'インフェルノウェーブ：下 ＋ キック（蓮の葉から通常ジャンプ高までの黒炎壁）'
    ],
    samael:[
      'ポイズンゲート：方向 ＋ パンチ（指定方向に発生点 → 相手へ毒弾）',
      'ヴェノムタン：前 ＋ 舌（舌先から毒弾）',
      'デッドリー・アクア：前 → 下 → 後ろ ＋ キック'
    ],
    kawazu:[
      'ファントムラッシュ：前 ＋ パンチ',
      '水圧ラッシュ：パンチ連打',
      'ミラージュキック：前 ＋ キック',
      'スピンキックカッター：後ろ ＋ キック（十字光3連発）'
    ],
    piranha:[
      '高速突進噛みつき：後ろ → 前 ＋ 舌',
      '急降下①：下 → 上 ＋ パンチ',
      '急降下②：下 → 上 ＋ キック'
    ],
    crayfish:[
      'クローラッシュ：パンチ ×3',
      'ボトムスマッシュ：後ろ → 下 ＋ キック',
      'クロー・カウンター：下 ＋ ガード ×2'
    ]
  };
  function applySelectCardCommands(card){
    if(!card)return;
    const moves=card.querySelector('.move-names'), list=selectCardCommands[card.dataset.fighter];
    if(!moves||!list)return;
    moves.innerHTML='<span class="command-list">'+list.map(x=>{
      const p=x.split('：'); return '<b>'+p.shift()+'</b>：'+p.join('：');
    }).join('<br>')+'</span>';
  }
  document.querySelectorAll('#selectScreen .fighter-card').forEach(applySelectCardCommands);

  function isStoryCleared(){
    try{return localStorage.getItem('kaeru_jump2_story_cleared')==='1';}
    catch(e){return false;}
  }

  function refreshStoryClearUnlock(){
    const unlocked=isStoryCleared();
    [samaelCard,seraphielCard,satanaelCard].forEach(card=>{
      if(!card)return;
      card.hidden=!unlocked;
      card.style.display=unlocked?'':'none';
      card.setAttribute('aria-hidden',unlocked?'false':'true');
    });
    if(opponentSelect){
      ['samael','seraphiel','satanael'].forEach(type=>{
        const opt=opponentSelect.querySelector(`option[value="${type}"]`);
        if(!opt)return;
        opt.hidden=!unlocked;
        opt.disabled=!unlocked;
        opt.style.display=unlocked?'':'none';
      });
      if(!unlocked && ['samael','seraphiel','satanael'].includes(opponentSelect.value)){
        opponentSelect.value='blue';
        selectedOpponent='blue';
      }
    }
  }

  function unlockStoryBosses(){
    try{localStorage.setItem('kaeru_jump2_story_cleared','1');}catch(e){}
    refreshStoryClearUnlock();
  }

  function isBeelzebubUnlocked(){
    // JUMP2ではベルゼブブさんは通常キャラとして最初から表示・選択可能。
    return true;
  }

  function refreshBossUnlock(){
    const unlocked=isBeelzebubUnlocked();

    // hiddenだけでは後段CSSに負ける端末があるため、displayも明示的に制御。
    if(beelzebubCard){
      beelzebubCard.hidden=!unlocked;
      beelzebubCard.style.display=unlocked?'':'none';
      beelzebubCard.setAttribute('aria-hidden',unlocked?'false':'true');
    }

    if(beelzebubOpponent){
      beelzebubOpponent.hidden=!unlocked;
      beelzebubOpponent.disabled=!unlocked;
      beelzebubOpponent.style.display=unlocked?'':'none';
    }

    if(bossTeaser){
      bossTeaser.hidden=!unlocked;
      bossTeaser.style.display=unlocked?'':'none';
    }
  }

  function unlockBeelzebub(){
    try{localStorage.setItem('kaeru_beelzebub_unlocked','1');}catch(e){}
    refreshBossUnlock();
  refreshStoryClearUnlock();
  }

  function isKawazuUnlocked(){
    try{return localStorage.getItem('kaeru_kawazu_unlocked')==='1';}
    catch(e){return false;}
  }
  function refreshKawazuUnlock(){
    // 未クリア時はDOM自体を作らない。名前・見た目・技名を完全に伏せる。
    if(!isKawazuUnlocked()) return;

    if(!kawazuCard){
      const grid=document.querySelector('#selectScreen .fighter-grid');
      if(grid){
        const btn=document.createElement('button');
        btn.id='kawazuCard';
        btn.className='fighter-card kawazu-card';
        btn.dataset.fighter='kawazu';
        btn.innerHTML=`<span class="fighter-emoji kawazu-frog">🐸</span>
          <strong>カワズさん</strong>
          <span class="special-hint move-names">水圧ラッシュ / ミラージュキック / スピンキックカッター</span>
          `;
        const outsideCard=grid.querySelector('.fighter-card[data-fighter="piranha"], .fighter-card[data-fighter="crayfish"]');
        if(outsideCard)grid.insertBefore(btn,outsideCard);
        else grid.appendChild(btn);
        applySelectCardCommands(btn);
        kawazuCard=btn;
        btn.addEventListener('click',()=>{
          document.querySelectorAll('.fighter-card').forEach(c=>c.classList.remove('selected'));
          btn.classList.add('selected');
          selectedFighter='kawazu';
          refreshStoryAvailability();
        });
      }
    }

    if(kawazuCard){
      const grid=document.querySelector('#selectScreen .fighter-grid');
      const outsideCard=grid&&grid.querySelector('.fighter-card[data-fighter="piranha"], .fighter-card[data-fighter="crayfish"]');
      if(grid&&outsideCard&&kawazuCard.compareDocumentPosition(outsideCard)&Node.DOCUMENT_POSITION_PRECEDING){
        grid.insertBefore(kawazuCard,outsideCard);
      }
    }

    if(!kawazuOpponent && opponentSelect){
      const opt=document.createElement('option');
      opt.id='kawazuOpponent'; opt.value='kawazu'; opt.textContent='カワズさん';
      opponentSelect.appendChild(opt);
      kawazuOpponent=opt;
    }
  }
  function unlockKawazu(){
    try{localStorage.setItem('kaeru_kawazu_unlocked','1');}catch(e){}
    refreshKawazuUnlock();
  }
  refreshKawazuUnlock();

  function showStoryNarrative(pages,onDone){
    if(!storyNarrative || !storyNarrativeText || !storyNarrativeNext){
      if(onDone)onDone(); return;
    }
    let i=0;
    const render=()=>{
      storyNarrativeText.textContent=pages[i];
      storyNarrativeNext.textContent=i===pages.length-1?'進む':'次へ';
    };
    storyNarrative.hidden=false;
    if(gameMode==='story') restartButton.hidden=true;
    render();
    storyNarrativeNext.onclick=()=>{
      i++;
      if(i>=pages.length){
        storyNarrative.hidden=true;
        storyNarrativeNext.onclick=null;
        const done=onDone; onDone=null;
        if(done)done();
      }else render();
    };
  }

  refreshBossUnlock();

  function refreshStoryAvailability(){
    const btn=document.getElementById('storyButton');
    if(!btn)return;
    const blocked=selectedFighter==='piranha'||selectedFighter==='crayfish';
    btn.disabled=blocked;
    btn.classList.toggle('story-disabled',blocked);
    btn.setAttribute('aria-disabled',blocked?'true':'false');
    btn.title=blocked?'アザゼルさん／ベリアルさんはストーリーでは使用できません':'';
  }

  document.querySelectorAll('.fighter-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.fighter-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedFighter = card.dataset.fighter;
      refreshStoryAvailability();
    });
  });
  refreshStoryAvailability();

  if(opponentSelect){
    opponentSelect.value=selectedOpponent;
    opponentSelect.addEventListener('change',()=>{selectedOpponent=opponentSelect.value;});
  }

  document.getElementById('fightButton').onclick = () => {
    playSfx('menu');
    selectedOpponent=opponentSelect ? opponentSelect.value : selectedOpponent;
    show('game');
    resize();
    startGame('free');
  };

  const allBattleButton=document.getElementById('allBattleButton');
  if(allBattleButton){
    const openAllBattle=e=>{
      if(e){e.preventDefault();e.stopPropagation();}
      playSfx('menu');startAllBattleMode();
    };
    allBattleButton.addEventListener('pointerup',openAllBattle);
    allBattleButton.addEventListener('click',e=>{if(window.PointerEvent)return;openAllBattle(e);});
  }

  const storyButton=document.getElementById('storyButton');
  if(storyButton){
    const openStory=(e)=>{
      if(e){
        e.preventDefault();
        e.stopPropagation();
      }
      if(selectedFighter==='piranha'||selectedFighter==='crayfish'){
        comboEl.textContent='このキャラではストーリーを選べません';
        refreshStoryAvailability();
        return;
      }
      playSfx('menu');
      startStoryMode();
    };
    storyButton.addEventListener('pointerup',openStory);
    storyButton.addEventListener('click',(e)=>{
      if(window.PointerEvent) return;
      openStory(e);
    });
  }

  const minigameBtn=document.getElementById('minigameBtn');
  if(minigameBtn){
    const openLeafMini=(e)=>{
      if(e){e.preventDefault();e.stopPropagation();}
      startLeafMiniGame();
    };
    minigameBtn.addEventListener('pointerup',openLeafMini);
    minigameBtn.addEventListener('click',(e)=>{
      if(window.PointerEvent)return;
      openLeafMini(e);
    });
  }

  const justGuardMiniBtn=document.getElementById('justGuardMiniBtn');
  if(justGuardMiniBtn){
    const openGuardMini=e=>{if(e){e.preventDefault();e.stopPropagation();}startGuardMiniGame();};
    justGuardMiniBtn.addEventListener('pointerup',openGuardMini);
    justGuardMiniBtn.addEventListener('click',e=>{if(window.PointerEvent)return;openGuardMini(e);});
  }

  const raceMiniBtn=document.getElementById('raceMiniBtn');
  if(raceMiniBtn){
    const openRace=e=>{if(e){e.preventDefault();e.stopPropagation();}startRaceMiniGame();};
    raceMiniBtn.addEventListener('pointerup',openRace);
    raceMiniBtn.addEventListener('click',e=>{if(window.PointerEvent)return;openRace(e);});
  }

  const basketMiniBtn=document.getElementById('basketMiniBtn');
  if(basketMiniBtn){
    const openBasket=e=>{if(e){e.preventDefault();e.stopPropagation();}startBasketMiniGame();};
    basketMiniBtn.addEventListener('pointerup',openBasket);
    basketMiniBtn.addEventListener('click',e=>{if(window.PointerEvent)return;openBasket(e);});
  }

  const practiceBtn=document.getElementById('practiceBtn');
  if(practiceBtn){
    const openPractice=(e)=>{
      if(e){
        e.preventDefault();
        e.stopPropagation();
      }
      playSfx('menu');
      startPractice();
    };

    // スマホ・PC共通。touch/clickの二重発火を避ける。
    practiceBtn.addEventListener('pointerup',openPractice);
    practiceBtn.addEventListener('click',(e)=>{
      // pointerイベント非対応環境の保険
      if(window.PointerEvent) return;
      openPractice(e);
    });
  }

  if(practiceExitButton){
    if(mixPracticeMode) practiceExitButton.textContent='MIXタイトルへ戻る';
    practiceExitButton.addEventListener('pointerup',(e)=>{
      e.preventDefault();
      e.stopPropagation();
      if(mixPracticeMode){
        location.href=new URL('index.html',location.href).href;
        return;
      }

      gameMode='battle';
      if(practiceHelp){practiceHelp.hidden=true;practiceHelp.style.display='none';}
      if(storyHud) storyHud.hidden=true;
      leafMiniActive=false;
      guardMiniActive=false;
      raceMiniActive=false;
      basketMiniActive=false;
      if(raceMiniHud){raceMiniHud.hidden=true;raceMiniHud.style.display='none';}
      if(basketMiniHud){basketMiniHud.hidden=true;basketMiniHud.style.display='none';}
      if(leafMiniHud){leafMiniHud.hidden=true;leafMiniHud.style.display='none';}
      if(guardMiniHud){guardMiniHud.hidden=true;guardMiniHud.style.display='none';}
      if(practiceLabel) practiceLabel.style.display='none';
      practiceExitButton.hidden=true;
      practiceExitButton.textContent='練習終了';
      comboEl.textContent='';
      show('select');
    });
  }

  if(titleReturnButton){
    titleReturnButton.onclick=()=>{
      gamePaused=false;
      if(pauseOverlay){pauseOverlay.hidden=true;pauseOverlay.style.display='none';}
      gameOver=true;
      running=false;
      leafMiniActive=false;
      guardMiniActive=false;
      if(storyHud) storyHud.hidden=true;
      if(leafMiniHud){leafMiniHud.hidden=true;leafMiniHud.style.display='none';}
      if(guardMiniHud){guardMiniHud.hidden=true;guardMiniHud.style.display='none';}
      restartButton.hidden=true;
      titleReturnButton.hidden=true;
      comboEl.textContent='';
      if(practiceHelp){practiceHelp.hidden=true;practiceHelp.style.display='none';}
      show('select');
    };
  }

  restartButton.onclick = () => {
    if(gameMode==='practice') startPractice();
    else if(gameMode==='leafMini') startLeafMiniGame();
    else if(gameMode==='guardMini') startGuardMiniGame();
    else if(gameMode==='raceMini') startRaceMiniGame();
    else if(gameMode==='basketMini') startBasketMiniGame();
    else if(gameMode==='allbattle'){
      if(allBattleIndex>=allBattleQueue.length){
        gameMode='battle';restartButton.hidden=true;restartButton.textContent='もう一度';show('select');
      }else continueAllBattle();
    }
    else if(gameMode==='story'){
      if(storyTransitionLocked)return;
      if(storyFinished){
        if(storyHud) storyHud.hidden=true;
        gameMode='battle';
        restartButton.hidden=true;
        restartButton.textContent='もう一度';
        show('select');
      }else if(!storyLastWon){
        // 負けた試合は同じ相手に再挑戦。
        startGame('story',storyQueue[storyFightIndex]);
      }else{
        continueStory();
      }
    }else startGame('free');
  };

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(innerWidth * dpr);
    canvas.height = Math.floor(innerHeight * dpr);
    canvas.style.width = innerWidth + 'px';
    canvas.style.height = innerHeight + 'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }

  function drawWhiteAura(x,y,rx,ry,intensity=1){
    ctx.save();ctx.translate(x,y);ctx.globalCompositeOperation='lighter';
    for(let i=0;i<4;i++){
      ctx.globalAlpha=(.12+i*.07)*intensity;
      ctx.fillStyle=i%2?'#ffffff':'#dffcff';
      ctx.beginPath();ctx.ellipse(0,0,rx+i*4,ry+i*3,0,0,Math.PI*2);ctx.fill();
    }
    ctx.restore();
  }

  function drawRedAura(x,y,rx,ry,intensity=1){
    ctx.save();ctx.translate(x,y);ctx.globalCompositeOperation='lighter';
    const pulse=.93+Math.sin(performance.now()/48)*.07;ctx.scale(pulse,pulse);
    for(let i=0;i<4;i++){
      ctx.globalAlpha=(.13+i*.055)*intensity;ctx.fillStyle=i%2===0?'#ff2738':'#ff7138';
      ctx.beginPath();ctx.ellipse(Math.sin(performance.now()/80+i)*4,Math.cos(performance.now()/96+i)*3,rx+i*4,ry+i*3,0,0,Math.PI*2);ctx.fill();
    }
    ctx.restore();
  }

  function drawBurningAura(x,y,rx,ry,rotation=0){
    ctx.save();
    ctx.translate(x,y);
    ctx.rotate(rotation);
    ctx.globalCompositeOperation='lighter';

    const pulse=.92+Math.sin(performance.now()/55)*.08;
    ctx.scale(pulse,pulse);

    for(let i=0;i<4;i++){
      const t=performance.now()/120+i*1.7;
      ctx.globalAlpha=.12+i*.06;
      ctx.fillStyle=i%2===0?'#ff2d20':'#ff8a28';
      ctx.beginPath();
      ctx.ellipse(
        Math.sin(t*1.8+i)*4,
        Math.cos(t*1.3+i)*3,
        rx+i*3,ry+i*2,0,0,Math.PI*2
      );
      ctx.fill();
    }

    for(let i=0;i<5;i++){
      const a=performance.now()/300+i*1.25;
      ctx.globalAlpha=.5;
      ctx.fillStyle=i%2?'#ff3b25':'#ffad3d';
      ctx.beginPath();
      ctx.arc(Math.cos(a)*rx*.75,Math.sin(a*1.4)*ry*.7,2.2+(i%2),0,Math.PI*2);
      ctx.fill();
    }
    ctx.restore();
  }

  function fighterPalette(type){
    if(type==='awakenedKokabiel') return {body:'#d6b83f',limb:'#9f8124',light:'#f2dc73',belly:'#f7edb8',eyeBump:'#c7a431'};
    if(type==='mob') return {body:'#79b85a',limb:'#5a9442',light:'#a9d97d',belly:'#eef7d8',eyeBump:'#8fc96a'};
    if(type==='flauros'){
      return {body:'#c92825',limb:'#b91f20',light:'#ff6a3d',belly:'#ef9b58',eyeBump:'#e64631'};
    }
    if(type==='kawazu'){
      return {
        body:'#4fbd55',
        limb:'#4aaf50',
        light:'#82d96d',
        belly:'#f4f1e8',
        eyeBump:'#5bc45b'
      };
    }

    if(type==='pascal'){
      return {body:'#75c968',limb:'#65b45c',light:'#a8ef87',belly:'#dff2b3',eyeBump:'#90dc74'};
    }
    if(type==='malphas'){
      return {body:'#76588f',limb:'#674c80',light:'#b38bd0',belly:'#d6b7e7',eyeBump:'#9b72ba'};
    }
    if(type==='black'){
      return {
        body:'#333b46',
        limb:'#333b46',
        light:'#7fdff2',
        belly:'#bdeff7',
        eyeBump:'#8de9f7'
      };
    }
    if(type==='purple'){
      return {
        body:'#f05a9d',
        limb:'#f05a9d',
        light:'#ff8fc1',
        belly:'#ffc1dc',
        eyeBump:'#f777b0'
      };
    }
    if(type==='beelzebub'){
      return {
        body:'#17121d',
        limb:'#1d1625',
        light:'#6f587d',
        belly:'#b8ff68',
        eyeBump:'#72ff2d'
      };
    }
    if(type==='sariel')return {body:'#5d6488',limb:'#68709a',light:'#f2efff',belly:'#a7acd0',eyeBump:'#d8ddf5'};
    if(type==='kokabiel')return {body:'#20263f',limb:'#262d4a',light:'#7ae7ef',belly:'#4b5479',eyeBump:'#63dbe7'};
    if(type==='jihal')return {body:'#244f78',limb:'#285b88',light:'#fff2a2',belly:'#e6cf55',eyeBump:'#f1d64e'};
    if(type==='remiel'){
      return {body:'#7eaebf',limb:'#79a6b8',light:'#c9edf2',belly:'#b8dce4',eyeBump:'#a9d6df'};
    }
    if(type==='seraphiel'){
      return {
        body:'#f1ead7',
        limb:'#f5efd9',
        light:'#fff5ae',
        belly:'#fff9df',
        eyeBump:'#ffe88a'
      };
    }
    if(type==='satanael'){
      return {body:'#4b0c12',limb:'#31070c',light:'#a52628',belly:'#8b6727',eyeBump:'#16090c'};
    }
    if(type==='samael'){
      return {
        body:'#2a183b',
        limb:'#322047',
        light:'#7862bd',
        belly:'#55416f',
        eyeBump:'#7562b9'
      };
    }
    if(type==='yellow'){
      return {
        body:'#e7cf3f', limb:'#e7cf3f', light:'#f5e56b',
        belly:'#fff08a', eyeBump:'#f1dc55'
      };
    }
    if(type==='orange'){
      return {
        body:'#ef8b32', limb:'#ef8b32', light:'#ffad55',
        belly:'#ffc477', eyeBump:'#f9a04a'
      };
    }
    if(type==='blue'){
      return {
        body:'#31aee8',
        limb:'#31aee8',
        light:'#75d8ff',
        belly:'#8ee3ff',
        eyeBump:'#63c8ef'
      };
    }
    return {
      body:'#39cb4d',
      limb:'#39cb4d',
      light:'#78e36d',
      belly:'#86e77b',
      eyeBump:'#63df6e'
    };
  }

  class Fighter {
    constructor(x, y, isPlayer, type='green') {
      const s = stats[type] || stats.green;
      this.x=x; this.y=y; this.vx=0; this.vy=0; this.isPlayer=isPlayer;
      this.type=type; this.speed=s.speed; this.tongueRange=s.tongue; this.damageMul=s.damage;
      this.defense=s.defense||1; this.bodyScale=s.scale||1;
      this.sink=s.sink; this.hue=s.hue;
      this.radius=35*this.bodyScale; this.hp=100; this.face = isPlayer ? 1 : -1;
      this.attack=null; this.attackT=0; this.attackVariant='mid'; this.stun=0; this.guard=false; this.tongueT=0;
      this.flash=0;
      this.hurtFaceT=0;
      this.hurtFace='wink';

      // ガード / 波
      this.guardStartT=0;
      this.guardTapTimes=[];
      this.waveCooldown=0;
      this.guardBreakT=0;

      // 壁受け身
      this.wallTechT=0;

      // JUMP版共通：壁際ガードで短時間だけ壁に張り付ける。
      this.wallClingT=0;
      this.wallClingCooldown=0;
      this.wallClingSide=0;
      this.wallTongueHeld=false;

      // 水中ダッシュ
      this.dashT=0;
      this.dashCooldown=0;

      // 必殺技
      this.specialT=0;
      this.specialType=null;
      this.specialHitDone=false;
      this.chargeStartTime=0;
      this.chargePower=0;
      this.healT=0;
      this.counterT=0;
      this.counterReady=false;
      this.tackleArmedT=0;
      this.tackleHit=false;
      this.urielGuardHoldStart=0;
      this.urielAuraT=0;
      this.michaelRedAuraT=0;
      this.michaelPowerReady=false;
      this.michaelBoostAttackT=0;
      this.lilithSpinStartTime=0;
      this.lilithSpinLastHitA=-9999;
      this.lilithSpinLastHitB=-9999;
      this.piranhaRushHit=false;
      this.piranhaDivePhase=0;
      this.piranhaDiveTargetX=0;
      this.crayfishRushStep=0;
      this.crayfishRushLastHit=0;
      this.crayfishSmashDone=false;
      this.crayfishSmashQueued=false;
      this.crayfishSmashQueueT=0;
      this.crayfishCounterReady=false;
      this.crayfishCounterT=0;
      this.bossTongueAimY=0;
      this.bossSpecialCooldown=0;
      this.luciferGrabTarget=null;
      this.luciferGrabT=0;
      this.luciferRushHits=0;
      this.luciferPunchSide=0;
      this.ribbonWhipIndex=0;
      this.luciferDiveHits=0;

      // フロッグファイター2 JUMP：毒状態。ベルゼブブ（将来のサマエルも）は継続毒を無効化。
      this.poisonT=0;
      this.poisonTick=0;
      this.poisonOwner=null;

      // 舌システム
      this.tonguePullTarget=null;   // 今、舌で引き寄せている相手
      this.tonguePullTimer=0;       // 2回目の舌入力を受け付ける時間
      this.tongueClashTarget=null;  // 投げ抜け時：お互い舌が伸びた相手
      this.tongueClashTimer=0;      // 舌の綱引き状態の残り時間
      this.throwState=null;         // 舌投げ中の状態
      this.spinAngle=0;
    }
    update(dt) {
      if (this.stun>0) this.stun-=dt;
      if(this.poisonT>0){
        this.poisonT=Math.max(0,this.poisonT-dt);
        this.poisonTick-=dt;
        if(this.poisonTick<=0){
          this.poisonTick=.62;
          if(!isPoisonImmune(this) && this.poisonOwner && !gameOver){
            const src=this.poisonOwner;
            src._projectileHit=true;
            damageHit(src,this,.62*src.damageMul,0,0);
            src._projectileHit=false;
          }
        }
        if(this.poisonT<=0)this.poisonOwner=null;
      }
      if(this.healT>0){
        this.healT-=dt;
        this.hp=Math.min(100,this.hp+3.2*dt);
        if(this.isPlayer) updateHud();
      }
      if(this.counterT>0){
        this.counterT-=dt;
        if(this.counterT<=0) this.counterReady=false;
      }
      if(this.tackleArmedT>0) this.tackleArmedT-=dt;
      if(this.bossSpecialCooldown>0) this.bossSpecialCooldown=Math.max(0,this.bossSpecialCooldown-dt);
      if(this.urielAuraT>0) this.urielAuraT=Math.max(0,this.urielAuraT-dt);
      if(this.type==='orange' && this.urielAuraT>0){
        this.hp=Math.min(100,this.hp+1.15*dt);
        if(this.isPlayer)updateHud();
      }
      if(this.michaelRedAuraT>0){
        this.michaelRedAuraT=Math.max(0,this.michaelRedAuraT-dt);
        this.hp=Math.min(100,this.hp+1.7*dt);
        if(this.isPlayer)updateHud();
      }
      if(this.michaelBoostAttackT>0)this.michaelBoostAttackT=Math.max(0,this.michaelBoostAttackT-dt);
      if (this.flash>0) this.flash-=dt;
      if (this.hurtFaceT>0) this.hurtFaceT-=dt;
      if (this.guardStartT>0) this.guardStartT-=dt;
      if(this.wallClingCooldown>0)this.wallClingCooldown=Math.max(0,this.wallClingCooldown-dt);
      if(this.wallClingT>0)this.wallClingT=Math.max(0,this.wallClingT-dt);
      if (this.waveCooldown>0) this.waveCooldown-=dt;
      if (this.guardBreakT>0) this.guardBreakT-=dt;
      if (this.wallTechT>0) this.wallTechT-=dt;
      if (this.dashT>0) this.dashT-=dt;
      if (this.dashCooldown>0) this.dashCooldown-=dt;
      if(this.gravityDragT>0){
        this.gravityDragT=Math.max(0,this.gravityDragT-dt);
        // グラビティボール命中後：グラビティキック同様、しばらく下へ引かれる。
        this.vy+=1050*dt;
      }
      if(this.darkPressureDragT>0){
        this.darkPressureDragT=Math.max(0,this.darkPressureDragT-dt);
        // ダークプレッシャー後：しばらく重圧が残り、下へ引かれ続ける。
        this.vy+=980*dt;
      }
      if (this.specialT>0){
        this.specialT-=dt;
        if(this.specialT<=0){
          this.specialT=0;
          this.specialType=null;
          this.specialHitDone=false;
        }
      }
      if (this.attackT>0) {
        this.attackT-=dt;
        if (this.attackT<=0) this.attack=null;
      }
      if (this.tongueT>0) this.tongueT-=dt;

      // 自分が相手を舌で引っ張っている間
      if(this.tonguePullTimer>0){
        this.tonguePullTimer-=dt;
        if(this.tonguePullTimer<=0){
          this.tonguePullTimer=0;
          this.tonguePullTarget=null;
        }
      }

      // 投げ抜け成功後の「舌の綱引き」
      if(this.tongueClashTimer>0){
        this.tongueClashTimer-=dt;
        if(this.tongueClashTimer<=0){
          this.tongueClashTimer=0;
          this.tongueClashTarget=null;
        }
      }

      // JUMP版共通：後ろ＋舌で壁へ吸着。舌ボタンを押している間は滞空。
      const floorNow=jumpFloorY();
      const airborne=this.y<floorNow-28;
      if(this.wallClingT>0){
        if(!this.wallTongueHeld || !airborne){
          this.wallClingT=0;this.wallClingCooldown=.30;this.wallClingSide=0;
        }else{
          this.wallClingT=.12;
          this.x=this.wallClingSide<0?47:innerWidth-47;
          this.vx=0;this.vy=0;
        }
      }
      if(this.wallClingT<=0){
        this.vy += JUMP_GRAVITY * dt;
        if(this.specialType==='urielTackle') this.vx *= Math.pow(.90,dt);
        else if(this.dashT>0) this.vx *= Math.pow(.82,dt);
        else this.vx *= Math.pow(JUMP_DRAG,dt);
      }

      // 舌で引かれている側は、舌の持ち主へゆっくり吸い寄せられる
      const puller = this.isPlayer ? enemy : player;
      if(puller && puller.tonguePullTarget===this && puller.tonguePullTimer>0 && !this.throwState){
        const dx = puller.x - this.x;
        const dy = puller.y - this.y;
        this.vx += dx * 6.0 * dt;
        this.vy += dy * 6.0 * dt;
        this.stun = Math.max(this.stun, .08);
      }

      // 投げ抜け成功中：両者が中間へ寄っていく。
      if(this.tongueClashTarget && this.tongueClashTimer>0 && !this.throwState){
        const dx = this.tongueClashTarget.x - this.x;
        const dy = this.tongueClashTarget.y - this.y;
        this.vx += dx * 2.8 * dt;
        this.vy += dy * 2.8 * dt;
        this.stun = Math.max(this.stun, .06);
      }

      if(this.throwState){
        if(typeof this.throwState.endT==='number'){
          this.throwState.endT-=dt;
          if(this.throwState.endT<=0){
            this.throwState=null;
            this.spinAngle=0;
          }
        }
        if(this.throwState){
          this.spinAngle += this.throwState.spinSpeed * dt;
        }
      } else if(this.specialType==='seraphicCyclone'){
        // JUMP版：時間ベースで連続回転。逆さまの静止絵に見えないよう高速で滑らかに回す。
        const elapsed=Math.max(0,performance.now()-(this.seraphicCycloneStart||performance.now()))/1000;
        this.spinAngle=elapsed*24*(this.face>0?1:-1);
      } else {
        this.spinAngle *= Math.pow(.03, dt);
      }

      // ルシファーさん：斜め下降キック連打。
      if(this.specialType==='darknessRush' && this.luciferDiveHits<4){
        const other=this.isPlayer?enemy:player;
        const active=this.specialT<=.82 && this.specialT>=.12 && this.vy>30;
        if(other && active){
          const fx=this.x+this.face*42;
          const fy=this.y+36;
          const d=Math.hypot(other.x-fx,other.y-fy);
          const now=performance.now();
          if(d<other.radius+38 && (!this._lastDarkHit || now-this._lastDarkHit>125)){
            this._lastDarkHit=now;
            this.luciferDiveHits++;
            const last=this.luciferDiveHits===4;
            damageHit(this,other,(last?4.0:2.2)*this.damageMul,
                      (last?145:45)*this.face,last?105:35);
          }
        }
      }

      // ボトムスマッシュ予約中：水底へ着くまで自動降下
      if(this.crayfishSmashQueued){
        this.crayfishSmashQueueT-=dt;
        this.vx*=Math.pow(.20,dt);
        this.vy=Math.max(this.vy,380);

        if(this.y>=innerHeight-128){
          this.specialType=null;
          this.specialT=0;
          executeCrayfishBottomSmash(this);
        }else if(this.crayfishSmashQueueT<=0){
          this.crayfishSmashQueued=false;
          this.specialType=null;
          this.specialT=0;
          comboEl.textContent='';
        }
      }

      // ベリアルさん：通常時は常に天井の糸に接続。
      // 投げ／強い下叩きつけでいったん切れ、短い間を置いてすぐ再接続する。
      if(this.type==='crayfish'){
        if(this.belialThreadGrow==null)this.belialThreadGrow=1;
        if(this.belialThreadReconnectT==null)this.belialThreadReconnectT=0;

        const thrownNow=!!this.throwState;
        if(thrownNow && !this._belialWasThrown){
          this.belialThreadGrow=0;
          this.belialThreadReconnectT=.18;
        }
        if(!thrownNow && this._belialWasThrown){
          this.belialThreadReconnectT=Math.max(this.belialThreadReconnectT,.10);
        }
        this._belialWasThrown=thrownNow;

        if(!thrownNow){
          if(this.belialThreadReconnectT>0){
            this.belialThreadReconnectT=Math.max(0,this.belialThreadReconnectT-dt);
          }else{
            // 再接続は素早く。0→1まで約0.2秒。
            this.belialThreadGrow=Math.min(1,this.belialThreadGrow+dt*5.2);
          }
        }
      }

      if(this.type==='crayfish' && this.crayfishCounterT>0){
        this.crayfishCounterT-=dt;
        if(this.crayfishCounterT<=0){
          this.crayfishCounterT=0;
          this.crayfishCounterReady=false;
          if(this.specialType==='crayfishCounter'){
            this.specialType=null;
            this.specialT=0;
          }
        }
      }

      // ベリアルさん：クローラッシュ
      // 土煙の中でも上下だけ少し相手へ自動追尾する。
      if(this.specialType==='crayfishRush'){
        const other=this.isPlayer?enemy:player;
        const now=performance.now();

        if(other){
          const dy=other.y-this.y;
          this.vy += Math.max(-90,Math.min(90,dy*2.2))*dt;

          // 前方向の勢いを少し維持
          if(Math.abs(this.vx)<300){
            this.vx += this.face*160*dt;
          }

          if(Math.hypot(other.x-this.x,other.y-this.y)<other.radius+this.radius+30){
            if(now-(this.crayfishRushLastHit||0)>125){
              this.crayfishRushLastHit=now;
              this.crayfishRushStep++;
              const fin=this.crayfishRushStep>=5;
              damageHit(
                this,other,
                (fin?3.8:1.8)*this.damageMul,
                (fin?155:34)*this.face,
                fin?-40:0
              );
            }
          }
        }
      }

      // アザゼルさん（トンボ）：高速突進攻撃
      if(this.specialType==='piranhaRush' && !this.piranhaRushHit){
        const other=this.isPlayer?enemy:player;
        if(other && Math.hypot(other.x-this.x,other.y-this.y)<other.radius+this.radius+12){
          this.piranhaRushHit=true; damageHit(this,other,9.2*this.damageMul,265*this.face,-35);
          other.hurtFace='both'; other.hurtFaceT=.65;
        }
      }
      // アザゼルさん（トンボ）：上空から急降下
      if((this.specialType==='piranhaDivePunch'||this.specialType==='piranhaDiveKick') && this.piranhaDivePhase===2){
        const other=this.isPlayer?enemy:player;
        if(other && Math.hypot(other.x-this.x,other.y-this.y)<other.radius+this.radius+15){
          this.piranhaDivePhase=3;
          const side=this.specialType==='piranhaDivePunch'?1:-1;
          damageHit(this,other,8.4*this.damageMul,120*this.face*side,245);
          other.hurtFace='both'; other.hurtFaceT=.7;
        }
      }

      // ウリエルさん：前傾タックル。接触した相手を回転させて吹き飛ばす。
      if(this.specialType==='urielTackle' && !this.tackleHit){
        const other=this.isPlayer?enemy:player;
        if(other){
          const fx=this.x+this.face*34;
          const d=Math.hypot(other.x-fx,other.y-this.y);
          if(d<other.radius+this.radius*.78){
            this.tackleHit=true;
            damageHit(this,other,9.0*this.damageMul,285*this.face,-70);
            other.throwState={owner:this,spinSpeed:this.face*12,endT:.62,noWallDamage:true};
            other.spinAngle=0;
            other.hurtFace='both'; other.hurtFaceT=.7;
            setTimeout(()=>{
              if(other && other.throwState && other.throwState.owner===this){
                other.throwState=null;
              }
            },620);
          }
        }
      }

      // 必殺技の赤いオーラが出ている間は、手足そのものに当たり判定を持たせる。
      // 1回の必殺技につき1ヒット。見た目と判定の時間を一致させる。
      if(this.specialType && !this.specialHitDone){
        const other = this.isPlayer ? enemy : player;

        if(other){
          if(this.specialType==='uppercut'){
            // 溜めが終わって上昇し始めてから赤い拳が有効。
            const active = this.specialT<=.54 && this.specialT>=.08;
            if(active){
              const hx=this.x + this.face*48;
              const hy=this.y - 22;
              const hitDist=Math.hypot(other.x-hx, other.y-hy);

              if(hitDist < other.radius + 28){
                this.specialHitDone=true;
                damageHit(this,other,8.0*this.damageMul,90*this.face,-230);
              }
            }
          }else if(this.specialType==='dropkick'){
            // 突進開始後、赤い足が消える直前まで有効。
            const active = this.specialT<=.475 && this.specialT>=.06;
            if(active){
              const fx=this.x + this.face*63;
              const fy=this.y + 25;
              const hitDist=Math.hypot(other.x-fx, other.y-fy);

              // 足先を上げた分、上方向にも少し広い判定。
              if(hitDist < other.radius + 37){
                this.specialHitDone=true;
                damageHit(this,other,10.0*this.damageMul,240*this.face,-35);
              }
            }
          }
        }
      }

      const movePrevX=this.x, movePrevY=this.y;
      this.x += this.vx * dt;
      this.y += this.vy * dt;

      // リリス：ギロチンキックは急降下の全行程で蹴り足に判定。
      // 前フレーム→現在フレームを縦長の帯として判定するので、高速落下でもすり抜けない。
      if(this.specialType==='lilithGuillotineKick' && !this.lilithGuillotineHit){
        const other=this.isPlayer?enemy:player;
        if(other){
          const footX0=movePrevX + this.face*38;
          const footX1=this.x + this.face*38;
          const minX=Math.min(footX0,footX1)-42;
          const maxX=Math.max(footX0,footX1)+42;
          const minHitY=Math.min(movePrevY,this.y)+8;
          const maxHitY=Math.max(movePrevY,this.y)+72;
          const r=other.radius||35;

          if(other.x+r>=minX && other.x-r<=maxX &&
             other.y+r>=minHitY && other.y-r<=maxHitY){
            this.lilithGuillotineHit=true;
            damageHit(this,other,7.4*this.damageMul,95*this.face,285);
            other.vy=Math.max(other.vy,330);
            spawnImpact(other.x,other.y,'hit');
            this.vy=-165;
          }
        }
      }

      const minY=78, maxY=innerHeight-65;

      // 舌投げで壁・床に当たった瞬間に追加ダメージ
      if(this.throwState){
        const hitWall = this.x<=45 || this.x>=innerWidth-45;
        const hitFloor = this.y>=maxY;
        if(hitWall || hitFloor){
          const owner = this.throwState.owner;
          this.x=Math.max(45,Math.min(innerWidth-45,this.x));
          this.y=Math.max(minY,Math.min(maxY,this.y));

          // 壁に当たる直前にガードを押していれば受け身成功。
          // 床は今まで通りダメージ。壁だけ受け身可能。
          if(hitWall && this.wallTechT>0){
            this.throwState=null;
            this.spinAngle=0;
            this.wallTechT=0;
            this.stun=.12;
            this.hurtFaceT=.08;

            // 壁を蹴るように軽く跳ね返る
            this.vx *= -.28;
            this.vy *= .18;

            spawnImpact(this.x,this.y,'guard');

            comboEl.textContent='UKEMI!';
            setTimeout(()=>{
              if(comboEl.textContent==='UKEMI!') comboEl.textContent='';
            },520);
          }else{
            this.hp=Math.max(0,this.hp-7.0);
            this.vx *= -.18;
            this.vy = hitFloor ? -95 : this.vy*.25;
            this.stun=.42;
            spawnImpact(this.x,this.y,'hit');

            if(owner && owner.isPlayer){
              comboHits++;
              comboTimer=1.15;
              comboEl.textContent=`${comboHits} HIT!`;
            }

            this.throwState=null;
            updateHud();
            if(this.hp<=0) endGame(owner ? owner.isPlayer : false);
          }
        }
      }

      this.x=Math.max(45,Math.min(innerWidth-45,this.x));
      const lotusFloor=jumpFloorY();
      this.y=Math.max(minY,Math.min(lotusFloor,this.y));
      if(this.y>=lotusFloor && !this.throwState){
        this.y=lotusFloor;
        if(this.specialType==='lilithGuillotineKick'){
          this.specialType=null;
          this.specialT=0;
          this.attack=null;
          this.attackT=0;
          this.lilithGuillotinePrevY=null;
        }
        // 着地した瞬間に次のジャンプ。JUMPシリーズの基本リズム。
        if(this.vy>=0) this.vy=-JUMP_SPEED;
      }

      const other = this.isPlayer ? enemy : player;
      if (other) this.face = other.x >= this.x ? 1 : -1;
    }
    hit(dmg,kx,ky) {
      if(this.guard){
        dmg*=.22; kx*=.2; ky*=.2;
        spawnImpact(this.x,this.y,'guard');
        playSfx('guard');
      } else {
        this.stun=.18;
        this.flash=.15;
        this.hurtFaceT=.32;
        this.hurtFace=Math.random()<.5?'wink':'both';
        spawnImpact(this.x,this.y,'hit');
        playSfx('hit',Math.min(1.25,.72+dmg*.035));
      }
      this.hp=Math.max(0,this.hp-dmg);
      this.vx += kx; this.vy += ky;
    }
    draw() {
      ctx.save();
      ctx.translate(this.x,this.y);
      if(this.wallClingT>0){
        ctx.save();
        ctx.globalCompositeOperation='lighter';
        ctx.globalAlpha=.55;
        ctx.strokeStyle='#d9fbff';
        ctx.lineWidth=3;
        ctx.beginPath();
        const sx=this.wallClingSide<0?-34:34;
        ctx.arc(sx,22,14,-1.2,1.2);
        ctx.stroke();
        ctx.restore();
      }
      if(this.type==='remiel'&&this.specialType==='mirageKick'&&this.specialT>0&&this.remielKickStartX!=null){
        const elapsed=Math.max(0,.72-this.specialT),step=Math.min(4,Math.floor(elapsed/.14));
        const jumps=[0,58,122,190,255],visualX=this.remielKickStartX+this.face*jumps[step];
        ctx.translate(visualX-this.x,0);
        if(elapsed%.14<.025)ctx.globalAlpha=.38;
      }
      const pal=fighterPalette(this.type);

      // ムーンサルトキックは本体そのものが高速縦回転する。
      if(this.type==='sariel'&&this.specialType==='moonSalt'&&this.specialT>0){
        ctx.rotate(this.moonSaltSpin||0);
      }

      if(this.specialType==='burningCyclone'){
        ctx.rotate(burningCycloneAngle(this));
      }
      if(this.specialType==='lilithBackSpin'){
        const elapsed=(performance.now()-(this.lilithSpinStartTime||performance.now()))/1000;
        ctx.rotate(elapsed*18*(this.face>0?-1:1));
      }


      // トンボ：アザゼルさん。オニヤンマを意識した黒＋黄の大型トンボ。
      if(this.type==='piranha'){
        if(this.face<0) ctx.scale(-1,1);
        if((this.specialType==='piranhaDivePunch'||this.specialType==='piranhaDiveKick') && this.piranhaDivePhase>=2){
          ctx.rotate(Math.PI/2);
        }else if(this.attack==='punch' && this.specialType!=='piranhaDivePunch'){
          const t=Math.max(0,Math.min(1,this.attackT/.34)); ctx.rotate((1-t)*Math.PI*2);
        }else if(this.attack==='kick' && this.specialType!=='piranhaDiveKick'){
          const t=Math.max(0,Math.min(1,this.attackT/.40)); ctx.rotate(-(1-t)*Math.PI*2);
        }
        if(this.flash>0) ctx.globalAlpha=.55;

        const flap=Math.sin(performance.now()/42)*.14;
        ctx.fillStyle='rgba(180,225,238,.62)';
        ctx.beginPath();ctx.ellipse(-3,-8,45,10,-.50+flap,0,Math.PI*2);ctx.fill();
        ctx.beginPath();ctx.ellipse(-5,7,45,10,.48-flap,0,Math.PI*2);ctx.fill();
        ctx.beginPath();ctx.ellipse(8,-7,39,9,.42-flap,0,Math.PI*2);ctx.fill();
        ctx.beginPath();ctx.ellipse(8,8,39,9,-.42+flap,0,Math.PI*2);ctx.fill();

        ctx.fillStyle='#171717';
        ctx.beginPath();ctx.ellipse(7,5,21,18,0,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#f2d928';
        ctx.fillRect(-5,-9,6,27);
        ctx.fillRect(8,-11,7,30);

        ctx.strokeStyle='#171717';
        ctx.lineWidth=14;
        ctx.lineCap='round';
        ctx.beginPath();ctx.moveTo(-8,7);ctx.lineTo(-102,8);ctx.stroke();
        ctx.strokeStyle='#f2d928';
        ctx.lineWidth=5;
        for(let x=-22;x>=-92;x-=18){
          ctx.beginPath();ctx.moveTo(x,2);ctx.lineTo(x,14);ctx.stroke();
        }
        ctx.strokeStyle='#171717';ctx.lineWidth=7;
        ctx.beginPath();ctx.moveTo(-99,8);ctx.lineTo(-122,8);ctx.stroke();

        ctx.fillStyle='#242424';ctx.beginPath();ctx.arc(31,3,16,0,Math.PI*2);ctx.fill();
        ctx.fillStyle=(this.hurtFaceT>0||this.throwState)?'#7e5b4c':'#38b7a4';
        ctx.beginPath();ctx.ellipse(37,1,11,14,.15,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='rgba(255,255,255,.62)';
        ctx.beginPath();ctx.arc(40,-4,3,0,Math.PI*2);ctx.fill();

        ctx.strokeStyle='#111';ctx.lineWidth=4;ctx.lineCap='round';
        ctx.beginPath();
        ctx.moveTo(13,15);ctx.lineTo(30,34);ctx.lineTo(35,44);
        ctx.moveTo(4,16);ctx.lineTo(13,40);ctx.lineTo(8,52);
        ctx.moveTo(-5,14);ctx.lineTo(-19,35);ctx.lineTo(-23,47);
        ctx.stroke();

        if(this.attack==='punch'){
          ctx.strokeStyle='rgba(220,248,255,.95)';
          ctx.lineWidth=7;
          ctx.beginPath();ctx.arc(32,3,34,-1.0,.75);ctx.stroke();
        }
        if(this.attack==='kick'){
          ctx.strokeStyle='rgba(245,225,80,.9)';
          ctx.lineWidth=8;
          ctx.beginPath();ctx.arc(-82,8,38,2.2,4.1);ctx.stroke();
        }

        if(this.specialType==='piranhaRush'){
          const bite=(Math.sin(performance.now()/48)+1)*.5;
          // v2.9: 以前の約1/4の見た目。実物寄りに黒い大顎＋視認用の黄色い縁。
          const reach=4.5+3.5*(1-bite);
          ctx.lineCap='round';

          // 黄色い縁取りを先に太く描く。
          ctx.strokeStyle='#f3d72d';
          ctx.lineWidth=8;
          ctx.beginPath();
          ctx.moveTo(43,-3);ctx.quadraticCurveTo(49+reach,-6,56+reach,-2);
          ctx.moveTo(43,4);ctx.quadraticCurveTo(49+reach,7,56+reach,3);
          ctx.stroke();

          // 本体の顎は黒。
          ctx.strokeStyle='#111';
          ctx.lineWidth=5;
          ctx.beginPath();
          ctx.moveTo(43,-3);ctx.quadraticCurveTo(49+reach,-6,56+reach,-2);
          ctx.moveTo(43,4);ctx.quadraticCurveTo(49+reach,7,56+reach,3);
          ctx.stroke();
        }

        ctx.restore();
        return;
      }


      // クモ：ベリアルさん。天井から伸びる糸に繋がり、空中を自在に移動。
      if(this.type==='crayfish'){
        if(this.face<0) ctx.scale(-1,1);
        if(this.flash>0) ctx.globalAlpha=.55;

        // 天井へ続く蜘蛛の糸。投げられている間は切れ、復帰後に上へ伸び直す。
        if((this.belialThreadGrow||0)>0 && !this.throwState){
          const grow=Math.max(0,Math.min(1,this.belialThreadGrow||0));
          ctx.save();
          if(this.face<0) ctx.scale(-1,1);
          ctx.strokeStyle='rgba(238,244,238,.88)';
          ctx.lineWidth=2.3;
          ctx.beginPath();
          ctx.moveTo(0,-17);
          // 体から画面上端まで一本の糸。切断中は grow=0、再接続時に上へ伸びる。
          const threadTop=-Math.max(28,this.y-4)*grow;
          ctx.quadraticCurveTo(10,threadTop*.55,0,threadTop);
          ctx.stroke();
          ctx.restore();
        }

        // 腹部と頭
        ctx.fillStyle='#44354f';
        ctx.beginPath();ctx.ellipse(-3,17,31,36,0,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#5a4568';
        ctx.beginPath();ctx.ellipse(8,-11,23,21,0,0,Math.PI*2);ctx.fill();

        // 8本脚。ラッシュ中は先端を高速に振る。
        const rush=this.specialType==='crayfishRush';
        const wig=rush?Math.sin(performance.now()/34)*16:0;
        ctx.strokeStyle='#392b43';ctx.lineWidth=8;ctx.lineCap='round';
        ctx.beginPath();
        const legYs=[-5,7,19,30];
        legYs.forEach((yy,i)=>{
          const ext=38+i*4+(rush?10:0);
          ctx.moveTo(-18,yy);ctx.lineTo(-45,yy-18-i*3);ctx.lineTo(-ext-18,yy-8+wig*(i%2?1:-1));
          ctx.moveTo(18,yy);ctx.lineTo(45,yy-18-i*3);ctx.lineTo(ext+18,yy-8-wig*(i%2?1:-1));
        });
        ctx.stroke();

        // 顔。カウンター待機中は複眼が赤く光る。
        const counter=this.specialType==='crayfishCounter';
        ctx.fillStyle=counter?'#ff382e':'#d9e6dc';
        for(const [ex,ey] of [[0,-18],[10,-20],[19,-15],[5,-9],[15,-7],[25,-5]]){
          ctx.beginPath();ctx.arc(ex,ey,3.6,0,Math.PI*2);ctx.fill();
        }
        if(counter){
          ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle='rgba(255,50,35,.35)';
          ctx.beginPath();ctx.arc(11,-14,24,0,Math.PI*2);ctx.fill();ctx.restore();
        }

        // 糸を使う攻撃の簡易表現
        if(this.attack==='crayfishStab' || this.specialType==='crayfishBottomSmash'){
          ctx.strokeStyle='rgba(245,250,245,.92)';ctx.lineWidth=5;
          ctx.beginPath();ctx.moveTo(18,-2);ctx.lineTo(70,this.specialType==='crayfishBottomSmash'?54:4);ctx.stroke();
        }
        if(this.specialType==='crayfishCounterHit'){
          ctx.strokeStyle='#392b43';ctx.lineWidth=11;ctx.beginPath();
          ctx.moveTo(18,0);ctx.lineTo(58,45);ctx.moveTo(-18,0);ctx.lineTo(-58,45);ctx.stroke();
        }

        if(this.attack==='crayfishHammer'){
          const jab=16+Math.sin(performance.now()/42)*5;
          ctx.strokeStyle='#2f2338';ctx.lineWidth=10;ctx.lineCap='round';
          ctx.beginPath();
          ctx.moveTo(19,-5);ctx.lineTo(52+jab,-18);ctx.lineTo(78+jab,-8);
          ctx.moveTo(18,6);ctx.lineTo(49+jab,4);ctx.lineTo(76+jab,14);
          ctx.stroke();
          ctx.strokeStyle='rgba(238,244,238,.72)';ctx.lineWidth=3;
          ctx.beginPath();ctx.moveTo(70+jab,-5);ctx.lineTo(88+jab,-7);ctx.stroke();
        }

        if(this.attack==='crayfishUpper'){
          const kick=18+Math.sin(performance.now()/48)*4;
          ctx.strokeStyle='#2f2338';ctx.lineWidth=11;ctx.lineCap='round';
          ctx.beginPath();
          ctx.moveTo(17,22);ctx.lineTo(52+kick,38);ctx.lineTo(81+kick,31);
          ctx.moveTo(10,31);ctx.lineTo(44+kick,55);ctx.lineTo(74+kick,52);
          ctx.stroke();
        }

        // ベリアルの舌ボタン＝カエルの舌と同じ性能。ただし見た目は白い蜘蛛糸。
        if(this.tongueT>0 || (this.tonguePullTarget && this.tonguePullTimer>0) || (this.tongueClashTarget && this.tongueClashTimer>0)){
          const target=this.tongueClashTarget || this.tonguePullTarget || (this.isPlayer?enemy:player);
          if(target){
            const dx=(target.x-this.x)*this.face;
            const dy=target.y-this.y;
            const len=Math.min(this.tongueRange,Math.max(0,dx));
            const ty=Math.max(-70,Math.min(70,dy));
            ctx.strokeStyle='rgba(250,253,250,.96)';
            ctx.lineWidth=4;
            ctx.lineCap='round';
            ctx.beginPath();
            ctx.moveTo(24,-7);
            ctx.lineTo(len,-7+ty);
            ctx.stroke();

            // 糸先の小さな粘着輪。
            ctx.lineWidth=2;
            ctx.beginPath();
            ctx.arc(len,-7+ty,7,0,Math.PI*2);
            ctx.stroke();
          }
        }

        ctx.restore();
        return;
      }


      // ウリエルさんは少し大柄
      if(this.bodyScale && this.bodyScale!==1) ctx.scale(this.bodyScale,this.bodyScale);

      // クローラッシュ中は追尾角度に合わせてほんの少し傾く
      if(this.specialType==='crayfishRush'){
        ctx.rotate(Math.max(-.16,Math.min(.16,this.vy/520)));
      }

      // ガーディアンタックル中は少し前傾
      if(this.specialType==='urielTackle') ctx.rotate(this.face*.22);

      // ヘルラッシュ中は少し低い姿勢
      if(this.specialType==='hellRush' && this.specialT>.55){
        ctx.translate(0,8); ctx.scale(1.04,.90);
      }

      // かえる跳びアッパーの溜め：少ししゃがむ
      if(this.specialType==='uppercut' && this.specialT>.48){
        ctx.translate(0,10);
        ctx.scale(1.08,.82);
      }

      // スピンキックカッター：フィギュアスケートのように高速3回転。
      // 右向き時は画面上で反時計回り、左向き時は左右反転して逆回転。
      if(this.type==='kawazu' && this.specialType==='kawazuSpinCutter' && this.specialT>0){
        const total=.84;
        const progress=Math.max(0,Math.min(1,(total-this.specialT)/total));
        const spinDir=this.face>0?-1:1;
        ctx.rotate(spinDir*progress*Math.PI*6);
      }else if(this.throwState || Math.abs(this.spinAngle)>.02){
        ctx.rotate(this.spinAngle);
      }
      if(this.face<0) ctx.scale(-1,1);
      if(this.flash>0) ctx.globalAlpha=.55;

      ctx.save();
      ctx.filter='none';

      // 2頭身くらいの丸い胴体
      ctx.fillStyle=pal.limb;
      ctx.beginPath();
      ctx.ellipse(0,31,30,34,0,0,Math.PI*2);
      ctx.fill();

      // お腹
      ctx.fillStyle=pal.belly;
      ctx.beginPath();
      ctx.ellipse(2,36,19,23,0,0,Math.PI*2);
      ctx.fill();

      if(this.type==='satanael'){
        // 真ボス：黒赤い体に金の腹、赤く光る瞳。
        ctx.save();
        ctx.globalCompositeOperation='lighter';
        ctx.globalAlpha=.22+.08*Math.sin(performance.now()/180);
        ctx.fillStyle='#ff2028';ctx.shadowColor='#ff1720';ctx.shadowBlur=18;
        ctx.beginPath();ctx.arc(0,-8,48,0,Math.PI*2);ctx.fill();
        ctx.restore();
      }
      if(this.type==='flauros'){
        // v1.9.9 ヒョウ柄：参考画像のような「黒いロゼット＋暖色の芯」。汚れに見えるベタ斑点は使わない。
        const drawRosette=(x,y,rx,ry,rot,open=0)=>{ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.lineCap='round';ctx.strokeStyle='#21120e';ctx.lineWidth=4.8;ctx.beginPath();ctx.ellipse(0,0,rx,ry,0,.25+open,2.55);ctx.stroke();ctx.beginPath();ctx.ellipse(0,0,rx,ry,0,3.45,5.95-open);ctx.stroke();ctx.fillStyle='#9a542b';ctx.beginPath();ctx.ellipse(0,0,rx*.48,ry*.48,0,0,Math.PI*2);ctx.fill();ctx.restore();};
        ctx.save();
        drawRosette(-18,19,8,6,.20,.08); drawRosette(18,25,9,6,-.35,.16);
        drawRosette(-16,43,8,7,-.18,.12); drawRosette(17,49,7,6,.32,.05);
        drawRosette(1,12,7,5,.08,.18);
        ctx.fillStyle='#21120e';[[-27,31,2.8],[27,37,2.6],[-6,57,2.8],[9,59,2.4]].forEach(([x,y,r])=>{ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();});
        ctx.restore();
      }

      if(this.type==='kawazu'){
        // 参考のアカメアマガエル風：胴体の左右に青い差し色
        ctx.save();
        ctx.fillStyle='#2e76b8';
        ctx.globalAlpha=.88;

        ctx.beginPath();
        ctx.ellipse(-23,31,8,25,-.18,0,Math.PI*2);
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(23,31,8,25,.18,0,Math.PI*2);
        ctx.fill();

        // 青と緑の境目に少し暗い青
        ctx.fillStyle='#24558d';
        ctx.globalAlpha=.72;
        ctx.beginPath();
        ctx.ellipse(-26,34,4,19,-.18,0,Math.PI*2);
        ctx.ellipse(26,34,4,19,.18,0,Math.PI*2);
        ctx.fill();
        ctx.restore();
      }

      // ニュートラル脚：
      // キック中は蹴り足側だけ消し、反対側の軸足は残す。
      ctx.strokeStyle=pal.limb;
      ctx.lineWidth=12;
      ctx.lineCap='round';
      ctx.lineJoin='round';
      ctx.beginPath();

      // 左側の脚は軸足として常に残す
      ctx.moveTo(-15,48); ctx.lineTo(-19,62); ctx.lineTo(-28,67);

      // 右側の脚はキック中だけ攻撃ポーズ側へ差し替える
      if(this.attack!=='kick'){
        ctx.moveTo(15,48); ctx.lineTo(19,62); ctx.lineTo(28,67);
      }
      ctx.stroke();

      // ニュートラル腕。
      // パンチ中・ガード中は通常腕を描かず、それぞれ専用ポーズに差し替える。
      if(!this.guard && this.attack!=='wave'){
        ctx.strokeStyle=pal.limb;
        ctx.lineWidth=10;
        ctx.beginPath();
        ctx.moveTo(-23,22); ctx.lineTo(-32,35);
        if(this.attack!=='punch'){
          ctx.moveTo(23,22); ctx.lineTo(32,35);
        }
        ctx.stroke();
      }

      if(this.type==='kawazu'){
        // 腕脚そのものは緑。先端だけオレンジにする。
        ctx.save();
        ctx.fillStyle='#ff7a2f';

        // 足先：
        // キック中も軸足側（左）は残し、蹴り足側（右）だけ攻撃用へ差し替える。
        ctx.beginPath();
        ctx.ellipse(-29,67,10,7,-.18,0,Math.PI*2);
        if(this.attack!=='kick'){
          ctx.ellipse(29,67,10,7,.18,0,Math.PI*2);
        }
        ctx.fill();

        // 手先
        if(!this.guard && this.attack!=='wave'){
          ctx.beginPath();
          ctx.ellipse(-33,36,8,6,-.25,0,Math.PI*2);
          if(this.attack!=='punch'){
            ctx.ellipse(33,36,8,6,.25,0,Math.PI*2);
          }
          ctx.fill();
        }
        ctx.restore();
      }

      // v6.35 リリスさん：リボンは廃止。代わりにピンク配色＋口紅。
      if(this.type==='purple'){
        ctx.save();
        // 上唇・下唇を小さく描き、戦闘中でも顔を邪魔しない。
        ctx.fillStyle='#d91f6f';
        ctx.beginPath();
        ctx.ellipse(-5,17,7,2.8,-.10,0,Math.PI*2);
        ctx.ellipse( 5,17,7,2.8, .10,0,Math.PI*2);
        ctx.fill();
        ctx.fillStyle='#ff7fb4';
        ctx.beginPath();
        ctx.ellipse(0,20,10,3.2,0,0,Math.PI);
        ctx.fill();
        ctx.restore();
      }

      if(this.type==='jihal'&&(this.jihalCharging||this.specialType==='lightningDash'||this.specialType==='thunderChargeRush')){
        ctx.save();ctx.globalCompositeOperation='lighter';
        if(!this.jihalCharging){
          // 高速技は長い雷の残光を後方へ引く。
          ctx.globalAlpha=.34;ctx.strokeStyle='#fff08a';ctx.lineWidth=8;ctx.lineCap='round';ctx.shadowColor='#ffe75a';ctx.shadowBlur=16;
          const rushDir=this.jihalRushDir||this.face||1;
          const localDir=rushDir*(this.face||1);
          for(let i=-1;i<=1;i++){
            ctx.beginPath();
            ctx.moveTo(-28*localDir,i*23);
            ctx.lineTo(-145*localDir,i*23+i*5);
            ctx.stroke();
          }
        }
        const p=this.jihalCharging?(.35+.65*(this.jihalCharge||0)):1;
        ctx.globalAlpha=.48*p;ctx.strokeStyle='#fff19a';ctx.lineWidth=3;ctx.shadowColor='#ffe75a';ctx.shadowBlur=13;
        for(let i=0;i<4;i++){const yy=-45+i*30,xx=(i%2?28:-28);ctx.beginPath();ctx.moveTo(xx,yy);ctx.lineTo(xx+this.face*13,yy+8);ctx.lineTo(xx-this.face*3,yy+17);ctx.stroke();}
        ctx.restore();
      }

      if(this.type==='remiel'){
        const mir=remielMirages.find(m=>m.owner===this&&m.t>0);
        if(mir){
          const drawRemielCopy=(gy,ga)=>{
            ctx.save();ctx.translate(0,gy);
            ctx.globalAlpha=ga;
            ctx.shadowColor='#c9f6ff';ctx.shadowBlur=3;

            // 本体と同じ寸法で胴体・腹。
            ctx.fillStyle=pal.limb;
            ctx.beginPath();ctx.ellipse(0,31,30,34,0,0,Math.PI*2);ctx.fill();
            ctx.fillStyle=pal.belly;
            ctx.beginPath();ctx.ellipse(2,36,19,23,0,0,Math.PI*2);ctx.fill();

            // 脚。
            ctx.strokeStyle=pal.limb;ctx.lineWidth=12;ctx.lineCap='round';ctx.lineJoin='round';
            ctx.beginPath();
            ctx.moveTo(-15,48);ctx.lineTo(-19,62);ctx.lineTo(-28,67);
            if(this.attack!=='kick'){
              ctx.moveTo(15,48);ctx.lineTo(19,62);ctx.lineTo(28,67);
            }
            ctx.stroke();

            // 腕。
            if(!this.guard && this.attack!=='wave'){
              ctx.strokeStyle=pal.limb;ctx.lineWidth=10;ctx.beginPath();
              ctx.moveTo(-23,22);ctx.lineTo(-32,35);
              if(this.attack!=='punch'){ctx.moveTo(23,22);ctx.lineTo(32,35);}
              ctx.stroke();
            }

            // 頭。
            ctx.fillStyle=pal.body;ctx.beginPath();ctx.ellipse(0,-6,35,30,0,0,Math.PI*2);ctx.fill();
            ctx.fillStyle=pal.eyeBump;ctx.beginPath();
            ctx.arc(-19,-29,16,0,Math.PI*2);ctx.arc(19,-29,16,0,Math.PI*2);ctx.fill();
            ctx.fillStyle='#fff';ctx.beginPath();
            ctx.arc(-19,-30,10,0,Math.PI*2);ctx.arc(19,-30,10,0,Math.PI*2);ctx.fill();

            // 本体と同じ方向へ視線。
            const target=this.isPlayer?enemy:player;
            let eyeShift=5;
            if(target && target.x<this.x) eyeShift=-5;
            ctx.fillStyle='#182a2a';ctx.beginPath();
            ctx.arc(-19+eyeShift,-29,4,0,Math.PI*2);
            ctx.arc( 19+eyeShift,-29,4,0,Math.PI*2);ctx.fill();

            ctx.fillStyle='rgba(255,130,150,.42)';ctx.beginPath();
            ctx.arc(-24,2,5,0,Math.PI*2);ctx.arc(24,2,5,0,Math.PI*2);ctx.fill();

            ctx.strokeStyle='#255c31';ctx.lineWidth=3;ctx.lineCap='round';ctx.beginPath();
            ctx.arc(0,-3,14,.15*Math.PI,.85*Math.PI);ctx.stroke();

            // 攻撃時の伸ばした手足もコピー。
            if(this.attack==='punch'){
              ctx.strokeStyle=pal.limb;ctx.lineWidth=12;ctx.beginPath();
              ctx.moveTo(22,22);
              if(this.attackVariant==='up')ctx.lineTo(48,-22);
              else ctx.lineTo(59,8);
              ctx.stroke();
            }
            if(this.attack==='kick'){ctx.strokeStyle=pal.limb;ctx.lineWidth=13;ctx.beginPath();ctx.moveTo(15,48);ctx.lineTo(67,49);ctx.stroke();}
            if(mir.tongueT>0){const target=this.isPlayer?enemy:player;const len=Math.min((this.tongueRange||220)*1.28,target?Math.abs(target.x-this.x):(this.tongueRange||220));ctx.strokeStyle='#ff718e';ctx.lineWidth=8;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(0,8);ctx.lineTo(len,8+(mir.tongueAimY||0));ctx.stroke();}
            ctx.restore();
          };

          const splitTime=.28;
          if((mir.age||0)<splitTime){
            const p=Math.max(0,Math.min(1,(mir.age||0)/splitTime));
            const e=p*p*(3-2*p);

            // 実体と幻影の2体だけを、同じ中心点から反対方向へ広げる。
            const bodyAbs =mir.originY+(mir.bodyTargetY -mir.originY)*e;
            const ghostAbs=mir.originY+(mir.ghostTargetY-mir.originY)*e;
            const bodyRel =bodyAbs-this.y;
            const ghostRel=ghostAbs-this.y;

            drawRemielCopy(bodyRel,.90);
            drawRemielCopy(ghostRel,.90);

            // この間は後で描かれる実体を隠し、3体に見えないようにする。
            ctx.globalAlpha=0;
          }else{
            // 分裂後は実体を通常描画し、幻影だけ追加。
            const settle=Math.min(1,((mir.age||0)-splitTime)/.10);
            drawRemielCopy(mir.offsetY,.82*settle*Math.min(1,mir.t/.22));
          }
        }
      }
      // 頭
      ctx.fillStyle=pal.body;
      ctx.beginPath();
      ctx.ellipse(0,-6,35,30,0,0,Math.PI*2);
      ctx.fill();

      if(this.type==='flauros'){
        // 顔側もロゼット柄。輪の内側を茶色にしてヒョウ柄として読めるようにする。
        const headRosette=(x,y,rx,ry,rot)=>{ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.strokeStyle='#21120e';ctx.lineWidth=4.2;ctx.lineCap='round';ctx.beginPath();ctx.ellipse(0,0,rx,ry,0,.30,2.45);ctx.stroke();ctx.beginPath();ctx.ellipse(0,0,rx,ry,0,3.55,5.75);ctx.stroke();ctx.fillStyle='#9a542b';ctx.beginPath();ctx.ellipse(0,0,rx*.45,ry*.44,0,0,Math.PI*2);ctx.fill();ctx.restore();};
        ctx.save();headRosette(-23,-8,7,5,.15);headRosette(21,-14,8,5,-.25);headRosette(-5,7,6,4,.25);headRosette(25,5,5,4,-.2);ctx.fillStyle='#21120e';ctx.beginPath();ctx.arc(-29,7,2.5,0,Math.PI*2);ctx.fill();ctx.restore();
      }

      // 目のふくらみ
      ctx.fillStyle=pal.eyeBump;
      ctx.beginPath();
      ctx.arc(-19,-29,16,0,Math.PI*2);
      ctx.arc(19,-29,16,0,Math.PI*2);
      ctx.fill();

      // 目：通常時と被弾時で表情を変える
      if(this.hurtFaceT>0 || this.throwState){
        ctx.strokeStyle='#182a2a';
        ctx.lineWidth=4;
        ctx.lineCap='round';

        if(this.hurtFace==='both'){
          // 両目をぎゅっと閉じる
          ctx.beginPath();
          ctx.moveTo(-28,-30); ctx.lineTo(-19,-26); ctx.lineTo(-10,-30);
          ctx.moveTo(10,-30); ctx.lineTo(19,-26); ctx.lineTo(28,-30);
          ctx.stroke();
        }else{
          // 片目を閉じ、もう片方は開く
          ctx.fillStyle='#fff';
          ctx.beginPath();
          ctx.arc(19,-30,10,0,Math.PI*2);
          ctx.fill();

          ctx.fillStyle='#182a2a';
          ctx.beginPath();
          ctx.arc(22,-29,4,0,Math.PI*2);
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(-28,-30); ctx.lineTo(-19,-26); ctx.lineTo(-10,-30);
          ctx.stroke();
        }
      }else{
        ctx.fillStyle='#fff';
        ctx.beginPath();
        ctx.arc(-19,-30,10,0,Math.PI*2);
        ctx.arc(19,-30,10,0,Math.PI*2);
        ctx.fill();

        ctx.fillStyle='#182a2a';
        ctx.beginPath();
        ctx.arc(-14,-29,4,0,Math.PI*2);
        ctx.arc(24,-29,4,0,Math.PI*2);
        ctx.fill();

        if(this.type==='kawazu'){
          // 白目は白のまま。赤い部分は虹彩だけ。
          ctx.fillStyle='#e62d24';
          ctx.beginPath();
          ctx.arc(-19,-30,7.2,0,Math.PI*2);
          ctx.arc(19,-30,7.2,0,Math.PI*2);
          ctx.fill();

          // 赤い虹彩の内側に黒い縦長の瞳孔
          ctx.fillStyle='#151515';
          ctx.beginPath();
          ctx.ellipse(-19,-30,2.8,5.3,0,0,Math.PI*2);
          ctx.ellipse(19,-30,2.8,5.3,0,0,Math.PI*2);
          ctx.fill();

          // 小さな光
          ctx.fillStyle='rgba(255,255,255,.88)';
          ctx.beginPath();
          ctx.arc(-21,-33,1.6,0,Math.PI*2);
          ctx.arc(17,-33,1.6,0,Math.PI*2);
          ctx.fill();
        }
      }

      // ほっぺ
      ctx.fillStyle='rgba(255,130,150,.42)';
      ctx.beginPath();
      ctx.arc(-24,2,5,0,Math.PI*2);
      ctx.arc(24,2,5,0,Math.PI*2);
      ctx.fill();

      // 口：被弾時は口角を下げる
      ctx.strokeStyle='#255c31';
      ctx.lineWidth=3;
      ctx.lineCap='round';
      ctx.beginPath();
      if(this.hurtFaceT>0 || this.throwState){
        ctx.arc(0,9,12,1.15*Math.PI,1.85*Math.PI);
      }else{
        ctx.arc(0,-3,14,.15*Math.PI,.85*Math.PI);
      }
      ctx.stroke();

      ctx.restore();

      // パンチは腕だけ前へ
      if(this.attack==='punch'){
        ctx.save();
        ctx.filter='none';
        ctx.strokeStyle=pal.limb;
        ctx.lineWidth=12;
        ctx.lineCap='round';
        ctx.beginPath();
        ctx.moveTo(22,22);
        if(this.specialType==='abyssCharge'){
          // アビスチャージ中：肘を曲げ、拳を身体の横へ引いて溜める。
          ctx.lineTo(37,31);
          ctx.lineTo(26,8);
        }else if(this.specialType==='abyssBurst'){
          // ボタンを離した瞬間：溜めた腕を前へ伸ばしてパンチ。
          ctx.lineTo(70,7);
        }else if(this.specialType==='hellCrashFinish'){
          ctx.lineTo(48,-38);
        }else if(this.specialType==='aquaTornado'){
          ctx.lineTo(48,-34);
        }else if(this.attackVariant==='up'){
          ctx.lineTo(48,-22);
        }else{
          ctx.lineTo(59,8);
        }
        ctx.stroke();
        ctx.restore();

        if(this.type==='kawazu'){
          ctx.save();
          ctx.fillStyle='#ff7a2f';
          let kx=59, ky=8;
          if(this.specialType==='kawazuPressureRush'){kx=58;ky=8;}
          else if(this.attackVariant==='up'){kx=48;ky=-22;}
          ctx.beginPath();
          ctx.ellipse(kx,ky,9,6,0,0,Math.PI*2);
          ctx.fill();
          ctx.restore();
        }

        if(this.specialType==='uppercut' && this.specialT<=.54 && this.specialT>=.08){
          drawBurningAura(48,-22,13,18,-.35);
        }
      }

      // キックは脚だけ前へ
      if(this.attack==='kick' && this.specialType!=='dropkick' && this.specialType!=='aquaStream' && this.specialType!=='lilithBackSpin'){
        ctx.save();
        ctx.filter='none';
        ctx.strokeStyle=pal.limb;
        ctx.lineWidth=13;
        ctx.lineCap='round';
        ctx.beginPath();
        ctx.moveTo(15,48);
        if(this.attackVariant==='down'){
          ctx.lineTo(52,78);
        }else{
          ctx.lineTo(60,48);
        }
        ctx.stroke();
        ctx.restore();

        if(this.type==='kawazu'){
          ctx.save();
          ctx.fillStyle='#ff7a2f';
          const ky=this.attackVariant==='down'?78:48;
          const kx=this.attackVariant==='down'?52:60;
          ctx.beginPath();
          ctx.ellipse(kx,ky,10,7,0,0,Math.PI*2);
          ctx.fill();
          ctx.restore();
        }
      }

      if(this.specialType==='lilithBackSpin'){
        ctx.save(); ctx.filter='none'; ctx.strokeStyle=pal.limb; ctx.lineWidth=13; ctx.lineCap='round';
        ctx.beginPath(); ctx.moveTo(-13,45); ctx.lineTo(-58,46); ctx.moveTo(13,45); ctx.lineTo(58,46); ctx.stroke();
        ctx.restore();
      }

      if(this.specialType==='dropkick'){
        // 攻撃する脚は1本だけ。反対側の脚は軸足として身体側に残す。
        ctx.save();
        ctx.filter='none';
        ctx.strokeStyle=pal.limb;
        ctx.lineWidth=13;
        ctx.lineCap='round';
        ctx.beginPath();
        ctx.moveTo(14,46);
        // v0.40: 蹴り足を少し斜め上へ伸ばす。
        ctx.lineTo(67,25);
        ctx.stroke();
        ctx.restore();

        if(this.specialT<=.475 && this.specialT>=.06){
          drawBurningAura(62,25,27,14,-.28);
        }
      }

      if(this.specialType==='aquaStream'){
        ctx.save();
        ctx.filter='none';
        ctx.strokeStyle=pal.limb;
        ctx.lineWidth=13;
        ctx.lineCap='round';
        ctx.beginPath();
        ctx.moveTo(15,47);
        ctx.lineTo(48,68);
        ctx.stroke();
        ctx.restore();
      }

      if(this.type==='pascal'||this.type==='malphas'){
        // 工作員は黄色い工具ゴーグル＋胸の工具マークで通常カエルと区別。
        ctx.save();
        ctx.strokeStyle='#ffe45c';ctx.lineWidth=4;
        ctx.beginPath();ctx.arc(-15,-27,10,0,Math.PI*2);ctx.arc(15,-27,10,0,Math.PI*2);ctx.stroke();
        ctx.beginPath();ctx.moveTo(-5,-27);ctx.lineTo(5,-27);ctx.stroke();
        ctx.fillStyle='#ffe45c';ctx.font='bold 15px sans-serif';ctx.textAlign='center';ctx.fillText('🔧',0,25);
        ctx.restore();
      }

      if(this.type==='black' && (this.specialType==='hellCrashFinish' || this.specialType==='abyssCharge' || this.specialType==='abyssBurst' || this.specialType==='iceCharge' || this.specialType==='iceChargeRelease')){
        let intensity=1;
        if(this.specialType==='abyssCharge'){
          const held=Math.max(0,performance.now()-(this.chargeStartTime||performance.now()));
          intensity=.4+.6*Math.min(1,held/1150);
        }
        if(this.specialType==='hellCrashFinish'){
          drawIceAura(70,48,26,14,intensity);
        }else if(this.specialType==='abyssCharge'){
          // 曲げた腕の拳に赤い力を溜める。
          drawIceAura(26,8,19,16,intensity);
        }else if(this.specialType==='abyssBurst'){
          // アビスチャージ解放：拳の周囲が一瞬凍りつく。
          drawIceAura(64,7,24,20,intensity);
        }else{
          // アイスチャージ中は蹴り足側に冷気を集める。
          drawIceAura(18,48,this.specialType==='iceCharge'?20:28,this.specialType==='iceCharge'?14:19,intensity);
        }
      }

      if(this.type==='purple' && this.specialType==='lilithGuillotineKick'){
        ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.55;
        ctx.strokeStyle='#d7b8ff';ctx.lineWidth=4;ctx.lineCap='round';
        for(let i=-1;i<=1;i++){ctx.beginPath();ctx.moveTo(-28+i*18,-22);ctx.lineTo(-28+i*18,-78);ctx.stroke();}
        ctx.restore();
      }

      if(this.type==='green' && this.specialType==='burningCyclone'){
        // 高速回転中は両足それぞれに赤いオーラ
        drawBurningAura(-17,52,18,13,-.15);
        drawBurningAura(17,52,18,13,.15);
      }

      if(this.type==='yellow' && this.specialType==='raphaelBubbleMove'){
        // エアホバー：全身を白青い風の渦で包む。
        ctx.save();
        ctx.globalCompositeOperation='lighter';
        ctx.translate(0,20);
        const wt=performance.now()/95;
        for(let i=0;i<3;i++){
          ctx.globalAlpha=.30+i*.10;
          ctx.strokeStyle=i===1?'#ffffff':'#b9f4ff';
          ctx.lineWidth=3+i;
          ctx.beginPath();
          ctx.ellipse(0,0,42+i*7,55+i*5,wt*.12+i*.8,-2.55,2.55);
          ctx.stroke();
        }
        ctx.restore();
      }

      if(this.type==='green' && this.michaelRedAuraT>0){
        ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle='#ff3025';ctx.lineWidth=5;
        ctx.globalAlpha=.42+.14*Math.sin(performance.now()/75);ctx.shadowColor='#ff2718';ctx.shadowBlur=18;
        ctx.beginPath();ctx.ellipse(0,18,49,64,0,0,Math.PI*2);ctx.stroke();ctx.restore();
      }

      if(this.type==='beelzebub' || this.type==='samael'){
        // 黒い身体に蛍光グリーンの目・輪郭が浮くラスボス演出
        ctx.save();
        ctx.globalCompositeOperation='lighter';
        ctx.fillStyle='#9aff32';
        ctx.shadowColor='#78ff18';
        ctx.shadowBlur=12;
        ctx.beginPath();
        ctx.arc(-15,-27,5.5,0,Math.PI*2);
        ctx.arc(15,-27,5.5,0,Math.PI*2);
        ctx.fill();
        ctx.restore();
      }

      if(this.type==='seraphiel' && (this.specialType==='seraphicUpper'||this.specialType==='seraphicKick') && this.specialT>0){
        const ap=Math.max(0,Math.min(1,this.specialT/.16));
        ctx.save();ctx.globalCompositeOperation='lighter';
        ctx.shadowColor='#fff3a6';ctx.shadowBlur=28;
        const hand=this.specialType==='seraphicUpper';
        const ax=hand?54:72, ay=hand?-40:50, rr=hand?31:36;
        const g=ctx.createRadialGradient(ax,ay,2,ax,ay,rr);
        g.addColorStop(0,'rgba(255,255,255,.98)');
        g.addColorStop(.38,'rgba(255,247,170,.92)');
        g.addColorStop(.75,'rgba(255,211,72,.5)');
        g.addColorStop(1,'rgba(255,200,60,0)');
        ctx.globalAlpha=.94*ap;ctx.fillStyle=g;ctx.beginPath();ctx.arc(ax,ay,rr,0,Math.PI*2);ctx.fill();
        ctx.globalAlpha=.46*ap;ctx.strokeStyle='#fff0a0';ctx.lineWidth=hand?12:16;ctx.lineCap='round';
        ctx.beginPath();ctx.moveTo(ax-46,ay+4);ctx.lineTo(ax+12,ay-2);ctx.stroke();
        ctx.restore();
      }

      // ラファエルさん：回復中は小さな泡が身体の周囲を上昇
      if(this.type==='yellow' && this.healT>0){
        ctx.save();
        ctx.strokeStyle='#d9fbff';
        ctx.lineWidth=2;
        ctx.globalAlpha=.65;
        const tm=performance.now()/220;
        for(let i=0;i<5;i++){
          const bx=Math.sin(tm+i*1.7)*28;
          const by=48-((tm*13+i*23)%100);
          ctx.beginPath();ctx.arc(bx,by,3+(i%3),0,Math.PI*2);ctx.stroke();
        }
        ctx.restore();
      }

      // ウリエルさん：ガード長押しで蓄えた薄い全身ホワイトオーラ
      if(this.type==='orange' && this.urielAuraT>0){
        ctx.save(); ctx.globalCompositeOperation='lighter';
        ctx.strokeStyle='#ffffff'; ctx.lineWidth=4; ctx.globalAlpha=.22+.08*Math.sin(performance.now()/90);
        ctx.beginPath(); ctx.ellipse(0,18,50,66,0,0,Math.PI*2); ctx.stroke();
        ctx.restore();
      }
      if(this.type==='orange' && this.urielAuraT>0 && this.whiteReachAttack){
        ctx.save(); ctx.globalCompositeOperation='lighter'; ctx.lineCap='round';
        ctx.strokeStyle='#ffffff'; ctx.globalAlpha=.62;
        ctx.lineWidth=this.whiteReachAttack==='punch'?18:22;
        ctx.beginPath();
        if(this.whiteReachAttack==='punch'){ctx.moveTo(22,22);ctx.lineTo(205,8);}else{ctx.moveTo(15,48);ctx.lineTo(245,48);}
        ctx.stroke(); ctx.restore();
      }

      // ウリエルさん：カウンター構え/反撃の白いオーラ
      if(this.type==='orange' && (this.counterReady || this.specialType==='whiteCounterHit')){
        ctx.save();ctx.globalCompositeOperation='lighter';
        ctx.strokeStyle='#ffffff';ctx.lineWidth=5;ctx.globalAlpha=.62;
        ctx.beginPath();ctx.arc(0,18,48,0,Math.PI*2);ctx.stroke();
        if(this.specialType==='whiteCounterHit') drawWhiteAura(58,7,20,16,1);
        ctx.restore();
      }

      if(this.specialType==='ribbonWhip'){
        ctx.save();
        ctx.strokeStyle='#f08b9a';
        ctx.lineWidth=6;
        ctx.lineCap='round';

        const phase=(performance.now()/55);
        const offsets=[-24,16,-8,26,-18,10,0];

        // 舌の根元は常に口中央。
        // 先端側だけが何本も高速で飛び出して見えるようにする。
        for(let i=0;i<5;i++){
          const idx=(Math.floor(phase)+i)%offsets.length;
          const y=offsets[idx];
          const reach=92+i*18;
          const alpha=.28+i*.14;

          ctx.globalAlpha=alpha;
          ctx.beginPath();
          ctx.moveTo(0,8);
          ctx.lineTo(reach,y);
          ctx.stroke();

          // 舌先だけ少し太くして「突き」の連打感を出す
          ctx.beginPath();
          ctx.arc(reach,y,5.2,0,Math.PI*2);
          ctx.fillStyle='#ff9dad';
          ctx.fill();
        }

        ctx.restore();
      }

      // ヘルラッシュ：左右の拳を交互に大きく突き出す。
      if(this.specialType==='hellRush'){
        const hammer=this.luciferRushHits>=4;
        const side=this.luciferPunchSide||0;
        ctx.save();
        ctx.strokeStyle=pal.limb;
        ctx.lineWidth=14;
        ctx.lineCap='round';

        if(hammer){
          // 最後は頭上から振り下ろす
          ctx.beginPath();
          ctx.moveTo(18,-2);
          ctx.lineTo(28,-42);
          ctx.lineTo(45,28);
          ctx.stroke();
        }else{
          // 左右で高さを変え、連打感を出す
          const yy=side===0?-8:17;
          ctx.beginPath();
          ctx.moveTo(15,yy*.25);
          ctx.lineTo(67,yy);
          ctx.stroke();

          // 引いている反対の拳
          ctx.globalAlpha=.65;
          ctx.beginPath();
          ctx.moveTo(-13,-yy*.15);
          ctx.lineTo(8,-yy*.45);
          ctx.stroke();
        }
        ctx.restore();
      }

      // ダークネスラッシュ：片足を斜め前下へ伸ばす
      if(this.specialType==='darknessRush'){
        ctx.save();
        ctx.strokeStyle=pal.limb;
        ctx.lineWidth=13;
        ctx.lineCap='round';
        ctx.beginPath();
        ctx.moveTo(15,47);
        ctx.lineTo(58,67);
        ctx.stroke();
        ctx.restore();
      }

      if(this.tongueT>0 || (this.tonguePullTarget && this.tonguePullTimer>0) || (this.tongueClashTarget && this.tongueClashTimer>0)){
        const target = this.tongueClashTarget || this.tonguePullTarget || (this.isPlayer ? enemy : player);
        const wallTongue=this.wallClingT>0&&this.wallClingSide!==0;
        let len=wallTongue?Math.abs(this.x-(this.wallClingSide<0?0:innerWidth)):Math.min((this.tongueRange||220)*1.28,Math.abs(target.x-this.x));
        ctx.strokeStyle=this.type==='samael'?'#9a72e8':'#ff718e';ctx.lineWidth=this.type==='samael'?9:8;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(0,8);
        if(wallTongue)ctx.lineTo(this.wallClingSide*len,0);
        else{const ty=this.type==='beelzebub'?Math.max(-88,Math.min(88,(target.y-this.y)*.55)):Math.max(-105,Math.min(105,(target.y-this.y)*.72));ctx.lineTo(len,8+ty);}
        ctx.stroke();
      }

      // カワズさん隠し技：旧版の「舌でグルグル巻き」表示。
      if(this.throwState && this.throwState.tongueWrapped && this.throwState.owner && this.throwState.owner.type==='kawazu'){
        ctx.save();
        ctx.filter='none';
        ctx.strokeStyle='#ff718e';ctx.lineWidth=7;ctx.lineCap='round';ctx.lineJoin='round';
        ctx.shadowColor='rgba(255,90,145,.35)';ctx.shadowBlur=5;
        for(let i=0;i<4;i++){
          ctx.beginPath();ctx.ellipse(0,-7+i*13,47-i*2,12,0,0,Math.PI*2);ctx.stroke();
        }
        ctx.restore();
      }

      if(this.attack==='wave'){
        ctx.save();
        ctx.filter='none';
        ctx.strokeStyle=pal.limb;
        ctx.lineWidth=11;
        ctx.lineCap='round';
        ctx.beginPath();
        // 両手を胸から前へ押し出す
        ctx.moveTo(-17,21); ctx.lineTo(13,17); ctx.lineTo(42,15);
        ctx.moveTo(-15,31); ctx.lineTo(14,29); ctx.lineTo(42,28);
        ctx.stroke();
        ctx.fillStyle=pal.light;
        ctx.beginPath();
        ctx.arc(43,15,6,0,Math.PI*2);
        ctx.arc(43,28,6,0,Math.PI*2);
        ctx.fill();
        ctx.restore();
      }

      if(this.guard){
        // フロッグファイター2 JUMP：全身を包むシャボン玉ガード。
        ctx.save();
        ctx.filter='none';
        const pulse=1+Math.sin(performance.now()/150)*.018;
        ctx.scale(pulse,pulse);
        ctx.globalAlpha=.32;
        ctx.fillStyle='rgba(210,248,255,.32)';
        ctx.strokeStyle='rgba(235,255,255,.92)';
        ctx.lineWidth=3;
        ctx.shadowColor='rgba(125,225,255,.9)';
        ctx.shadowBlur=14;
        ctx.beginPath();
        ctx.ellipse(0,12,58,70,0,0,Math.PI*2);
        ctx.fill(); ctx.stroke();
        ctx.globalAlpha=.65;
        ctx.beginPath(); ctx.arc(-23,-25,10,.25,1.45); ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.filter='none';
        ctx.strokeStyle=pal.limb;
        ctx.lineWidth=11;
        ctx.lineCap='round';
        ctx.lineJoin='round';

        // ガードは胸の前で腕を交差。
        // 描画上は常に右側が「敵に近い側」になる（face反転前提）。
        // 近い側の腕は少し上へ、遠い側は真っ直ぐ内側へ。
        ctx.beginPath();

        // 遠い側の手：胸へ真っ直ぐ内側に差し込む
        ctx.moveTo(-23,22);
        ctx.lineTo(-8,19);
        ctx.lineTo(10,18);

        // 敵に近い側の手：上から斜めに胸を守る
        ctx.moveTo(23,22);
        ctx.lineTo(12,10);
        ctx.lineTo(-5,16);

        ctx.stroke();

        // 手先を少し丸く見せる
        ctx.fillStyle=pal.light;
        ctx.beginPath();
        ctx.arc(10,18,6,0,Math.PI*2);
        ctx.arc(-5,16,6,0,Math.PI*2);
        ctx.fill();

        ctx.restore();
      }

      ctx.restore();
    }
  }


  class PracticeDummy {
    constructor(){
      this.x=innerWidth*.72;
      this.y=innerHeight*.48;
      this.vx=0; this.vy=0;
      this.radius=34;
      this.hp=999999;
      this.guard=false;
      this.stun=0;
      this.throwState=null;
      this.flash=0;
      this.face=-1;
      this.isPlayer=false;
      this.tonguePullTarget=null;
      this.tonguePullTimer=0;
      this.tongueClashTarget=null;
      this.tongueClashTimer=0;
      this.spinAngle=0;
    }
    hit(dmg,kx,ky){
      this.vx+=kx*.72;
      this.vy+=ky*.72;
      this.flash=.13;
      this.stun=.08;
      spawnImpact(this.x,this.y,'hit');
    }
    update(dt){
      if(this.flash>0)this.flash-=dt;
      if(this.stun>0)this.stun-=dt;
      // 葉っぱなのでゆっくり元の高さへ漂う
      this.vy += Math.sin(performance.now()/650)*5*dt;
      this.vx *= Math.pow(.28,dt);
      this.vy *= Math.pow(.42,dt);
      this.x += this.vx*dt;
      this.y += this.vy*dt;
      this.x=Math.max(innerWidth*.48,Math.min(innerWidth-55,this.x));
      this.y=Math.max(95,Math.min(innerHeight-80,this.y));
    }
    draw(){
      ctx.save();
      ctx.translate(this.x,this.y);
      ctx.rotate(-.18 + Math.sin(performance.now()/700)*.08);
      if(this.flash>0)ctx.globalAlpha=.55;

      // 水中を漂う丸い葉っぱ
      ctx.fillStyle='#72c95d';
      ctx.beginPath();
      ctx.ellipse(0,0,38,25,-.18,0,Math.PI*2);
      ctx.fill();

      ctx.strokeStyle='#397e3d';
      ctx.lineWidth=3;
      ctx.beginPath();
      ctx.moveTo(-27,8);
      ctx.quadraticCurveTo(0,0,29,-8);
      ctx.stroke();

      ctx.strokeStyle='#4b9950';
      ctx.lineWidth=2;
      for(let i=-15;i<=15;i+=10){
        ctx.beginPath();
        ctx.moveTo(i,1);
        ctx.lineTo(i-9,-10);
        ctx.stroke();
      }

      // 練習相手だと分かる小さな的
      ctx.strokeStyle='rgba(255,255,255,.72)';
      ctx.lineWidth=3;
      ctx.beginPath();
      ctx.arc(0,0,11,0,Math.PI*2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0,0,4,0,Math.PI*2);
      ctx.stroke();

      ctx.restore();
    }
  }

  let player, enemy;
  let gameMode='battle'; // battle | practice | leafMini | guardMini | raceMini | basketMini
  let practiceLabel=null;
  const input={
    x:0,y:0,
    currentDir:null,
    lastReleasedDir:null,
    lastReleasedTime:0,
    dashUsedThisTouch:false,
    commandHistory:[],
    luciferTongueReadyUntil:0,
    punchTapTimes:[],
    tongueTapTimes:[],
    crayfishComboStep:0,
    crayfishComboTime:0,
    guardTapTimes:[],
    simpleGuardTapTimes:[],
    lastSimpleGuardTapTime:0,
    lastBackInputTime:0,
    purpleGuardCount:0,
    purpleGuardLastTime:0,
    forwardTapTimes:[]
  };

  function pushCommandDir(dir){
    if(!dir) return;
    const now=performance.now();
    const hist=input.commandHistory;
    const last=hist[hist.length-1];

    if(!last || last.dir!==dir){
      hist.push({dir,time:now});
    }else{
      last.time=now;
    }

    // 古い入力は削除
    input.commandHistory=hist.filter(v=>now-v.time<=900).slice(-8);
  }

  function hasCommand(sequence, maxMs=700){
    const now=performance.now();
    const hist=input.commandHistory.filter(v=>now-v.time<=maxMs);

    let i=hist.length-1;
    for(let s=sequence.length-1;s>=0;s--){
      while(i>=0 && hist[i].dir!==sequence[s]) i--;
      if(i<0) return false;
      i--;
    }
    return true;
  }

  function hasFullRotation(maxMs=1350){
    const now=performance.now();
    const order=['right','downRight','down','downLeft','left','upLeft','up','upRight'];
    const hist=input.commandHistory.filter(v=>now-v.time<=maxMs && order.includes(v.dir));
    if(hist.length<6)return false;
    let total=0,validSteps=0;
    for(let i=1;i<hist.length;i++){
      let a=order.indexOf(hist[i-1].dir),b=order.indexOf(hist[i].dir);
      let d=b-a;
      if(d>4)d-=8;if(d<-4)d+=8;
      if(Math.abs(d)<=2 && d!==0){total+=d;validSteps++;}
    }
    // スマホで完全な8方向を通らなくても、一周として十分な回転量なら成立。
    return validSteps>=5 && Math.abs(total)>=6;
  }

  function clearCommand(){
    input.commandHistory=[];
  }

  function getStickDirection(x,y){
    const mag=Math.hypot(x,y);
    if(mag<.40) return null;

    const angle=Math.atan2(y,x);
    const oct=Math.round(angle/(Math.PI/4));
    const dirs=['right','downRight','down','downLeft','left','upLeft','up','upRight'];
    return dirs[(oct+8)%8];
  }

  function dashVector(dir){
    const s=Math.SQRT1_2;
    const map={
      '覚醒コカビエル':'awakenedKokabiel',
      'モブ':'mob','モブさん':'mob',
      right:[1,0],
      downRight:[s,s],
      down:[0,1],
      downLeft:[-s,s],
      left:[-1,0],
      upLeft:[-s,-s],
      up:[0,-1],
      upRight:[s,-s]
    };
    return map[dir] || [0,0];
  }

  function doDash(dir){
    if(!player || gameOver || player.stun>0 || player.guard || player.throwState || player.dashCooldown>0) return false;

    const [dx,dy]=dashVector(dir);
    player.vx += dx*340;
    player.vy += dy*275;
    player.dashT=.25;
    player.dashCooldown=.44;

    comboEl.textContent='DASH!';
    setTimeout(()=>{
      if(comboEl.textContent==='DASH!') comboEl.textContent='';
    },380);

    for(let i=0;i<12;i++){
      particles.push({
        x:player.x-dx*(12+Math.random()*30),
        y:player.y-dy*(12+Math.random()*30)+(Math.random()-.5)*30,
        vx:-dx*(55+Math.random()*90)+(Math.random()-.5)*35,
        vy:-dy*(55+Math.random()*90)+(Math.random()-.5)*35,
        t:.34+Math.random()*.14,
        r:2+Math.random()*4,
        type:'guard'
      });
    }
    return true;
  }

  function checkTouchDash(){
    const dir=getStickDirection(input.x,input.y);
    input.currentDir=dir;

    // リリスさん用：後ろ方向を入れた時刻を記録
    if(player && player.type==='purple' && dir){
      const back=player.face>0?'left':'right';
      const backUp=player.face>0?'upLeft':'upRight';
      const backDown=player.face>0?'downLeft':'downRight';
      if(dir===back || dir===backUp || dir===backDown){
        input.lastBackInputTime=performance.now();
      }
    }
    if(dir) pushCommandDir(dir);
    if(!dir || input.dashUsedThisTouch) return;

    const now=performance.now();
    if(
      input.lastReleasedDir===dir &&
      now-input.lastReleasedTime<=450
    ){
      if(doDash(dir)){
        input.dashUsedThisTouch=true;
        input.lastReleasedDir=null;
        input.lastReleasedTime=0;
      }
    }
  }


  function spawnLeafTarget(slot=0, initial=false){
    const laneCount=5;
    const lane=slot%laneCount;
    const top=innerHeight*.25;
    const bottom=innerHeight*.72;
    const y=top+(bottom-top)*(lane/(laneCount-1));

    // initial=true のときは画面内～右端へ時間差配置。
    // 通常生成は右端から入ってくる。
    const x=initial
      ? innerWidth*.42 + (slot%7)*innerWidth*.12
      : innerWidth+35;

    leafTargets.push({
      x, y:y+(Math.random()-.5)*18,
      vx:-(145+Math.random()*40),
      r:20+Math.random()*4,
      rot:Math.random()*Math.PI*2,
      spin:(Math.random()-.5)*1.1,
      hp:1,
      hit:false
    });
  }

  function startLeafMiniGame(){
    if(pauseButton)pauseButton.hidden=true;gamePaused=false;
    gameMode='leafMini';
    if(practiceHelp){practiceHelp.hidden=true;practiceHelp.style.display='none';}
    gamePaused=false;
    if(pauseOverlay){pauseOverlay.hidden=true;pauseOverlay.style.display='none';}
    if(pauseButton)pauseButton.hidden=false;
    gameOver=false;
    restartButton.hidden=true;
    comboHits=0; comboTimer=0; comboEl.textContent='';

    show('game');
    resize();

    player=new Fighter(innerWidth*.25,innerHeight*.5,true,selectedFighter);
    enemy=new PracticeDummy();
    enemy.x=-5000; enemy.y=-5000;

    leafTargets=[];
    leafMiniActive=true;
    leafMiniTime=60;
    leafMiniScore=0;
    leafSpawnTimer=0;

    if(leafMiniHud){ leafMiniHud.hidden=false; leafMiniHud.style.display='flex'; }
    if(guardMiniHud){ guardMiniHud.hidden=true; guardMiniHud.style.display='none'; }
    guardMiniActive=false;
    if(leafMiniTimeEl) leafMiniTimeEl.textContent='60.0';
    if(leafMiniScoreEl) leafMiniScoreEl.textContent='0';

    if(practiceExitButton){
      practiceExitButton.hidden=false;
      practiceExitButton.textContent='ミニゲーム終了';
    }
    if(practiceLabel) practiceLabel.style.display='none';

    bubbles=Array.from({length:28},()=>({
      x:Math.random()*innerWidth,y:Math.random()*innerHeight,
      r:2+Math.random()*6,s:10+Math.random()*26
    }));

    particles=[]; hitRings=[]; guardWaves=[]; aquaTornadoes=[]; aquaVortices=[];
    siltClouds=[]; catfishCharges=[]; pressureBlades=[]; water2Shots=[]; flaurosPillars=[]; flaurosClaws=[]; satanaelFlares=[]; satanaelRays=[]; satanaelPressures=[]; satanaelWaves=[]; samaelGates=[]; seraphielRays=[]; remielMirages=[]; remielFakeShots=[]; lunarSlashes=[]; bloodMoons=[]; gravityBalls=[]; gravityZones=[]; meteorDrops=[]; jihalBolts=[]; jihalBursts=[]; burstWaves=[];

    for(let i=0;i<12;i++){
      spawnLeafTarget(i,true);
      if(leafTargets[i]) leafTargets[i].x=innerWidth*(.38+(i%6)*.11);
    }

    running=true;
    last=performance.now();
    updateHud();
  }

  function endLeafMiniGame(){
    if(!leafMiniActive) return;
    leafMiniActive=false;
    comboEl.textContent=`RESULT ${leafMiniScore} 枚!`;
    restartButton.hidden=false;
  }

  function checkLeafHits(){
    if(!leafMiniActive || !player) return;

    const normalAttack=player.attackT>0;
    const tongueAttack=player.tongueT>0;
    const specialAttack=player.specialT>0;
    if(!normalAttack && !tongueAttack && !specialAttack) return;

    let reach=112;
    let height=82;
    if(tongueAttack){reach=190;height=58;}
    if(player.type==='piranha'){reach=Math.max(reach,130);height=90;}
    if(player.type==='crayfish'){reach=Math.max(reach,135);height=95;}
    if(specialAttack){reach+=45;height+=24;}

    leafTargets.forEach(leaf=>{
      if(leaf.hit) return;
      const dx=leaf.x-player.x;
      const dy=Math.abs(leaf.y-player.y);

      // 基本は向いている側。キャラ中心に重なった葉っぱも確実に壊す。
      const inFront=(dx*player.face)>=-28 && (dx*player.face)<=reach;
      const overlapping=Math.abs(dx)<=player.radius+leaf.r;
      if((inFront || overlapping) && dy<=height){
        leaf.hp=0;
        leaf.hit=true;
        leafMiniScore++;
        if(leafMiniScoreEl)leafMiniScoreEl.textContent=String(leafMiniScore);
        spawnImpact(leaf.x,leaf.y,'guard');
      }
    });
  }

  function spawnGuardTarget(){
    const targetY=player ? player.y : innerHeight*.5;
    guardTargets.push({
      x:innerWidth+60,
      y:targetY,
      targetY:targetY,
      vx:-(150+Math.random()*35),
      r:14+Math.random()*3,
      phase:Math.random()*Math.PI*2,
      kind:Math.random()<.75?'fish':'bug',
      resolved:false
    });
  }

  function startGuardMiniGame(){
    if(pauseButton)pauseButton.hidden=true;gamePaused=false;
    gameMode='guardMini';
    if(practiceHelp){practiceHelp.hidden=true;practiceHelp.style.display='none';} gameOver=false; restartButton.hidden=true;
    comboHits=0; comboTimer=0; comboEl.textContent='';
    show('game'); resize();
    player=new Fighter(innerWidth*.25,innerHeight*.5,true,selectedFighter);
    enemy=new PracticeDummy(); enemy.x=-5000; enemy.y=-5000;
    guardTargets=[]; guardMiniActive=true; leafMiniActive=false;
    guardMiniTime=60; guardMiniScore=0; guardMiniMiss=0; guardSpawnTimer=2.2;
    guardMiniGuardTapTime=-9999;
    if(leafMiniHud){ leafMiniHud.hidden=true; leafMiniHud.style.display='none'; }
    if(guardMiniHud){ guardMiniHud.hidden=false; guardMiniHud.style.display='flex'; }
    if(guardMiniTimeEl) guardMiniTimeEl.textContent='60.0';
    if(guardMiniScoreEl) guardMiniScoreEl.textContent='0';
    if(guardMiniMissEl) guardMiniMissEl.textContent='0';
    if(practiceExitButton){practiceExitButton.hidden=false;practiceExitButton.textContent='ミニゲーム終了';}
    if(practiceLabel) practiceLabel.style.display='none';
    particles=[]; hitRings=[]; guardWaves=[]; aquaTornadoes=[]; aquaVortices=[]; siltClouds=[];
    catfishCharges=[]; pressureBlades=[]; water2Shots=[]; burstWaves=[];

    // 最初は1体だけ。いきなり複数が同時に来ないようにする。
    spawnGuardTarget();

    running=true; last=performance.now(); updateHud();
  }

  function endGuardMiniGame(){
    if(!guardMiniActive)return;
    guardMiniActive=false;
    comboEl.textContent=`JUST GUARD ${guardMiniScore} 回!`;
    restartButton.hidden=false;
  }

  function hideAllMiniHuds(){
    if(leafMiniHud){leafMiniHud.hidden=true;leafMiniHud.style.display='none';}
    if(guardMiniHud){guardMiniHud.hidden=true;guardMiniHud.style.display='none';}
    if(raceMiniHud){raceMiniHud.hidden=true;raceMiniHud.style.display='none';}
    if(basketMiniHud){basketMiniHud.hidden=true;basketMiniHud.style.display='none';}
  }

  function buildRaceCourse(){
    // v6.38: ジグザグ障害物コースを廃止。見てすぐ分かる楕円1周コース。
    const cx=innerWidth*.5, cy=innerHeight*.52;
    const rx=Math.max(230,innerWidth*.37), ry=Math.max(115,innerHeight*.27);
    raceObstacles=[];
    raceCheckpoints=[];
    // 左下寄りをスタートにして時計回り。細かいCPでショートカットを防ぐ。
    const startAng=Math.PI*.82;
    const count=20;
    for(let i=0;i<=count;i++){
      const ang=startAng-(Math.PI*2*i/count);
      raceCheckpoints.push({x:cx+Math.cos(ang)*rx,y:cy+Math.sin(ang)*ry,r:62});
    }
    raceCheckpointIndex=1;
    raceEnemyCheckpointIndex=1;
  }

  function startRaceMiniGame(){
    if(pauseButton)pauseButton.hidden=true;gamePaused=false;
    gameMode='raceMini'; gameOver=false; restartButton.hidden=true;
    comboEl.textContent=''; show('game'); resize();
    buildRaceCourse();
    const start=raceCheckpoints[0];
    player=new Fighter(start.x,start.y+22,true,selectedFighter);
    enemy=new Fighter(start.x,start.y-22,false,'blue');
    enemy.face=1;
    leafMiniActive=false;guardMiniActive=false;basketMiniActive=false;raceMiniActive=true;
    hideAllMiniHuds();
    raceMiniStart=performance.now();raceMiniElapsed=0;
    try{raceMiniBest=parseFloat(localStorage.getItem('kaeru_race_best')||'0')||0;}catch(e){raceMiniBest=0;}
    if(raceMiniHud){raceMiniHud.hidden=false;raceMiniHud.style.display='flex';}
    if(raceMiniTimeEl)raceMiniTimeEl.textContent='0.00';
    if(raceMiniBestEl)raceMiniBestEl.textContent=raceMiniBest?raceMiniBest.toFixed(2):'--';
    if(practiceExitButton){practiceExitButton.hidden=false;practiceExitButton.textContent='ミニゲーム終了';}
    running=true;last=performance.now();updateHud();
  }

  function endRaceMiniGame(){
    if(!raceMiniActive)return;
    raceMiniActive=false;
    const time=raceMiniElapsed;
    let best=false;
    if(!raceMiniBest || time<raceMiniBest){
      raceMiniBest=time;best=true;
      try{localStorage.setItem('kaeru_race_best',String(time));}catch(e){}
    }
    if(raceMiniBestEl)raceMiniBestEl.textContent=raceMiniBest.toFixed(2);
    comboEl.textContent=(best?'NEW BEST! ':'FINISH! ')+time.toFixed(2)+' sec';
    restartButton.hidden=false;
  }

  function resetBasketBall(){
    // マリモ型パック。最初から速めに動かす。
    const dir=Math.random()<.5?-1:1;
    basketBall={x:innerWidth*.5,y:innerHeight*.52,vx:dir*390,vy:(Math.random()-.5)*240,r:17,owner:null,lastTouch:null};
    player.x=innerWidth*.24;player.y=innerHeight*.52;player.vx=player.vy=0;
    enemy.x=innerWidth*.76;enemy.y=innerHeight*.52;enemy.vx=enemy.vy=0;
  }

  function startBasketMiniGame(){
    if(pauseButton)pauseButton.hidden=true;gamePaused=false;
    gameMode='basketMini'; gameOver=false; restartButton.hidden=true;
    comboEl.textContent=''; show('game'); resize();
    player=new Fighter(innerWidth*.24,innerHeight*.52,true,selectedFighter);
    enemy=new Fighter(innerWidth*.76,innerHeight*.52,false,'blue');
    leafMiniActive=false;guardMiniActive=false;raceMiniActive=false;basketMiniActive=true;
    basketMiniTime=60;basketPlayerScore=0;basketEnemyScore=0;basketShotCooldown=0;
    // 左右のゴール。playerは左陣、CPUは右陣から出られない。
    basketHoops=[
      {x:12,y:innerHeight*.52,side:'cpu'},
      {x:innerWidth-12,y:innerHeight*.52,side:'player'}
    ];
    resetBasketBall();
    hideAllMiniHuds();
    if(basketMiniHud){basketMiniHud.hidden=false;basketMiniHud.style.display='flex';}
    if(basketPlayerScoreEl)basketPlayerScoreEl.textContent='0';
    if(basketEnemyScoreEl)basketEnemyScoreEl.textContent='0';
    if(basketTimeEl)basketTimeEl.textContent='60.0';
    if(practiceExitButton){practiceExitButton.hidden=false;practiceExitButton.textContent='ミニゲーム終了';}
    running=true;last=performance.now();updateHud();
  }

  function hockeyStrike(f,kind){
    if(!basketMiniActive || !basketBall || !f)return false;
    const dx=basketBall.x-f.x,dy=basketBall.y-f.y;
    const reach=kind==='tongue'?(f.tongueRange||220)*.72:(f.radius+82);
    if(Math.hypot(dx,dy)>reach)return false;
    // 舌は遠くから弾けるが少し弱め。パンチ/キックは強打。
    const speed=kind==='tongue'?520:(kind==='kick'?720:650);
    const d=Math.hypot(dx,dy)||1;
    basketBall.owner=null;
    basketBall.lastTouch=f;
    basketBall.vx=dx/d*speed + f.face*110;
    basketBall.vy=dy/d*speed + (Math.random()-.5)*80;
    return true;
  }

  function endBasketMiniGame(){
    if(!basketMiniActive)return;
    basketMiniActive=false;
    const result=basketPlayerScore===basketEnemyScore?'DRAW':
      (basketPlayerScore>basketEnemyScore?'YOU WIN!':'YOU LOSE');
    comboEl.textContent=`${result} ${basketPlayerScore}-${basketEnemyScore}`;
    restartButton.hidden=false;
  }

  function basketTongueUse(f){
    if(!basketMiniActive || !basketBall || !f)return false;
    const other=f.isPlayer?enemy:player;
    const range=(f.tongueRange||220)*1.05;
    if(basketBall.owner===other &&
       Math.abs(other.x-f.x)<range &&
       Math.abs(other.y-f.y)<115){
      basketBall.owner=f;basketBall.lastTouch=f;
      comboEl.textContent='TONGUE STEAL!';
      setTimeout(()=>{if(comboEl.textContent==='TONGUE STEAL!')comboEl.textContent='';},400);
      return true;
    }
    const dx=basketBall.x-f.x,dy=basketBall.y-f.y;
    if(!basketBall.owner && Math.sign(dx)===f.face && Math.abs(dx)<range && Math.abs(dy)<115){
      basketBall.owner=f;basketBall.lastTouch=f;basketBall.vx=basketBall.vy=0;
      comboEl.textContent='BALL CATCH!';
      setTimeout(()=>{if(comboEl.textContent==='BALL CATCH!')comboEl.textContent='';},340);
      return true;
    }
    return false;
  }

  function basketShoot(f){
    if(!basketMiniActive || !basketBall || basketBall.owner!==f || basketShotCooldown>0)return false;
    const hoop=f.isPlayer?basketHoops[1]:basketHoops[0];
    const dx=hoop.x-basketBall.x,dy=hoop.y-basketBall.y;
    const d=Math.hypot(dx,dy)||1;
    basketBall.owner=null;
    basketBall.lastTouch=f;
    basketBall.vx=dx/d*360;
    basketBall.vy=dy/d*360;
    basketShotCooldown=.38;
    return true;
  }

  function startPractice(){
    if(pauseButton)pauseButton.hidden=true;gamePaused=false;
    gameMode='practice';
    updatePracticeHelp();
    gameOver=false;
    restartButton.hidden=true;
    comboHits=0;
    comboTimer=0;
    comboEl.textContent='';

    show('game');
    resize();

    player=new Fighter(innerWidth*.28,innerHeight*.50,true,selectedFighter);
    enemy=new PracticeDummy();

    bubbles=Array.from({length:28},()=>({
      x:Math.random()*innerWidth,
      y:Math.random()*innerHeight,
      r:2+Math.random()*6,
      s:10+Math.random()*26
    }));
    particles=[];
    hitRings=[];
    guardWaves=[];
    aquaTornadoes=[]; aquaVortices=[];
    siltClouds=[];
    catfishCharges=[];
    pressureBlades=[]; water2Shots=[];
    burstWaves=[];
    aquaTornadoes=[]; aquaVortices=[];
    siltClouds=[];
    catfishCharges=[];
    burstWaves=[];

    if(practiceExitButton) practiceExitButton.hidden=false;

    if(!practiceLabel){
      practiceLabel=document.createElement('div');
      practiceLabel.className='practice-label';
      practiceLabel.textContent='操作練習　∞';
      document.body.appendChild(practiceLabel);
    }
    practiceLabel.style.display='block';

    running=true;
    last=performance.now();
    updateHud();
  }


  function currentPlayableTypes(){
    const base=['green','blue','black','purple','flauros','satanael','yellow','orange','piranha','crayfish','sariel','kokabiel','jihal','remiel'];
    if(isKawazuUnlocked())base.push('kawazu');
    if(isStoryCleared())base.push('samael','seraphiel','satanael');
    return base;
  }

  function practiceSpecialText(type){
    const map={
      mob:['前 ＋ パンチ：バブルショット','上 ＋ パンチ：かえる跳びアッパー','前 ＋ キック：トリプルキック'],
      green:['上 ＋ パンチ：バーニングアッパー','前 ＋ キック：バーニングキック','後ろ ＋ パンチ：バーニングショット','下 → 後ろ ＋ キック：バーニングサイクロン'],
      blue:['上 ＋ パンチ：アクアトルネード','下 ＋ キック：アクアストリーム','後ろ ＋ パンチ：アクアボルテックス','前 ＋ パンチ：アクアショット'],
      yellow:['前 ＋ パンチ：エアカッター（2連）','前 ＋ キック：エアカッター（2連・斜め下）','後ろ ＋ パンチ：エアーギロチン（真上 → 真下）','後ろ ＋ キック：エアブレード（真下 → 真上）','ガード ×2：ヒーリングバブル','上 ＋ ガード：エアホバー（約5秒・方向入力で空中移動）'],
      orange:['後ろ ＋ ガード：ホワイトカウンター','前 ＋ ガード：ガーディアンタックル','ガード長押し：ホワイトオーラ','オーラ中 パンチ / キック：白い長リーチ攻撃','ガード ＋ パンチ：ホワイトショット'],
      black:['前 ＋ キック：ヘルクラッシュ（氷オーラの蹴り・特大ノックバック）','後ろ ＋ パンチ長押し → 離す：アビスチャージ（周囲を一瞬凍結）','前 ＋ パンチ：アイスショット','後ろ ＋ ガード：アイスウォール'],
      purple:['舌連打：舌ラッシュ','後ろ ＋ パンチ：バブルショット（前）','下 ＋ パンチ：バブルショット（斜め下）','下 ＋ キック：ギロチンキック（真下へ急降下）','後ろ ＋ キック：バックスピンキック（追加入力で追加回転）'],
      beelzebub:['下 → 後ろ ＋ ガード：ヴェノム・ウォーター','上 ＋ パンチ：アビスショック（上弧）','下 ＋ キック：アビスショック（下弧）','前 ＋ パンチ：ベノムショット'],
      sariel:['上 ＋ パンチ：ルナ・スラッシュ（上弧）','下 ＋ パンチ：ルナ・スラッシュ（下弧）','前 ＋ ガード：イーブルアイ','後ろ ＋ ガード：ブラッドムーン','上 ＋ キック：ムーンサルトキック'],
      kokabiel:['前 ＋ パンチ：グラビティボール','後ろ ＋ ガード：グラビティゾーン','下 ＋ パンチ：メテオレイン','下 ＋ キック：グラビティダイブ'],
      jihal:['前 ＋ パンチ：ボルトショット','前 ＋ キック：ライトニングダッシュ','後ろ ＋ キック長押し → 離す：サンダーチャージ','下 ＋ パンチ：スパークバースト'],
      remiel:['上 ＋ ガード：ミラージュ（上）','下 ＋ ガード：ミラージュ（下）','後ろ ＋ ガード：ミラージュカウンター','前 ＋ ガード：アクアパリィ','前 ＋ パンチ：フロストショット','前 ＋ キック：ミラージュキック'],
      seraphiel:['上 ＋ パンチ：セラフィックアッパー','前 ＋ キック：セラフィックキック','後ろ ＋ パンチ：セラフィックショット','下 → 後ろ ＋ キック：セラフィックサイクロン','下 → 前 ＋ パンチ：セラフィックレイ'],
      flauros:['上 ＋ パンチ：ヘルフレイム（通常ジャンプ高まで伸びる火柱）','前 ＋ パンチ：フレイムクロー（3方向の炎爪）','前 ＋ キック：レオパードラッシュ','上 ＋ キック：インフェルノクロー（壁から画面下寄りまで急降下→時間差5連斬）'],
      satanael:[
      'ディザスターフレア：後ろ ＋ パンチ',
      'ダークレイ：前 ＋ パンチ',
      'ダークプレッシャー：下 ＋ ガード',
      'インフェルノウェーブ：下 ＋ キック（蓮の葉から通常ジャンプ高までの黒炎壁）'
    ],
    samael:['方向 ＋ パンチ：ポイズンゲート（指定方向から毒弾）','舌：ヴェノムタン（舌先から毒弾）','前 → 下 → 後ろ ＋ キック：デッドリー・アクア'],
      kawazu:['前 ＋ パンチ：ファントムラッシュ（アッパー×2→キック×2→両側アッパー）','パンチ連打：水圧ラッシュ','前 ＋ キック：ミラージュキック','後ろ ＋ キック：スピンキックカッター（十字光3連発）','隠し：方向キー1回転 ＋ 舌']
    };
    return map[type] || ['専用必殺技：練習対象外'];
  }

  function openPause(){
    if(!player||gameOver||!screens.game.classList.contains('active'))return;
    gamePaused=true;
    if(pauseFighterName)pauseFighterName.textContent=fighterDisplayName(selectedFighter);
    if(pauseMoveList){
      const moves=practiceSpecialText(selectedFighter);
      pauseMoveList.innerHTML=moves.map(v=>`<div>${v}</div>`).join('');
    }
    if(pauseOverlay){pauseOverlay.hidden=false;pauseOverlay.style.display='flex';}
    if(pauseButton)pauseButton.hidden=true;
    input.x=0;input.y=0;
    if(stickId!==null)stickId=null;
  }

  function closePause(){
    gamePaused=false;
    if(pauseOverlay){pauseOverlay.hidden=true;pauseOverlay.style.display='none';}
    if(pauseButton)pauseButton.hidden=false;
    last=performance.now();
  }

  if(pauseButton){
    pauseButton.addEventListener('pointerup',e=>{e.preventDefault();e.stopPropagation();openPause();});
    pauseButton.addEventListener('click',e=>{if(window.PointerEvent)return;e.preventDefault();openPause();});
  }
  if(resumeButton){
    resumeButton.addEventListener('pointerup',e=>{e.preventDefault();e.stopPropagation();closePause();});
    resumeButton.addEventListener('click',e=>{if(window.PointerEvent)return;e.preventDefault();closePause();});
  }

  function updatePracticeHelp(){
    if(!practiceHelp) return;
    if(gameMode!=='practice'){
      practiceHelp.hidden=true;
      practiceHelp.style.display='none';
      return;
    }

    const moves=practiceSpecialText(selectedFighter);
    if(practiceSpecialTitle){
      practiceSpecialTitle.textContent=`${fighterDisplayName(selectedFighter)} の必殺技`;
    }
    if(practiceSpecialMoves){
      practiceSpecialMoves.innerHTML=moves.map(v=>`<div>${v}</div>`).join('');
    }
    practiceHelp.hidden=false;
    practiceHelp.style.display='block';
  }

  function mixTypeFor(nameOrType){
    if(!nameOrType)return null;
    const map={
      'モブ':'mob','モブさん':'mob',
      'カワズ':'kawazu','カワズさん':'kawazu',
      'ミカエル':'green','ミカエルさん':'green','ガブリエル':'blue','ガブリエルさん':'blue',
      'ルシファー':'black','ルシファーさん':'black','リリス':'purple','リリスさん':'purple',
      'ラファエル':'yellow','ラファエルさん':'yellow','ウリエル':'orange','ウリエルさん':'orange',
      'ベルゼブブ':'beelzebub','ベルゼブブさん':'beelzebub','サマエル':'samael','サマエルさん':'samael','セラフィエル':'seraphiel','セラフィエルさん':'seraphiel','レミエル':'remiel','レミエルさん':'remiel','ジィハル':'jihal','ジィハルさん':'jihal','コカビエル':'kokabiel','コカビエルさん':'kokabiel','サリエル':'sariel','サリエルさん':'sariel',
      'フラウロス':'flauros','フラウロスさん':'flauros','サタナエル':'satanael','サタナエルさん':'satanael',
      'リヴァイア':'piranha','リヴァイアさん':'piranha','アスモデウス':'crayfish','アスモデウスさん':'crayfish',
      'アザゼル':'piranha','アザゼルさん':'piranha','ベリアル':'crayfish','ベリアルさん':'crayfish'
    };
    return map[nameOrType]||nameOrType;
  }

  function finishMixBattle(playerWon){
    if(!mixBattleMode||!mixBattleContext)return false;
    const playerWasAttacker=mixBattleContext.playerRole!=='defender';
    const attackerWon=playerWasAttacker?playerWon:!playerWon;
    const result={
      attacker:mixBattleContext.attacker,defender:mixBattleContext.defender,node:mixBattleContext.node,
      attackerHp:playerWasAttacker?player.hp:enemy.hp,
      defenderHp:playerWasAttacker?enemy.hp:player.hp,
      winner:attackerWon?'attacker':'defender',
      returnSide:String(mixBattleContext.attacker||'').startsWith('b')?'beel':'kawazu'
    };
    sessionStorage.setItem('mixBattleResult',JSON.stringify(result));
    sessionStorage.removeItem('mixBattle');
    restartButton.textContent='戦略マップへ戻る';
    restartButton.hidden=false;
    restartButton.onclick=()=>{ location.href=new URL(mixBattleContext.returnUrl||'index.html',location.href).href; };
    if(titleReturnButton)titleReturnButton.hidden=true;
    return true;
  }

  function fighterDisplayName(type){
    return {
      mob:'モブさん', green:'ミカエルさん', blue:'ガブリエルさん', black:'ルシファーさん',
      purple:'リリスさん', yellow:'ラファエルさん', orange:'ウリエルさん',
      piranha:'アザゼルさん', crayfish:'ベリアルさん',
      beelzebub:'ベルゼブブさん', flauros:'フラウロスさん', satanael:'サタナエルさん', samael:'サマエルさん', seraphiel:'セラフィエルさん', remiel:'レミエルさん', jihal:'ジィハルさん', awakenedKokabiel:'覚醒コカビエル', kokabiel:'コカビエルさん', sariel:'サリエルさん', kawazu:'カワズさん'
    }[type]||type;
  }

  function resetBattleEffects(){
    particles=[]; hitRings=[]; guardWaves=[]; aquaTornadoes=[]; aquaVortices=[];
    siltClouds=[]; catfishCharges=[]; pressureBlades=[]; water2Shots=[]; flaurosPillars=[]; flaurosClaws=[]; satanaelFlares=[]; satanaelRays=[]; satanaelPressures=[]; satanaelWaves=[]; samaelGates=[]; seraphielRays=[]; remielMirages=[]; remielFakeShots=[]; jihalBolts=[]; jihalBursts=[]; burstWaves=[];
    leafTargets=[]; guardTargets=[]; toxicWaters=[]; bossFish=[]; abyssShocks=[]; kawazuShots=[]; kawazuGhosts=[];
  }

  function startGame(mode='free', enemyType=null) {
    gameMode=mode==='story'?'story':'battle';
    if(practiceHelp){practiceHelp.hidden=true;practiceHelp.style.display='none';}
    if(practiceLabel) practiceLabel.style.display='none';
    if(practiceExitButton) practiceExitButton.hidden=true;
    if(leafMiniHud){
      leafMiniHud.hidden=true;
      leafMiniHud.style.display='none';
    }
    if(guardMiniHud){
      guardMiniHud.hidden=true;
      guardMiniHud.style.display='none';
    }
    if(raceMiniHud){raceMiniHud.hidden=true;raceMiniHud.style.display='none';}
    if(basketMiniHud){basketMiniHud.hidden=true;basketMiniHud.style.display='none';}
    leafMiniActive=false;
    guardMiniActive=false;
    leafTargets=[];
    guardTargets=[];

    gameOver=false;
    restartButton.hidden=true;
    restartButton.textContent='もう一度';
    if(titleReturnButton) titleReturnButton.hidden=true;
    comboHits=0; comboTimer=0; comboEl.textContent='';

    const rivalType=enemyType || selectedOpponent || 'blue';
    // STORY特殊戦は開始時にも明示的に外の蓮池へ固定。
    // ナレーション経由でも大会会場テーマへ戻らないようにする。
    if(gameMode==='story' && (rivalType==='piranha'||rivalType==='crayfish')) stageTheme=4;
    player=new Fighter(innerWidth*.28,innerHeight*.52,true,selectedFighter);
    enemy=new Fighter(innerWidth*.72,innerHeight*.48,false,rivalType);
    enemy.hp=100;
    enemy.sameCharacter=(rivalType===selectedFighter);

    bubbles=Array.from({length:28},()=>({
      x:Math.random()*innerWidth,y:Math.random()*innerHeight,
      r:2+Math.random()*6,s:10+Math.random()*26
    }));
    resetBattleEffects();

    if(gameMode==='allbattle'){
      if(storyHud){
        storyHud.hidden=false;
        storyHud.textContent=`ALL CHARACTERS ${allBattleIndex+1}/${allBattleQueue.length}　VS ${fighterDisplayName(rivalType)}`;
      }
    }else if(gameMode==='story'){
      if(storyHud){
        storyHud.hidden=false;
        const roundNames=['総勢64名が参加するトーナメント。優勝するには6回勝ち抜く必要がある。\n\n1回戦','2回戦','3回戦','池の騒動','4回戦','5回戦','池の騒動','決勝戦','SPECIAL'];
        storyHud.textContent=`STORY ${roundNames[storyFightIndex]||''}　勝${storyWins} 敗${storyLosses}/3　VS ${fighterDisplayName(rivalType)}`;
      }
    }else{
      if(storyHud) storyHud.hidden=true;
      stageTheme=0;
    }

    running=true; last=performance.now();
    updateHud();
  }

  function startAllBattleMode(){
    allBattleQueue=currentPlayableTypes().filter(t=>t!==selectedFighter && t!=='seraphiel');
    // ボスクラスは後半へ。セラフィエルは最後。
    const bosses=['beelzebub','samael','satanael'];
    const normal=allBattleQueue.filter(t=>!bosses.includes(t));
    const late=allBattleQueue.filter(t=>bosses.includes(t));
    allBattleQueue=normal.concat(late);
    if(selectedFighter!=='seraphiel')allBattleQueue.push('seraphiel');
    allBattleIndex=0;allBattleWins=0;
    show('game');resize();
    startGame('allbattle',allBattleQueue[0]);
  }

  function continueAllBattle(){
    allBattleIndex++;
    if(allBattleIndex>=allBattleQueue.length){
      gameOver=true;
      comboEl.textContent=`ALL CHARACTERS CLEAR!　${allBattleWins}勝`;
      restartButton.hidden=false;
      restartButton.textContent='キャラ選択へ';
      return;
    }
    startGame('allbattle',allBattleQueue[allBattleIndex]);
  }

  function shuffleStory(a){
    const b=a.slice();
    for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}
    return b;
  }

  function buildTournamentStory(){
    // 本大会はセラフィエル主催。サマエルは反対ブロックから決勝へ上がってくる。
    // 大会参加枠から操作キャラ・サマエル・セラフィエルを除き、5人を主人公側の対戦相手にする。
    const tournamentPool=['green','blue','yellow','orange','black','purple','remiel','jihal','kokabiel','sariel','beelzebub','kawazu','flauros']
      .filter(t=>t!==selectedFighter && t!=='samael' && t!=='seraphiel');
    let picked=shuffleStory(tournamentPool).slice(0,5);

    // ベルゼブブ／カワズが主人公側へ来た場合は強敵枠として後半へ。
    const normal=picked.filter(t=>t!=='beelzebub'&&t!=='kawazu');
    const heavy=picked.filter(t=>t==='beelzebub'||t==='kawazu');
    picked=normal.concat(heavy);
    return picked;
  }

  function startStoryMode(){
    gameMode='story';
    storyTransitionLocked=false;
    if(leafMiniHud){leafMiniHud.hidden=true;leafMiniHud.style.display='none';}
    if(guardMiniHud){guardMiniHud.hidden=true;guardMiniHud.style.display='none';}
    leafMiniActive=false;guardMiniActive=false;leafTargets=[];guardTargets=[];

    storyTournament=buildTournamentStory();
    // 1～3回戦 → アザゼル（トンボ） → 4～5回戦 → ベリアル（クモ） → 決勝サマエル → 特別戦
    storyQueue=[
      storyTournament[0],storyTournament[1],storyTournament[2],
      'piranha',
      storyTournament[3],storyTournament[4],
      'crayfish',
      'samael','satanael','seraphiel'
    ];
    storyFightIndex=0;storyLosses=0;storyWins=0;storyFinished=false;storyPhase='tournament';storyDay=1;storyLastWon=true;stageTheme=0;

    show('game');resize();
    showStoryNarrative([
      '前回の「カエル大戦！？」――。\n\nカワズさんが参戦し、ベルゼブブさんを懲らしめたことで、池には再び平和が訪れた。',
      '……しかし、平和すぎるというのも困りものだった。\n\n退屈してきた誰かが、ぽつりと言った。\n\n「正直言うとさ、あの戦い見てるの、けっこう興奮したんだよね……。またあの戦い見たくない？」',
      '「そうだ、格闘大会を開いてもらえないか、頼みにいこうよ」\n\n「いいね！ あっちの池の腕自慢たちも呼んでもらおうよ！」',
      'こうして一行は、大会を開いてもらえないか頼みにいった。\n\nすると話は、妙に早くまとまった。\n\nそして――みんなのところへ、一通ずつ招待状が送られた。',
      '数日後。\n\n透き通った水に照明がきらめく、蓮の葉格闘大会の特設・蓮の葉競技場。\n\n大会主催者「ようこそ皆さん。存分に、素晴らしい戦いを見せてください！」',
      `トーナメント開始！\n\nこちらのブロック、一回戦の相手は――${fighterDisplayName(storyQueue[0])}！\n\n反対側のブロックでも、強豪たちの試合が静かに進んでいた……。`
    ],()=>startGame('story',storyQueue[0]));
  }

  function storyInterlude(nextIndex,callback){
    // indexは「次に戦うstoryQueue位置」
    if(nextIndex===3){
      storyDay=1;
      showStoryNarrative([
        '――大会1日目、三回戦終了。',
        '観客席がまだ熱気に包まれている、そのときだった。\n\n「ちょ、ちょっと！ 大変だよ！」',
        '「外の蓮池でアザゼルさんが暴れてるんだ！ このままだと大会どころじゃないよ！ 何とかしてよ！」',
        '……なぜ大会の合間に池のトラブルまで解決することになったのか。\n\nともかく、外の池へ急げ！',
        'EXTRA BATTLE\nVS アザゼルさん'
      ],callback);return true;
    }
    if(nextIndex===4){
      storyDay=2;
      showStoryNarrative([
        'アザゼルさんを何とか退け、大会会場へ戻った。\n\nそして翌日――。',
        '大会2日目。\n\n昨日より照明は鮮やかに、競技場の緑も少し深くなっている。',
        `四回戦――VS ${fighterDisplayName(storyQueue[4])}！`
      ],callback);return true;
    }
    if(nextIndex===6){
      showStoryNarrative([
        '――大会2日目、全試合終了。\n\nこれで残すは最終日の決勝戦……のはずだった。',
        '「また大変だよ！」\n\n「今度はベリアルさんが外の蓮池で暴れてる！」',
        '「なんで毎日ひとりずつ暴れるの！？」\n\n理由を考えている暇はない。再び外の池へ！',
        'EXTRA BATTLE\nVS ベリアルさん'
      ],callback);return true;
    }
    if(nextIndex===7){
      storyDay=3;
      showStoryNarrative([
        'ベリアルさんも撃破。\n\nそして――最終日。',
        '決勝用に飾られた蓮の葉競技場は、これまでとは別物だった。\n\n光が水面から幾重にも差し込み、会場中の照明と旗がきらめき、四段の観客席が熱気に包まれている。',
        '反対側のブロックを勝ち上がってきたのは――あまり見かけない、かなり強いヤツらしい。\n\n「あっちの池から呼ばれたヤツだろうか？」',
        'サマエルさん「……待っていた」',
        'FINAL\nVS サマエルさん'
      ],callback);return true;
    }
    if(nextIndex===8){
      showStoryNarrative([
        'サマエルさんを破り――大会優勝！\n\n会場いっぱいに四段の観客席から大歓声が巻き起こる。',
        'サマエルさん「待て！ 俺は負けてねえ！」',
        'サマエルさん「もう一回だ！ もう一回、俺と戦え！」',
        'その瞬間――。\n\n競技場の照明が一瞬だけ赤黒く揺れた。',
        '誰も姿を捉えられないほどの速さで、何者かがサマエルさんの前に現れる。',
        'ドンッ！！',
        'サマエルさん「ぐっ……！？」\n\nサマエルさんは一撃で競技場の端まで吹き飛ばされ、そのまま動かなくなった。',
        '？？？「……ぬるいわ」',
        '静まり返る会場。\n\n赤黒い炎の向こうから、そのカエルがゆっくりこちらを向いた。',
        '？？？「次は貴様だ」',
        'トーナメント表には存在しない乱入者。\n\nその名は――サタナエル。',
        'SPECIAL BATTLE\nVS サタナエルさん'
      ],callback);return true;
    }
    if(nextIndex===9){
      showStoryNarrative([
        'サタナエルさんを退けると、赤黒い炎が静かに消えていった。',
        'サタナエルさん「……ほう」',
        'それだけ言い残し、サタナエルさんは観客席の暗がりへ姿を消した。',
        'しばらく誰も声を出せなかったが――やがて、割れんばかりの歓声が競技場を包む。',
        'そこへ、大会主催者がゆっくり前へ出た。',
        '大会主催者「実に素晴らしい戦いでしたよ！」',
        '大会主催者「まさか、あの方まで退けるとは……おかげで私も、すっかり血が騒いでしまってね。」',
        '大会主催者「最後にひとつ、私とも手合わせ願えないだろうか？」',
        '今度こそ、本当に最後の一戦。',
        'SPECIAL MATCH\nVS セラフィエルさん'
      ],callback);return true;
    }
    return false;
  }

  function showStoryEnding(){
    storyTransitionLocked=true;
    storyFinished=true;gameOver=true;unlockStoryBosses();
    comboEl.textContent=`STORY CLEAR!　${storyWins}勝 ${storyLosses}敗`;
    restartButton.hidden=true;
    showStoryNarrative([
      'セラフィエルさん「……参りました。いやあ、実に楽しかった！」',
      '大会優勝、突然のサタナエルさん乱入、そして主催者との特別試合。\n\nとんでもなく長い一日になった。',
      'こうして、蓮の葉格闘大会は今度こそ本当に終了した。\n\n優勝者を称える紙吹雪が競技場いっぱいに舞い、みんなは勝った負けたと好き勝手に騒いでいる。',
      'ベルゼブブさん「次はもっとルールを減らそう」\n\n誰か「増やすんじゃなくて！？」\n\nカワズさんは隅で静かに首を振った。',
      'そして外の池では――。\n\nアザゼルさんはトンボらしく水面の上を飛び、ベリアルさんは蓮の陰に糸を張っていた。',
      '「……次の大会も、やる？」',
      '一瞬の沈黙。\n\n「やる！」\n\n池の平和は戻った。\n\nたぶん。\n\n少なくとも、次の招待状が届くまでは――。',
      'フロッグファイター2 JUMP\n\nTHE END'
    ],()=>{storyTransitionLocked=false;restartButton.hidden=false;restartButton.textContent='キャラ選択へ';});
  }

  function continueStory(){
    if(storyFinished || storyTransitionLocked)return;
    storyTransitionLocked=true;
    restartButton.hidden=true;

    storyFightIndex++;
    if(storyFightIndex>=storyQueue.length){
      showStoryEnding();
      return;
    }
    const nextType=storyQueue[storyFightIndex];

    if(nextType==='piranha'||nextType==='crayfish')stageTheme=4;
    else if(nextType==='samael'||nextType==='seraphiel'||nextType==='satanael')stageTheme=3;
    else stageTheme=storyFightIndex>=4?2:1;

    const go=()=>{
      storyTransitionLocked=false;
      startGame('story',nextType);
    };
    if(storyInterlude(storyFightIndex,go))return;
    go();
  }

  function chooseAttackVariant(f, other, kind){
    const dy=other.y-f.y;

    // 初心者向けの自動補正だけに絞る。
    // パンチは上方向だけ、キックは下方向だけ。
    if(kind==='punch' && dy<-30) return 'up';
    if(kind==='kick' && dy>30) return 'down';

    return 'mid';
  }

  function auraCancelZones(f){
    if(!f) return [];
    const z=[];
    const fx=x=>f.x+f.face*x;

    if((f.type==='green'||f.type==='mob') && f.specialType==='uppercut' && f.specialT<=.54 && f.specialT>=.08)
      z.push({owner:f,x:fx(48),y:f.y-22,r:30});
    if(f.type==='green' && f.specialType==='dropkick' && f.specialT<=.475 && f.specialT>=.06)
      z.push({owner:f,x:fx(63),y:f.y+25,r:39});
    if(f.type==='green' && f.specialType==='burningCyclone'){
      const ang=burningCycloneAngle(f);
      const a=rotatePoint(-17,52,ang);
      const b=rotatePoint(17,52,ang);
      z.push({owner:f,x:f.x+a.x,y:f.y+a.y,r:28});
      z.push({owner:f,x:f.x+b.x,y:f.y+b.y,r:28});
    }

    if(f.type==='black' && f.specialType==='hellCrashFinish')
      z.push({owner:f,x:fx(48),y:f.y-38,r:34});
    if(f.type==='black' && f.specialType==='abyssCharge')
      z.push({owner:f,x:fx(26),y:f.y+8,r:27});
    if(f.type==='black' && f.specialType==='abyssBurst')
      z.push({owner:f,x:fx(64),y:f.y+7,r:36});

    if(f.type==='orange' && f.specialType==='whiteCounterHit')
      z.push({owner:f,x:fx(58),y:f.y+7,r:32});

    return z;
  }

  function cancelSoftProjectilesAtZone(z){
    if(!z || !z.owner) return;

    pressureBlades.forEach(p=>{
      if(p.hit || !p.owner || p.owner===z.owner) return;
      if(Math.hypot(p.x-z.x,p.y-z.y)<z.r+30){
        p.hit=true; p.t=0;
        spawnImpact(p.x,p.y,'guard');
      }
    });

    catfishCharges.forEach(n=>{
      if(n.hit || !n.owner || n.owner===z.owner) return;
      const headX=n.x+Math.sign(n.vx||1)*58;
      if(Math.hypot(headX-z.x,n.y-z.y)<z.r+58){
        n.hit=true; n.t=0;
        spawnImpact(headX,n.y,'guard');
      }
    });
  }

  function cancelSoftProjectilesByAura(){
    [player,enemy].filter(Boolean).forEach(f=>{
      auraCancelZones(f).forEach(cancelSoftProjectilesAtZone);
    });
  }

  function pointToSegmentDistance(px,py,x1,y1,x2,y2){
    const vx=x2-x1, vy=y2-y1;
    const wx=px-x1, wy=py-y1;
    const vv=vx*vx+vy*vy || 1;
    let t=(wx*vx+wy*vy)/vv;
    t=Math.max(0,Math.min(1,t));
    const cx=x1+vx*t, cy=y1+vy*t;
    return Math.hypot(px-cx,py-cy);
  }

  function specialAquaVortex(f){
    if(gameOver || f.stun>0 || f.guard || f.specialT>0 || f.attackT>0) return false;

    const dir=f.face;
    f.specialType='aquaVortex';
    f.specialT=.48;
    f.attack='punch';
    f.attackVariant='mid';
    f.attackT=.48;

    aquaVortices.push({
      owner:f,
      x:f.x+dir*52,
      y:f.y+7,
      r:34,
      t:3.0,
      life:3.0,
      spin:0,
      lastHitAt:-9999
    });

    comboEl.textContent='アクアボルテックス!';
    setTimeout(()=>{
      if(comboEl.textContent==='アクアボルテックス!') comboEl.textContent='';
    },700);
    return true;
  }

  function specialAquaTornado(f){
    if(gameOver || f.stun>0 || f.guard || f.specialT>0 || f.attackT>0) return false;

    const dir=f.face;
    f.specialType='aquaTornado';
    f.specialT=.78;
    f.specialHitDone=false;
    f.attack='punch';
    f.attackVariant='up';
    f.attackT=.78;

    // 手元から斜め前上へ。画面上端を越える長さにしておく。
    const startX=f.x+dir*35;
    const startY=f.y-6;
    const length=Math.max(innerWidth,innerHeight)*1.05;
    // JUMP版：上方向への制圧力を強め、約35度の斜め上へ。
    const dx=dir*.819;
    const dy=-.574;

    aquaTornadoes.push({
      owner:f,
      startX,startY,
      endX:startX+dx*length,
      endY:startY+dy*length,
      dir,
      t:.72,
      life:.72,
      width:28,
      hit:false,
      direction:'up',
      source:'hand'
    });

    comboEl.textContent='アクアトルネード!';
    setTimeout(()=>{
      if(comboEl.textContent==='アクアトルネード!') comboEl.textContent='';
    },650);

    return true;
  }


  function specialRibbonWhip(f){
    if(gameOver || f.stun>0 || f.guard || f.specialT>0) return false;
    const other=f.isPlayer?enemy:player;
    const dir=f.face;

    f.specialType='ribbonWhip';
    f.specialT=.82;
    f.attack='tongue';
    f.attackT=.82;
    f.ribbonWhipIndex=0;

    comboEl.textContent='リボンラッシュ!';
    setTimeout(()=>{
      if(comboEl.textContent==='リボンラッシュ!') comboEl.textContent='';
    },720);

    // 百裂キック風：舌先を高速で7回突き出す。
    const offsets=[-24,16,-8,26,-18,10,0];
    offsets.forEach((oy,i)=>{
      setTimeout(()=>{
        if(gameOver || !other) return;
        f.ribbonWhipIndex=i+1;

        const dx=(other.x-f.x)*dir;
        const dy=other.y-(f.y+oy);

        if(dx>0 && dx<f.tongueRange*1.42 && Math.abs(dy)<44){
          damageHit(
            f,other,
            (i===6?1.8:1.0)*f.damageMul,
            (i===6?85:18)*dir,
            (i===6?-30:0)
          );
        }
      },i*82);
    });

    return true;
  }

  function specialCatfishCharge(f){
    if(gameOver || f.stun>0 || f.specialT>0) return false;
    const other=f.isPlayer?enemy:player;
    if(!other) return false;
    f.specialType='catfishCall'; f.specialT=.65; f.attackT=.30;
    // リリスさん自身の背後から現れて、そのまま相手方向へ突進。
    const attackDir=f.face;
    const behindX=f.x-attackDir*105;
    const spawnX=Math.max(72,Math.min(innerWidth-72,behindX));

    catfishCharges.push({
      owner:f,
      target:other,
      x:spawnX,
      y:Math.max(90,Math.min(innerHeight-90,f.y+8)),
      vx:attackDir*345,
      t:1.75,
      hit:false
    });
    comboEl.textContent='ナマズさん突進!';
    setTimeout(()=>{if(comboEl.textContent==='ナマズさん突進!')comboEl.textContent='';},800);
    return true;
  }

  function drawIceAura(x,y,rx,ry,intensity=1){
    ctx.save(); ctx.translate(x,y); ctx.globalCompositeOperation='lighter';
    ctx.shadowColor='#bff7ff'; ctx.shadowBlur=20*intensity;
    ctx.fillStyle='rgba(170,238,255,'+(0.24+0.22*intensity)+')';
    ctx.beginPath(); ctx.ellipse(0,0,rx,ry,0,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle='rgba(235,255,255,'+(0.55+0.3*intensity)+')'; ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(-rx*.8,0); ctx.lineTo(-rx*.2,-ry*.8); ctx.lineTo(rx*.15,-ry*.25); ctx.lineTo(rx*.75,-ry*.65); ctx.stroke();
    ctx.restore();
  }

  function specialHellCrash(f){
    if(gameOver || f.stun>0 || f.guard || f.specialT>0) return false;

    const other=f.isPlayer?enemy:player;
    if(!other) return false;

    let dir=f.face;
    const aimDx=other.x-f.x;
    const aimDy=other.y-f.y;
    if(Math.abs(aimDx)>4) dir=Math.sign(aimDx);
    f.face=dir;

    f.specialType='hellCrash';
    f.specialT=.95;
    f.attack='kick';
    f.attackT=.95;
    f.specialHitDone=false;

    comboEl.textContent='ヘルクラッシュ!';
    setTimeout(()=>{
      if(comboEl.textContent==='ヘルクラッシュ!') comboEl.textContent='';
    },800);

    // JUMP版：発動時の相手位置へ上下角度を自動補正。
    // 完全追尾ではなく、最大約45度までの直線突進。
    const rawAngle=Math.atan2(aimDy,Math.max(55,Math.abs(aimDx)));
    const aimAngle=Math.max(-Math.PI/4,Math.min(Math.PI/4,rawAngle));
    const crashSpeed=365;
    f.vx=dir*Math.cos(aimAngle)*crashSpeed;
    f.vy=Math.sin(aimAngle)*crashSpeed;

    const started=performance.now();
    const timer=setInterval(()=>{
      if(gameOver || !f || !other || f.specialType!=='hellCrash'){
        clearInterval(timer);
        return;
      }

      const dx=(other.x-f.x)*dir;
      const dy=Math.abs(other.y-f.y);

      if(dx>-16 && dx<84 && dy<72 && !f.specialHitDone){
        f.specialHitDone=true;
        clearInterval(timer);

        f.vx*=.08;
        other.vx*=.08;
        other.vy*=.12;
        other.stun=Math.max(other.stun,.38);

        // 接触後、氷をまとった蹴りで大きく吹き飛ばす
        f.specialType='hellCrashFinish';
        f.specialT=.5;
        f.attack='kick';
        f.attackVariant='mid';
        f.attackT=.5;

        setTimeout(()=>{
          if(gameOver) return;

          other.hurtFace='both';
          other.hurtFaceT=.72;

          // 斜め上へ強く飛ばし、やられ顔で回転させる
          damageHit(f,other,12.0*f.damageMul,465*dir,-45);

          burstWaves.push({
            x:other.x,
            y:other.y+4,
            t:.30,life:.30,
            radius:12,max:70,
            power:1
          });
        },125);
      }

      if(performance.now()-started>650){
        clearInterval(timer);
      }
    },20);

    return true;
  }

  function startAbyssCharge(f){
    if(gameOver || f.stun>0 || f.guard || f.specialT>0) return false;
    f.specialType='abyssCharge'; f.specialT=20; f.attack='punch'; f.attackT=20;
    f.chargeStartTime=performance.now(); f.chargePower=.2; f.vx*=.25; f.vy*=.25;
    comboEl.textContent='CHARGE...'; return true;
  }

  function releaseAbyssCharge(f){
    if(!f || f.specialType!=='abyssCharge') return false;
    const held=Math.max(0,performance.now()-(f.chargeStartTime||performance.now()));
    const power=Math.max(.25,Math.min(1,held/1150));
    f.specialType='abyssBurst'; f.specialT=.5; f.attack='punch'; f.attackVariant='mid'; f.attackT=.5; f.chargePower=power;
    // 溜め姿勢から拳を出す瞬間に、身体もわずかに前へ乗せる。
    f.vx+=f.face*(38+42*power);
    comboEl.textContent='アビスチャージ!';
    burstWaves.push({x:f.x+f.face*42,y:f.y+7,t:.34,life:.34,radius:18,max:115,power:1.25,ice:true});
    setTimeout(()=>{if(comboEl.textContent==='アビスチャージ!')comboEl.textContent='';},720);
    setTimeout(()=>{
      if(gameOver)return; const other=f.isPlayer?enemy:player; if(!other)return;
      const hx=f.x+f.face*67, hy=f.y+7, dist=Math.hypot(other.x-hx,other.y-hy);
      if(dist<other.radius+34){
        // 直撃は相手をルシファーさんから遠ざける方向へ大きく吹き飛ばす
        const directKnockback=300+150*power;
        damageHit(
          f,other,
          (7.5+7.5*power)*f.damageMul,
          directKnockback*f.face,
          -55
        );
      }else if(dist<155){
        // 衝撃波だけなら従来どおり小さめ
        damageHit(f,other,(1.1+1.9*power)*f.damageMul,85*f.face,-16);
      }
      burstWaves.push({x:hx,y:hy,t:.44,life:.44,radius:18,max:150,power});
    },110);
    return true;
  }

  function specialAquaStream(f){
    if(gameOver || f.stun>0 || f.guard || f.specialT>0 || f.attackT>0) return false;

    const dir=f.face;
    f.specialType='aquaStream';
    f.specialT=.72;
    f.specialHitDone=false;
    f.attack='kick';
    f.attackVariant='down';
    f.attackT=.72;

    const startX=f.x+dir*28;
    const startY=f.y+42;
    const length=Math.max(innerWidth,innerHeight)*1.05;
    // JUMP版：下方向への角度を大きくし、約32度の斜め下へ。
    const dx=dir*.848;
    const dy=.530;

    aquaTornadoes.push({
      owner:f,
      startX,startY,
      endX:startX+dx*length,
      endY:startY+dy*length,
      dir,
      t:.68,
      life:.68,
      width:30,
      hit:false,
      direction:'down',
      source:'foot',
      siltSpawned:false
    });

    comboEl.textContent='アクアストリーム!';
    setTimeout(()=>{
      if(comboEl.textContent==='アクアストリーム!') comboEl.textContent='';
    },650);

    return true;
  }

  function specialBurningCyclone(f){
    if(gameOver || f.stun>0 || f.guard || f.specialT>0 || f.attackT>0) return false;

    f.specialType='burningCyclone';
    f.specialT=1.12;
    f.attack='kick';
    f.attackT=1.12;
    f.cycloneLastHitA=-9999;
    f.cycloneLastHitB=-9999;
    f.cycloneStartTime=performance.now();

    // JUMP版：回転の圧を残しつつ、横への突進量はかなり控えめ。
    f.vx+=f.face*215;
    f.vy*=.18;

    comboEl.textContent='バーニングサイクロン!';
    setTimeout(()=>{
      if(comboEl.textContent==='バーニングサイクロン!') comboEl.textContent='';
    },820);
    clearCommand();
    return true;
  }

  function specialLilithGuillotineKick(f){
    if(gameOver || !f || f.type!=='purple' || f.stun>0 || f.guard || f.throwState || f.specialT>0 || f.attackT>0) return false;
    f.specialType='lilithGuillotineKick';f.specialT=2.4;
    f.attack='kick';f.attackVariant='mid';f.attackT=2.4;
    f.lilithGuillotineHit=false;
    f.lilithGuillotinePrevY=f.y;
    // 横キックの足を出したまま真下へ急降下。
    f.vx*=.16;f.vy=690;
    comboEl.textContent='ギロチンキック!';
    setTimeout(()=>{if(comboEl.textContent==='ギロチンキック!')comboEl.textContent='';},650);
    return true;
  }

  function specialLilithBackSpin(f,additional=false){
    if(gameOver || !f || f.type!=='purple' || f.stun>0 || f.throwState) return false;
    if(additional && f.specialType==='lilithBackSpin'){
      f.specialT=Math.min(1.55,f.specialT+.34);
      f.attackT=Math.min(1.55,f.attackT+.34);
      f.vx-=f.face*115;
      return true;
    }
    if(f.specialT>0 || f.attackT>0) return false;
    f.specialType='lilithBackSpin'; f.specialT=.58;
    f.attack='kick'; f.attackT=.58;
    f.lilithSpinStartTime=performance.now();
    f.lilithSpinLastHitA=-9999; f.lilithSpinLastHitB=-9999;
    f.vx-=f.face*285; f.vy*=.25;
    comboEl.textContent='バックスピンキック!';
    setTimeout(()=>{if(comboEl.textContent==='バックスピンキック!')comboEl.textContent='';},600);
    return true;
  }

  function specialUppercut(f){
    if(gameOver || f.stun>0 || f.guard || f.specialT>0 || f.attackT>0) return false;

    const other=f.isPlayer?enemy:player;
    f.specialType='uppercut';
    f.specialT=.72;
    f.specialHitDone=false;
    f.attack='punch';
    f.attackVariant='up';
    f.attackT=.72;

    // 一瞬しゃがんだ後に、画面上方向へ強く跳ぶ
    setTimeout(()=>{
      if(!f || gameOver) return;
      // JUMP版：縦の主力。従来のおよそ2倍の到達高度を狙う。
      f.vy=-745;
      f.vx+=f.face*45;

      comboEl.textContent=(f.type==='mob'?'かえる跳びアッパー!':'バーニングアッパー!');
      setTimeout(()=>{
        if(comboEl.textContent==='バーニングアッパー!'||comboEl.textContent==='かえる跳びアッパー!') comboEl.textContent='';
      },600);
    },180);

    return true;
  }

  function specialDropKick(f){
    if(gameOver || f.stun>0 || f.guard || f.specialT>0 || f.attackT>0) return false;

    const other=f.isPlayer?enemy:player;
    f.specialType='dropkick';
    f.specialT=.62;
    f.specialHitDone=false;
    f.attack='kick';
    f.attackVariant='mid';
    f.attackT=.62;

    // JUMP版：発射時に敵の位置へ角度を自動補正する。
    setTimeout(()=>{
      if(!f || gameOver) return;
      const target=f.isPlayer?enemy:player;
      let dir=f.face;
      let angle=-0.12;

      if(target){
        const dx=target.x-f.x;
        const dy=target.y-f.y;
        if(Math.abs(dx)>4) dir=Math.sign(dx);
        f.face=dir;

        // 真上・真下へ行きすぎないよう ±55度で制限。
        const raw=Math.atan2(dy,Math.max(45,Math.abs(dx)));
        angle=Math.max(-0.96,Math.min(0.96,raw));
      }

      const speed=475;
      f.vx=dir*Math.cos(angle)*speed;
      f.vy=Math.sin(angle)*speed;

      comboEl.textContent='バーニングキック!';
      setTimeout(()=>{
        if(comboEl.textContent==='バーニングキック!') comboEl.textContent='';
      },600);
    },145);

    return true;
  }

  function hasBackBackCommand(f, windowMs=820){
    const back=f.face>0?'left':'right';
    const diagUp=f.face>0?'upLeft':'upRight';
    const diagDown=f.face>0?'downLeft':'downRight';
    const valid=new Set([back,diagUp,diagDown]);
    const now=performance.now();
    const recent=input.commandHistory.filter(e=>now-e.t<=windowMs);
    let count=0;
    for(let i=recent.length-1;i>=0;i--){
      if(valid.has(recent[i].dir)){
        count++;
        if(count>=2) return true;
      }else if(count>0){
        break;
      }
    }
    return false;
  }


  function specialVenomWater(f){
    if(gameOver || !f || f.stun>0 || f.specialT>0 || f.bossSpecialCooldown>0) return false;
    f.guard=false; f.specialType='venomWater'; f.specialT=.68; f.bossSpecialCooldown=2.4;
    [{vx:-145,vy:-470},{vx:0,vy:-525},{vx:145,vy:-470}].forEach((v,i)=>{
      toxicWaters.push({owner:f,t:4.8,life:4.8,tick:0,x:f.x+(i-1)*10,y:f.y-22,
        vx:v.vx,vy:v.vy,r:21,landed:false,seed:Math.random()*1000,airHitAt:0});
    });
    comboEl.textContent='ヴェノム・ウォーター!';
    setTimeout(()=>{if(comboEl.textContent==='ヴェノム・ウォーター!')comboEl.textContent='';},800);
    clearCommand(); return true;
  }

  function specialFishRaid(f){
    if(gameOver || !f || f.stun>0 || f.specialT>0 || f.bossSpecialCooldown>0) return false;
    const target=f.isPlayer?enemy:player;
    if(!target) return false;

    f.specialType='fishRaid';
    f.specialT=.55;
    f.attack='punch';
    f.attackT=.55;
    f.bossSpecialCooldown=2.0;

    const count=10+Math.floor(Math.random()*11);
    for(let i=0;i<count;i++){
      const side=(i%2===0)?1:-1;
      bossFish.push({
        owner:f,
        target,
        x:side>0?innerWidth+30+Math.random()*130:-30-Math.random()*130,
        y:70+Math.random()*Math.max(120,innerHeight-150),
        vx:0,vy:0,
        r:10+Math.random()*4,
        hp:1,
        t:4.4,
        phase:Math.random()*Math.PI*2
      });
    }

    comboEl.textContent='フィッシュ・レイド!';
    setTimeout(()=>{if(comboEl.textContent==='フィッシュ・レイド!')comboEl.textContent='';},800);
    clearCommand();
    return true;
  }

  function specialAbyssShock(f, route='upper'){
    if(gameOver || !f || f.stun>0 || f.specialT>0 || f.bossSpecialCooldown>0) return false;
    const upper=route!=='lower';
    f.specialType='abyssShock';
    f.specialT=.62;
    f.attack=upper?'punch':'kick';
    f.attackVariant=upper?'up':'down';
    f.attackT=.62;
    f.bossSpecialCooldown=1.25;

    setTimeout(()=>{
      if(gameOver || !f) return;
      abyssShocks.push({
        owner:f,
        x:f.x+f.face*52,
        y:f.y+(upper?-28:52),
        vx:f.face*300,
        vy:upper?-220:220,
        curve:upper?185:-185,
        t:2.4, life:2.4,
        r:30, hit:false, reflected:0, maxReflect:4,
        damage:5.8
      });
    },180);

    comboEl.textContent='アビスショック!';
    setTimeout(()=>{if(comboEl.textContent==='アビスショック!')comboEl.textContent='';},700);
    clearCommand();
    return true;
  }

  function specialCrayfishCounter(f){
    if(gameOver || f.stun>0 || f.throwState || f.specialT>0) return false;
    f.guard=false;
    f.attack=null;
    f.attackT=0;
    f.specialType='crayfishCounter';
    f.specialT=1.15;
    f.crayfishCounterReady=true;
    f.crayfishCounterT=1.15;
    comboEl.textContent='クロー・カウンター!';
    setTimeout(()=>{
      if(comboEl.textContent==='クロー・カウンター!') comboEl.textContent='';
    },720);
    clearCommand();
    return true;
  }

  function triggerCrayfishCounter(f,attacker){
    if(!f || !f.crayfishCounterReady || !attacker) return false;

    f.crayfishCounterReady=false;
    f.crayfishCounterT=0;
    f.specialType='crayfishCounterHit';
    f.specialT=.52;
    f.attack='punch';
    f.attackT=.52;

    attacker.stun=Math.max(attacker.stun,.44);
    attacker.attackT=Math.max(attacker.attackT,.30);

    setTimeout(()=>{
      if(gameOver || !f || !attacker) return;
      // 両腕を広げた構えから、一気に振り下ろす
      damageHit(f,attacker,9.0*f.damageMul,150*f.face,115);
      attacker.hurtFace='both';
      attacker.hurtFaceT=.55;
    },110);

    comboEl.textContent='COUNTER!';
    setTimeout(()=>{
      if(comboEl.textContent==='COUNTER!') comboEl.textContent='';
    },520);

    return true;
  }

  function specialCrayfishRush(f){
    if(gameOver || f.stun>0 || f.specialT>0) return false;
    f.specialType='crayfishRush';
    f.specialT=1.05;
    f.attack='punch';
    f.attackT=1.05;
    f.crayfishRushStep=0;
    f.crayfishRushLastHit=0;
    f.vx += f.face*390;
    f.vy *= .35;

    comboEl.textContent='クローラッシュ!';
    setTimeout(()=>{if(comboEl.textContent==='クローラッシュ!')comboEl.textContent='';},750);
    return true;
  }

  function executeCrayfishBottomSmash(f){
    if(gameOver || !f) return false;

    f.crayfishSmashQueued=false;
    f.crayfishSmashQueueT=0;
    f.specialType='crayfishBottomSmash';
    f.specialT=.72;
    f.attack='kick';
    f.attackT=.72;
    f.crayfishSmashDone=false;

    comboEl.textContent='ボトムスマッシュ!';
    setTimeout(()=>{if(comboEl.textContent==='ボトムスマッシュ!')comboEl.textContent='';},720);

    setTimeout(()=>{
      if(gameOver || !f) return;
      f.crayfishSmashDone=true;

      const floorY=innerHeight-35;
      for(let i=0;i<42;i++){
        const life=1.65+Math.random()*.75;
        siltClouds.push({
          x:Math.random()*innerWidth,
          y:floorY-Math.random()*Math.max(150,innerHeight*.58),
          t:life,life,radius:45+Math.random()*70,mega:true
        });
      }
      for(let i=0;i<14;i++){
        const life=1.4+Math.random()*.55;
        siltClouds.push({
          x:Math.max(0,Math.min(innerWidth,f.x+(Math.random()-.5)*360)),
          y:floorY-Math.random()*180,
          t:life,life,radius:65+Math.random()*75,mega:true
        });
      }

      const other=f.isPlayer?enemy:player;
      if(other && Math.abs(other.x-f.x)<145 && other.y>innerHeight-145){
        damageHit(f,other,5.8*f.damageMul,70*f.face,-135);
      }
    },220);

    return true;
  }

  function specialCrayfishBottomSmash(f){
    if(gameOver || f.stun>0 || f.specialT>0 || f.crayfishSmashQueued) return false;

    // 水底すれすれなら、その場で発動してよい
    if(f.y>=innerHeight-128){
      return executeCrayfishBottomSmash(f);
    }

    // 高い場所ではまず水底へ降りる。空中で土煙は出さない。
    f.crayfishSmashQueued=true;
    f.crayfishSmashQueueT=2.0;
    f.specialType='crayfishSmashDrop';
    f.specialT=2.0;
    f.attack=null;
    f.attackT=0;
    f.vx*=.25;
    f.vy=Math.max(f.vy,360);
    comboEl.textContent='水底へ…';
    return true;
  }

  function specialPiranhaRush(f){
    if(gameOver || f.stun>0 || f.specialT>0) return false;
    f.specialType='piranhaRush'; f.specialT=.72; f.attack='tongue'; f.attackT=.72;
    f.piranhaRushHit=false; f.vx += f.face*610;
    comboEl.textContent='高速突進噛みつき!';
    setTimeout(()=>{if(comboEl.textContent==='高速突進噛みつき!')comboEl.textContent='';},650);
    return true;
  }

  function specialPiranhaDive(f,variant){
    if(gameOver || f.stun>0 || f.specialT>0) return false;
    const other=f.isPlayer?enemy:player;
    f.specialType=variant==='punch'?'piranhaDivePunch':'piranhaDiveKick';
    f.specialT=1.15; f.attack=variant; f.attackT=1.15; f.piranhaDivePhase=1;
    const offset=(variant==='punch'?42:-42)*f.face;
    f.piranhaDiveTargetX=Math.max(45,Math.min(innerWidth-45,(other?other.x:f.x)+offset));
    f.vy=-620; f.vx*=.15;
    comboEl.textContent=variant==='punch'?'急降下背びれ!':'急降下テール!';
    setTimeout(()=>{
      if(gameOver || !f || !f.specialType || !f.specialType.startsWith('piranhaDive')) return;
      f.x=f.piranhaDiveTargetX; f.y=-42; f.vx=0; f.vy=690; f.piranhaDivePhase=2;
    },330);
    return true;
  }

  function specialPressureBlade(f,angleDeg=0,source='punch'){
    const hovering=f && f.type==='yellow' && f.specialType==='raphaelBubbleMove' && (f.raphaelHoverT||0)>0;
    if(gameOver || f.stun>0 || f.guard || (f.specialT>0 && !hovering)) return false;

    // エアホバー中はホバー状態と残り時間を維持したまま攻撃できる。
    if(!hovering){
      f.specialType='pressureBlade';
      f.specialT=.42;
    }
    f.attack=source==='kick' ? 'kick' : 'punch';
    f.attackT=.42;

    // JUMP版ラファエル：風属性のエアカッターを2連射。
    // 空中では少し速く・大きくして風使いとしての性能を上げる。
    const airborne=f.y < jumpFloorY()-18;
    const speed=airborne?425:380;
    const deg=source==='kick' ? 18 : angleDeg;
    const rad=deg*Math.PI/180;
    const yOffset=source==='punch' ? -10 : 24;

    [0,1].forEach((n)=>{
      setTimeout(()=>{
        if(gameOver || !f) return;
        pressureBlades.push({
          owner:f,
          x:f.x+f.face*(64+n*5),
          y:f.y+yOffset+(source==='kick'?n*4:-n*5),
          vx:f.face*Math.cos(rad)*speed,
          vy:Math.sin(rad)*speed,
          t:1.18,
          life:1.18,
          hit:false,
          size:airborne?1.12:1.0,
          angle:rad,
          reflected:0,
          style:'airCutter'
        });
      },n*105);
    });

    comboEl.textContent='エアカッター!';
    setTimeout(()=>{if(comboEl.textContent==='エアカッター!')comboEl.textContent='';},760);
    return true;
  }

  function specialAirBlade(f,variant='down'){
    const hovering=f && f.type==='yellow' && f.specialType==='raphaelBubbleMove' && (f.raphaelHoverT||0)>0;
    if(gameOver || f.stun>0 || f.guard || (f.specialT>0 && !hovering) || f.attackT>0) return false;

    const target=f.isPlayer?enemy:player;
    const airborne=f.y < jumpFloorY()-18;
    const charge=.34;

    // ホバー中に撃っても specialType / specialT はエアホバーのまま。
    if(!hovering){
      f.specialType='airBladeWindup';
      f.specialT=charge+.26;
    }
    f.attack=variant==='down'?'punch':'kick';
    f.attackVariant=variant==='down'?'up':'down';
    f.attackT=charge+.26;

    const moveName=variant==='down'?'エアーギロチン':'エアブレード';
    comboEl.textContent=moveName+'…';

    setTimeout(()=>{
      if(gameOver || !f) return;

      // 相手の現在位置を狙うが、軌道そのものは完全な垂直。
      const tx=Math.max(36,Math.min(innerWidth-36,target?target.x:(f.x+f.face*100)));
      const floor=jumpFloorY();
      const downward=variant==='down';

      water2Shots.push({
        owner:f,
        x:tx,
        y:downward?-72:floor+72,
        vx:0,
        vy:downward?(airborne?610:560):-(airborne?610:560),
        r:airborne?24:22,
        age:0,
        maxAge:3.2,
        t:1,
        life:1,
        damage:airborne?4.7:4.2,
        name:moveName,
        color:'aqua',
        reflected:0,
        hit:false,
        spin:0,
        style:'airGuillotine',
        poisonDuration:0,
        curve:0,
        wobble:0,
        maxReflect:5,
        bladeDown:downward,
        trail:[]
      });

      comboEl.textContent=downward?'エアーギロチン!':'エアブレード 真下→真上!';
      setTimeout(()=>{
        if(comboEl.textContent.includes('エアーギロチン') || comboEl.textContent.includes('エアブレード 真下→真上')){
          comboEl.textContent='';
        }
      },650);
    },charge*1000);

    return true;
  }

  function specialRaphaelBubbleMove(f){
    if(gameOver || f.stun>0 || f.throwState || f.specialT>0) return false;

    f.guard=false;
    // Internal name is kept for existing projectile-immunity / wind-effect compatibility.
    f.specialType='raphaelBubbleMove';
    f.specialT=5.0;
    f.attack=null;
    f.attackT=0;
    f.raphaelHoverT=5.0;
    f.raphaelMoveElapsed=0;
    f.vx=0;
    f.vy=-260; // activation gives a quick lift into the air

    comboEl.textContent='エアホバー!';
    setTimeout(()=>{
      if(comboEl.textContent==='エアホバー!') comboEl.textContent='';
    },720);
    clearCommand();
    return true;
  }

  function specialHealingBubble(f){
    if(gameOver || f.stun>0 || f.specialT>0 || f.healT>0) return false;
    f.guard=false; f.specialType='healingBubble'; f.specialT=.55; f.healT=4.8;
    comboEl.textContent='ヒーリングバブル!';
    setTimeout(()=>{if(comboEl.textContent==='ヒーリングバブル!')comboEl.textContent='';},720);
    return true;
  }

  function hasFacingCircle(f, clockwiseWhenFacingRight=true, maxMs=1100){
    if(!f) return false;
    const now=performance.now();
    const hist=input.commandHistory
      .filter(v=>now-v.time<=maxMs)
      .map(v=>v.dir);

    // 画面座標では下が正なので、この並びが時計回り。
    const cw=['right','downRight','down','downLeft','left','upLeft','up','upRight'];
    const ccw=['right','upRight','up','upLeft','left','downLeft','down','downRight'];

    // 左向き時はコマンドを鏡映しにする。
    const wantCw = f.face>0 ? clockwiseWhenFacingRight : !clockwiseWhenFacingRight;
    const seq=wantCw ? cw : ccw;

    for(let start=0;start<8;start++){
      let p=0;
      for(const d of hist){
        if(d===seq[(start+p)%8]) p++;
        if(p>=7) return true;
      }
    }
    return false;
  }

  function hasFullCircle(maxMs=900){
    const now=performance.now();
    const hist=input.commandHistory.filter(v=>now-v.time<=maxMs).map(v=>v.dir);
    const cw=['right','downRight','down','downLeft','left','upLeft','up','upRight'];
    const ccw=['right','upRight','up','upLeft','left','downLeft','down','downRight'];
    const match=seq=>{
      for(let start=0;start<seq.length;start++){
        let p=0;
        for(const d of hist){
          if(d===seq[(start+p)%8]) p++;
          if(p>=7) return true;
        }
      }
      return false;
    };
    return match(cw)||match(ccw);
  }

  function specialWhiteCounter(f){
    if(gameOver || f.stun>0 || f.specialT>0) return false;
    f.guard=false; f.attack=null; f.attackT=0;
    f.specialType='whiteCounter'; f.specialT=1.15;
    f.counterT=1.15; f.counterReady=true;
    comboEl.textContent='ホワイトカウンター!';
    setTimeout(()=>{if(comboEl.textContent==='ホワイトカウンター!')comboEl.textContent='';},720);
    clearCommand();
    return true;
  }

  function triggerWhiteCounter(f,attacker){
    if(!f || !f.counterReady) return false;
    f.counterReady=false; f.counterT=0;
    f.specialType='whiteCounterHit'; f.specialT=.46;
    f.attack='punch'; f.attackVariant='mid'; f.attackT=.46;
    f.face=attacker && attacker.x<f.x ? -1 : 1;
    if(attacker){
      attacker.stun=Math.max(attacker.stun,.48);
      attacker.attackT=Math.max(attacker.attackT,.48);
      setTimeout(()=>{
        if(gameOver)return;
        damageHit(f,attacker,8.5*f.damageMul,210*f.face,-65,true);
      },105);
    }
    comboEl.textContent='COUNTER!';
    setTimeout(()=>{if(comboEl.textContent==='COUNTER!')comboEl.textContent='';},520);
    return true;
  }

  function armUrielTackle(f){
    if(gameOver || f.stun>0 || f.specialT>0) return false;
    f.tackleArmedT=.8;
    comboEl.textContent='TACKLE READY';
    setTimeout(()=>{if(comboEl.textContent==='TACKLE READY')comboEl.textContent='';},420);
    return true;
  }

  function specialUrielTackle(f){
    if(gameOver || f.stun>0 || f.specialT>0) return false;
    f.guard=false; f.tackleArmedT=0;
    f.specialType='urielTackle'; f.specialT=.96;
    f.attack='punch'; f.attackT=.96; f.tackleHit=false;
    // v4.3: より速く、より長く突進
    f.vx += f.face*560;
    comboEl.textContent='ガーディアンタックル!';
    setTimeout(()=>{if(comboEl.textContent==='ガーディアンタックル!')comboEl.textContent='';},720);
    return true;
  }

  function hasForwardForwardTap(f, windowMs=780){
    const now=performance.now();
    const taps=(input.forwardTapTimes||[]).filter(t=>now-t<=windowMs);
    input.forwardTapTimes=taps;
    return taps.length>=2;
  }

  function specialKawazuTonguePiledriver(f){
    if(gameOver || !f || f.type!=='kawazu' || f.stun>0 || f.specialT>0) return false;
    const other=f.isPlayer?enemy:player;
    if(!other) return false;
    if(Math.abs(other.x-f.x)>18) f.face=Math.sign(other.x-f.x)||f.face;

    f.attack='tongue';f.attackT=.55;f.tongueT=.55;
    const dx=(other.x-f.x)*f.face,dy=Math.abs(other.y-f.y);
    clearCommand();
    if(dx<=0 || dx>(f.tongueRange||205)*1.28 || dy>150)return true;

    setTimeout(()=>{
      if(gameOver||!other||other.guard)return;
      f.specialType='kawazuTonguePiledriver';f.specialT=1.22;
      other.stun=Math.max(other.stun,1.15);
      other.throwState={owner:f,endT:1.0,spinSpeed:0,noWallDamage:true,tongueWrapped:true};
      other.vx=0;other.vy=0;f.vx=0;f.vy=0;
      comboEl.textContent='SECRET! 舌巻きパイルドライバー!';

      // 旧版の見た目を復元：ピンクの舌で胴体を何重にも巻き、二人で回転してから逆さまに落とす。
      const cx=(f.x+other.x)*.5;
      const cy=Math.max(150,Math.min(jumpFloorY()-170,(f.y+other.y)*.5-18));
      [0,1,2,3,4,5].forEach(i=>setTimeout(()=>{
        if(gameOver||!other||!f)return;
        const a=i*Math.PI*.48;
        f.x=cx+Math.cos(a)*34; f.y=cy+Math.sin(a)*25;
        other.x=cx-Math.cos(a)*18; other.y=cy-Math.sin(a)*14;
        f.spinAngle=a*.72; other.spinAngle=a*.72;
        other.throwState && (other.throwState.tongueWrapped=true);
      },90+i*72));

      setTimeout(()=>{
        if(gameOver||!other)return;
        // 相手を完全に逆さまへ。カワズは巻き込みから離脱。
        other.x=cx;other.y=cy+10;other.spinAngle=Math.PI;
        f.x=Math.max(50,Math.min(innerWidth-50,cx-78*f.face));
        f.y=cy-22;f.spinAngle=0;
        if(other.throwState)other.throwState.tongueWrapped=false;
        other.throwState=null;
        other.vx=0;other.vy=820;
        f.vx=-f.face*105;f.vy=-115;
        damageHit(f,other,9.0*f.damageMul,0,420,true);
        spawnImpact(other.x,other.y,'hit');
      },575);

      setTimeout(()=>{if(comboEl.textContent.includes('SECRET'))comboEl.textContent='';},1050);
    },105);
    return true;
  }

  function specialKawazuTripleUpper(f){
    if(gameOver||!f||f.type!=='kawazu'||f.stun>0||f.guard||f.specialT>0||f.attackT>0)return false;
    const other=f.isPlayer?enemy:player;
    if(!other)return false;
    f.specialType='kawazuTripleUpper';f.specialT=1.42;f.attack='punch';f.attackVariant='up';f.attackT=1.42;
    other.stun=Math.max(other.stun,1.45);
    comboEl.textContent='ファントムラッシュ!';

    let side=f.x<other.x?-1:1;
    const warpStrike=(kind,dmg,lift,delay)=>{
      setTimeout(()=>{
        if(gameOver||!other||other.hp<=0)return;
        const oldX=f.x,oldY=f.y;
        side*=-1;
        f.x=Math.max(48,Math.min(innerWidth-48,other.x+side*74));
        f.y=Math.max(70,Math.min(jumpFloorY()-70,other.y+36));
        f.face=other.x>=f.x?1:-1;
        kawazuGhosts.push({x:oldX,y:oldY,t:.30,life:.30,angle:0});
        f.attack=kind==='kick'?'kick':'punch';
        f.attackVariant=kind==='kick'?'side':'up';
        f.attackT=Math.max(f.attackT,.18);
        damageHit(f,other,dmg*f.damageMul,kind==='kick'?78*f.face:30*f.face,lift);
        other.vy=Math.min(other.vy,lift);
        spawnImpact(other.x,other.y,'hit');
      },delay);
    };

    warpStrike('upper',2.7,-230,95);
    warpStrike('upper',2.9,-275,275);
    warpStrike('kick',2.8,-135,455);
    warpStrike('kick',3.0,-165,625);

    // 最後は左右に「同時に2人いる」ような濃い残像を出し、両側からアッパー。
    setTimeout(()=>{
      if(gameOver||!other||other.hp<=0)return;
      const y=Math.max(70,Math.min(jumpFloorY()-70,other.y+36));
      const lx=Math.max(48,other.x-78), rx=Math.min(innerWidth-48,other.x+78);
      kawazuGhosts.push({x:lx,y,t:.34,life:.34,angle:0});
      kawazuGhosts.push({x:rx,y,t:.34,life:.34,angle:0});
      // 本体も一方に置き、もう一方を濃い残像にしてほぼ同時攻撃に見せる。
      f.x=lx; f.y=y; f.face=1;
      f.attack='punch';f.attackVariant='up';f.attackT=.28;
      damageHit(f,other,4.8*f.damageMul,0,-410);
      other.vy=Math.min(other.vy,-410);
      spawnImpact(other.x-12,other.y,'hit');
      setTimeout(()=>spawnImpact(other.x+12,other.y,'hit'),28);
    },815);

    setTimeout(()=>{if(comboEl.textContent==='ファントムラッシュ!')comboEl.textContent='';},1250);
    clearCommand();return true;
  }

  function specialKawazuPressureRush(f){
    if(gameOver || f.stun>0 || f.specialT>0)return false;
    f.specialType='kawazuPressureRush';f.specialT=.62;f.attack='punch';f.attackT=.62;
    const count=10;
    for(let i=0;i<count;i++){
      const spread=(-.48+Math.random()*.96);
      const speed=370+Math.random()*145;
      kawazuShots.push({
        owner:f,x:f.x+f.face*45,y:f.y+5+(Math.random()-.5)*20,
        vx:f.face*Math.cos(spread)*speed,vy:Math.sin(spread)*speed,
        r:8+Math.random()*3,t:.85,life:.85,hit:false,reflected:0
      });
    }
    comboEl.textContent='水圧ラッシュ!';
    clearCommand();return true;
  }

  function specialKawazuMirageKick(f){
    if(gameOver || f.stun>0 || f.specialT>0)return false;
    const other=f.isPlayer?enemy:player;
    f.specialType='kawazuMirageKick';f.specialT=1.0;f.attack='kick';f.attackT=1.0;
    f.vx=f.face*760;
    const startFace=f.face;
    setTimeout(()=>{
      if(gameOver||!other||f.specialType!=='kawazuMirageKick')return;
      if(Math.hypot(other.x-f.x,other.y-f.y)<other.radius+f.radius+72){
        f.vx=0;other.stun=Math.max(other.stun,.95);
        for(let i=0;i<7;i++){
          setTimeout(()=>{
            if(gameOver||!other)return;
            const a=i*Math.PI*2/7;
            const gx=other.x+Math.cos(a)*72,gy=other.y+Math.sin(a)*54;
            kawazuGhosts.push({x:gx,y:gy,t:.22,life:.22,angle:a});
            spawnImpact(other.x+Math.cos(a)*20,other.y+Math.sin(a)*15,'hit');
            damageHit(f,other,(i===6?2.5:.90)*f.damageMul,(i===6?180:10)*startFace,(i===6?-50:0));
          },i*62);
        }
      }
    },105);
    comboEl.textContent='ミラージュキック!';
    clearCommand();return true;
  }

  function specialKawazuSpinCutter(f){
    if(gameOver || !f || f.type!=='kawazu' || f.stun>0 || f.guard || f.specialT>0) return false;

    // フィギュアスケート風にその場で高速3回転し、1回転ごとにカッターを1発放つ。
    const total=.84;
    f.specialType='kawazuSpinCutter';
    f.specialT=total;
    f.attack='kick';
    f.attackT=total;
    comboEl.textContent='スピンキックカッター!';

    const dir=f.face;
    [90,330,570].forEach((delay,i)=>{
      setTimeout(()=>{
        if(gameOver || !f || f.specialType!=='kawazuSpinCutter') return;

        // 3発ともほぼ正面。わずかに高さをずらして刃が重なり過ぎないようにする。
        const speed=390+i*16;
        water2Shots.push({
          owner:f,
          x:f.x+dir*62,
          y:f.y-4+(i-1)*9,
          vx:dir*speed,
          vy:(i-1)*10,
          r:15,
          t:1.35,
          life:1.35,
          damage:2.0,
          name:'スピンキックカッター',
          color:'blade',
          reflected:0,
          hit:false,
          spin:i*.65,
          style:'spinCutterBlade',
          poisonDuration:0,
          curve:0,
          wobble:0,
          baseVy:(i-1)*10,
          maxReflect:4
        });
        spawnImpact(f.x+dir*54,f.y+8,'guard');
      },delay);
    });

    clearCommand();
    return true;
  }

  function specialKawazuCyclone(f){
    if(gameOver || f.stun>0 || f.specialT>0)return false;
    const other=f.isPlayer?enemy:player;
    if(!other)return false;
    f.specialType='kawazuCyclone';f.specialT=1.15;f.attack='kick';f.attackT=1.15;
    const dir=f.face;
    other.stun=Math.max(other.stun,1.0);
    for(let i=0;i<14;i++){
      setTimeout(()=>{
        if(gameOver||!other)return;
        const a=i*Math.PI*2/7;
        f.x=Math.max(45,Math.min(innerWidth-45,other.x+Math.cos(a)*64));
        f.y=Math.max(55,Math.min(innerHeight-55,other.y+Math.sin(a)*48));
        kawazuGhosts.push({x:f.x,y:f.y,t:.42,life:.42,angle:a});
        if(Math.hypot(f.x-other.x,f.y-other.y)<100){
          damageHit(f,other,(i===13?3.2:.72)*f.damageMul,(i===13?225:8)*dir,(i===13?-65:0));
        }
      },i*55);
    }
    comboEl.textContent='ハイスピードサイクロン!';
    clearCommand();return true;
  }

  function specialMichaelRedAura(f){
    if(gameOver || !f || f.type!=='green' || f.stun>0 || f.specialT>0) return false;
    f.guard=false; f.specialType='michaelRedAura'; f.specialT=.42;
    f.michaelRedAuraT=3.0; f.michaelPowerReady=true;
    f.hp=Math.min(100,f.hp+3.0);
    if(f.isPlayer)updateHud();
    comboEl.textContent='レッドオーラ!';
    setTimeout(()=>{if(comboEl.textContent==='レッドオーラ!')comboEl.textContent='';},720);
    clearCommand(); return true;
  }

  function consumeMichaelPower(f,kind){
    if(!f || f.type!=='green' || !f.michaelPowerReady)return false;
    f.michaelPowerReady=false; f.michaelBoostAttackT=1.45;
    if(kind==='punch'||kind==='kick'){
      michaelAuraShots.push({
        owner:f,x:f.x+f.face*42,y:f.y+(kind==='punch'?-4:28),
        vx:f.face*(kind==='punch'?520:470),vy:0,
        r:kind==='punch'?11:13,t:.9,life:.9,hit:false
      });
    }
    return true;
  }

  function specialEngineerMiniVortex(f){
    if(gameOver||!f||(f.type!=='pascal'&&f.type!=='malphas')||f.stun>0||f.guard||f.specialT>0)return false;
    f.specialType='engineerMiniVortex';f.specialT=.34;f.attack='punch';f.attackT=.34;
    engineerShots.push({
      owner:f,x:f.x+f.face*42,y:f.y+4,
      vx:f.face*305,vy:0,r:14,t:1.35,life:1.35,spin:0,hit:false
    });
    comboEl.textContent='ミニボルテックス!';
    setTimeout(()=>{if(comboEl.textContent==='ミニボルテックス!')comboEl.textContent='';},520);
    return true;
  }

  function specialLunaSlash(f,arc){
    if(gameOver||!f||f.type!=='sariel'||f.stun>0||f.guard||f.specialT>0||f.attackT>0)return false;
    f.specialType='lunaSlash';f.specialT=.50;f.attack='punch';f.attackT=.50;
    lunarSlashes.push({owner:f,arc,dir:f.face,baseX:f.x,baseY:f.y,t:1.55,life:1.55,age:0,r:(f&&f.type==='awakenedKokabiel'?31:22),damage:6.2,hit:false});
    comboEl.textContent=arc==='up'?'ルナ・スラッシュ（上）!':'ルナ・スラッシュ（下）!';return true;
  }
  function specialEvilEye(f){
    if(gameOver||!f||f.type!=='sariel'||f.stun>0||f.specialT>0)return false;
    f.guard=false;f.specialType='evilEye';f.specialT=.72;f.evilEyeHit=false;comboEl.textContent='イーブルアイ…';return true;
  }
  function specialBloodMoon(f){
    if(gameOver||!f||f.type!=='sariel'||f.stun>0||f.specialT>0)return false;
    f.guard=false;f.specialType='bloodMoon';f.specialT=2.75;
    bloodMoons=bloodMoons.filter(m=>m.owner!==f);
    bloodMoons.push({owner:f,t:2.5,life:2.5,broken:false,startHp:f.hp});
    comboEl.textContent='ブラッドムーン…';return true;
  }
  function specialMoonSaltKick(f){
    if(gameOver||!f||f.type!=='sariel'||f.stun>0||f.guard||f.specialT>0||f.attackT>0)return false;
    f.specialType='moonSalt';f.specialT=.82;f.attack='kick';f.attackT=.82;f.moonSaltHits=0;f.moonSaltHitCd=0;f.moonSaltSpin=0;f.vy=-145;f.vx=f.face*78;
    comboEl.textContent='ムーンサルトキック!';return true;
  }

  function specialGravityBall(f){
    const specialGravityBall_awakenedBoost=(f&&f.type==='awakenedKokabiel')?1.65:1;
    if(gameOver||!f||f.type!=='kokabiel'||f.stun>0||f.guard||f.specialT>0||f.attackT>0)return false;
    f.specialType='gravityBall';f.specialT=.54;f.attack='punch';f.attackT=.54;
    // JUMP版：横へ吸うより「下へ落とす」重力弾。
    gravityBalls.push({owner:f,x:f.x+f.face*48,y:f.y-8,vx:f.face*170,vy:0,r:22,t:4,damage:4.4,reflects:0,maxReflect:4,pull:250,downPull:980});
    comboEl.textContent='グラビティボール…';return true;
  }
  function specialGravityZone(f){
    const specialGravityZone_awakenedBoost=(f&&f.type==='awakenedKokabiel')?1.65:1;
    if(gameOver||!f||f.type!=='kokabiel'||f.stun>0||f.specialT>0)return false;
    f.guard=false;f.specialType='gravityZone';f.specialT=.58;
    const t=f.isPlayer?enemy:player;
    const x=t?Math.max(80,Math.min(innerWidth-80,t.x-f.face*85)):f.x+f.face*150;
    // JUMP版：重力ゾーンは常に蓮の葉に近い下方へ発生。
    const y=Math.max(innerHeight*.68,jumpFloorY()-72);
    gravityZones=gravityZones.filter(z=>z.owner!==f);
    gravityZones.push({owner:f,x,y,r:22,maxR:120,t:3.0,life:3.0,arm:.36,downPull:1500});
    comboEl.textContent='グラビティゾーン…';return true;
  }
  function specialMeteorRain(f){
    const specialMeteorRain_awakenedBoost=(f&&f.type==='awakenedKokabiel')?1.65:1;
    if(gameOver||!f||f.type!=='kokabiel'||f.stun>0||f.guard||f.specialT>0||f.attackT>0)return false;
    const t=f.isPlayer?enemy:player;if(!t)return false;
    f.specialType='meteorRain';f.specialT=.85;f.attack='punch';f.attackT=.42;
    // JUMP版：ほぼ全画面を覆わないよう、相手周辺の狭い範囲に3発。
    const base=t.x,offs=[-34,0,34];
    offs.forEach((ox,i)=>meteorDrops.push({
      owner:f,x:Math.max(55,Math.min(innerWidth-55,base+ox)),
      y:-55-i*22,vy:315+i*20,r:22+(i===1?3:0),
      delay:.16+i*.15,t:2.25,active:false,damage:4.4
    }));
    comboEl.textContent='メテオレイン…';return true;
  }

  function specialGravityDive(f){
    const specialGravityDive_awakenedBoost=(f&&f.type==='awakenedKokabiel')?1.65:1;
    if(gameOver||!f||f.type!=='kokabiel'||f.stun>0||f.guard||f.specialT>0||f.attackT>0)return false;
    f.specialType='gravityDive';f.specialT=.58;f.attack='kick';f.attackT=.58;
    f.gravityDiveHit=false;f.vx=f.face*285;f.vy=430;
    comboEl.textContent='グラビティダイブ!';return true;
  }

  function specialJihalBolt(f){
    if(gameOver||!f||f.type!=='jihal'||f.stun>0||f.guard||f.specialT>0||f.attackT>0)return false;
    f.specialType='jihalBolt';f.specialT=.40;f.attack='punch';f.attackT=.40;
    jihalBolts.push({owner:f,x:f.x+f.face*58,y:f.y-10,vx:f.face*350,vy:0,r:13,halfW:36,halfH:11,t:2.4,damage:5,reflects:0});
    comboEl.textContent='ボルトショット!';return true;
  }
  function specialLightningDash(f){
    if(gameOver||!f||f.type!=='jihal'||f.stun>0||f.guard||f.specialT>0||f.attackT>0)return false;
    f.jihalDashOriginX=f.x;
    f.jihalRushDir=f.face||1;
    f.specialType='lightningDash';f.specialT=.34;f.attack='kick';f.attackT=.34;
    f.jihalDashHit=false;f.jihalDashHitWindow=.21;
    f.vx=f.face*920;
    comboEl.textContent='ライトニングダッシュ!';
    return true;
  }
  function startThunderCharge(f){
    if(gameOver||!f||f.type!=='jihal'||f.stun>0||f.guard||f.attackT>0||f.jihalCharging)return false;
    f.jihalCharging=true;f.jihalCharge=0;f.specialType='thunderChargeHold';f.specialT=999;f.vx*=.1;
    comboEl.textContent='サンダーチャージ…';return true;
  }
  function releaseThunderCharge(f){
    if(!f||!f.jihalCharging)return false;
    const c=Math.max(0,Math.min(1,f.jihalCharge||0));
    f.jihalCharging=false;
    f.jihalDashOriginX=f.x;
    f.jihalRushDir=f.face||1;
    f.specialType='thunderChargeRush';f.specialT=.30;f.attack='kick';f.attackT=.30;
    f.jihalChargePower=c;f.jihalThunderHit=false;
    f.vx=f.jihalRushDir*(980+520*c);
    comboEl.textContent=c>.75?'フル・サンダーチャージ!':'サンダーチャージ!';
    return true;
  }
  function specialSparkBurst(f){
    if(gameOver||!f||f.type!=='jihal'||f.stun>0||f.guard||f.specialT>0||f.attackT>0)return false;
    f.specialType='sparkBurst';f.specialT=.50;f.attack='punch';f.attackT=.42;
    jihalBursts.push({owner:f,x:f.x,y:f.y,r:8,maxR:108,t:.40,life:.40});
    const o=f.isPlayer?enemy:player;
    setTimeout(()=>{if(o&&Math.hypot(o.x-f.x,o.y-f.y)<112){damageHit(f,o,7*f.damageMul,Math.sign(o.x-f.x||1)*210,-65);spawnImpact(o.x,o.y,'hit');}},100);
    comboEl.textContent='スパークバースト!';return true;
  }

  function remielMakeMirage(f,where){
    if(gameOver||!f||f.type!=='remiel'||f.stun>0||f.specialT>0)return false;
    remielMirages=remielMirages.filter(m=>m.owner!==f);

    const originY=f.y;
    // 幻影側は大きく、本体側も反対方向へ少し移動。
    const ghostDelta=where==='up'?-108:108;
    const bodyDelta =where==='up'?  48:-48;
    const bodyTargetY=Math.max(74,Math.min(innerHeight-74,originY+bodyDelta));
    const ghostTargetY=Math.max(74,Math.min(innerHeight-74,originY+ghostDelta));

    remielMirages.push({
      owner:f,side:where,t:4.2,life:4.2,alpha:.82,age:0,
      originY,bodyTargetY,ghostTargetY,
      offsetY:ghostTargetY-bodyTargetY
    });

    f.vy=0;
    f.specialType='remielMirage';f.specialT=.34;
    comboEl.textContent=where==='up'?'ミラージュ（上）!':'ミラージュ（下）!';
    return true;
  }
  function specialMirageCounter(f){
    if(gameOver||!f||f.type!=='remiel'||f.stun>0||f.specialT>0)return false;
    f.guard=false;f.specialType='mirageCounter';f.specialT=.48;f.remielCounterT=.30;comboEl.textContent='ミラージュカウンター…';return true;
  }
  function specialAquaParry(f,just=false){
    if(gameOver||!f||f.type!=='remiel'||f.stun>0||f.specialT>0)return false;
    f.guard=true;f.guardStartT=.28;f.specialType='aquaParry';f.specialT=just?.30:.38;f.remielParryT=just?.18:.15;comboEl.textContent=just?'ジャスト・アクアパリィ!':'アクアパリィ…';return true;
  }
  function specialRemielFrostShot(f){
    if(!specialWater2Shot(f,{name:'フロストショット',attack:'punch',color:'ice',style:'iceOrb',speed:210,damage:4.8,r:22,charge:.40,maxReflect:5})) return false;
    const mir=remielMirages.find(m=>m.owner===f&&m.t>0),target=f.isPlayer?enemy:player;
    if(mir&&target){
      const sx=f.x+f.face*42,sy=f.y+mir.offsetY-12,dx=target.x-sx,dy=target.y-sy,d=Math.hypot(dx,dy)||1,sp=210;
      // 分身弾も本体と同じ大きさ・速度。見た目では判別できず、命中時のみ半ダメージ。
      remielFakeShots.push({owner:f,x:sx,y:sy,vx:dx/d*sp,vy:dy/d*sp,r:22,t:1.55,life:1.55,damage:2.4,reflects:0,hit:false});
    }
    return true;
  }
  function specialMirageKick(f){
    if(gameOver||!f||f.type!=='remiel'||f.stun>0||f.guard||f.specialT>0||f.attackT>0)return false;
    f.specialType='mirageKick';f.specialT=.72;f.attack='kick';f.attackT=.72;f.remielKickStartX=f.x;f.vx=f.face*360;
    const other=f.isPlayer?enemy:player,dir=f.face;
    const mir=remielMirages.find(m=>m.owner===f&&m.t>0);
    setTimeout(()=>{
      if(other&&Math.abs(other.x-f.x)<132&&Math.abs(other.y-f.y)<82){damageHit(f,other,9.8*f.damageMul,315*dir,-50);spawnImpact(other.x,other.y,'hit');}
      if(mir&&mir.t>0&&other){
        const gy=f.y+mir.offsetY;
        if(Math.abs(other.x-f.x)<132&&Math.abs(other.y-gy)<82){
          damageHit(f,other,4.9*f.damageMul,175*dir,-28);
          spawnImpact(other.x,other.y,'hit');mir.t=0;
        }
      }
    },180);comboEl.textContent='ミラージュキック!';return true;
  }

  function specialSeraphicUpper(f){
    if(gameOver||!f||f.type!=='seraphiel'||f.stun>0||f.guard||f.specialT>0||f.attackT>0)return false;
    f.specialType='seraphicUpper';f.specialT=.68;f.attack='punch';f.attackVariant='up';f.attackT=.68;
    f.seraphicAura='hand'; f.seraphicAuraT=.68;
    f.vx=f.face*105; f.vy=-705;
    const other=f.isPlayer?enemy:player,dir=f.face;
    setTimeout(()=>{if(other&&Math.abs(other.x-f.x)<112&&Math.abs(other.y-f.y)<105){
      damageHit(f,other,13.2*f.damageMul,175*dir,-315);spawnImpact(other.x,other.y,'hit');
    }},150);
    comboEl.textContent='セラフィックアッパー!';
    return true;
  }

  function specialSeraphicKick(f){
    if(gameOver||!f||f.type!=='seraphiel'||f.stun>0||f.guard||f.specialT>0||f.attackT>0)return false;
    f.specialType='seraphicKick';f.specialT=.64;f.attack='kick';f.attackVariant='mid';f.attackT=.64;
    f.seraphicAura='foot'; f.seraphicAuraT=.64;
    f.vx=f.face*355;
    const other=f.isPlayer?enemy:player,dir=f.face;
    setTimeout(()=>{if(other&&Math.abs(other.x-f.x)<128&&Math.abs(other.y-f.y)<82){
      damageHit(f,other,11.8*f.damageMul,365*dir,-55);spawnImpact(other.x,other.y,'hit');
    }},145);
    comboEl.textContent='セラフィックキック!';
    return true;
  }

  function specialSeraphicCyclone(f){
    if(gameOver||!f||f.type!=='seraphiel'||f.stun>0||f.guard||f.specialT>0||f.attackT>0)return false;
    f.specialType='seraphicCyclone';f.specialT=.95;f.attack='kick';f.attackT=.95;f.seraphicCycloneStart=performance.now();
    const other=f.isPlayer?enemy:player;
    let hits=0;
    const timer=setInterval(()=>{
      if(gameOver||!other||f.specialType!=='seraphicCyclone'){clearInterval(timer);return;}
      if(Math.abs(other.x-f.x)<105&&Math.abs(other.y-f.y)<90&&hits<3){
        hits++; damageHit(f,other,4.2*f.damageMul,105*f.face,(hits===3?-155:-35));spawnImpact(other.x,other.y,'hit');
      }
    },105);
    setTimeout(()=>{clearInterval(timer);f.spinAngle=0;},720);
    comboEl.textContent='セラフィックサイクロン!';
    return true;
  }

  function specialSeraphicRay(f){
    if(gameOver||!f||f.type!=='seraphiel'||f.stun>0||f.guard||f.specialT>0||f.attackT>0)return false;
    f.specialType='seraphicRay';f.specialT=.92;f.attack='punch';f.attackT=.92;
    // 独自技：細い光線ではなく、水中を貫く太い光の帯。予告後に一瞬だけ発生。
    seraphielRays.push({owner:f,x:f.x+f.face*55,y:f.y-8,dir:f.face,t:.62,life:.62,active:false,hit:false});
    comboEl.textContent='セラフィックレイ…';
    return true;
  }


  function specialDisasterFlare(f){
    if(gameOver||!f||f.type!=='satanael'||f.stun>0||f.guard||f.specialT>0||f.attackT>0)return false;
    f.specialType='disasterFlare';f.specialT=.62;f.attack='punch';f.attackT=.62;
    satanaelFlares.push({owner:f,x:f.x+f.face*58,y:f.y-6,vx:f.face*118,r:31,t:6,hit:false});
    comboEl.textContent='ディザスターフレア…';
    return true;
  }
  function specialDarkRay(f){
    if(gameOver||!f||f.type!=='satanael'||f.stun>0||f.guard||f.specialT>0||f.attackT>0)return false;
    f.specialType='darkRay';f.specialT=.92;f.attack='punch';f.attackT=.92;
    satanaelRays.push({owner:f,x:f.x+f.face*55,y:f.y-8,dir:f.face,t:.62,life:.62,active:false,hit:false});
    comboEl.textContent='ダークレイ…';
    return true;
  }
  function specialDarkPressure(f){
    if(gameOver||!f||f.type!=='satanael'||f.stun>0||f.specialT>0||f.attackT>0)return false;
    f.guard=false;f.specialType='darkPressure';f.specialT=.82;
    satanaelPressures.push({owner:f,t:.78,life:.78});
    comboEl.textContent='ダークプレッシャー…';
    return true;
  }
  function specialInfernoWave(f){
    if(gameOver||!f||f.type!=='satanael'||f.stun>0||f.guard||f.specialT>0||f.attackT>0)return false;
    f.specialType='infernoWave';f.specialT=.78;f.attack='kick';f.attackT=.78;
    const dir=f.face;
    // JUMP版：蓮の葉付近から通常ジャンプ高まで立ち上がる、太い黒炎の壁。
    const floorY=innerHeight-82;
    for(let i=0;i<9;i++)satanaelWaves.push({owner:f,x:f.x+dir*(70+i*78),y:floorY,t:.12+i*.085,life:.34,hit:false});
    comboEl.textContent='インフェルノウェーブ!';
    return true;
  }

  function specialDeadlyAqua(f){
    if(gameOver || !f || f.type!=='samael' || f.stun>0 || f.guard || f.specialT>0 || f.attackT>0) return false;
    const target=f.isPlayer?enemy:player;
    if(!target) return false;
    f.specialType='deadlyAqua'; f.specialT=1.18; f.attack=null; f.attackT=.25;
    // 反則級だが予告は明確。水槽内の4点に毒水の渦が順番に生まれる。
    const W=innerWidth,H=innerHeight;
    const pts=[
      [Math.max(78,target.x-185),Math.max(88,target.y-125)],
      [Math.min(W-78,target.x+185),Math.min(H-88,target.y+125)],
      [Math.min(W-78,target.x+175),Math.max(88,target.y-135)],
      [Math.max(78,target.x-175),Math.min(H-88,target.y+135)]
    ];
    pts.forEach((pt,i)=>{
      samaelGates.push({owner:f,target,side:'deadly',x:pt[0],y:pt[1],t:.62+i*.15,life:.62+i*.15,fired:false,deadly:true});
    });
    comboEl.textContent='デッドリー・アクア…!';
    setTimeout(()=>{if(comboEl.textContent==='デッドリー・アクア…!')comboEl.textContent='';},900);
    return true;
  }

  function specialSamaelGate(f,side){
    if(gameOver || !f || f.type!=='samael' || f.stun>0 || f.guard || f.specialT>0 || f.attackT>0) return false;
    const target=f.isPlayer?enemy:player;
    if(!target) return false;
    f.specialType='samaelGate'; f.specialT=.64; f.attack='punch'; f.attackT=.64;
    let x=target.x, y=target.y;
    const marginX=82, marginY=86;
    if(side==='up'){ x=target.x; y=Math.max(64,target.y-170); }
    else if(side==='down'){ x=target.x; y=Math.min(innerHeight-64,target.y+170); }
    else if(side==='forward'){ x=Math.max(64,Math.min(innerWidth-64,target.x+f.face*190)); y=target.y; }
    else { x=Math.max(64,Math.min(innerWidth-64,target.x-f.face*190)); y=target.y; }
    samaelGates.push({owner:f,target,side,x,y,t:.56,life:.56,fired:false});
    comboEl.textContent='ポイズンゲート…';
    return true;
  }

  function specialSamaelTongueShot(f){
    if(gameOver || !f || f.type!=='samael' || f.stun>0 || f.guard || f.specialT>0 || f.attackT>0) return false;
    const target=f.isPlayer?enemy:player;
    if(!target) return false;
    f.specialType='samaelTongue'; f.specialT=.58;
    f.attack='tongue'; f.attackT=.58; f.tongueT=.46;
    f.bossTongueAimY=Math.max(-62,Math.min(62,(target.y-f.y)*.40));
    comboEl.textContent='ヴェノムタン…';
    setTimeout(()=>{
      if(gameOver || !f || !target) return;
      const reach=Math.min(f.tongueRange,Math.max(145,Math.abs(target.x-f.x)*.82));
      const sx=f.x+f.face*reach;
      const sy=f.y+8+(f.bossTongueAimY||0);
      const dx=target.x-sx,dy=target.y-sy,d=Math.hypot(dx,dy)||1;
      const speed=245;
      water2Shots.push({
        owner:f,x:sx,y:sy,vx:dx/d*speed,vy:dy/d*speed,r:15,
        age:0,maxAge:18,t:1,life:1,damage:4.3,name:'ヴェノムタン',
        color:'samaelVenom',reflected:0,hit:false,spin:0,style:'samaelVenom',
        poisonDuration:2.0,curve:0,arcFlip:1,wobble:0,baseVy:dy/d*speed,maxReflect:4
      });
      comboEl.textContent='ヴェノムタン!';
      setTimeout(()=>{if(comboEl.textContent==='ヴェノムタン!')comboEl.textContent='';},520);
    },260);
    return true;
  }


  function specialAquaDropShot(f){
    if(gameOver || !f || f.stun>0 || f.guard || f.specialT>0 || f.attackT>0) return false;

    const target=f.isPlayer?enemy:player;
    f.specialType='aquaDropShotWindup';
    f.specialT=.56;
    f.attack='punch';
    f.attackVariant='up';
    f.attackT=.56;
    comboEl.textContent='アクアショット…';

    setTimeout(()=>{
      if(gameOver || !f) return;
      const q={
        owner:f,
        x:f.x,
        y:f.y-36,
        vx:f.face*38,
        vy:-520,
        r:15,
        age:0,
        maxAge:8,
        t:1,
        life:1,
        damage:4.1,
        name:'アクアショット',
        color:'aqua',
        reflected:0,
        hit:false,
        spin:0,
        style:'aquaDrop',
        poisonDuration:0,
        curve:0,
        arcFlip:1,
        wobble:.05,
        baseVy:-520,
        maxReflect:5,
        dropPhase:'rising',
        dropTargetX:target?target.x:f.x+f.face*120
      };
      water2Shots.push(q);
      comboEl.textContent='アクアショット!';
      setTimeout(()=>{if(comboEl.textContent==='アクアショット!')comboEl.textContent='';},520);
    },360);

    return true;
  }

  function specialWater2Shot(f,opts={}){
    if(gameOver || !f || f.stun>0 || f.guard || f.specialT>0 || f.attackT>0) return false;
    const dir=f.face;
    const name=opts.name||'ショット';
    const charge=Math.max(.18,opts.charge||.34); // 予備動作。見てからガードできる。
    f.specialType='water2ShotWindup';
    f.specialT=charge+.18;
    f.attack=opts.attack||'punch';
    f.attackVariant='mid';
    f.attackT=charge+.18;
    comboEl.textContent=name+'…';
    setTimeout(()=>{
      if(gameOver || !f) return;
      const speed=opts.speed||285;
      const angle=(opts.angle||0)*Math.PI/180;
      const shot={
        owner:f, x:f.x+dir*(opts.offsetX||58), y:f.y+(opts.offsetY||0),
        vx:dir*Math.cos(angle)*speed, vy:Math.sin(angle)*speed,
        r:opts.r||13,
        // v0.4.2: 弾は速度差で不公平にならないよう、通常は時間切れで消さない。
        // maxAge は画面外に出られない等の異常時だけ使う長い安全寿命。
        age:0, maxAge:opts.maxAge||18, t:1, life:1,
        damage:opts.damage||4.0, name, color:opts.color||'aqua',
        reflected:0, hit:false, spin:0,
        style:opts.style||opts.color||'aqua',
        poisonDuration:opts.poisonDuration||0,
        curve:opts.curve||0,
        // カープ水圧カッターの上/下で刃の絵も反転させる。
        arcFlip: opts.arcFlip || ((opts.curve||0) < 0 ? -1 : 1),
        wobble:opts.wobble||0,
        baseVy:Math.sin(angle)*speed,
        maxReflect:opts.maxReflect||5,
        riseAfter:opts.riseAfter||0,
        riseAccel:opts.riseAccel||0,
        spiralAmp:opts.spiralAmp||0,
        spiralFreq:opts.spiralFreq||0
      };
      water2Shots.push(shot);
      comboEl.textContent=name+'!';
      setTimeout(()=>{if(comboEl.textContent===name+'!')comboEl.textContent='';},520);
    },charge*1000);
    return true;
  }

  function specialIceWall(f){
    if(gameOver || !f || f.type!=='black' || f.stun>0 || f.specialT>0) return false;
    f.guard=false;
    f.specialType='iceWall'; f.specialT=.42; f.attack=null; f.attackT=.18;
    const x=Math.max(58,Math.min(innerWidth-58,f.x+f.face*60));
    const y=Math.max(90,Math.min(innerHeight-85,f.y+5));
    // 同じルシファーの古い壁は消し、1枚だけ設置できる。
    iceWalls=iceWalls.filter(w=>w.owner!==f);
    iceWalls.push({owner:f,x,y,w:25,h:112,t:3.0,life:3.0,hitCd:0});
    comboEl.textContent='アイスウォール!';
    setTimeout(()=>{if(comboEl.textContent==='アイスウォール!')comboEl.textContent='';},650);
    return true;
  }

  function startIceChargeShot(f){
    if(gameOver || !f || f.type!=='black' || f.stun>0 || f.guard || f.specialT>0) return false;
    f.specialType='iceCharge'; f.specialT=20; f.attack='kick'; f.attackT=20;
    f.iceChargeStart=performance.now(); f.vx*=.3; f.vy*=.3;
    comboEl.textContent='ICE CHARGE...'; return true;
  }

  function releaseIceChargeShot(f){
    if(!f || f.specialType!=='iceCharge') return false;
    const held=Math.max(0,performance.now()-(f.iceChargeStart||performance.now()));
    const power=Math.max(.25,Math.min(1,held/1200));
    f.specialType='iceChargeRelease'; f.specialT=.42; f.attack='kick'; f.attackT=.42;
    const r=20+12*power, speed=225+65*power;
    water2Shots.push({owner:f,x:f.x+f.face*62,y:f.y+22,vx:f.face*speed,vy:0,r,age:0,maxAge:18,damage:6.0+5.0*power,name:'アイスチャージショット',color:'ice',reflected:0,hit:false,spin:0,style:'iceChargeOrb',poisonDuration:0,curve:0,wobble:0,baseVy:0,maxReflect:5,trail:[]});
    comboEl.textContent='アイスチャージショット!';
    setTimeout(()=>{if(comboEl.textContent==='アイスチャージショット!')comboEl.textContent='';},650);
    return true;
  }

  function water2HeldDir(f, dir){
    if(!f) return false;
    const kx=(keys['d']?1:0)-(keys['a']?1:0);
    const ky=(keys['s']?1:0)-(keys['w']?1:0);
    const x=(input.x||0)+kx;
    const y=(input.y||0)+ky;
    if(dir==='up') return y<-.35;
    if(dir==='down') return y>.35;
    if(dir==='forward') return f.face>0 ? x>.35 : x<-.35;
    if(dir==='back') return f.face>0 ? x<-.35 : x>.35;
    return false;
  }

  function specialHellFlame(f){
    if(gameOver||!f||f.stun>0||f.guard||f.specialT>0)return false;
    const target=f.isPlayer?enemy:player;if(!target)return false;
    f.specialType='hellFlame';f.specialT=.58;f.attack='punch';f.attackT=.58;
    flaurosPillars.push({owner:f,x:target.x,y:innerHeight-86,t:.48,life:.95,fired:false,hit:false});
    comboEl.textContent='ヘルフレイム…';return true;
  }
  function specialFlameClaw(f){
    if(gameOver||!f||f.stun>0||f.guard||f.specialT>0)return false;
    // 専用技なので specialWater2Shot の再チェックを通さず、予備動作後に3本を直接生成する。
    f.specialType='flameClaw';f.specialT=.62;f.attack='punch';f.attackT=.62;
    comboEl.textContent='フレイムクロー…';
    const fireOne=(deg)=>{
      if(gameOver||!f)return;
      const dir=f.face, speed=315, angle=deg*Math.PI/180;
      water2Shots.push({owner:f,x:f.x+dir*58,y:f.y,vx:dir*Math.cos(angle)*speed,vy:Math.sin(angle)*speed,r:16,age:0,maxAge:18,t:1,life:1,damage:3.1,name:'フレイムクロー',color:'fire',reflected:0,hit:false,spin:0,style:'flameClaw',poisonDuration:0,curve:0,arcFlip:1,wobble:0,baseVy:Math.sin(angle)*speed,maxReflect:4});
    };
    setTimeout(()=>{[-20,0,20].forEach((a,i)=>setTimeout(()=>fireOne(a),i*65));comboEl.textContent='フレイムクロー!';},180);
    return true;
  }
  function specialLeopardRush(f){
    if(gameOver||!f||f.stun>0||f.guard||f.specialT>0)return false;
    f.specialType='leopardRush';f.specialT=.46;f.attack='kick';f.attackT=.46;f.flaurosRushHit=false;f.flaurosRushDir=f.face;f.vx=f.face*760;f.vy=-55;
    comboEl.textContent='レオパードラッシュ!';return true;
  }
  function specialInfernoClaw(f){
    if(gameOver||!f||f.stun>0||f.guard||f.specialT>0)return false;
    f.specialType='infernoClaw';f.specialT=1.10;f.attack='kick';f.attackT=1.10;f.infernoPhase=0;f.infernoHit=false;f.infernoStart=performance.now();
    // まず「自分の後ろ側」の上壁へ飛ぶ。右向きなら左上、左向きなら右上。
    f.infernoFromX=f.x;f.infernoFromY=f.y;
    f.infernoWallX=f.face>0?62:innerWidth-62;f.infernoWallY=92;
    f.infernoEndX=f.face>0?innerWidth-62:62;f.infernoEndY=innerHeight-230;
    comboEl.textContent='インフェルノクロー!';return true;
  }


  function specialMobTripleKick(f){
    if(gameOver||!f||f.type!=='mob'||f.stun>0||f.guard||f.specialT>0||f.attackT>0)return false;
    const other=f.isPlayer?enemy:player;
    if(!other)return false;

    f.specialType='mobTripleKick';
    f.specialT=.78;
    f.attack='kick';
    f.attackVariant='mid';
    f.attackT=.78;
    f.vx=0;
    comboEl.textContent='トリプルキック!';

    const hitOnce=(delay,damage,step,knock)=>{
      setTimeout(()=>{
        if(gameOver||!other||other.hp<=0||f.specialType!=='mobTripleKick')return;

        // 1発ごとに前へ素早く滑り込みながら蹴る
        f.x=Math.max(42,Math.min(innerWidth-42,f.x+f.face*step));
        f.face=(other.x>=f.x)?1:-1;
        f.attack='kick';
        f.attackVariant='mid';
        f.attackT=Math.max(f.attackT,.17);

        const dx=(other.x-f.x)*f.face;
        const dy=Math.abs(other.y-f.y);
        if(dx>-18 && dx<105 && dy<82){
          if(other.guard){
            spawnImpact(other.x,other.y,'guard');
            other.vx+=f.face*28;
          }else{
            damageHit(f,other,damage*f.damageMul,knock*f.face,-10);
            spawnImpact(other.x,other.y,'hit');
          }
        }
      },delay);
    };

    hitOnce(70,1.8,34,40);
    hitOnce(205,2.0,38,48);
    hitOnce(340,2.4,44,72);

    setTimeout(()=>{
      if(comboEl.textContent==='トリプルキック!')comboEl.textContent='';
    },720);

    clearCommand();
    return true;
  }

  function trySpecial(f,kind){
    if(kind==='guard'&&f&&f.type==='satanael'&&water2HeldDir(f,'down')){clearCommand();return specialDarkPressure(f);}
    if(!f) return false;
    const forward=f.face>0?'right':'left';
    const back=f.face>0?'left':'right';
    if((f.type==='pascal'||f.type==='malphas') && kind==='punch'){
      clearCommand();
      return specialEngineerMiniVortex(f);
    }


    if(f.type==='satanael'){
      if(kind==='punch'&&water2HeldDir(f,'back')){clearCommand();return specialDisasterFlare(f);}
      if(kind==='punch'&&water2HeldDir(f,'forward')){clearCommand();return specialDarkRay(f);}
      if(kind==='kick'&&water2HeldDir(f,'down')){clearCommand();return specialInfernoWave(f);}
    }
    if(f.type==='flauros'){
      if(kind==='punch'&&water2HeldDir(f,'up')){clearCommand();return specialHellFlame(f);}
      if(kind==='punch'&&water2HeldDir(f,'forward')){clearCommand();return specialFlameClaw(f);}
      if(kind==='kick'&&water2HeldDir(f,'up')){clearCommand();return specialInfernoClaw(f);}
      if(kind==='kick'&&water2HeldDir(f,'forward')){clearCommand();return specialLeopardRush(f);}
    }

    if(f.type==='sariel'){
      if(kind==='punch'&&water2HeldDir(f,'up')){clearCommand();return specialLunaSlash(f,'up');}
      if(kind==='punch'&&water2HeldDir(f,'down')){clearCommand();return specialLunaSlash(f,'down');}
      if(kind==='kick'&&water2HeldDir(f,'up')){clearCommand();return specialMoonSaltKick(f);}
    }

    if((f.type==='kokabiel'||f.type==='awakenedKokabiel')){
      if(kind==='punch'&&water2HeldDir(f,'forward')){clearCommand();return specialGravityBall(f);}
      if(kind==='punch'&&water2HeldDir(f,'down')){clearCommand();return specialMeteorRain(f);}
      if(kind==='kick'&&water2HeldDir(f,'down')){clearCommand();return specialGravityDive(f);}
    }

    if(f.type==='jihal'){
      if(kind==='punch'&&water2HeldDir(f,'forward')){clearCommand();return specialJihalBolt(f);}
      if(kind==='punch'&&water2HeldDir(f,'down')){clearCommand();return specialSparkBurst(f);}
      if(kind==='kick'&&water2HeldDir(f,'forward')){clearCommand();return specialLightningDash(f);}
    }

    if(f.type==='remiel'){
      if(kind==='punch' && water2HeldDir(f,'forward')){clearCommand();return specialRemielFrostShot(f);}
      if(kind==='kick' && water2HeldDir(f,'forward')){clearCommand();return specialMirageKick(f);}
    }

    // セラフィエル：ミカエル系の高火力・低防御。レイだけ独自技。
    if(f.type==='seraphiel'){
      if(kind==='kick'){
        if(water2HeldDir(f,'forward')){clearCommand();return specialSeraphicKick(f);}
        if(water2HeldDir(f,'back') && hasCommand(['down'],1200)){
          clearCommand();return specialSeraphicCyclone(f);
        }
      }
      if(kind==='punch'){
        if(water2HeldDir(f,'up')){clearCommand();return specialSeraphicUpper(f);}
        if(water2HeldDir(f,'forward') && hasCommand(['down'],1200)){
          clearCommand();return specialSeraphicRay(f);
        }
        if(water2HeldDir(f,'back')){
          clearCommand();return specialWater2Shot(f,{name:'セラフィックショット',attack:'punch',color:'seraphic',style:'seraphicShot',speed:300,damage:5.8,r:25,charge:.36,maxReflect:5,spiralAmp:28,spiralFreq:11});
        }
      }
    }

    // サマエル：本人ではなく指定方向に毒の発生点を作る。
    if(f.type==='samael'){
      // 上位技はスマホでも押しやすい「前 → 下 → 後ろ ＋ キック」。
      if(kind==='kick'){
        // スマホ向け専用判定：
        // 「前 → 下」の履歴があり、最後に後ろを押しながらキックで成立。
        // スティックが斜めを通っても最後の後ろ入力を履歴に要求しない。
        const deadlyBackHeld=water2HeldDir(f,'back');
        if(deadlyBackHeld && hasCommand([forward,'down'],1500)){
          clearCommand(); f.attackT=0; f.attack=null;
          return specialDeadlyAqua(f);
        }
      }
      if(kind==='punch'){
        let side=null;
        if(water2HeldDir(f,'up')) side='up';
        else if(water2HeldDir(f,'down')) side='down';
        else if(water2HeldDir(f,'forward')) side='forward';
        else if(water2HeldDir(f,'back')) side='back';
        if(side){ clearCommand(); return specialSamaelGate(f,side); }
      }
      if(kind==='tongue' && water2HeldDir(f,'forward')){ clearCommand(); return specialSamaelTongueShot(f); }
    }

    // カワズさん：4キャラ運用を前提に入力を短く。
    if(f.type==='kawazu'){
      if(kind==='tongue' && hasFullRotation(1350)){
        clearCommand();
        return specialKawazuTonguePiledriver(f);
      }
      if(kind==='punch' && water2HeldDir(f,'forward')){
        clearCommand();
        return specialKawazuTripleUpper(f);
      }
      if(kind==='kick' && water2HeldDir(f,'back')){
        clearCommand();
        return specialKawazuSpinCutter(f);
      }
      if(kind==='kick' && water2HeldDir(f,'forward')){
        clearCommand();
        return specialKawazuMirageKick(f);
      }
      if(kind==='punch' && (input.punchTapTimes||[]).length>=2){
        input.punchTapTimes=[];
        clearCommand();
        return specialKawazuPressureRush(f);
      }
    }

    
    // 池将棋MIX：モブさん専用。技は2つだけ。
    if(f.type==='mob'){
      const mobForward=water2HeldDir(f,'forward') || hasCommand([forward],650);
      const mobUp=water2HeldDir(f,'up') || hasCommand(['up'],650);
      if(kind==='kick' && mobForward){
        clearCommand();
        return specialMobTripleKick(f);
      }
      // 上を優先。斜め前上で誤ってバブルショットになるのを防ぐ。
      if(kind==='punch' && mobUp){
        clearCommand();
        const ok=specialUppercut(f);
        if(ok){
          comboEl.textContent='かえる跳びアッパー!';
          setTimeout(()=>{if(comboEl.textContent==='かえる跳びアッパー!')comboEl.textContent='';},620);
        }
        return ok;
      }
      if(kind==='punch' && mobForward){
        clearCommand();
        return specialWater2Shot(f,{
          name:'バブルショット',
          attack:'punch',
          color:'bubble',
          style:'bubble',
          speed:190,
          damage:3.0,
          r:18,
          charge:.24,
          wobble:.12,
          maxReflect:3
        });
      }
    }

    // フロッグファイター2 JUMP：ミカエル。基本技は1方向＋ボタン、サイクロンだけ上位コマンド。
    if(f.type==='green'){
      if(kind==='kick' && hasCommand(['down',back],760)){ clearCommand(); return specialBurningCyclone(f); }
      if(kind==='punch' && water2HeldDir(f,'up')){ clearCommand(); return specialUppercut(f); }
      if(kind==='kick' && water2HeldDir(f,'forward')){ clearCommand(); return specialDropKick(f); }
      if(kind==='punch' && water2HeldDir(f,'back')){
        clearCommand(); return specialWater2Shot(f,{name:'バーニングショット',attack:'punch',color:'fire',style:'burning',speed:190,damage:4.4,r:15,charge:.40,maxReflect:5});
      }
    }

    // フロッグファイター2 JUMP：ガブリエル。ガード始動をやめ、方向＋攻撃へ。
    if(f.type==='blue'){
      if(kind==='punch' && water2HeldDir(f,'up')){ clearCommand(); return specialAquaTornado(f); }
      if(kind==='kick' && water2HeldDir(f,'down')){ clearCommand(); return specialAquaStream(f); }
      if(kind==='punch' && water2HeldDir(f,'back')){ clearCommand(); return specialAquaVortex(f); }
      if(kind==='punch' && water2HeldDir(f,'forward')){
        // JUMP版：前＋パンチらしく、正面へ太い高圧水弾を高速射出。
        clearCommand(); return specialWater2Shot(f,{
          name:'アクアショット',
          attack:'punch',
          color:'aqua',
          style:'aquaPressure',
          speed:430,
          damage:4.2,
          r:(f&&f.type==='awakenedKokabiel'?34:24),
          charge:.30,
          wobble:.04,
          maxReflect:5
        });
      }
    }

    if(f.type==='black'){
      if(kind==='kick' && water2HeldDir(f,'forward')){ clearCommand(); f.attackT=0; f.attack=null; return specialHellCrash(f); }
      if(kind==='punch' && water2HeldDir(f,'forward')){
        clearCommand(); return specialWater2Shot(f,{name:'アイスショット',attack:'punch',color:'ice',style:'iceOrb',speed:225,damage:5.2,r:24,charge:.44,maxReflect:5});
      }
    }

    if(f.type==='piranha'){
      if(!false && kind==='tongue' && hasCommand([back,forward],850)){
        clearCommand(); return specialPiranhaRush(f);
      }
      if(kind==='punch' && hasCommand(['down','up'],900)){ clearCommand(); return specialPiranhaDive(f,'punch'); }
      if(kind==='kick' && hasCommand(['down','up'],900)){ clearCommand(); return specialPiranhaDive(f,'kick'); }
    }

    if(f.type==='crayfish'){
      if(kind==='kick' && hasCommand([back,'down'],850)){ clearCommand(); return specialCrayfishBottomSmash(f); }
    }

    // JUMP版ラファエル：風属性。前は2連エアカッター、後ろは縦軌道のエアブレード。
    if(f.type==='yellow'){
      if(kind==='punch' && water2HeldDir(f,'forward')){ clearCommand(); return specialPressureBlade(f,0,'punch'); }
      if(kind==='kick' && water2HeldDir(f,'forward')){ clearCommand(); return specialPressureBlade(f,18,'kick'); }
      if(kind==='punch' && water2HeldDir(f,'back')){ clearCommand(); return specialAirBlade(f,'down'); }
      if(kind==='kick' && water2HeldDir(f,'back')){ clearCommand(); return specialAirBlade(f,'up'); }
    }

    // フロッグファイター2 JUMP：ウリエル G＋P（直前のガードタップ＋P）でホワイトショット。
    if(f.type==='orange' && kind==='punch'){
      const justGuarded=performance.now()-(input.lastSimpleGuardTapTime||0)<=650;
      if(justGuarded){ input.lastSimpleGuardTapTime=0; clearCommand(); return specialWater2Shot(f,{name:'ホワイトショット',attack:'punch',color:'white',style:'whiteOrb',speed:250,damage:3.7,r:17,charge:.38,maxReflect:5}); }
    }
    // リリス JUMP版：大きく遅い泡。後半は浮力で上へ持ち上がる。
    if(f.type==='purple' && kind==='punch' && water2HeldDir(f,'back')){
      clearCommand(); return specialWater2Shot(f,{name:'バブルショット',attack:'punch',color:'bubble',style:'bubble',speed:145,damage:(f&&f.type==='awakenedKokabiel'?5.2:3.2),r:27,charge:.36,wobble:.18,maxReflect:4,riseAfter:.72,riseAccel:150});
    }
    if(f.type==='purple' && kind==='punch' && water2HeldDir(f,'down')){
      clearCommand(); return specialWater2Shot(f,{name:'バブルショット',attack:'punch',color:'bubble',style:'bubble',speed:145,angle:30,damage:3.2,r:27,charge:.36,wobble:.18,maxReflect:4,riseAfter:.72,riseAccel:150});
    }

    if(f.type==='beelzebub'){
      if(kind==='punch' && water2HeldDir(f,'forward')){ clearCommand(); return specialWater2Shot(f,{name:'ベノムショット',attack:'punch',color:'venom',style:'venomGloss',speed:285,angle:-24,curve:285,damage:5.0,r:29,charge:.46,poisonDuration:2.2,maxReflect:4}); }
      if(kind==='punch' && water2HeldDir(f,'up')){ clearCommand(); return specialAbyssShock(f,'upper'); }
      if(kind==='kick' && water2HeldDir(f,'down')){ clearCommand(); return specialAbyssShock(f,'lower'); }
    }

    return false;
  }

  function registerRapidTap(kind){
    const now=performance.now();
    const key=kind==='punch'?'punchTapTimes':'tongueTapTimes';
    input[key]=(input[key]||[]).filter(t=>now-t<=620);
    input[key].push(now);
    if(input[key].length>=3){
      input[key]=[];
      return true;
    }
    return false;
  }

  function attack(f, kind) {
    if(basketMiniActive){
      hockeyStrike(f,kind);
    }

    if(gameOver || f.guard) return;

    // 壁際の後ろ＋舌：壁へ舌を伸ばして張り付く。
    if(kind==='tongue' && f && f.isPlayer){
      const backHeld=(f.face>0&&input.x<-.35)||(f.face<0&&input.x>.35);
      const floor=jumpFloorY(),nearLeft=f.x<=68,nearRight=f.x>=innerWidth-68;
      if(backHeld&&f.y<floor-28&&(nearLeft||nearRight)&&f.wallClingCooldown<=0&&!f.throwState){
        f.wallTongueHeld=true;f.wallClingSide=nearLeft?-1:1;f.wallClingT=.12;
        f.tongueT=.12;f.attack='tongue';f.attackT=.12;f.vx=0;f.vy=0;return;
      }
    }
    if(f.type==='green' && f.michaelPowerReady && (kind==='punch'||kind==='kick')){
      consumeMichaelPower(f,kind);
    }

    const rapidTriple=(kind==='punch' || kind==='tongue') ? registerRapidTap(kind) : false;
    // アスモデウスさん：パンチ×3でクローラッシュ
    if(f.type==='crayfish' && kind==='punch' && rapidTriple){
      f.attackT=0;
      f.attack=null;
      if(specialCrayfishRush(f)){ playSfx('special'); return; }
    }


    if(f.type==='purple' && kind==='tongue' && rapidTriple){
      // 1・2回目の通常舌硬直を3回目でキャンセル。
      f.attackT=0;
      f.attack=null;
      f.tongueT=0;
      if(specialRibbonWhip(f)){ playSfx('special'); return; }
    }

    // リリスさん：下＋キックで真下へギロチンキック。
    if(f.type==='purple' && kind==='kick'){
      const downHeld=input.y>.35;
      if(downHeld && specialLilithGuillotineKick(f)){ playSfx('special'); return; }
    if(f.specialType==='lilithBackSpin'){
        if(specialLilithBackSpin(f,true)){ playSfx('special'); return; }
      }
      const backHeld=(f.face>0 && input.x<-.35)||(f.face<0 && input.x>.35);
      if(backHeld && specialLilithBackSpin(f,false)){ playSfx('special'); return; }
    }

    // 通常攻撃より先に必殺技コマンドを判定
    if(trySpecial(f,kind)){ playSfx('special'); return; }

    // 舌で引かれている最中だけは、stun中でも舌による投げ抜けを受け付ける。
    const pullerForEscape = f.isPlayer ? enemy : player;
    const canTongueEscape = kind==='tongue' && pullerForEscape &&
      pullerForEscape.tonguePullTarget===f && pullerForEscape.tonguePullTimer>0;

    if(!canTongueEscape && (f.stun>0 || f.attackT>0)) return;

    // 非カエル種の舌ボタンは、それぞれ固有の近接攻撃に置換
    if(kind==='tongue' && f.type==='piranha'){
      playSfx('tongue');
      f.attack='tongue'; f.attackT=.34; f.vx += f.face*115;
      const other=f.isPlayer?enemy:player;
      setTimeout(()=>{ if(other && Math.hypot(other.x-f.x,other.y-f.y)<88) damageHit(f,other,4.4*f.damageMul,92*f.face,-5); },105);
      return;
    }

    if(kind==='tongue' && f.type==='crayfish'){
      playSfx('tongue');
      f.attack='crayfishStab'; f.attackT=.34;
      const other=f.isPlayer?enemy:player;
      setTimeout(()=>{
        if(!other)return;
        const dx=(other.x-f.x)*f.face;
        if(dx>0 && dx<105 && Math.abs(other.y-f.y)<58){
          damageHit(f,other,4.8*f.damageMul,110*f.face,-5);
        }
      },105);
      return;
    }

    const other = f.isPlayer ? enemy : player;
    const dir=f.face;
    const dist=Math.hypot(other.x-f.x, other.y-f.y);

    // ウリエルさん：ガード長押しで得た白いオーラ中はパンチ/キックのリーチ約3倍。
    if(f.type==='orange' && f.urielAuraT>0 && (kind==='punch'||kind==='kick')){
      f.attack=kind; f.attackVariant='mid'; f.attackT=kind==='punch'?.40:.54;
      f.whiteReachAttack=kind;
      const reach=kind==='punch'?235:285;
      const dmg=kind==='punch'?3.5:6.4;
      const delay=kind==='punch'?120:170;
      if(other && (other.x-f.x)*dir>0 && (other.x-f.x)*dir<reach && Math.abs(other.y-f.y)<82){
        setTimeout(()=>{
          if(!other)return;
          damageHit(f,other,dmg*f.damageMul,(kind==='punch'?85:170)*dir,kind==='punch'?-8:-28);
        },delay);
      }
      setTimeout(()=>{ if(f.whiteReachAttack===kind) f.whiteReachAttack=null; },Math.round((kind==='punch'?.40:.54)*1000));
      return;
    }

    if(f.type==='crayfish' && kind==='punch'){
      f.attack='crayfishHammer'; f.attackT=.42;
      if(dist<100 && Math.abs(other.y-f.y)<72){
        setTimeout(()=>damageHit(f,other,5.6*f.damageMul,85*dir,110),150);
      }
      return;
    }

    if(f.type==='crayfish' && kind==='kick'){
      f.attack='crayfishUpper'; f.attackT=.44;
      if(dist<100 && Math.abs(other.y-f.y)<78){
        setTimeout(()=>damageHit(f,other,5.2*f.damageMul,80*dir,-145),155);
      }
      return;
    }

    if(kind==='punch' || kind==='kick'){
      f.attackVariant=chooseAttackVariant(f,other,kind);
    }

    if(kind==='punch'){
      f.attack='punch';f.attackT=.34;
      const v=f.attackVariant;
      const yAim=v==='up'?-34:0;
      if(dist<88 && Math.abs((other.y-f.y)-yAim)<58){
        const ky=v==='up'?-72:-5;
        setTimeout(()=>damageHit(f,other,2.6*f.damageMul,52*dir,ky),125);
      }
    } else if(kind==='kick'){
      f.attack='kick';f.attackT=.50;remielMirageAttack(f,'kick');
      const v=f.attackVariant;
      const yAim=v==='down'?42:0;
      if(dist<106 && Math.abs((other.y-f.y)-yAim)<72){
        const ky=v==='down'?125:-21;
        setTimeout(()=>damageHit(f,other,5.2*f.damageMul,142*dir,ky),175);
      }
    } else if(kind==='tongue'){
      // 自分が舌で引き寄せられている最中に舌を押すと「投げ抜け」。
      // お互いの舌が伸びたままになり、投げには移行せず中央へ接近する。
      const puller = f.isPlayer ? enemy : player;
      if(puller && puller.tonguePullTarget===f && puller.tonguePullTimer>0){
        puller.tonguePullTarget=null;
        puller.tonguePullTimer=0;

        f.tongueClashTarget=puller;
        f.tongueClashTimer=.72;
        puller.tongueClashTarget=f;
        puller.tongueClashTimer=.72;

        f.tongueT=.72;
        puller.tongueT=.72;
        f.attack='tongue';
        f.attackT=.24;

        // 互いの速度を一度落とし、中央へじわっと寄る。
        f.vx*=.3; f.vy*=.3;
        puller.vx*=.3; puller.vy*=.3;

        spawnImpact((f.x+puller.x)/2,(f.y+puller.y)/2,'guard');
        return;
      }

      // 引き寄せ中にもう一度舌を押したら「舌投げ」
      if(!f.tongueClashTarget && f.tonguePullTarget && f.tonguePullTimer>0){
        const target=f.tonguePullTarget;
        f.tongueT=.18;
        f.attack='tongue';
        f.attackT=.28;

        // JUMP版：2回目の舌は横へ投げず、相手を下方向へ叩きつける。
        // 横成分は少なめにして、床へ強く落とす「舌叩きつけ」にする。
        const throwDir = -f.face;

        // 連続舌投げ時に前回の回転状態を引き継がない
        target.throwState=null;
        target.spinAngle=0;

        target.throwState={
          owner:f,
          spinSpeed: throwDir*12,
          endT:.58,
          noWallDamage:false
        };
        target.hurtFace='both';
        target.hurtFaceT=.7;

        target.vx = throwDir*145;
        target.vy = 760;

        target.stun=.55;
        f.tonguePullTarget=null;
        f.tonguePullTimer=0;
        spawnImpact(target.x,target.y,'hit');
        return;
      }

      // 通常の舌。コンボ中でなくても小ダメージ＋引き寄せ。
      remielMirageAttack(f,'tongue');
      playSfx('tongue');
      f.tongueT=.22;
      f.attack='tongue';
      f.attackT=.3;

      const jumpTongueRange=(f.tongueRange||220)*1.28;
      const tongueDy=Math.abs(other.y-f.y);
      const tongueTolerance=f.type==='beelzebub'?180:150;
      f.jumpTongueAimY=Math.max(-105,Math.min(105,(other.y-f.y)*.72));
      if(Math.abs(other.x-f.x)<jumpTongueRange&&tongueDy<tongueTolerance&&Math.sign(other.x-f.x)===dir){
        if(f.type==='beelzebub')f.bossTongueAimY=(other.y-f.y)*.55;
        setTimeout(()=>{
          if(!other.guard){
            // まず小ダメージ
            damageHit(f,other,1.8*f.damageMul,0,0);

            // 一定時間、相手を自分へ引き寄せる
            f.tonguePullTarget=other;
            f.tonguePullTimer=.72;
            other.stun=Math.max(other.stun,.18);

            const dx=f.x-other.x;
            const dy=f.y-other.y;
            other.vx += dx*1.8;
            other.vy += dy*1.8;
          } else {
            spawnImpact(other.x,other.y,'guard');
          }
        },70);
      }
    }
  }


  function remielMirageAttack(owner,kind){
    if(!owner||owner.type!=='remiel')return;
    const mir=remielMirages.find(m=>m.owner===owner&&m.t>0&&(m.age||0)>=.28),target=owner.isPlayer?enemy:player;
    if(!mir||!target)return;
    const dx=target.x-owner.x,dy=target.y-(owner.y+mir.offsetY),front=dx*owner.face>=-12;
    let hit=false,dmg=0,kx=0,ky=0;
    if(kind==='punch'){hit=front&&Math.abs(dx)<104&&Math.abs(dy)<72;dmg=1.3;kx=owner.face*42;ky=-8;}
    else if(kind==='kick'){hit=front&&Math.abs(dx)<116&&Math.abs(dy)<82;dmg=2.1;kx=owner.face*68;ky=20;}
    else if(kind==='tongue'){hit=front&&Math.abs(dx)<(owner.tongueRange||220)*1.28&&Math.abs(dy)<150;dmg=.9;kx=owner.face*25;mir.tongueT=.24;mir.tongueAimY=Math.max(-105,Math.min(105,dy*.72));}
    if(hit)setTimeout(()=>{if(!mir||mir.t<=0||!target||gameOver)return;if(target.guard)spawnImpact(target.x,target.y,'guard');else{damageHit(owner,target,dmg*(owner.damageMul||1),kx,ky);spawnImpact(target.x,target.y,'hit');}mir.t=0;},kind==='kick'?150:90);
  }

  function damageHit(attacker,target,dmg,kx,ky,bypassCounter=false){
    if(target&&target.type==='remiel'&&attacker&&attacker!==target&&!bypassCounter){
      if(target.remielCounterT>0){
        target.remielCounterT=0;target.specialT=.32;
        const counterDir=-Math.sign(target.x-attacker.x||1);
        damageHit(target,attacker,7.2*target.damageMul,counterDir*230,-75,true);
        const mir=remielMirages.find(m=>m.owner===target&&m.t>0);
        if(mir){
          // 分身側のミラージュカウンターは本体の50%ダメージ。
          damageHit(target,attacker,3.6*target.damageMul,counterDir*120,-38,true);
          mir.t=0;
        }
        spawnImpact(target.x,target.y,'guard');comboEl.textContent='ミラージュカウンター!';return;
      }
      if(target.remielParryT>0){target.remielParryT=0;target.specialT=.24;attacker.vx=-Math.sign(target.x-attacker.x||1)*255;attacker.vy=-55;attacker.stun=Math.max(attacker.stun||0,.34);spawnImpact(target.x,target.y,'guard');comboEl.textContent='アクアパリィ!';return;}
      if(target.guard&&target.guardStartT>.18){attacker.vx=-Math.sign(target.x-attacker.x||1)*220;attacker.stun=Math.max(attacker.stun||0,.24);spawnImpact(target.x,target.y,'guard');comboEl.textContent='ジャスト・アクアパリィ!';return;}
    }

    if(attacker&&attacker.type==='green'&&attacker.michaelBoostAttackT>0)dmg*=1.35;
    if(attacker && !attacker.isPlayer && target && target.isPlayer){
      dmg*=difficultyProfile().damage;
    }
    // ベリアルさん：下方向へ強く叩きつけられた攻撃では天井の糸が切れる。
    // 投げは update 側で throwState を検出して同様に切る。
    if(target && target.type==='crayfish' && ky>=240){
      target.belialThreadGrow=0;
      target.belialThreadReconnectT=.20;
    }
    // アスモデウスさんのクロー・カウンター：
    // 近距離打撃だけ無効化。飛び道具は普通に受ける。
    if(target && target.type==='crayfish' && target.crayfishCounterReady && attacker){
      const projectileLike =
        attacker._projectileHit===true ||
        attacker.specialType==='pressureBlade' ||
        attacker.specialType==='aquaTornado' ||
        attacker.specialType==='aquaStream' ||
        attacker.specialType==='aquaVortex';

      const closeEnough=Math.hypot(attacker.x-target.x,attacker.y-target.y)<135;

      if(!projectileLike && closeEnough){
        triggerCrayfishCounter(target,attacker);
        spawnImpact(target.x,target.y,'guard');
        playSfx('guard');
        return;
      }
    }

    if(gameOver) return;

    // ウリエルさんのカウンター構え：打撃を無効化して白オーラ拳で反撃。
    if(!bypassCounter && target && target.type==='orange' && target.counterReady){
      spawnImpact(target.x,target.y,'guard');
      triggerWhiteCounter(target,attacker);
      return;
    }

    // 防御力。ウリエルさんは約22%軽減。
    dmg /= (target.defense||1);

    // ガード直後の緩めの受付時間ならジャストガード。
    const justGuard = target.guard && target.guardStartT>0;
    target.hit(dmg,kx,ky);
    if(gameMode==='practice' && target===enemy) target.hp=999999;

    if(justGuard){
      attacker.stun=Math.max(attacker.stun,.42);
      attacker.attackT=Math.max(attacker.attackT,.42);
      attacker.vx += -attacker.face*55;
      spawnImpact(attacker.x,attacker.y,'guard');
      comboEl.textContent='JUST GUARD!';
      setTimeout(()=>{
        if(comboEl.textContent==='JUST GUARD!') comboEl.textContent='';
      },520);
    }
    if(attacker.isPlayer && !target.guard){
      comboHits++; comboTimer=1.15;
      comboEl.textContent = comboHits>1 ? `${comboHits} HIT!` : '';
    }
    updateHud();
    if(target.hp<=0) endGame(attacker.isPlayer);
  }

  function endGame(playerWon){
    if(gameMode==='practice' || gameMode==='leafMini' || gameMode==='guardMini') return;

    gameOver=true; running=true;
    playSfx('ko');

    // v6.42: 決着後に負けた側が平然と通常顔へ戻らないよう、
    // 被弾顔をそのまま長時間維持する。
    const defeated=playerWon ? enemy : player;
    if(defeated){
      defeated.hurtFace='both';
      defeated.hurtFaceT=999;
      defeated.stun=Math.max(defeated.stun,1.2);
      defeated.guard=false;
      defeated.attack=null;
      defeated.attackT=0;
      defeated.tongueT=0;
      defeated.specialT=0;
      defeated.specialType=null;
    }

    if(mixBattleMode){
      finishMixBattle(playerWon);
      comboEl.textContent=playerWon?'YOU WIN!':'YOU LOSE';
      return;
    }

    if(gameMode==='allbattle'){
      if(playerWon){
        allBattleWins++;
        if(allBattleIndex>=allBattleQueue.length-1){
          allBattleIndex=allBattleQueue.length;
          comboEl.textContent=`ALL CHARACTERS CLEAR!　${allBattleWins}勝`;
          restartButton.textContent='キャラ選択へ';
        }else{
          comboEl.textContent=`YOU WIN!　${allBattleIndex+1}/${allBattleQueue.length}`;
          restartButton.textContent='次の相手';
        }
      }else{
        comboEl.textContent=`YOU LOSE　${allBattleWins}勝で終了`;
        allBattleIndex=allBattleQueue.length;
        restartButton.textContent='キャラ選択へ';
      }
      restartButton.hidden=false;
      if(storyHud)storyHud.hidden=true;
      return;
    }

    if(gameMode==='story'){
      storyTransitionLocked=false;
      storyLastWon=!!playerWon;
      if(playerWon)storyWins++;else storyLosses++;

      if(!playerWon&&storyLosses>=4){
        storyFinished=true;
        comboEl.textContent=`GAME OVER　${storyWins}勝 ${storyLosses}敗`;
        restartButton.textContent='キャラ選択へ';
      }else if(playerWon&&storyFightIndex>=storyQueue.length-1){
        showStoryEnding();
        if(storyHud)storyHud.textContent=`STORY CLEAR　勝${storyWins} 敗${storyLosses}`;
        return;
      }else if(!playerWon){
        // 大会で負けたのに勝ち上がらない。同じ相手と再戦。
        comboEl.textContent=`YOU LOSE　残り猶予 ${3-storyLosses}`;
        restartButton.textContent='再戦';
      }else{
        const label=(storyFightIndex===2?'1日目終了':storyFightIndex===5?'2日目終了':storyFightIndex===7?'大会優勝':storyFightIndex===8?'乱入者撃破':'次の試合へ');
        comboEl.textContent=`YOU WIN!　${label}`;
        restartButton.textContent='次へ';
      }
      if(storyHud)storyHud.textContent=`STORY　勝${storyWins} 敗${storyLosses}/3`;
      restartButton.hidden=false;
      return;
    }

    comboEl.textContent = playerWon ? 'YOU WIN!' : 'YOU LOSE';
    restartButton.textContent='もう一度';
    restartButton.hidden=false;
    if(titleReturnButton) titleReturnButton.hidden=false;
  }

  function updateHud(){
    playerHpEl.style.width=Math.max(0,Math.min(100,player.hp))+'%';
    enemyHpEl.style.width=((gameMode==='practice'||gameMode==='leafMini')?100:Math.max(0,Math.min(100,enemy.hp)))+'%';
  }

  // Touch stick
  const zone=document.getElementById('stickZone'), base=document.getElementById('stickBase'), knob=document.getElementById('stickKnob');
  let stickId=null;
  function stickMove(t){
    const r=base.getBoundingClientRect(), cx=r.left+r.width/2, cy=r.top+r.height/2;
    let dx=t.clientX-cx,dy=t.clientY-cy;
    const max=r.width*.34, len=Math.hypot(dx,dy)||1, scale=Math.min(1,max/len);
    dx*=scale;dy*=scale;
    input.x=dx/max; input.y=dy/max;
    knob.style.transform=`translate(${dx}px,${dy}px)`;
    checkTouchDash();
  }
  zone.addEventListener('touchstart',e=>{
    const t=e.changedTouches[0];
    stickId=t.identifier;
    input.dashUsedThisTouch=false;
    stickMove(t);
    e.preventDefault();
  },{passive:false});
  zone.addEventListener('touchmove',e=>{for(const t of e.changedTouches)if(t.identifier===stickId)stickMove(t);e.preventDefault()},{passive:false});
  function clearStick(){
    if(player && input.currentDir){
      const forward=player.face>0?'right':'left';
      const forwardUp=player.face>0?'upRight':'upLeft';
      const forwardDown=player.face>0?'downRight':'downLeft';
      if(input.currentDir===forward || input.currentDir===forwardUp || input.currentDir===forwardDown){
        const now=performance.now();
        input.forwardTapTimes=(input.forwardTapTimes||[]).filter(t=>now-t<=800);
        input.forwardTapTimes.push(now);
      }
    }
    if(input.currentDir && !input.dashUsedThisTouch){
      input.lastReleasedDir=input.currentDir;
      input.lastReleasedTime=performance.now();
    }
    stickId=null;
    input.x=input.y=0;
    input.currentDir=null;
    input.dashUsedThisTouch=false;
    knob.style.transform='translate(0,0)';
  }
  zone.addEventListener('touchend',clearStick);zone.addEventListener('touchcancel',clearStick);

  document.querySelectorAll('.action').forEach(btn=>{
    const action=btn.dataset.action;
    const down=e=>{
      e.preventDefault();btn.classList.add('pressed');
      if(action==='guard'){
        if(player){
          if(player.type==='sariel'){
            const fwd=(player.face>0&&input.x>.35)||(player.face<0&&input.x<-.35);
            const back=(player.face>0&&input.x<-.35)||(player.face<0&&input.x>.35);
            if(fwd&&specialEvilEye(player)){btn.classList.remove('pressed');return;}
            if(back&&specialBloodMoon(player)){btn.classList.remove('pressed');return;}
          }
          if(player.type==='kokabiel'){
            const backHeld=(player.face>0&&input.x<-.35)||(player.face<0&&input.x>.35);
            if(backHeld&&specialGravityZone(player)){btn.classList.remove('pressed');return;}
          }
          if(player.type==='remiel'){
            let used=false;
            if(input.y<-.35) used=remielMakeMirage(player,'up');
            else if(input.y>.35) used=remielMakeMirage(player,'down');
            else if((player.face>0&&input.x<-.35)||(player.face<0&&input.x>.35)) used=specialMirageCounter(player);
            else if((player.face>0&&input.x>.35)||(player.face<0&&input.x<-.35)) used=specialAquaParry(player,false);
            if(used){btn.classList.remove('pressed');return;}
          }
          // ルシファー：後ろ＋ガードは通常ガードより優先してアイスウォール。
          const luciferBackHeld = player.type==='black' &&
            ((player.face>0 && input.x<-.35) || (player.face<0 && input.x>.35));
          if(luciferBackHeld && !player.throwState){
            player.guard=false;
            player.attackT=0; player.attack=null;
            if(specialIceWall(player)){
              btn.classList.remove('pressed');
              return;
            }
          }

          // MIX簡易コマンド：ガード入力を共通タイマーで記録。
          const simpleNow=performance.now();
          input.simpleGuardTapTimes=(input.simpleGuardTapTimes||[]).filter(t=>simpleNow-t<=650);
          input.simpleGuardTapTimes.push(simpleNow);
          input.lastSimpleGuardTapTime=simpleNow;

          // ミカエル：下→後ろ＋ガードでレッドオーラ。
          if(player.type==='green' && !player.throwState){
            const back=player.face>0?'left':'right';
            if(hasCommand(['down',back],720)){
              input.simpleGuardTapTimes=[];
              if(specialMichaelRedAura(player)){btn.classList.remove('pressed');return;}
            }
          }

          // ラファエル：上＋ガードで約5秒のエアホバー。
          if(player.type==='yellow' && !player.throwState && input.y<-.35){
            input.simpleGuardTapTimes=[];
            if(specialRaphaelBubbleMove(player)){
              btn.classList.remove('pressed');
              return;
            }
          }

          // ラファエル：ガード×2でヒーリングバブル。
          if(player.type==='yellow' && !player.throwState && input.simpleGuardTapTimes.length>=2){
            input.simpleGuardTapTimes=[];
            input.lastSimpleGuardTapTime=0;
            if(specialHealingBubble(player)){
              btn.classList.remove('pressed');
              return;
            }
          }

          // ウリエル：後ろ＋ガードでホワイトカウンター。
          if(player.type==='orange' && !player.throwState){
            const back=player.face>0?'left':'right';
            if(input.keys[back]){
              input.simpleGuardTapTimes=[];
              input.lastSimpleGuardTapTime=0;
              if(specialWhiteCounter(player)){
                btn.classList.remove('pressed');
                return;
              }
            }
          }

          // ベルゼブブさん：強力な毒水は2方向コマンド（下→後ろ＋ガード）。
          if(player.type==='beelzebub' && !player.throwState && hasCommand(['down',player.face>0?'left':'right'],900)){
            if(specialVenomWater(player)){
              btn.classList.remove('pressed');
              return;
            }
          }

          // アスモデウスさん：下＋ガード×2で近距離カウンター構え
          if(player.type==='crayfish' && !player.throwState){
            const now=performance.now();
            const downNow=input.y>.35;
            input._crayGuardTimes=(input._crayGuardTimes||[]).filter(t=>now-t<760);

            if(downNow){
              input._crayGuardTimes.push(now);
              if(input._crayGuardTimes.length>=2){
                input._crayGuardTimes=[];
                if(specialCrayfishCounter(player)){
                  btn.classList.remove('pressed');
                  return;
                }
              }
            }
          }

          // ラファエルさん：敵が右なら反時計回り1回転＋ガードで高速バブル移動
          if(false && player.type==='yellow' && !player.throwState && hasFacingCircle(player,false,1150)){
            if(specialRaphaelBubbleMove(player)){
              btn.classList.remove('pressed');
              return;
            }
          }

          // ラファエルさん：後ろ＋ガード×2で徐々に回復
          if(false && player.type==='yellow' && !player.throwState){
            const now=performance.now();
            const backNow=(player.face>0 && input.x<-.35)||(player.face<0 && input.x>.35);
            input._raphaelGuardTimes=(input._raphaelGuardTimes||[]).filter(t=>now-t<720);
            if(backNow){
              input._raphaelGuardTimes.push(now);
              if(input._raphaelGuardTimes.length>=2){
                input._raphaelGuardTimes=[];
                if(specialHealingBubble(player)){btn.classList.remove('pressed');return;}
              }
            }
          }

          // ウリエルさん：1回転＋ガードでカウンター構え
          if(false && player.type==='orange' && !player.throwState && hasFullCircle(1000)){
            if(specialWhiteCounter(player)){btn.classList.remove('pressed');return;}
          }

          // ウリエルさん：前＋ガードでガーディアンタックル発動。
          if(player.type==='orange' && !player.throwState){
            const forward=player.face>0?'right':'left';
            if(input.keys[forward]){
              clearCommand();
              if(specialUrielTackle(player)){
                btn.classList.remove('pressed');
                return;
              }
            }
          }

          // リリスさん：後ろを入れたまま、または直前に後ろ入力してガード×2。
          if(player.type==='purple' && !player.throwState){
            const now=performance.now();

            // 現在のスティック方向も直接見る。
            const backNow =
              (player.face>0 && input.x<-.35) ||
              (player.face<0 && input.x>.35);

            const recentlyBack = now-(input.lastBackInputTime||0) <= 1200;

            if(backNow || recentlyBack){
              if(now-(input.purpleGuardLastTime||0) <= 700){
                input.purpleGuardCount=(input.purpleGuardCount||0)+1;
              }else{
                input.purpleGuardCount=1;
              }
              input.purpleGuardLastTime=now;

              if(input.purpleGuardCount>=2){
                input.purpleGuardCount=0;
                input.purpleGuardLastTime=0;
                input.lastBackInputTime=0;
                clearCommand();

                player.guard=false;
                player.attackT=0;

                if(specialCatfishCharge(player)){
                  btn.classList.remove('pressed');
                  return;
                }
              }
            }else{
              input.purpleGuardCount=0;
            }
          }

          // ウリエルさん：通常ガード長押しの計測開始。
          if(player.type==='orange' && !player.throwState && !player.urielGuardHoldStart){
            player.urielGuardHoldStart=performance.now();
          }

          // 舌投げで回転中は通常ガードではなく「壁受け身入力」。
          // 約0.24秒だけ受け身受付を残す。
          if(player.throwState){
            player.wallTechT=.24;
            return;
          }

          if(player.stun<=0){
            const now=performance.now();
            player.guardTapTimes=player.guardTapTimes.filter(t=>now-t<650);
            player.guardTapTimes.push(now);

            // ガード開始直後 約0.28秒はジャストガード受付。
            if(player.type==='satanael'&&water2HeldDir(player,'down')){specialDarkPressure(player);}else player.guard=true;
            player.guardStartT=.28;
            if(guardMiniActive) guardMiniGuardTapTime=performance.now();

            // 650ms以内に3回で水押し波。ダメージは0、吹き飛ばしのみ。
            if(player.guardTapTimes.length>=3){
              player.guardTapTimes=[];
              guardWave(player);
            }
          }
        }
      }
      else if(action==='punch' && player && player.type==='black'){
        const backHeld=(player.face>0 && input.x<-.35) || (player.face<0 && input.x>.35);
        if(backHeld && !player.throwState){
          player.attackT=0; player.attack=null;
          if(startAbyssCharge(player)){btn.dataset.charging='1';return;}
        }
        attack(player,action);
      }
      else if(action==='kick'&&player&&player.type==='jihal'){
        const backHeld=(player.face>0&&input.x<-.35)||(player.face<0&&input.x>.35);
        if(backHeld&&startThunderCharge(player)){btn.dataset.jihalCharge='1';return;}
        attack(player,action);
      }
      else if(player){if(action==='tongue')player.wallTongueHeld=true;attack(player,action);}
    };
    const up=e=>{
      e.preventDefault(); btn.classList.remove('pressed');
      if(action==='tongue'&&player){player.wallTongueHeld=false;if(player.wallClingT>0){player.wallClingT=0;player.wallClingCooldown=.30;player.wallClingSide=0;player.attackT=0;player.attack=null;}}
      if(action==='kick'&&player&&btn.dataset.jihalCharge==='1'){
        btn.dataset.jihalCharge='';releaseThunderCharge(player);
      }
      if(action==='punch' && player && btn.dataset.charging==='1'){
        btn.dataset.charging=''; releaseAbyssCharge(player);
      }
      if(action==='guard'&&player){
        player.guard=false;
        if(player.type==='orange' && player.urielGuardHoldStart){
          const held=(performance.now()-player.urielGuardHoldStart)/1000;
          player.urielGuardHoldStart=0;
          // 誤タップでは発動しない。0.55秒以上から、押していた長さ程度を維持（最大4秒）。
          if(held>=.55 && !player.counterReady && player.specialType!=='whiteCounter'){
            player.urielAuraT=Math.min(4.0,held);
            comboEl.textContent='ホワイトオーラ!';
            setTimeout(()=>{if(comboEl.textContent==='ホワイトオーラ!')comboEl.textContent='';},600);
          }
        }
      }
    };
    btn.addEventListener('touchstart',down,{passive:false});btn.addEventListener('touchend',up,{passive:false});btn.addEventListener('touchcancel',up,{passive:false});
    btn.addEventListener('mousedown',down);btn.addEventListener('mouseup',up);btn.addEventListener('mouseleave',up);
  });

  // Keyboard support for desktop testing
  const keys={};
  const keyDashTimes={};
  addEventListener('keydown',e=>{
    if(e.key==='Escape'&&screens.game.classList.contains('active')){
      e.preventDefault();
      if(gamePaused)closePause();else openPause();
      return;
    }
    if(gamePaused){e.preventDefault();return;}
    const key=e.key.toLowerCase();
    keys[key]=true;
    if(e.repeat)return;

    if(['w','a','s','d'].includes(key)){
      const map={w:'up',a:'left',s:'down',d:'right'};
      pushCommandDir(map[key]);
      const now=performance.now();
      if(keyDashTimes[key] && now-keyDashTimes[key]<=450){
        doDash(map[key]);
        keyDashTimes[key]=0;
      }else{
        keyDashTimes[key]=now;
      }
    }
    if(e.key==='j')attack(player,'punch');
    if(e.key==='k'&&player){
      const back=player.type==='jihal'&&((player.face>0&&keys['a'])||(player.face<0&&keys['d']));
      if(back)startThunderCharge(player);else attack(player,'kick');
    }
    if(e.key==='l')attack(player,'tongue');
    if(e.key==='i'&&player){
      let remielUsed=false;
      if(player.type==='sariel'){
        const sfwd=(player.face>0&&keys['d'])||(player.face<0&&keys['a']);
        const sback=(player.face>0&&keys['a'])||(player.face<0&&keys['d']);
        if(sfwd){specialEvilEye(player);return;}
        if(sback){specialBloodMoon(player);return;}
      }
      const kokabielBack=player.type==='kokabiel'&&((player.face>0&&keys['a'])||(player.face<0&&keys['d']));
      if(kokabielBack){specialGravityZone(player);return;}
      if(player.type==='remiel'){
        if(keys['w']) remielUsed=remielMakeMirage(player,'up');
        else if(keys['s']) remielUsed=remielMakeMirage(player,'down');
        else if((player.face>0&&keys['a'])||(player.face<0&&keys['d'])) remielUsed=specialMirageCounter(player);
        else if((player.face>0&&keys['d'])||(player.face<0&&keys['a'])) remielUsed=specialAquaParry(player,false);
      }
      const backHeld=player.type==='black'&&((player.face>0&&keys['a'])||(player.face<0&&keys['d']));
      if(remielUsed){player.guard=false;}
      else if(backHeld){ specialIceWall(player); }
      else{
        if(player.type==='orange'&&!player.urielGuardHoldStart)player.urielGuardHoldStart=performance.now();
        if(player.type==='satanael'&&water2HeldDir(player,'down')){specialDarkPressure(player);}else player.guard=true;
        player.guardStartT=.28;
        if(guardMiniActive) guardMiniGuardTapTime=performance.now();
      }
    }
  });
  addEventListener('keyup',e=>{
    if(e.key==='k'&&player&&player.type==='jihal'&&player.jihalCharging)releaseThunderCharge(player);
    const key=e.key.toLowerCase(); keys[key]=false;
    if(e.key==='i'&&player && player.specialType!=='iceWall')player.guard=false;
  });

  function incomingReflectableThreat(f){
    if(!f) return false;
    const threats=[];
    water2Shots.forEach(q=>{ if(q.owner && q.owner!==f && !q.hit) threats.push({x:q.x,y:q.y,vx:q.vx||0,vy:q.vy||0,r:q.r||14}); });
    pressureBlades.forEach(q=>{ if(q.owner && q.owner!==f && !q.hit) threats.push({x:q.x,y:q.y,vx:q.vx||0,vy:q.vy||0,r:30}); });
    return threats.some(q=>{
      const dx=f.x-q.x, dy=f.y-q.y;
      const d=Math.hypot(dx,dy);
      if(d>250 || Math.abs(dy)>95) return false;
      // 弾の速度ベクトルがキャラ方向を向いているか。
      return dx*q.vx + dy*q.vy > 0;
    });
  }

  function enemyAI(dt){
    const diff=difficultyProfile();
    if(gameMode==='practice' || gameMode==='raceMini' || gameMode==='basketMini') return;
    if(gameOver)return;

    // CPUも舌で引かれている時は、たまに投げ抜けを狙う。
    if(player && player.tonguePullTarget===enemy && player.tonguePullTimer>0){
      if(Math.random()<dt*3.2*diff.tongue) attack(enemy,'tongue');
      return;
    }

    if(enemy.stun>0)return;
    const dx=player.x-enemy.x,dy=player.y-enemy.y,dist=Math.hypot(dx,dy);

    // 飛び道具へのガードは難易度別の成功率。
    // 何もしていない時だけ反応しやすく、移動中・攻撃中・必殺技中は基本的に被弾する。
    enemy.cpuProjectileGuardT=Math.max(0,(enemy.cpuProjectileGuardT||0)-dt);
    enemy.cpuProjectileDecisionCd=Math.max(0,(enemy.cpuProjectileDecisionCd||0)-dt);
    const projectileThreat=incomingReflectableThreat(enemy);

    if(enemy.cpuProjectileGuardT>0){
      enemy.guard=true;
      enemy.guardStartT=Math.max(enemy.guardStartT||0,.18);
      enemy.vx*=.84;enemy.vy*=.84;
      return;
    }

    if(projectileThreat && enemy.cpuProjectileDecisionCd<=0){
      const moving=Math.hypot(enemy.vx||0,enemy.vy||0)>42;
      const busy=(enemy.attackT||0)>0 || (enemy.specialT||0)>0 || moving;
      enemy.cpuProjectileDecisionCd=.62;

      if(!busy && Math.random()<diff.projectileGuard){
        enemy.cpuProjectileGuardT=.34;
        enemy.guard=true;
        enemy.guardStartT=.28;
        enemy.vx*=.82;enemy.vy*=.82;
        return;
      }
      // 失敗した時はその弾に対してすぐ再抽選しない。
      // 通常AIを続けるので、移動や攻撃を始めればそのまま被弾しうる。
    }
    enemy.guard=false;

    if(enemy.attackT<=0){
      // ラファエルCPU：接近戦を避け、エアカッター／エアブレード中心の距離戦。
      if(enemy.type==='yellow'){
        const idealMin=285, idealMax=430;
        const away=-Math.sign(dx||enemy.face||1);

        if(dist<idealMin){
          // 近づかれたらまず距離を取る。かなり近い時はエアホバーも使う。
          enemy.vx += away*enemy.speed*1.75*diff.move*dt;
          enemy.vy += -Math.sign(dy||1)*enemy.speed*.42*diff.move*dt;
          if(dist<155 && enemy.specialT<=0 && Math.random()<dt*.42){
            specialRaphaelBubbleMove(enemy);return;
          }
        }else if(dist>idealMax){
          // 遠すぎる時だけ少し寄る。密着するまで追いかけない。
          enemy.vx += Math.sign(dx)*enemy.speed*.34*diff.move*dt;
          enemy.vy += Math.sign(dy)*enemy.speed*.18*diff.move*dt;
        }else{
          // 射撃距離では横移動を弱め、上下だけ軽く合わせる。
          enemy.vx*=.93;
          enemy.vy += Math.sign(dy)*enemy.speed*.15*diff.move*dt;
        }

        if(enemy.specialT<=0){
          const r=Math.random();
          if(r<dt*.34*diff.special){
            specialPressureBlade(enemy,0,'punch');return;
          }
          if(r<dt*.56*diff.special){
            specialPressureBlade(enemy,18,'kick');return;
          }
          if(r<dt*.72*diff.special){
            const fromAbove=(player.y>enemy.y);
            specialAirBlade(enemy,fromAbove?'down':'up');return;
          }
          if(enemy.hp<45 && r<dt*.78*diff.special){specialHealingBubble(enemy);return;}
        }
        // ラファエルは通常の接近・舌・近接AIへ流さない。
        return;
      }

      if(enemy.type==='beelzebub' && enemy.specialT<=0 && enemy.bossSpecialCooldown<=0){
        const roll=Math.random();
        if(!mixBattleMode){
          if(roll<dt*.10){ specialVenomWater(enemy); return; }
          if(roll<dt*.26){ specialAbyssShock(enemy,dy<0?'upper':'lower'); return; }
        }
        if(dist>150 && roll<dt*.46){ specialWater2Shot(enemy,{name:'ベノムショット',attack:'punch',color:'venom',style:'venomGloss',speed:285,angle:-24,curve:285,damage:5.0,r:29,charge:.46,poisonDuration:2.2,maxReflect:4}); return; }
      }
      if(enemy.type==='satanael'&&enemy.specialT<=0){const r=Math.random();if(dist>190&&r<dt*.16){specialDisasterFlare(enemy);return;}if(dist>220&&r<dt*.28){specialDarkRay(enemy);return;}if(r<dt*.38){specialDarkPressure(enemy);return;}if(r<dt*.50){specialInfernoWave(enemy);return;}}
      if(enemy.type==='flauros'&&enemy.specialT<=0){const r=Math.random();if(dist>180&&r<dt*.20){specialHellFlame(enemy);return;}if(dist>170&&r<dt*.38){specialFlameClaw(enemy);return;}if(dist<250&&r<dt*.52){specialLeopardRush(enemy);return;}if(dist>130&&r<dt*.59){specialInfernoClaw(enemy);return;}}
      if(enemy.type==='sariel'&&enemy.specialT<=0){const r=Math.random();if(dist>170&&r<dt*.18){specialLunaSlash(enemy,Math.random()<.5?'up':'down');return;}if(dist<160&&r<dt*.12){specialMoonSaltKick(enemy);return;}if(dist<360&&r<dt*.07){specialEvilEye(enemy);return;}if(dist>180&&r<dt*.035){specialBloodMoon(enemy);return;}}
      if((enemy.type==='kokabiel'||enemy.type==='awakenedKokabiel')&&enemy.specialT<=0){const r=Math.random();if(dist>180&&r<dt*.24){specialGravityBall(enemy);return;}if(dist<260&&r<dt*.10){specialGravityZone(enemy);return;}if(dist>130&&r<dt*.08){specialMeteorRain(enemy);return;}}
      if(enemy.type==='jihal'&&enemy.specialT<=0&&!enemy.jihalCharging){const r=Math.random();if(dist>210&&r<dt*.28){specialJihalBolt(enemy);return;}if(dist<175&&r<dt*.18){specialLightningDash(enemy);return;}if(dist<110&&r<dt*.10){specialSparkBurst(enemy);return;}if(dist>250&&r<dt*.05){startThunderCharge(enemy);setTimeout(()=>{if(enemy&&enemy.jihalCharging)releaseThunderCharge(enemy);},650);return;}}
      if(enemy.type==='remiel' && enemy.specialT<=0){const roll=Math.random();if(!remielMirages.some(m=>m.owner===enemy)&&roll<dt*.10){remielMakeMirage(enemy,Math.random()<.5?'up':'down');return;}if(dist>190&&roll<dt*.28){specialRemielFrostShot(enemy);return;}if(dist<150&&roll<dt*.18){specialMirageKick(enemy);return;}if(dist<115&&roll<dt*.10){specialAquaParry(enemy,false);return;}}
      if(enemy.type==='seraphiel' && enemy.specialT<=0){
        const roll=Math.random();
        if(dist>220 && roll<dt*.22){specialWater2Shot(enemy,{name:'セラフィックショット',attack:'punch',color:'seraphic',style:'seraphicShot',speed:300,damage:5.8,r:25,charge:.36,maxReflect:5,spiralAmp:28,spiralFreq:11});return;}
        if(dist>180 && roll<dt*.10){specialSeraphicRay(enemy);return;}
        if(dist<135 && roll<dt*.24){specialSeraphicKick(enemy);return;}
        if(dist<110 && roll<dt*.12){specialSeraphicUpper(enemy);return;}
      }
      if(enemy.type==='samael' && enemy.specialT<=0){
        const roll=Math.random();
        if(enemy.hp<enemy.maxHp*.55 && roll<dt*.10){ specialDeadlyAqua(enemy); return; }
        if(roll<dt*.40){
          const sides=['up','down','forward','back'];
          specialSamaelGate(enemy,sides[Math.floor(Math.random()*sides.length)]);
          return;
        }
        if(dist>120 && roll<dt*.62){ specialSamaelTongueShot(enemy); return; }
      }
      if(enemy.type==='kawazu' && enemy.specialT<=0){
        const roll=Math.random();
        if(dist<190 && roll<dt*.16){ specialKawazuTripleUpper(enemy); return; }
        if(dist>135 && roll<dt*.30){ specialKawazuPressureRush(enemy); return; }
        if(dist<250 && roll<dt*.46){ specialKawazuMirageKick(enemy); return; }
        if(dist>120 && roll<dt*.62){ specialKawazuSpinCutter(enemy); return; }
      }

      if(dist>105){ enemy.vx += Math.sign(dx)*enemy.speed*.9*diff.move*dt; enemy.vy += Math.sign(dy)*enemy.speed*.55*diff.move*dt; }
      else if(Math.random()<dt*.8*diff.attack) attack(enemy,Math.random()<.62?'punch':'kick');
      if(enemy.tonguePullTarget && enemy.tonguePullTimer>0 && Math.random()<dt*2.2*diff.attack){
        attack(enemy,'tongue');
      } else if(dist>120&&dist<enemy.tongueRange&&Math.random()<dt*.28*diff.tongue) {
        attack(enemy,'tongue');
      }
      if(dist<90 && Math.random()<dt*.25*diff.guard) enemy.guard=true;
    }
  }

  function guardWave(f){
    if(!f || gameOver || f.waveCooldown>0) return;

    f.waveCooldown=1.05;
    f.guard=false;
    f.attack='wave';
    f.attackT=.48;

    const dir=f.face;
    guardWaves.push({
      owner:f,
      x:f.x+dir*34,
      y:f.y+18,
      dir,
      r:18,
      t:.48,
      life:.48,
      hit:false
    });

    // 水を両手で押した反動
    f.vx += -dir*42;
  }

  function spawnImpact(x,y,type){
    const n=type==='guard'?8:16;
    for(let i=0;i<n;i++){
      particles.push({
        x,y,
        vx:(Math.random()-.5)*(type==='guard'?160:240),
        vy:(Math.random()-.5)*(type==='guard'?160:240),
        t:type==='guard'?.32:.42,
        r:2+Math.random()*(type==='guard'?4:6),
        type
      });
    }

    // 当たった瞬間に広がるリングで、ヒットを見やすくする
    hitRings.push({
      x,y,
      r:type==='guard'?12:10,
      max:type==='guard'?42:58,
      t:type==='guard'?.28:.34,
      life:type==='guard'?.28:.34,
      type
    });
  }

  function ensureFighterVisible(f,fallbackX,fallbackY){
    if(!f) return;

    if(!Number.isFinite(f.x) || !Number.isFinite(f.y) ||
       !Number.isFinite(f.vx) || !Number.isFinite(f.vy)){
      f.x=fallbackX;
      f.y=fallbackY;
      f.vx=0;
      f.vy=0;
      f.spinAngle=0;
      f.throwState=null;
    }

    const margin=Math.max(42,(Number.isFinite(f.radius)?f.radius:35)+8);
    f.x=Math.max(margin,Math.min(innerWidth-margin,f.x));
    f.y=Math.max(58,Math.min(innerHeight-58,f.y));
  }

  function separateBattleFighters(a,b){
    // 表示・描画処理とは完全に独立した座標補正だけ。
    if(!a || !b) return;
    if(!Number.isFinite(a.x) || !Number.isFinite(a.y) ||
       !Number.isFinite(b.x) || !Number.isFinite(b.y)) return;

    // 舌投げなど、意図的に重なる演出中は何もしない。
    if(a.throwState || b.throwState) return;

    const ar=Number.isFinite(a.radius) ? a.radius : 35;
    const br=Number.isFinite(b.radius) ? b.radius : 35;

    const dx=b.x-a.x;
    const dy=b.y-a.y;

    // 上下差が大きい場合は水中ですれ違える。
    const verticalLimit=(ar+br)*0.62;
    if(Math.abs(dy)>verticalLimit) return;

    // 横方向の最低距離。見た目より少し柔らかめ。
    const minX=(ar+br)*0.76;
    const absDx=Math.abs(dx);
    if(absDx>=minX) return;

    // 完全に同じXなら、PLAYERを左・RIVALを右に分ける。
    const dir=absDx<0.001 ? 1 : Math.sign(dx);
    const overlap=minX-absDx;

    // 一気に弾かず、1フレームで少しずつ押し分ける。
    const push=Math.min(overlap*.52,8);

    a.x-=dir*push;
    b.x+=dir*push;

    // 互いに突っ込み続けて再び重なるのを少し抑える。
    if(Number.isFinite(a.vx) && Number.isFinite(b.vx)){
      const approaching=(b.vx-a.vx)*dir<0;
      if(approaching){
        a.vx*=.72;
        b.vx*=.72;
      }
    }

    // 画面外へ押し出さない。
    const margin=42;
    a.x=Math.max(margin,Math.min(innerWidth-margin,a.x));
    b.x=Math.max(margin,Math.min(innerWidth-margin,b.x));
  }

  function rotatePoint(x,y,a){
    const ca=Math.cos(a), sa=Math.sin(a);
    return {x:x*ca-y*sa,y:x*sa+y*ca};
  }

  function burningCycloneAngle(f){
    if(!f || f.specialType!=='burningCyclone') return 0;
    const elapsed=(performance.now()-(f.cycloneStartTime||performance.now()))/1000;
    // 右向きは時計回り、左向きは鏡映し
    return elapsed*22*(f.face>0?1:-1);
  }

  function updateNewSpecialMoves(f,dt){
    if(!f) return;

    if(f.type==='flauros'){
      const o=f.isPlayer?enemy:player;
      if(f.specialType==='leopardRush'&&f.specialT>0){
        f.vx=(f.flaurosRushDir||f.face)*760;
        if(o&&!f.flaurosRushHit&&Math.abs(o.x-f.x)<76&&Math.abs(o.y-f.y)<72){f.flaurosRushHit=true;damageHit(f,o,8.0*f.damageMul,300*(f.flaurosRushDir||f.face),-55);spawnImpact(o.x,o.y,'hit');}
      }
      if(f.specialType==='infernoClaw'&&f.specialT>0){
        const elapsed=(performance.now()-(f.infernoStart||performance.now()))/1000;
        const wallT=.25, diveT=.48;
        f.vx=0;f.vy=0;
        if(elapsed<wallT){
          // 現在地→後ろ上の壁。少しイーズアウトして「壁へ飛びつく」動き。
          let t=Math.max(0,Math.min(1,elapsed/wallT));t=1-Math.pow(1-t,2);
          f.x=f.infernoFromX+(f.infernoWallX-f.infernoFromX)*t;
          f.y=f.infernoFromY+(f.infernoWallY-f.infernoFromY)*t;
        }else{
          if(f.infernoPhase===0)f.infernoPhase=1;
          // 壁から反対側の下端まで、軌道を曲げず対角線に一直線。
          const t=Math.max(0,Math.min(1,(elapsed-wallT)/diveT));
          f.x=f.infernoWallX+(f.infernoEndX-f.infernoWallX)*t;
          f.y=f.infernoWallY+(f.infernoEndY-f.infernoWallY)*t;
          const dir=Math.sign(f.infernoEndX-f.infernoWallX)||f.face;
          if(o&&!f.infernoHit&&Math.abs(o.x-f.x)<76&&Math.abs(o.y-f.y)<70){
            f.infernoHit=true;const guarded=o.guard;spawnImpact(o.x,o.y,guarded?'guard':'hit');
            if(guarded){damageHit(f,o,1.0,55*dir,10);}else{
              const bx=o.x,by=o.y;for(let i=0;i<5;i++)flaurosClaws.push({owner:f,target:o,x:bx,y:by,t:.10+i*.065,life:.30,index:i,hit:false});
            }
          }
        }
      }
    }

    if(f.specialType==='burningCyclone'){
      const other=f.isPlayer?enemy:player;
      const ang=burningCycloneAngle(f);

      // JUMP版：横へ流れすぎないよう、最低速度も加速も小さくする。
      if(Math.abs(f.vx)<150) f.vx+=f.face*95*dt;

      if(other){
        const feet=[
          {localX:-17,localY:52,key:'cycloneLastHitA'},
          {localX: 17,localY:52,key:'cycloneLastHitB'}
        ];
        const now=performance.now();

        feet.forEach(foot=>{
          const p=rotatePoint(foot.localX,foot.localY,ang);
          const wx=f.x+p.x, wy=f.y+p.y;
          if(
            Math.hypot(other.x-wx,other.y-wy)<other.radius+25 &&
            now-(f[foot.key]||-9999)>68
          ){
            f[foot.key]=now;
            // 超多段用の小ダメージ
            damageHit(f,other,.72*f.damageMul,18*f.face,-2);
          }
        });
      }
    }

    if(f.specialType==='lilithBackSpin'){
      const other=f.isPlayer?enemy:player;
      const elapsed=(performance.now()-(f.lilithSpinStartTime||performance.now()))/1000;
      const ang=elapsed*18*(f.face>0?-1:1);
      if(other){
        const now=performance.now();
        [{x:-58,y:46,key:'lilithSpinLastHitA'},{x:58,y:46,key:'lilithSpinLastHitB'}].forEach(foot=>{
          const p=rotatePoint(foot.x,foot.y,ang);
          if(Math.hypot(other.x-(f.x+p.x),other.y-(f.y+p.y))<other.radius+22 && now-(f[foot.key]||-9999)>115){
            f[foot.key]=now;
            damageHit(f,other,.82*f.damageMul,-38*f.face,-5);
          }
        });
      }
    }

    if(f.specialType==='raphaelBubbleMove'){
      f.raphaelHoverT=Math.max(0,(f.raphaelHoverT||0)-dt);

      // 5秒間、重力に負けず空中を自由移動。
      // プレイヤーはスティック/方向入力、CPUは相手方向へ緩く追従。
      let hx=0, hy=0;
      if(f.isPlayer){
        hx=input.x||0;
        hy=input.y||0;
      }else{
        const other=f===player?enemy:player;
        if(other){
          hx=Math.max(-1,Math.min(1,(other.x-f.x)/150));
          hy=Math.max(-1,Math.min(1,(other.y-f.y)/150));
        }
      }

      const hoverSpeed=245;
      f.vx=hx*hoverSpeed;
      f.vy=hy*hoverSpeed;

      // 無入力ならその場に浮く。
      if(Math.abs(hx)<.12) f.vx=0;
      if(Math.abs(hy)<.12) f.vy=0;

      f.x=Math.max(34,Math.min(innerWidth-34,f.x));
      f.y=Math.max(72,Math.min(jumpFloorY()-34,f.y));

      if(f.raphaelHoverT<=0){
        f.specialT=0;
        f.specialType=null;
        f.vx*=.35;
        f.vy=0;
      }
    }
  }

  function isPoisonImmune(f){
    return !!f && (f.type==='beelzebub' || f.type==='samael');
  }

  function applyPoison(target,owner,duration=2.5){
    if(!target || isPoisonImmune(target)) return false;
    target.poisonT=Math.max(target.poisonT||0,duration);
    target.poisonTick=Math.min(target.poisonTick||0,.35);
    target.poisonOwner=owner||null;
    return true;
  }

  function projectileImmuneByBubble(f){
    return !!(f && f.specialType==='raphaelBubbleMove' && f.specialT>0);
  }

function drawBackground(dt){
    const w=innerWidth,h=innerHeight,t=performance.now()/1000;

    // STORYのアザゼル／ベリアル戦専用：大会会場ではなく、外の蓮池。
    if(stageTheme===4){
      const sky=ctx.createLinearGradient(0,0,0,h);
      sky.addColorStop(0,'#bfeaff');sky.addColorStop(.48,'#eaf8ff');sky.addColorStop(1,'#91d7b0');
      ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);

      // 遠景の雲
      ctx.save();ctx.globalAlpha=.72;ctx.fillStyle='#ffffff';
      for(let i=0;i<5;i++){
        const x=((i*173+t*7)%(w+180))-90, y=80+(i%3)*58;
        ctx.beginPath();ctx.ellipse(x,y,48,18,0,0,Math.PI*2);ctx.ellipse(x+36,y+4,38,15,0,0,Math.PI*2);ctx.ellipse(x-32,y+6,31,13,0,0,Math.PI*2);ctx.fill();
      }
      ctx.restore();

      // 遠くの葦と池の水平線
      const waterY=h*.48;
      const wg=ctx.createLinearGradient(0,waterY,0,h);
      wg.addColorStop(0,'#71cbd0');wg.addColorStop(1,'#2e9e91');
      ctx.fillStyle=wg;ctx.fillRect(0,waterY,w,h-waterY);
      ctx.fillStyle='rgba(63,143,73,.75)';
      for(let x=8;x<w;x+=18){
        const rh=24+((x*7)%43);
        ctx.fillRect(x,waterY-rh,3,rh+4);
        ctx.beginPath();ctx.ellipse(x+7,waterY-rh*.72,13,4,-.55,0,Math.PI*2);ctx.fill();
      }

      // 遠景の蓮葉・花。観客席やレフリーは置かない。
      for(let i=0;i<12;i++){
        const x=(i*97+43)%w, y=waterY+42+(i%5)*45;
        ctx.save();ctx.translate(x,y);
        ctx.fillStyle=i%3?'#3aa84e':'#4cb75c';
        ctx.beginPath();ctx.ellipse(0,0,38+(i%4)*6,12+(i%3)*2,0,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle='rgba(31,112,57,.65)';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(30,0);ctx.stroke();
        if(i===2||i===8){
          ctx.fillStyle='#f6b6d4';
          for(let a=0;a<Math.PI*2;a+=Math.PI/4){ctx.beginPath();ctx.ellipse(Math.cos(a)*8,-10+Math.sin(a)*5,8,4,a,0,Math.PI*2);ctx.fill();}
          ctx.fillStyle='#f4d55c';ctx.beginPath();ctx.arc(0,-10,4,0,Math.PI*2);ctx.fill();
        }
        ctx.restore();
      }

      // 戦闘用の大きな自然の蓮葉
      const floor=jumpFloorY();
      ctx.save();ctx.translate(w*.5,floor+45);
      ctx.fillStyle='rgba(24,113,65,.35)';ctx.beginPath();ctx.ellipse(5,14,w*.46,58,0,0,Math.PI*2);ctx.fill();
      const lg=ctx.createRadialGradient(-w*.10,-20,8,0,0,w*.43);
      lg.addColorStop(0,'#76d45d');lg.addColorStop(.55,'#43b54d');lg.addColorStop(1,'#21883e');
      ctx.fillStyle=lg;ctx.strokeStyle='#176f38';ctx.lineWidth=4;
      ctx.beginPath();ctx.ellipse(0,0,w*.43,54,0,0,Math.PI*2);ctx.fill();ctx.stroke();
      ctx.strokeStyle='rgba(29,119,48,.68)';ctx.lineWidth=1.6;
      for(let a=-2.8;a<=2.8;a+=.42){ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(a)*w*.36,Math.sin(a)*42);ctx.stroke();}
      ctx.fillStyle='#3997a1';ctx.beginPath();ctx.moveTo(0,-2);ctx.lineTo(28,-40);ctx.lineTo(8,-6);ctx.closePath();ctx.fill();
      ctx.restore();

      // 壁張り付き位置だけは自然物っぽい黄色い蓮の実で示す。
      const anchorYs=[h*.31,h*.43,h*.55,h*.67];
      anchorYs.forEach(ay=>[-1,1].forEach(side=>{
        const ax=side<0?5:w-5;
        ctx.fillStyle='#d9b947';ctx.beginPath();ctx.arc(ax,ay,6,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle='#8a7124';ctx.lineWidth=1.5;ctx.stroke();
      }));
      return;
    }

    const themes=[
      ['#75cfee','#f8f1c9','#7bc66a'],['#ffd6a3','#fff5d7','#92b96b'],
      ['#b8cad9','#f0efe0','#768d78'],['#51415e','#b9898a','#4e4b56']
    ];
    const th=themes[Math.max(0,Math.min(3,stageTheme||0))];
    const sky=ctx.createLinearGradient(0,0,0,h);sky.addColorStop(0,th[0]);sky.addColorStop(.52,th[1]);sky.addColorStop(1,th[2]);
    ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);

    // JUMP壁張り付き用の金色アンカー。端の端だけに置き、競技場装飾にも見える程度に控えめ。
    ctx.save();
    const anchorYs=[h*.31,h*.43,h*.55,h*.67];
    anchorYs.forEach(ay=>{
      [-1,1].forEach(sideSign=>{
        const ax=sideSign<0?5:w-5;
        const g=ctx.createRadialGradient(ax-2,ay-2,1,ax,ay,9);
        g.addColorStop(0,'#fff4b0');g.addColorStop(.42,'#e8bf4d');g.addColorStop(1,'#8d6418');
        ctx.fillStyle=g;ctx.shadowColor='#f5d76b';ctx.shadowBlur=7;
        ctx.beginPath();ctx.arc(ax,ay,7,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle='rgba(255,238,151,.9)';ctx.lineWidth=1.5;ctx.stroke();
      });
    });
    ctx.restore();

    const floor=jumpFloorY();
    const top=Math.max(178,h*.235);
    const bottom=Math.min(floor-170,h*.655);
    const side=Math.max(22,w*.045);
    const standW=w-side*2;
    const tierGap=(bottom-top)/4;

    // Stadium shell: clearly separate grandstand from ring-side area.
    ctx.save();
    ctx.fillStyle='rgba(39,58,54,.96)';
    ctx.strokeStyle='rgba(231,205,122,.94)';ctx.lineWidth=6;
    ctx.beginPath();ctx.roundRect(side,top,standW,bottom-top+30,Math.min(52,w*.075));ctx.fill();ctx.stroke();
    ctx.strokeStyle='rgba(133,215,180,.78)';ctx.lineWidth=3;
    ctx.beginPath();ctx.roundRect(side+13,top+14,standW-26,bottom-top+2,Math.min(40,w*.06));ctx.stroke();

    // Four tiers with clipped frog audience.
    for(let tier=0;tier<4;tier++){
      const y0=top+22+tier*tierGap;
      const y1=top+(tier+1)*tierGap-8;
      const inset=side+22;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(inset,y0+5);ctx.quadraticCurveTo(w*.5,y0-8,w-inset,y0+5);
      ctx.lineTo(w-inset,y1-6);ctx.quadraticCurveTo(w*.5,y1+7,inset,y1-6);ctx.closePath();
      ctx.fillStyle=tier%2?'rgba(16,76,69,.98)':'rgba(18,88,78,.98)';ctx.fill();
      ctx.strokeStyle='rgba(144,220,192,.72)';ctx.lineWidth=2;ctx.stroke();ctx.clip();

      const rows=3,gap=Math.max(22,w/14.5);
      const stairCenters=[w*.30,w*.70], stairHalf=Math.max(17,w*.028);
      for(let r=0;r<rows;r++){
        for(let x=inset+20+(r?gap*.48:0);x<w-inset-10;x+=gap){
          if(stairCenters.some(c=>Math.abs(x-c)<stairHalf)) continue;
          const arch=Math.pow((x-w*.5)/(w*.5),2);
          const bob=Math.sin(t*3.1+x*.11+tier+r)*1.2;
          const colors=['#63d65a','#48b8e8','#edd04a','#ba6ce2','#f18b42'];
          const fc=colors[(Math.floor(x/gap)+tier+r)%colors.length];
          const fy=y0+16+r*Math.max(15,tierGap*.205)+arch*4+bob;
          const sc=Math.max(.72,Math.min(.93,w/760));
          ctx.save();ctx.translate(x,fy);ctx.scale(sc,sc);
          ctx.fillStyle=fc;ctx.beginPath();ctx.ellipse(0,4,6.3,7.3,0,0,Math.PI*2);ctx.fill();
          ctx.beginPath();ctx.arc(-3.8,-2.5,3.3,0,Math.PI*2);ctx.arc(3.8,-2.5,3.3,0,Math.PI*2);ctx.fill();
          ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(-3.8,-2.5,1.85,0,Math.PI*2);ctx.arc(3.8,-2.5,1.85,0,Math.PI*2);ctx.fill();
          ctx.fillStyle='#17302a';ctx.beginPath();ctx.arc(-3.4,-2.5,.72,0,Math.PI*2);ctx.arc(4.2,-2.5,.72,0,Math.PI*2);ctx.fill();
          ctx.restore();
        }
      }
      ctx.restore();

      // Horizontal concourse between seating blocks.
      if(tier<3){
        const ay=y1+5;ctx.fillStyle='rgba(223,207,145,.96)';
        ctx.beginPath();ctx.moveTo(side+18,ay-4);ctx.quadraticCurveTo(w*.5,ay+4,w-side-18,ay-4);ctx.lineTo(w-side-18,ay+6);ctx.quadraticCurveTo(w*.5,ay+14,side+18,ay+6);ctx.closePath();ctx.fill();
      }
    }

    // Two staircase aisles through the grandstand, not one giant runway.
    [w*.30,w*.70].forEach((cx,idx)=>{
      const topW=Math.max(30,w*.052), botW=Math.max(46,w*.074);
      ctx.fillStyle='rgba(206,190,130,.98)';
      ctx.beginPath();ctx.moveTo(cx-topW/2,top+18);ctx.lineTo(cx+topW/2,top+18);ctx.lineTo(cx+botW/2,bottom+12);ctx.lineTo(cx-botW/2,bottom+12);ctx.closePath();ctx.fill();
      ctx.fillStyle='rgba(82,117,79,.98)';
      ctx.beginPath();ctx.moveTo(cx-topW/2+5,top+18);ctx.lineTo(cx+topW/2-5,top+18);ctx.lineTo(cx+botW/2-7,bottom+12);ctx.lineTo(cx-botW/2+7,bottom+12);ctx.closePath();ctx.fill();
      // visible stair treads
      ctx.strokeStyle='rgba(246,231,175,.88)';ctx.lineWidth=1.4;
      for(let s=1;s<11;s++){
        const q=s/11, y=top+18+(bottom-top-6)*q;
        const ww=topW+(botW-topW)*q;
        ctx.beginPath();ctx.moveTo(cx-ww/2+5,y);ctx.lineTo(cx+ww/2-5,y);ctx.stroke();
      }
    });

    // Short central entrance staircase stops at ring-side, creating readable distance.
    const stairTop=bottom+25, stairBottom=floor-92;
    const steps=6;
    for(let i=0;i<steps;i++){
      const q=i/(steps-1), y0=stairTop+(stairBottom-stairTop)*q;
      const ww=w*(.105+.055*q), hh=Math.max(8,(stairBottom-stairTop)/steps+2);
      ctx.fillStyle=i%2?'rgba(85,132,82,.98)':'rgba(101,146,91,.98)';
      ctx.strokeStyle='rgba(231,211,145,.96)';ctx.lineWidth=2;
      ctx.beginPath();ctx.roundRect(w*.5-ww/2,y0,ww,hh,4);ctx.fill();ctx.stroke();
    }

    // Lamps and stadium name.
    for(let i=0;i<4;i++){const x=(i+.5)*w/4;ctx.fillStyle='rgba(255,244,170,.96)';ctx.beginPath();ctx.arc(x,top-20,7,0,Math.PI*2);ctx.fill();}
    ctx.font='900 13px system-ui';ctx.textAlign='center';ctx.fillStyle='rgba(255,247,204,.96)';ctx.fillText('FROG FIGHTER Ⅱ  •  LOTUS STADIUM',w/2,bottom+18);
    ctx.restore();

    // Ring-side promenade / open space between stands and lotus platform.
    const apronTop=floor-92;
    const ag=ctx.createLinearGradient(0,apronTop,0,h);ag.addColorStop(0,'rgba(112,180,108,.92)');ag.addColorStop(1,'rgba(37,123,95,.98)');
    ctx.fillStyle=ag;ctx.fillRect(0,apronTop,w,h-apronTop);
    ctx.strokeStyle='rgba(238,218,145,.82)';ctx.lineWidth=3;
    ctx.beginPath();ctx.moveTo(0,apronTop+14);ctx.lineTo(w,apronTop+14);ctx.stroke();

    // Broad oval ring-side deck gives the leaf breathing room.
    ctx.save();ctx.translate(w*.5,floor+49);
    ctx.fillStyle='rgba(212,193,126,.97)';ctx.beginPath();ctx.ellipse(0,2,w*.485,73,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='rgba(71,139,83,.98)';ctx.strokeStyle='rgba(255,233,153,.96)';ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(0,0,w*.463,65,0,0,Math.PI*2);ctx.fill();ctx.stroke();
    // competition lotus leaf sits inside the deck, leaving a visible perimeter walkway
    ctx.fillStyle='#37a83f';ctx.strokeStyle='#dff08a';ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(0,0,w*.405,52,0,0,Math.PI*2);ctx.fill();ctx.stroke();
    ctx.fillStyle='rgba(124,205,83,.45)';ctx.beginPath();ctx.ellipse(-6,-7,w*.315,36,0,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='rgba(35,105,45,.7)';ctx.lineWidth=1.8;for(let a=-2.8;a<=2.8;a+=.44){ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(a)*w*.34,Math.sin(a)*39);ctx.stroke();}
    ctx.fillStyle='rgba(48,138,159,.9)';ctx.beginPath();ctx.moveTo(0,-2);ctx.lineTo(28,-42);ctx.lineTo(8,-6);ctx.closePath();ctx.fill();
    ctx.restore();

    if((stageTheme||0)>=2){for(let i=0;i<22;i++){const x=(i*83+t*18)%w,y=(i*47+t*34)%(h*.66);ctx.save();ctx.translate(x,y);ctx.rotate(t+i);ctx.fillStyle=['#fff2a3','#e77b91','#8ee7ff'][i%3];ctx.fillRect(-2,-5,4,10);ctx.restore();}}
  }

  function drawLotusReferee(dt){
    if(stageTheme===4) return;
    const w=innerWidth,h=innerHeight,floor=jumpFloorY();
    refereeFrog.t=(refereeFrog.t||0)+(dt||.016);
    // JUMP版ではレフリーは競技用の大蓮葉の外側で見守る。
    refereeFrog.x=w*.79;
    refereeFrog.dir=-1;
    const x=w*.79,y=floor-42+Math.sin(refereeFrog.t*4)*1.5;
    const s=Math.max(.72,Math.min(1.05,w/760));
    ctx.save();ctx.translate(x,y);ctx.scale(refereeFrog.dir*s,s);ctx.globalAlpha=.95;
    // yellow referee frog
    ctx.fillStyle='#efd133';ctx.beginPath();ctx.ellipse(0,9,13,16,0,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(-7,-4,7,0,Math.PI*2);ctx.arc(7,-4,7,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(-7,-4,4.1,0,Math.PI*2);ctx.arc(7,-4,4.1,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#17201d';ctx.beginPath();ctx.arc(-6.2,-4,1.7,0,Math.PI*2);ctx.arc(7.8,-4,1.7,0,Math.PI*2);ctx.fill();
    // striped referee shirt
    ctx.save();ctx.beginPath();ctx.ellipse(0,11,8.4,10.8,0,0,Math.PI*2);ctx.clip();ctx.fillStyle='#f8f8f4';ctx.fillRect(-9,1,18,22);ctx.fillStyle='#222';for(let sx=-8;sx<9;sx+=5)ctx.fillRect(sx,1,2.5,22);ctx.restore();
    ctx.fillStyle='#222';ctx.beginPath();ctx.moveTo(-5,3);ctx.lineTo(0,8);ctx.lineTo(5,3);ctx.lineTo(0,5);ctx.closePath();ctx.fill();
    ctx.strokeStyle='#efd133';ctx.lineWidth=4;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(9,8);ctx.lineTo(16,1);ctx.lineTo(18,-7);ctx.stroke();
    ctx.restore();
  }

  function loop(now){
    requestAnimationFrame(loop);
    if(!screens.game.classList.contains('active')||!player||!enemy)return;
    let dt=Math.min(.033,(now-last)/1000);last=now;
    if(gamePaused)return;
    if(!gameOver){
      let ix=input.x+(keys['d']?1:0)-(keys['a']?1:0);
      let iy=input.y+(keys['s']?1:0)-(keys['w']?1:0);
      if(player.stun<=0&&!player.guard){
        player.vx += ix*player.speed*dt*2.28;
        // JUMP版：上下入力はコマンド専用。カエルは蓮の葉から自動ジャンプする。
      }
      enemyAI(dt);
      // JUMP版：CPUもプレイヤーと同じ重力・自動ジャンプを使う。
      // 縦速度を毎フレーム減衰させない（ジャンプ高度を公平にする）。
      player.update(dt);enemy.update(dt);
      updateNewSpecialMoves(player,dt);
      updateNewSpecialMoves(enemy,dt);

      // v6.5: フリー対戦／ストーリーだけ、上下位置が近い時に横へ押し分ける。
      if(gameMode==='battle' || gameMode==='story'){
        separateBattleFighters(player,enemy);
      }

      ensureFighterVisible(player,innerWidth*.28,innerHeight*.52);
      ensureFighterVisible(enemy,innerWidth*.72,innerHeight*.48);




      // ラファエルさんの水圧カッター更新
      if(leafMiniActive){
        leafMiniTime-=dt;
        leafSpawnTimer-=dt;

        if(leafMiniTimeEl) leafMiniTimeEl.textContent=Math.max(0,leafMiniTime).toFixed(1);

        if(leafSpawnTimer<=0 && leafTargets.length<22){
          spawnLeafTarget(Math.floor(Math.random()*5),false);
          leafSpawnTimer=.24+Math.random()*.16;
        }

        leafTargets.forEach(leaf=>{
          leaf.x+=leaf.vx*dt;
          leaf.rot+=leaf.spin*dt;
        });

        leafTargets=leafTargets.filter(leaf=>!leaf.hit && leaf.x>-80);
        checkLeafHits();

        if(leafMiniTime<=0){
          leafMiniTime=0;
          endLeafMiniGame();
        }
      }

      if(guardMiniActive){
        guardMiniTime-=dt; guardSpawnTimer-=dt;
        if(guardMiniTimeEl) guardMiniTimeEl.textContent=Math.max(0,guardMiniTime).toFixed(1);
        const progress=1-Math.max(0,guardMiniTime)/60;
        // 最初の20秒は必ず1体ずつ。以降も最大2体まで。
        const maxTargets=guardMiniTime>40 ? 1 : 2;
        if(guardSpawnTimer<=0 && guardTargets.length<maxTargets){
          spawnGuardTarget();
          // 序盤は約2秒間隔。後半だけ少しずつ短くする。
          guardSpawnTimer=Math.max(.95,2.05-progress*.95)+Math.random()*.35;
        }
        guardTargets.forEach(t=>{
          t.x+=t.vx*dt;
          t.phase+=dt*4;
          // 全て主人公へ向かう。上下移動してもゆっくり追尾する。
          t.targetY=player.y;
          t.y+=(t.targetY-t.y)*Math.min(1,dt*3.2);
          if(t.resolved)return;
          const dx=t.x-player.x, dy=Math.abs(t.y-player.y);
          if(dx<player.radius+t.r+13 && dx>-player.radius-t.r-10 && dy<player.radius+t.r+8){
            t.resolved=true;
            const elapsed=performance.now()-guardMiniGuardTapTime;
            if(player.guard && elapsed>=0 && elapsed<=300){
              guardMiniScore++;
              if(guardMiniScoreEl)guardMiniScoreEl.textContent=String(guardMiniScore);
              comboEl.textContent='JUST GUARD!';
              spawnImpact(player.x+player.face*30,player.y,'guard');
            }else{
              guardMiniMiss++;
              if(guardMiniMissEl)guardMiniMissEl.textContent=String(guardMiniMiss);
              comboEl.textContent='MISS';
              player.hurtFace='both'; player.hurtFaceT=.28;
              spawnImpact(player.x+player.face*24,player.y,'hit');
            }
          }
        });
        guardTargets=guardTargets.filter(t=>!t.resolved && t.x>-80);
        if(guardMiniTime<=0){guardMiniTime=0;endGuardMiniGame();}
      }

      if(leafMiniActive){
        // 保険：葉っぱが0枚になっても必ず次を生成する
        if(leafTargets.length===0){
          for(let i=0;i<5;i++){
            spawnLeafTarget(i,false);
            const t=leafTargets[leafTargets.length-1];
            if(t) t.x=innerWidth+35+i*95;
          }
        }
      }

      // オーラのある拳・脚で水圧カッター／ナマズを打ち消す。
      // ガブリエルさんの長い水流は貫通系なので対象外。
      cancelSoftProjectilesByAura();

      michaelAuraShots.forEach(s=>{
        ctx.save();ctx.globalCompositeOperation='lighter';
        ctx.fillStyle='rgba(255,55,35,.85)';ctx.shadowColor='#ff2a18';ctx.shadowBlur=16;
        ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fill();ctx.restore();
      });
      engineerShots.forEach(q=>{
        q.t-=dt;q.x+=q.vx*dt;q.y+=q.vy*dt;q.spin+=dt*9;
        const target=q.owner&&q.owner.isPlayer?enemy:player;
        if(target&&!q.hit&&Math.hypot(target.x-q.x,target.y-q.y)<target.radius+q.r+4){
          q.hit=true;q.t=0;
          if(projectileImmuneByBubble(target))spawnImpact(target.x,target.y,'guard');
          else{
            q.owner._projectileHit=true;
            damageHit(q.owner,target,2.4*q.owner.damageMul,42*q.owner.face,-5);
            q.owner._projectileHit=false;
            spawnImpact(q.x,q.y,'hit');
          }
        }
      });
      engineerShots=engineerShots.filter(q=>q.t>0&&q.x>-50&&q.x<innerWidth+50);

      aquaVortices.forEach(v=>{
        v.t-=dt;
        v.spin+=dt*8.5;

        cancelSoftProjectilesAtZone({owner:v.owner,x:v.x,y:v.y,r:v.r});

        const target=v.owner && v.owner.isPlayer ? enemy : player;
        if(target){
          const d=Math.hypot(target.x-v.x,target.y-v.y);
          const now=performance.now();
          if(d<target.radius+v.r && now-v.lastHitAt>260){
            v.lastHitAt=now;
            if(projectileImmuneByBubble(target)){
              spawnImpact(target.x,target.y,'guard');
            }else{
              v.owner._projectileHit=true;
              damageHit(v.owner,target,1.15*v.owner.damageMul,26*v.owner.face,-8);
              v.owner._projectileHit=false;
              v.owner.hp=Math.min(100,v.owner.hp+.42);
              if(v.owner.isPlayer)updateHud();
            }
          }
        }
      });
      aquaVortices=aquaVortices.filter(v=>v.t>0);
      michaelAuraShots.forEach(s=>{
        s.t-=dt;s.x+=s.vx*dt;s.y+=s.vy*dt;
        const target=s.owner&&s.owner.isPlayer?enemy:player;
        if(target&&!s.hit&&Math.hypot(target.x-s.x,target.y-s.y)<target.radius+s.r+8){
          s.hit=true;s.t=0;s.owner._projectileHit=true;
          damageHit(s.owner,target,3.4*s.owner.damageMul,95*s.owner.face,-8);
          s.owner._projectileHit=false;spawnImpact(s.x,s.y,'hit');
        }
      });
      michaelAuraShots=michaelAuraShots.filter(s=>s.t>0&&s.x>-80&&s.x<innerWidth+80);


      // ルシファー：設置型アイスウォール。約3秒残り、接触した相手を押し返す。
      iceWalls.forEach(w=>{
        w.t-=dt; w.hitCd=Math.max(0,(w.hitCd||0)-dt);
        const target=w.owner&&w.owner.isPlayer?enemy:player;
        if(target && w.hitCd<=0 && Math.abs(target.x-w.x)<target.radius+w.w*.65 && Math.abs(target.y-w.y)<target.radius+w.h*.45){
          w.hitCd=.55;
          const dir=Math.sign(target.x-w.x)||w.owner.face;
          damageHit(w.owner,target,1.8*w.owner.damageMul,150*dir,-18);
          spawnImpact(target.x,target.y,'guard');
        }
      });
      iceWalls=iceWalls.filter(w=>w.t>0);

      // サリエル：月刃・邪眼・血月・ムーンサルト。
      [player,enemy].forEach(f=>{
        if(!f)return;
        if((f.sarielParalyzeT||0)>0){f.sarielParalyzeT=Math.max(0,f.sarielParalyzeT-dt);f.vx*=.45;f.vy*=.45;}
        if((f.bloodSlowT||0)>0){f.bloodSlowT=Math.max(0,f.bloodSlowT-dt);f.vx*=.86;f.vy*=.86;}
        if(f.type!=='sariel')return;
        const o=f.isPlayer?enemy:player;if(!o)return;
        if(f.specialType==='evilEye'&&f.specialT>0&&!f.evilEyeHit){
          const facing=(f.face>0&&o.x>f.x)||(f.face<0&&o.x<f.x);
          if(facing&&Math.abs(o.y-f.y)<125&&Math.abs(o.x-f.x)<430&&!o.guard){
            f.evilEyeHit=true;o.sarielParalyzeT=3;o.vx=0;o.vy=0;comboEl.textContent='イーブルアイ：3秒麻痺!';
          }
        }
        if(f.specialType==='moonSalt'&&f.specialT>0){
          // 上昇を抑え、相手の高さに長く留まる回転多段技にする。
          f.vy=Math.min(f.vy,-72);
          f.moonSaltSpin=(f.moonSaltSpin||0)+dt*34;
          f.moonSaltHitCd=Math.max(0,(f.moonSaltHitCd||0)-dt);
          // 回転そのものが攻撃。最大6ヒット、約0.09秒ごとに再ヒット可能。
          if((f.moonSaltHits||0)<6&&f.moonSaltHitCd<=0&&Math.abs(o.x-f.x)<82&&Math.abs(o.y-f.y)<88){
            f.moonSaltHits=(f.moonSaltHits||0)+1;f.moonSaltHitCd=.09;
            const last=f.moonSaltHits>=6;
            damageHit(f,o,(last?3.8:1.45)*f.damageMul,(last?145:24)*f.face,last?-210:-22);
            spawnImpact(o.x,o.y,'hit');
          }
        }
      });
      lunarSlashes.forEach(q=>{
        q.t-=dt;q.age+=dt;const p=Math.min(1,q.age/1.45),a=Math.PI*p;
        q.x=q.baseX+Math.sin(a)*q.dir*285;q.y=q.baseY+(q.arc==='up'?-1:1)*Math.sin(a)*92;
        const t=q.owner.isPlayer?enemy:player;
        if(t&&!q.hit&&Math.abs(q.x-t.x)<t.radius+30&&Math.abs(q.y-t.y)<t.radius+30){
          if(t.guard){q.owner=t;q.baseX=t.x;q.baseY=t.y;q.dir=t.face;q.arc=q.arc==='up'?'down':'up';q.age=0;spawnImpact(t.x,t.y,'guard');}
          else{q.hit=true;damageHit(q.owner,t,q.damage,125*q.dir,q.arc==='up'?-45:45);spawnImpact(q.x,q.y,'hit');}
        }
      });
      lunarSlashes=lunarSlashes.filter(q=>q.t>0&&q.age<1.52);
      bloodMoons.forEach(m=>{
        m.t-=dt;const o=m.owner,t=o&&o.isPlayer?enemy:player;if(!o||!t||m.broken)return;
        if(o.hp<m.startHp-.05){m.broken=true;o.specialT=Math.min(o.specialT,.15);comboEl.textContent='ブラッドムーン破壊!';return;}
        if(m.t<=0){t.bloodSlowT=10;m.broken=true;comboEl.textContent='ブラッドムーン：10秒スロー!';}
      });
      bloodMoons=bloodMoons.filter(m=>!m.broken&&m.t>0);

      // コカビエル：急降下キックと重力異常。
      [player,enemy].forEach(f=>{
        if(!f)return;
        if((f.gravityHeavyT||0)>0){
          f.gravityHeavyT=Math.max(0,f.gravityHeavyT-dt);
          f.vy+=360*dt;
          if(f.vy<0)f.vy*=.88;
        }
        if(f.type!=='kokabiel'||f.specialType!=='gravityDive'||f.specialT<=0)return;
        f.vy=Math.max(f.vy,390);
        const o=f.isPlayer?enemy:player;
        if(o&&!f.gravityDiveHit&&Math.abs(o.x-f.x)<78&&Math.abs(o.y-f.y)<82){
          f.gravityDiveHit=true;
          damageHit(f,o,8.2*f.damageMul,145*f.face,135);
          o.gravityHeavyT=2.25;o.vy=Math.max(o.vy,180);
          spawnImpact(o.x,o.y,'hit');comboEl.textContent='ヘヴィ・グラビティ!';
        }
      });

      gravityBalls.forEach(q=>{
        q.t-=dt;q.x+=q.vx*dt;q.y+=q.vy*dt;
        const target=q.owner.isPlayer?enemy:player;if(!target||q.t<=0)return;
        const dx=q.x-target.x,dy=q.y-target.y,d=Math.hypot(dx,dy)||1;
        if(d<245){
          const f=(1-d/245)*q.pull+24;
          // 横方向は弱く引き寄せ、主効果は強い下向き重力。
          target.vx+=dx/d*f*.22*dt;
          target.vy+=(q.downPull||980)*(0.42+0.58*(1-d/245))*dt;
        }
        if(Math.abs(q.x-target.x)<target.radius+q.r+8&&Math.abs(q.y-target.y)<target.radius+q.r+8){
          if(target.guard){q.owner=target;q.vx=-q.vx*1.05;q.reflects++;q.x=target.x+Math.sign(q.vx)*56;spawnImpact(target.x,target.y,'guard');if(q.reflects>=q.maxReflect)q.t=0;}
          else{damageHit(q.owner,target,q.damage,Math.sign(q.vx)*70,145);target.vy=Math.max(target.vy,250);target.gravityDragT=Math.max(target.gravityDragT||0,1.35);spawnImpact(q.x,q.y,'hit');q.t=0;}
        }
      });
      gravityBalls=gravityBalls.filter(q=>q.t>0&&q.x>-100&&q.x<innerWidth+100);
      gravityZones.forEach(z=>{
        z.t-=dt;z.arm=Math.max(0,z.arm-dt);
        const target=z.owner.isPlayer?enemy:player;if(!target||z.t<=0)return;
        const dx=z.x-target.x,dy=z.y-target.y,d=Math.hypot(dx,dy)||1;
        if(z.arm<=0&&d<z.maxR){
          const strength=(1-d/z.maxR);
          target.vx+=dx/d*(110+240*strength)*.20*dt;
          target.vy+=(z.downPull||1500)*(0.48+0.52*strength)*dt;
        }
      });
      gravityZones=gravityZones.filter(z=>z.t>0);
      meteorDrops.forEach(m=>{
        m.t-=dt;if(!m.active){m.delay-=dt;if(m.delay<=0)m.active=true;}if(!m.active)return;
        m.y+=m.vy*dt;const target=m.owner.isPlayer?enemy:player;
        if(target&&Math.abs(m.x-target.x)<target.radius+m.r&&Math.abs(m.y-target.y)<target.radius+m.r){
          if(target.guard){damageHit(m.owner,target,1.3,0,35);spawnImpact(target.x,target.y,'guard');}
          else{damageHit(m.owner,target,m.damage,Math.sign(target.x-m.x||1)*55,160);spawnImpact(m.x,m.y,'hit');}
          m.t=0;
        }
      });
      meteorDrops=meteorDrops.filter(m=>m.t>0&&m.y<innerHeight+90);

      // ジィハル高速技は発動時の進行方向と速度を維持する。
      [player,enemy].forEach(f=>{
        if(!f||f.type!=='jihal')return;
        const dir=f.jihalRushDir||f.face||1;
        if(f.specialType==='lightningDash'&&f.specialT>0) f.vx=dir*920;
        if(f.specialType==='thunderChargeRush'&&f.specialT>0){
          const c=Math.max(0,Math.min(1,f.jihalChargePower||0));
          f.vx=dir*(980+520*c);
        }
      });

      // ジィハル高速技の当たり判定。
      [player,enemy].forEach(f=>{
        if(!f||f.type!=='jihal')return;
        const o=f.isPlayer?enemy:player;
        if(!o)return;

        // ライトニングダッシュは前半〜中盤だけ攻撃判定。
        if(f.specialType==='lightningDash' && f.specialT>0){
          const elapsed=.34-f.specialT;
          if(elapsed<=.21 && !f.jihalDashHit && Math.abs(o.x-f.x)<78 && Math.abs(o.y-f.y)<76){
            f.jihalDashHit=true;
            damageHit(f,o,7.6*f.damageMul,365*f.face,-45);
            spawnImpact(o.x,o.y,'hit');
          }
        }

        // サンダーチャージは相手に当たっても速度を落とさず、そのまま通り抜ける。
        if(f.specialType==='thunderChargeRush' && f.specialT>0){
          if(!f.jihalThunderHit && Math.abs(o.x-f.x)<86 && Math.abs(o.y-f.y)<84){
            f.jihalThunderHit=true;
            const c=Math.max(0,Math.min(1,f.jihalChargePower||0));
            const dir=f.jihalRushDir||f.face||1;
            const keepVx=dir*(980+520*c);
            damageHit(f,o,(9.45+5.4*c)*f.damageMul,(410+180*c)*dir,-70);
            // hit処理後も速度を完全復元し、相手の反対側へ抜ける。
            f.vx=keepVx;
            f.x=o.x+dir*(o.radius+f.radius+16);
            o.x-=dir*8;
            spawnImpact(o.x,o.y,'hit');
          }
        }
      });

      [player,enemy].forEach(f=>{if(f&&f.type==='jihal'&&f.jihalCharging){f.jihalCharge=Math.min(1,(f.jihalCharge||0)+dt/.95);f.specialT=999;f.vx*=.75;}});
      jihalBolts.forEach(q=>{
        q.t-=dt;q.x+=q.vx*dt;q.y+=q.vy*dt;const t=q.owner.isPlayer?enemy:player;
        if(t&&q.t>0&&Math.abs(q.x-t.x)<((q.halfW||20)+30)&&Math.abs(q.y-t.y)<((q.halfH||13)+42)){
          if(t.guard){q.owner=t;q.vx=-q.vx*1.06;q.reflects++;q.x=t.x+Math.sign(q.vx)*52;spawnImpact(t.x,t.y,'guard');if(q.reflects>=5)q.t=0;}
          else{damageHit(q.owner,t,q.damage,Math.sign(q.vx)*160,-30);spawnImpact(q.x,q.y,'hit');q.t=0;}
        }
      });
      jihalBolts=jihalBolts.filter(q=>q.t>0&&q.x>-80&&q.x<innerWidth+80);
      jihalBursts.forEach(b=>{b.t-=dt;b.r=b.maxR*(1-b.t/b.life);});
      jihalBursts=jihalBursts.filter(b=>b.t>0);

      remielMirages.forEach(m=>{
        m.t-=dt;m.age=(m.age||0)+dt;if(m.tongueT>0)m.tongueT-=dt;
        const splitTime=.28;
        if(m.owner && m.age<=splitTime && m.originY!=null){
          const p=Math.max(0,Math.min(1,m.age/splitTime));
          const e=p*p*(3-2*p);
          m.owner.y=m.originY+(m.bodyTargetY-m.originY)*e;
          m.owner.vy=0;
        }
        const foe=m.owner.isPlayer?enemy:player;if(foe&&foe.attackT>0&&Math.abs(foe.x-m.owner.x)<105&&Math.abs(foe.y-((m.age||0)<.28 ? (m.originY+(m.ghostTargetY-m.originY)*Math.max(0,Math.min(1,(m.age||0)/.28))) : (m.owner.y+m.offsetY)))<72){m.t=0;spawnImpact(m.owner.x,(m.age||0)<.28 ? (m.originY+(m.ghostTargetY-m.originY)*Math.max(0,Math.min(1,(m.age||0)/.28))) : m.owner.y+m.offsetY,'guard');}for(const q of water2Shots){if(q.owner!==m.owner&&Math.abs(q.x-m.owner.x)<48&&Math.abs(q.y-((m.age||0)<.28 ? (m.originY+(m.ghostTargetY-m.originY)*Math.max(0,Math.min(1,(m.age||0)/.28))) : (m.owner.y+m.offsetY)))<58){m.t=0;q.t=0;spawnImpact(q.x,q.y,'guard');break;}}});
      remielMirages=remielMirages.filter(m=>m.t>0);
      remielFakeShots.forEach(q=>{
        q.t-=dt;q.x+=q.vx*dt;q.y+=q.vy*dt;
        const target=q.owner&&q.owner.isPlayer?enemy:player;
        if(target&&q.t>0&&!q.hit&&Math.abs(q.x-target.x)<(q.r+30)&&Math.abs(q.y-target.y)<(q.r+42)){
          if(target.guard){
            // 分身フロストショットも通常弾同様、ガードで反射可能。
            q.owner=target;q.vx=-q.vx*1.06;q.vy=-q.vy*.25;
            q.reflects=(q.reflects||0)+1;
            q.x=target.x+Math.sign(q.vx||1)*(target.radius+q.r+8);
            spawnImpact(target.x,target.y,'guard');
            if(q.reflects>=5)q.t=0;
          }else{
            damageHit(q.owner,target,(q.damage||2.4)*(q.owner.damageMul||1),Math.sign(q.vx||1)*135,-24);
            spawnImpact(q.x,q.y,'hit');q.hit=true;q.t=0;
          }
        }
      });
      remielFakeShots=remielFakeShots.filter(q=>q.t>0&&q.x>-50&&q.x<innerWidth+50&&q.y>-50&&q.y<innerHeight+50);

      // セラフィエル：セラフィックレイ。予告0.32秒後に短時間だけ攻撃判定。
      seraphielRays.forEach(r=>{
        r.t-=dt;
        // 発動点は本人に追従。ジャンプで離れても光線の根元だけ置き去りにならない。
        if(r.owner){
          r.x=r.owner.x+r.dir*55;
          r.y=r.owner.y-8;
        }
        const elapsed=r.life-r.t;
        r.active=elapsed>.32 && elapsed<.50;
        const target=r.owner.isPlayer?enemy:player;
        if(r.active && target && !r.hit){
          const ahead=(target.x-r.x)*r.dir;
          if(ahead>0 && ahead<innerWidth && Math.abs(target.y-r.y)<34+target.radius*.45){
            if(target.guard){
              // レイは飛び道具ではないので反射せず、シャボンで大きく軽減。
              damageHit(r.owner,target,3.0*r.owner.damageMul,80*r.dir,-15);
              spawnImpact(target.x,target.y,'guard');
            }else{
              damageHit(r.owner,target,15.5*r.owner.damageMul,265*r.dir,-55);
              spawnImpact(target.x,target.y,'hit');
            }
            r.hit=true;
          }
        }
      });
      seraphielRays=seraphielRays.filter(r=>r.t>0);


      // サタナエル：ディザスターフレア。遅い赤黒炎は通常弾を飲み込み、ガードでも消滅しない。
      satanaelFlares.forEach(q=>{
        q.t-=dt;q.x+=q.vx*dt;
        for(const p of water2Shots){
          if(p.owner!==q.owner&&p.t>0&&Math.abs(p.x-q.x)<q.r+(p.r||12)&&Math.abs(p.y-q.y)<q.r+(p.r||12)){
            p.t=0;spawnImpact(p.x,p.y,'guard');
          }
        }
        const target=q.owner.isPlayer?enemy:player;
        if(target&&!q.hit&&Math.abs(target.x-q.x)<q.r+target.radius*.65&&Math.abs(target.y-q.y)<q.r+target.radius*.65){
          if(target.guard){damageHit(q.owner,target,3.4*q.owner.damageMul,38*Math.sign(q.vx),-8);spawnImpact(target.x,target.y,'guard');}
          else{damageHit(q.owner,target,12.5*q.owner.damageMul,185*Math.sign(q.vx),-45);spawnImpact(target.x,target.y,'hit');}
          q.hit=true; // 本体への多段防止。弾そのものは画面外まで残る。
        }
      });
      satanaelFlares=satanaelFlares.filter(q=>q.t>0&&q.x>-100&&q.x<innerWidth+100);

      // ダークレイ：セラフィックレイの黒版。
      satanaelRays.forEach(r=>{
        r.t-=dt;const elapsed=r.life-r.t;r.active=elapsed>.32&&elapsed<.50;
        // JUMP版：レイの根元はサタナエル本人に固定して追従。
        if(r.owner){
          r.dir=r.owner.face;
          r.x=r.owner.x+r.dir*55;
          r.y=r.owner.y-8;
        }
        const target=r.owner.isPlayer?enemy:player;
        if(r.active&&target&&!r.hit){
          const ahead=(target.x-r.x)*r.dir;
          if(ahead>0&&ahead<innerWidth&&Math.abs(target.y-r.y)<34+target.radius*.45){
            if(target.guard){damageHit(r.owner,target,3.2*r.owner.damageMul,80*r.dir,-15);spawnImpact(target.x,target.y,'guard');}
            else{damageHit(r.owner,target,16.2*r.owner.damageMul,275*r.dir,-55);spawnImpact(target.x,target.y,'hit');}
            r.hit=true;
          }
        }
      });
      satanaelRays=satanaelRays.filter(r=>r.t>0);

      // ダークプレッシャー：上から降りる黒い光。0ダメージで相手を底へ押し下げる。
      satanaelPressures.forEach(p=>{
        p.t-=dt;const elapsed=p.life-p.t;const target=p.owner.isPlayer?enemy:player;
        if(target&&elapsed>.18&&elapsed<.68){
          const floorY=innerHeight-72;
          target.y+=(floorY-target.y)*Math.min(1,dt*7.5);
          target.vy=Math.max(target.vy,240);
          target.darkPressureDragT=Math.max(target.darkPressureDragT||0,1.35);
        }
      });
      satanaelPressures=satanaelPressures.filter(p=>p.t>0);

      // インフェルノウェーブ：底を黒炎の火柱が連続して走る。
      satanaelWaves.forEach(p=>{
        p.t-=dt;
        if(p.t<=0&&!p.fired){p.fired=true;p.t=p.life;}
        if(p.fired){
          const target=p.owner.isPlayer?enemy:player;
          // 見た目と同じく、蓮の葉付近から約300px上までを攻撃判定にする。
          if(target&&!p.hit&&Math.abs(target.x-p.x)<48&&target.y>p.y-300&&target.y<p.y+28){
            p.hit=true;
            if(target.guard){damageHit(p.owner,target,1.6*p.owner.damageMul,45*p.owner.face,-25);spawnImpact(target.x,target.y,'guard');}
            else{damageHit(p.owner,target,5.0*p.owner.damageMul,115*p.owner.face,-95);spawnImpact(target.x,target.y,'hit');}
          }
        }
      });
      satanaelWaves=satanaelWaves.filter(p=>p.t>0);

      // サマエル：毒弾の発生地点。紫＋青白い渦を見せてから相手へ発射。
  

    samaelGates.forEach(g=>{
        g.t-=dt;
        if(g.t<=0 && !g.fired){
          g.fired=true;
          const target=g.target && g.target.hp>0 ? g.target : (g.owner.isPlayer?enemy:player);
          if(target){
            const dx=target.x-g.x,dy=target.y-g.y,d=Math.hypot(dx,dy)||1;
            const speed=g.deadly?225:252;
            water2Shots.push({
              owner:g.owner,x:g.x,y:g.y,vx:dx/d*speed,vy:dy/d*speed,r:g.deadly?19:16,
              age:0,maxAge:18,t:1,life:1,damage:g.deadly?5.6:4.7,name:g.deadly?'デッドリー・アクア':'ポイズンゲート',
              color:'samaelVenom',reflected:0,hit:false,spin:0,style:'samaelVenom',
              poisonDuration:g.deadly?2.8:2.2,curve:0,arcFlip:1,wobble:g.deadly?.08:.04,baseVy:dy/d*speed,maxReflect:g.deadly?3:4
            });
            comboEl.textContent='ポイズンゲート!';
            setTimeout(()=>{if(comboEl.textContent==='ポイズンゲート!')comboEl.textContent='';},480);
          }
        }
      });
      samaelGates=samaelGates.filter(g=>g.t>-.08 && !g.fired);

      flaurosPillars.forEach(p=>{
        p.t-=dt;const target=p.owner&&p.owner.isPlayer?enemy:player;if(!target)return;
        if(!p.fired&&p.t<=0){p.fired=true;p.t=.42;comboEl.textContent='ヘルフレイム!';}
        if(p.fired&&!p.hit&&Math.abs(target.x-p.x)<54&&target.y>=Math.max(120,p.y-300)&&target.y<=p.y+18){p.hit=true;damageHit(p.owner,target,7.2*p.owner.damageMul,45*Math.sign(target.x-p.x||1),-175);spawnImpact(target.x,target.y,'hit');}
      });
      flaurosPillars=flaurosPillars.filter(p=>p.t>0||!p.fired);
      flaurosClaws.forEach(c=>{c.t-=dt;if(c.t<=0&&!c.hit&&c.target&&c.target.hp>0){c.hit=true;const last=c.index===4;damageHit(c.owner,c.target,(last?2.5:1.55)*c.owner.damageMul,(last?145:20)*c.owner.face,last?-75:-8);spawnImpact(c.target.x,c.target.y,'hit');}});
      flaurosClaws=flaurosClaws.filter(c=>!c.hit);

      // フロッグファイター2 JUMP 共通飛び道具：シャボンガードに触れると自動反射。
      water2Shots.forEach(q=>{
        q.age=(q.age||0)+dt;
        q.spin=(q.spin||0)+dt*(q.style==='aquaSpin'?10:(q.style==='spinCutterBlade'?22:4));
        if(q.curve){ q.vy += q.curve*dt; }
        if(q.style==='bubble' && q.riseAfter>0 && q.age>q.riseAfter){ q.vy-=q.riseAccel*dt; }
        if(q.style==='iceChargeOrb'){ q.trail=q.trail||[]; q.trail.push({x:q.x,y:q.y,t:.75}); if(q.trail.length>22)q.trail.shift(); q.trail.forEach(v=>v.t-=dt); q.trail=q.trail.filter(v=>v.t>0); }
        if(q.style==='aquaPressure'){ q.trail=q.trail||[]; q.trail.push({x:q.x,y:q.y,t:.28}); if(q.trail.length>10)q.trail.shift(); q.trail.forEach(v=>v.t-=dt); q.trail=q.trail.filter(v=>v.t>0); }
        if(q.style==='airGuillotine'){ q.trail=q.trail||[]; q.trail.push({x:q.x,y:q.y,t:.32}); if(q.trail.length>12)q.trail.shift(); q.trail.forEach(v=>v.t-=dt); q.trail=q.trail.filter(v=>v.t>0); }

        // JUMP版アクアショット：上へ消え、相手付近へ落下して戻る。
        if(q.style==='aquaDrop' && q.dropPhase==='rising' && q.y<-85){
          const target=q.owner&&q.owner.isPlayer?enemy:player;
          const tx=target&&target.hp>0?target.x:(q.dropTargetX||q.x);
          q.x=Math.max(28,Math.min(innerWidth-28,tx));
          q.y=-118; // 一度完全に画面外へ消える
          q.vx=0;
          q.vy=325;
          q.baseVy=325;
          q.dropPhase='falling';
        }

        q.x+=q.vx*dt;
        q.y+=q.vy*dt + Math.sin((q.spin||0)*2)*(q.wobble||0)*18*dt;
        if(q.spiralAmp>0&&q.spiralFreq>0){
          const prevPhase=Math.max(0,(q.age-dt))*q.spiralFreq;
          const nextPhase=q.age*q.spiralFreq;
          q.y+=(Math.sin(nextPhase)-Math.sin(prevPhase))*q.spiralAmp;
        }
        const target=q.owner&&q.owner.isPlayer?enemy:player;
        if(!target||q.hit) return;
        if(Math.hypot(target.x-q.x,target.y-q.y)<target.radius+q.r+14){
          if(target.guard){
            // 反射：所有者を入れ替え、相手方向へ返す。ラリーごとに少し加速・大型化。
            spawnImpact(q.x,q.y,'guard'); playSfx('guard');
            q.owner=target; q.vx=-q.vx*1.08; q.vy=-q.vy*.94;
            if(q.style==='aquaDrop') q.dropPhase='reflected';
            // 泡は大きくなり過ぎない。ほかの弾も成長を控えめにしてラリーを見やすくする。
            const grow=(q.style==='bubble')?1.015:1.035;
            const cap=(q.style==='bubble')?23:25;
            q.r=Math.min(cap,q.r*grow);
            q.damage*=1.06; q.reflected=(q.reflected||0)+1;
            q.x=target.x+target.face*(target.radius+q.r+12);
            // 反射回数が増えるほど不安定に。上限では派手に消散。
            if(q.reflected>=q.maxReflect){
              q.hit=true;
              spawnImpact(q.x,q.y,'guard');
              comboEl.textContent='OVER REFLECT!';
            }else{
              comboEl.textContent=q.reflected>1?'REFLECT x'+q.reflected+'!':'REFLECT!';
            }
          }else{
            q.hit=true; q.owner._projectileHit=true;
            damageHit(q.owner,target,q.damage*q.owner.damageMul,75*Math.sign(q.vx||q.owner.face),-8);
            q.owner._projectileHit=false;
            if(q.poisonDuration>0) applyPoison(target,q.owner,q.poisonDuration);
            spawnImpact(q.x,q.y,'hit');
          }
        }
      });
      water2Shots=water2Shots.filter(q=>!q.hit&&(q.age||0)<(q.maxAge||18)&&q.x>-100&&q.x<innerWidth+100&&q.y>(q.style==='aquaDrop'?-150:-100)&&q.y<innerHeight+100);

      toxicWaters.forEach(v=>{
        v.t-=dt;
        const target=v.owner&&v.owner.isPlayer?enemy:player;
        if(!v.landed){
          v.vy+=LAND_GRAVITY*.92*dt; v.x+=v.vx*dt; v.y+=v.vy*dt;
          if(target){
            const now=performance.now();
            if(Math.hypot(target.x-v.x,target.y-v.y)<target.radius+v.r+7 && now-(v.airHitAt||0)>650){
              v.airHitAt=now; const guarded=target.guard;
              v.owner._projectileHit=true;
              damageHit(v.owner,target,2.0*v.owner.damageMul,22*Math.sign(v.vx||v.owner.face),18);
              v.owner._projectileHit=false;
              if(!guarded && !isPoisonImmune(target)) applyPoison(target,v.owner,2.0);
            }
          }
          const floor=innerHeight-185;
          if(v.y>=floor){v.y=floor;v.vx=0;v.vy=0;v.landed=true;v.r=42;v.tick=0;spawnImpact(v.x,v.y,'hit');}
        }else{
          v.tick-=dt;
          if(target&&v.tick<=0&&Math.hypot(target.x-v.x,target.y-v.y)<target.radius+v.r+18){
            v.tick=.52; const guarded=target.guard;
            v.owner._projectileHit=true; damageHit(v.owner,target,1.25*v.owner.damageMul,0,-10); v.owner._projectileHit=false;
            if(!guarded && !isPoisonImmune(target)) applyPoison(target,v.owner,1.25);
          }
        }
      });
      toxicWaters=toxicWaters.filter(v=>v.t>0&&v.x>-100&&v.x<innerWidth+100);

      bossFish.forEach(fish=>{
        fish.t-=dt;
        fish.phase+=dt*7;
        const target=fish.target;
        if(target){
          const dx=target.x-fish.x, dy=target.y-fish.y;
          const d=Math.hypot(dx,dy)||1;
          fish.vx+=(dx/d)*260*dt;
          fish.vy+=(dy/d)*210*dt;
          const sp=Math.hypot(fish.vx,fish.vy)||1;
          const maxSp=235;
          if(sp>maxSp){fish.vx=fish.vx/sp*maxSp;fish.vy=fish.vy/sp*maxSp;}
          fish.x+=fish.vx*dt;
          fish.y+=fish.vy*dt+Math.sin(fish.phase)*6*dt;

          // 相手の攻撃に触れれば小魚は1発で倒せる
          const attacking=target.attackT>0 || target.tongueT>0 || target.specialT>0;
          if(attacking && Math.hypot(target.x-fish.x,target.y-fish.y)<target.radius+72){
            fish.hp=0;
            spawnImpact(fish.x,fish.y,'guard');
          }else if(Math.hypot(target.x-fish.x,target.y-fish.y)<target.radius+fish.r+8){
            fish.hp=0;
            fish.owner._projectileHit=true;
            damageHit(fish.owner,target,1.25*fish.owner.damageMul,45*Math.sign(fish.vx||1),-8);
            fish.owner._projectileHit=false;
          }
        }
      });
      bossFish=bossFish.filter(f=>f.t>0 && f.hp>0);

      abyssShocks.forEach(w=>{
        w.t-=dt;
        w.vy+=(w.curve||0)*dt;
        w.x+=w.vx*dt;
        w.y+=w.vy*dt;
        const target=w.owner && w.owner.isPlayer ? enemy : player;
        if(!w.hit && target && Math.hypot(target.x-w.x,target.y-w.y)<target.radius+w.r+8){
          if(target.guard){
            spawnImpact(w.x,w.y,'guard'); playSfx('guard');
            w.owner=target; w.vx=-w.vx*1.06; w.vy=-w.vy*.96; w.curve=-(w.curve||0);
            w.reflected=(w.reflected||0)+1;
            w.x=target.x+target.face*(target.radius+w.r+12);
            if(w.reflected>=w.maxReflect){w.hit=true;comboEl.textContent='OVER REFLECT!';}
            else comboEl.textContent='REFLECT!';
          }else{
            w.hit=true;
            w.owner._projectileHit=true;
            damageHit(w.owner,target,(w.damage||5.8)*w.owner.damageMul,135*Math.sign(w.vx||w.owner.face),-80);
            w.owner._projectileHit=false;
          }
        }
      });
      abyssShocks=abyssShocks.filter(w=>w.t>0 && !w.hit && w.x>-100 && w.x<innerWidth+100 && w.y>-120 && w.y<innerHeight+120);

      if(raceMiniActive){
        raceMiniElapsed=(performance.now()-raceMiniStart)/1000;
        if(raceMiniTimeEl)raceMiniTimeEl.textContent=raceMiniElapsed.toFixed(2);
        const cp=raceCheckpoints[raceCheckpointIndex];
        if(cp && Math.hypot(player.x-cp.x,player.y-cp.y)<cp.r){
          raceCheckpointIndex++;
          if(raceCheckpointIndex>=raceCheckpoints.length){
            endRaceMiniGame();
          }
        }
        // v6.41: リング境界では停止させず、接線方向へ滑らせる。
        // これにより楕円の端（見た目上の「角」）で引っ掛からない。
        {
          const xs=raceCheckpoints.map(p=>p.x), ys=raceCheckpoints.map(p=>p.y);
          const rcx=(Math.min(...xs)+Math.max(...xs))/2, rcy=(Math.min(...ys)+Math.max(...ys))/2;
          const rrx=(Math.max(...xs)-Math.min(...xs))/2, rry=(Math.max(...ys)-Math.min(...ys))/2;
          const laneHalf=48;
          const keepOnRing=(f)=>{
            if(!f)return;
            const dx=f.x-rcx, dy=f.y-rcy;
            const a=Math.atan2(dy/Math.max(1,rry),dx/Math.max(1,rrx));
            const ca=Math.cos(a), sa=Math.sin(a);
            const innerRx=Math.max(24,rrx-laneHalf), innerRy=Math.max(24,rry-laneHalf);
            const outerRx=rrx+laneHalf, outerRy=rry+laneHalf;
            const qInner=(dx*dx)/(innerRx*innerRx)+(dy*dy)/(innerRy*innerRy);
            const qOuter=(dx*dx)/(outerRx*outerRx)+(dy*dy)/(outerRy*outerRy);

            // 楕円の接線ベクトル。境界に当たった時は進行成分をこちらへ残す。
            let tx=-innerRx*sa, ty=innerRy*ca;
            const tl=Math.hypot(tx,ty)||1; tx/=tl; ty/=tl;

            if(qInner<1){
              // 内周に少しだけ余白を持たせ、めり込みを一発で解消
              f.x=rcx+ca*(innerRx+3);
              f.y=rcy+sa*(innerRy+3);
              const tang=f.vx*tx+f.vy*ty;
              const speed=Math.max(1.2,Math.hypot(f.vx,f.vy)*0.92);
              const sign=Math.abs(tang)>.08?Math.sign(tang):1;
              f.vx=tx*speed*sign; f.vy=ty*speed*sign;
            }else if(qOuter>1){
              // 外周でも同様に、壁に止めずコース沿いへ滑らせる
              f.x=rcx+ca*(outerRx-3);
              f.y=rcy+sa*(outerRy-3);
              tx=-outerRx*sa; ty=outerRy*ca;
              const otl=Math.hypot(tx,ty)||1; tx/=otl; ty/=otl;
              const tang=f.vx*tx+f.vy*ty;
              const speed=Math.max(1.2,Math.hypot(f.vx,f.vy)*0.92);
              const sign=Math.abs(tang)>.08?Math.sign(tang):1;
              f.vx=tx*speed*sign; f.vy=ty*speed*sign;
            }
          };
          keepOnRing(player); keepOnRing(enemy);
        }

        // CPUレーサーも同じ楕円を走る。少しだけライン取りに揺らぎを入れる。
        const ecp=raceCheckpoints[raceEnemyCheckpointIndex];
        if(ecp && enemy){
          const dx=ecp.x-enemy.x,dy=ecp.y-enemy.y,d=Math.hypot(dx,dy)||1;
          const cpuSpeed=enemy.speed*.88;
          enemy.vx+=dx/d*cpuSpeed*2.2*dt;
          enemy.vy+=dy/d*cpuSpeed*2.2*dt;
          if(d<ecp.r){
            raceEnemyCheckpointIndex++;
            if(raceEnemyCheckpointIndex>=raceCheckpoints.length){
              raceMiniActive=false;
              comboEl.textContent='レース結果：RIVALの勝ち！';
              comboEl.style.fontSize='clamp(28px,5vw,56px)';
              restartButton.hidden=false;
            }
          }
        }
      }

      if(basketMiniActive){
        basketMiniTime-=dt;
        if(basketTimeEl)basketTimeEl.textContent=Math.max(0,basketMiniTime).toFixed(1);

        // 自陣から出られない：中央線を越えない。
        const mid=innerWidth*.5, margin=player.radius+8;
        player.x=Math.min(player.x,mid-margin);
        enemy.x=Math.max(enemy.x,mid+margin);

        if(basketBall){
          basketBall.owner=null;
          basketBall.vx*=Math.pow(.9985,dt*60);
          basketBall.vy*=Math.pow(.9985,dt*60);
          // 遅くなりすぎない。エアホッケーらしく常に速め。
          let sp=Math.hypot(basketBall.vx,basketBall.vy);
          if(sp<330){
            const ang=sp>20?Math.atan2(basketBall.vy,basketBall.vx):(Math.random()*Math.PI*2);
            basketBall.vx=Math.cos(ang)*330;basketBall.vy=Math.sin(ang)*330;
          }else if(sp>820){
            basketBall.vx*=820/sp;basketBall.vy*=820/sp;
          }
          basketBall.x+=basketBall.vx*dt;
          basketBall.y+=basketBall.vy*dt;

          const goalHalf=Math.max(62,innerHeight*.13);
          const cy=innerHeight*.52;
          // 上下壁
          if(basketBall.y<62+basketBall.r || basketBall.y>innerHeight-48-basketBall.r){
            basketBall.vy*=-1;
            basketBall.y=Math.max(62+basketBall.r,Math.min(innerHeight-48-basketBall.r,basketBall.y));
          }
          // 左右壁。ただしゴール開口部は通過して得点。
          if(basketBall.x<8+basketBall.r){
            if(Math.abs(basketBall.y-cy)<goalHalf){
              basketEnemyScore++;
              if(basketEnemyScoreEl)basketEnemyScoreEl.textContent=String(basketEnemyScore);
              comboEl.textContent='RIVAL SCORE';
              resetBasketBall();
            }else{
              basketBall.vx=Math.abs(basketBall.vx);
              basketBall.x=8+basketBall.r;
            }
          }else if(basketBall.x>innerWidth-8-basketBall.r){
            if(Math.abs(basketBall.y-cy)<goalHalf){
              basketPlayerScore++;
              if(basketPlayerScoreEl)basketPlayerScoreEl.textContent=String(basketPlayerScore);
              comboEl.textContent='SCORE!';
              resetBasketBall();
            }else{
              basketBall.vx=-Math.abs(basketBall.vx);
              basketBall.x=innerWidth-8-basketBall.r;
            }
          }

          // CPUは自陣内でマリモのYに合わせて守り、近ければ打ち返す。
          if(enemy && enemy.stun<=0){
            const tx=Math.max(mid+margin,Math.min(innerWidth*.82,basketBall.x));
            const ty=basketBall.y;
            enemy.vx+=Math.sign(tx-enemy.x)*enemy.speed*.72*dt;
            enemy.vy+=Math.sign(ty-enemy.y)*enemy.speed*.62*dt;
            if(Math.hypot(enemy.x-basketBall.x,enemy.y-basketBall.y)<enemy.radius+92 && Math.random()<dt*8){
              hockeyStrike(enemy,Math.random()<.45?'kick':'punch');
            }
          }
        }

        if(basketMiniTime<=0){basketMiniTime=0;endBasketMiniGame();}
      }

      kawazuShots.forEach(p=>{
        p.t-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;
        const target=p.owner&&p.owner.isPlayer?enemy:player;
        if(!p.hit&&target&&Math.hypot(target.x-p.x,target.y-p.y)<target.radius+p.r){
          if(target.guard){
            // 水圧ラッシュは反射されると単純に戻らず、上下へ散る。
            spawnImpact(p.x,p.y,'guard');
            p.owner=target; p.reflected=(p.reflected||0)+1;
            p.vx=-p.vx*.78;
            const sign=(p.vy||0)>=0?1:-1;
            p.vy=sign*(150+Math.abs(p.vy)*.72);
            p.x=target.x+target.face*(target.radius+p.r+10);
            comboEl.textContent='SPLIT REFLECT!';
          }else{
            p.hit=true;
            p.owner._projectileHit=true;
            damageHit(p.owner,target,1.00*p.owner.damageMul,30*Math.sign(p.vx),p.vy*.08);
            p.owner._projectileHit=false;
          }
        }
      });
      kawazuShots=kawazuShots.filter(p=>p.t>0&&!p.hit&&p.x>-40&&p.x<innerWidth+40&&p.y>-40&&p.y<innerHeight+40);
      kawazuGhosts.forEach(q=>q.t-=dt);
      kawazuGhosts=kawazuGhosts.filter(q=>q.t>0);

    pressureBlades.forEach(p=>{
        p.t-=dt; p.x+=p.vx*dt; p.y+=(p.vy||0)*dt;
        const target=p.owner && p.owner.isPlayer ? enemy : player;
        if(!p.hit && target){
          const d=Math.hypot(target.x-p.x,target.y-p.y);
          if(d<target.radius+28){
            // フロッグファイター2 JUMP：水圧カッターもシャボンガードで反射できる。
            if(target.guard){
              spawnImpact(p.x,p.y,'guard'); playSfx('guard');
              p.owner=target;
              p.vx=-p.vx*1.10; p.vy=-(p.vy||0)*.92;
              p.size=Math.min(1.45,(p.size||1)*1.06);
              p.reflected=(p.reflected||0)+1;
              p.x=target.x+target.face*(target.radius+38);
              if(p.reflected>=5){p.hit=true;p.t=0;comboEl.textContent='OVER REFLECT!';}
              else comboEl.textContent=p.reflected>1?'REFLECT x'+p.reflected+'!':'REFLECT!';
            }else{
              p.hit=true;
              if(projectileImmuneByBubble(target)){
                spawnImpact(p.x,p.y,'guard');
              }else if(target.type==='orange' && target.counterReady){
                spawnImpact(p.x,p.y,'guard');
              }else{
                p.owner._projectileHit=true;
                damageHit(p.owner,target,5.2*p.owner.damageMul,105*Math.sign(p.vx||p.owner.face),-18);
                p.owner._projectileHit=false;
              }
            }
          }
        }
      });
      pressureBlades=pressureBlades.filter(p=>p.t>0 && !p.hit && p.x>-80 && p.x<innerWidth+80);

      aquaTornadoes.forEach(t=>{
        t.t-=dt;

        // 発生中は持ち主の手元に根元を追従
        const owner=t.owner;
        if(owner){
          const length=Math.max(innerWidth,innerHeight)*1.05;
          const downward=t.direction==='down';
          // 水流は発生後も指定角度を維持する。
          // 下: 水平より8° / 上: 水平より15°
          const dx=owner.face*(downward?.990:.966);
          const dy=downward?.139:-.259;

          t.startX=owner.x+owner.face*(t.source==='foot'?28:35);
          t.startY=owner.y+(t.source==='foot'?42:-6);
          t.endX=t.startX+dx*length;
          t.endY=t.startY+dy*length;
          t.dir=owner.face;
        }

        // 下向き水流が底に当たった場所だけ、軽い土煙を出す。
        // 円を大量生成せず、1つの濁り雲を短時間描くだけなので軽量。
        if(t.direction==='down' && !t.siltSpawned){
          const floorY=innerHeight-35;
          const segDy=t.endY-t.startY;
          if(segDy>0 && t.startY<floorY && t.endY>=floorY){
            const u=(floorY-t.startY)/segDy;
            const floorX=t.startX+(t.endX-t.startX)*u;
            if(floorX>-40 && floorX<innerWidth+40){
              t.siltSpawned=true;
              siltClouds.push({
                x:floorX,
                y:floorY-2,
                t:1.05,
                life:1.05,
                radius:32
              });
            }
          }
        }

        const target=owner && owner.isPlayer ? enemy : player;
        if(!t.hit && target){
          const d=pointToSegmentDistance(
            target.x,target.y,
            t.startX,t.startY,t.endX,t.endY
          );

          // 水流全体が当たり判定
          if(d < target.radius + t.width){
            t.hit=true;
            if(projectileImmuneByBubble(target)){
              spawnImpact(target.x,target.y,'guard');
            }else{
              owner._projectileHit=true;
              damageHit(owner,target,7.0*owner.damageMul,125*owner.face,-125);
              owner._projectileHit=false;
            }
          }
        }
      });
      aquaTornadoes=aquaTornadoes.filter(t=>t.t>0);

      catfishCharges.forEach(n=>{
        n.t-=dt; n.x+=n.vx*dt;
        const target=n.target;
        if(!n.hit && target && Math.hypot(target.x-(n.x+Math.sign(n.vx)*55),target.y-n.y)<target.radius+72){
          n.hit=true;
          if(projectileImmuneByBubble(target)){
            spawnImpact(target.x,target.y,'guard');
          }else{
            n.owner._projectileHit=true;
            damageHit(n.owner,target,7.0*n.owner.damageMul,n.vx*.42,-55);
            n.owner._projectileHit=false;
          }
        }
      });
      catfishCharges=catfishCharges.filter(n=>n.t>0);

    burstWaves.forEach(b=>{b.t-=dt;});
      burstWaves=burstWaves.filter(b=>b.t>0);

    siltClouds.forEach(s=>{
        s.t-=dt;
        s.radius+=34*dt;
        s.y-=5*dt;
      });
      siltClouds=siltClouds.filter(s=>s.t>0);

    guardWaves.forEach(w=>{
        w.t-=dt;
        w.x += w.dir*285*dt;
        w.r += 42*dt;

        const target=w.owner.isPlayer?enemy:player;
        if(!w.hit && target){
          const dx=target.x-w.x, dy=target.y-w.y;
          if(Math.hypot(dx,dy)<w.r+target.radius){
            w.hit=true;
            // ダメージ無し。水圧だけで押し返す。
            target.vx += w.dir*365;
            target.vy += -38;
            target.stun=Math.max(target.stun,.16);
            spawnImpact(target.x,target.y,'guard');
          }
        }
      });
      guardWaves=guardWaves.filter(w=>w.t>0);

      if(comboTimer>0){comboTimer-=dt;if(comboTimer<=0){comboHits=0;comboEl.textContent=''}}
    } else {
      player.update(dt);enemy.update(dt);
    }

    drawBackground(dt);
    drawLotusReferee(dt);
    ctx.globalAlpha=1;
    ctx.globalCompositeOperation='source-over';

    if(raceMiniActive){
      ctx.save();
      const xs=raceCheckpoints.map(p=>p.x), ys=raceCheckpoints.map(p=>p.y);
      const cx=(Math.min(...xs)+Math.max(...xs))/2, cy=(Math.min(...ys)+Math.max(...ys))/2;
      const rx=(Math.max(...xs)-Math.min(...xs))/2, ry=(Math.max(...ys)-Math.min(...ys))/2;
      ctx.strokeStyle='rgba(255,255,255,.32)';ctx.lineWidth=38;
      ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);ctx.stroke();
      ctx.strokeStyle='rgba(70,225,240,.75)';ctx.lineWidth=3;
      ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);ctx.stroke();
      // 中央は通れないことが視覚的にも分かる内周境界
      ctx.fillStyle='rgba(0,72,82,.32)';
      ctx.beginPath();ctx.ellipse(cx,cy,Math.max(20,rx-48),Math.max(20,ry-48),0,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='rgba(255,255,255,.62)';ctx.lineWidth=3;
      ctx.beginPath();ctx.ellipse(cx,cy,Math.max(20,rx-48),Math.max(20,ry-48),0,0,Math.PI*2);ctx.stroke();
      for(let i=2;i<raceCheckpoints.length;i+=4){
        const p=raceCheckpoints[i], q=raceCheckpoints[Math.min(i+1,raceCheckpoints.length-1)];
        const ang=Math.atan2(q.y-p.y,q.x-p.x);
        ctx.save();ctx.translate(p.x,p.y);ctx.rotate(ang);
        ctx.fillStyle='rgba(255,242,120,.9)';
        ctx.beginPath();ctx.moveTo(16,0);ctx.lineTo(-10,-9);ctx.lineTo(-5,0);ctx.lineTo(-10,9);ctx.closePath();ctx.fill();
        ctx.restore();
      }
      ctx.restore();
    }

    if(basketMiniActive){
      ctx.save();
      const mid=innerWidth*.5, cy=innerHeight*.52, gh=Math.max(62,innerHeight*.13);
      // 中央線
      ctx.strokeStyle='rgba(255,255,255,.42)';ctx.lineWidth=3;ctx.setLineDash([10,10]);
      ctx.beginPath();ctx.moveTo(mid,58);ctx.lineTo(mid,innerHeight-48);ctx.stroke();ctx.setLineDash([]);
      // 左右ゴール
      for(const x of [10,innerWidth-10]){
        ctx.strokeStyle='#f7d660';ctx.lineWidth=6;
        ctx.beginPath();ctx.moveTo(x,cy-gh);ctx.lineTo(x,cy+gh);ctx.stroke();
        ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=2;
        for(let y=cy-gh;y<=cy+gh;y+=14){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+(x<mid?28:-28),y);ctx.stroke();}
      }
      ctx.restore();
    }

    ctx.globalAlpha=1;
    ctx.globalCompositeOperation='source-over';
    ctx.filter='none';
    ctx.shadowBlur=0;
    ctx.shadowColor='transparent';

    ctx.save();
    player.draw();
    ctx.restore();

    ctx.save();
    enemy.draw();
    ctx.restore();

    // WATER HOCKEYのマリモは背景・キャラクターの後に描画。
    // update側で描くと次のdrawBackgroundで消えるため、必ずここで表示する。
    if(basketMiniActive && basketBall){
      ctx.save();
      ctx.globalAlpha=1;
      ctx.globalCompositeOperation='source-over';

      // 水中でも見失いにくいよう少し大きめ＋白い縁取り
      const br=Math.max(18,basketBall.r||15);

      ctx.fillStyle='#4f9d45';
      ctx.strokeStyle='#b9ef9f';
      ctx.lineWidth=4;
      ctx.beginPath();
      ctx.arc(basketBall.x,basketBall.y,br,0,Math.PI*2);
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle='rgba(30,95,36,.65)';
      ctx.lineWidth=2.5;
      ctx.beginPath();
      ctx.moveTo(basketBall.x-br,basketBall.y);
      ctx.lineTo(basketBall.x+br,basketBall.y);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(basketBall.x,basketBall.y,br*.58,-Math.PI/2,Math.PI/2);
      ctx.stroke();

      // 小さなハイライト
      ctx.fillStyle='rgba(255,255,255,.72)';
      ctx.beginPath();
      ctx.arc(basketBall.x-br*.35,basketBall.y-br*.35,br*.18,0,Math.PI*2);
      ctx.fill();

      ctx.restore();
    }

    if(leafMiniActive){
      leafTargets.forEach(leaf=>{
        ctx.save();
        ctx.translate(leaf.x,leaf.y);
        ctx.rotate(leaf.rot);
        ctx.fillStyle='#62b453';
        ctx.strokeStyle='#2d7b37';
        ctx.lineWidth=2;
        ctx.beginPath();
        ctx.ellipse(0,0,leaf.r*1.2,leaf.r*.65,-.25,0,Math.PI*2);
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle='#d9ee91';
        ctx.beginPath();
        ctx.moveTo(-leaf.r*.9,0);
        ctx.lineTo(leaf.r*.9,0);
        ctx.stroke();
        ctx.restore();
      });
    }

    // 同キャラ対戦時は相手側にRIVALマーク
    if(enemy && enemy.sameCharacter && gameMode==='battle'){
      ctx.save();
      ctx.textAlign='center';
      ctx.font='900 13px sans-serif';
      ctx.fillStyle='#fff5a8';
      ctx.strokeStyle='rgba(35,22,10,.7)';
      ctx.lineWidth=4;
      ctx.strokeText('▼ RIVAL ▼',enemy.x,enemy.y-enemy.radius-25);
      ctx.fillText('▼ RIVAL ▼',enemy.x,enemy.y-enemy.radius-25);
      ctx.restore();
    }

    // JUST GUARD ミニゲームの小魚/水生昆虫は、背景とキャラ描画の後に必ず描く。
    if(guardMiniActive){
      guardTargets.forEach(t=>{
        ctx.save();
        ctx.translate(t.x,t.y);

        if(t.kind==='fish'){
          // 小魚
          ctx.fillStyle='#8fd5cf';
          ctx.beginPath();
          ctx.ellipse(0,0,t.r*1.35,t.r*.72,0,0,Math.PI*2);
          ctx.fill();

          ctx.fillStyle='#6cb5b0';
          ctx.beginPath();
          ctx.moveTo(t.r*.95,0);
          ctx.lineTo(t.r*2.15,-t.r*.8);
          ctx.lineTo(t.r*2.15,t.r*.8);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle='#ffffff';
          ctx.beginPath();
          ctx.arc(-t.r*.45,-3,3,0,Math.PI*2);
          ctx.fill();

          ctx.fillStyle='#17282c';
          ctx.beginPath();
          ctx.arc(-t.r*.45,-3,1.5,0,Math.PI*2);
          ctx.fill();
        }else{
          // 水生昆虫
          ctx.fillStyle='#b8d56f';
          ctx.beginPath();
          ctx.ellipse(0,0,t.r*.85,t.r*.52,0,0,Math.PI*2);
          ctx.fill();

          ctx.strokeStyle='#e3f2ad';
          ctx.lineWidth=2.5;
          ctx.beginPath();
          ctx.moveTo(-t.r*.3,-2); ctx.lineTo(-t.r*1.35,-t.r*.9);
          ctx.moveTo(-t.r*.3, 2); ctx.lineTo(-t.r*1.35, t.r*.9);
          ctx.moveTo( t.r*.3,-2); ctx.lineTo( t.r*1.3,-t.r*.9);
          ctx.moveTo( t.r*.3, 2); ctx.lineTo( t.r*1.3, t.r*.9);
          ctx.stroke();
        }

        ctx.restore();
      });
    }

    toxicWaters.forEach(v=>{
      ctx.save(); ctx.translate(v.x,v.y);
      if(!v.landed){
        const rg=ctx.createRadialGradient(-v.r*.30,-v.r*.38,2,0,0,v.r*1.08);
        rg.addColorStop(0,'#c97ae8'); rg.addColorStop(.18,'#8f35b5'); rg.addColorStop(.62,'#5b187d'); rg.addColorStop(1,'#2d0b40');
        ctx.fillStyle=rg; ctx.beginPath(); ctx.ellipse(0,0,v.r*.80,v.r,0,0,Math.PI*2); ctx.fill();
        ctx.strokeStyle='rgba(45,8,62,.82)'; ctx.lineWidth=2; ctx.stroke();
        ctx.fillStyle='rgba(255,235,255,.72)'; ctx.beginPath(); ctx.ellipse(-v.r*.27,-v.r*.37,v.r*.18,v.r*.10,-.5,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='rgba(218,150,238,.32)'; ctx.beginPath(); ctx.ellipse(v.r*.16,v.r*.20,v.r*.25,v.r*.13,-.3,0,Math.PI*2); ctx.fill();
      }else{
        const a=Math.max(.20,Math.min(1,v.t/1.0)); ctx.globalAlpha=a; ctx.fillStyle='rgba(83,16,112,.86)';
        ctx.beginPath(); ctx.ellipse(0,4,v.r*1.28,v.r*.34,0,0,Math.PI*2); ctx.fill();
        ctx.globalAlpha=.42*a; ctx.fillStyle='#a64bc5';
        for(let i=0;i<5;i++){ctx.beginPath();ctx.arc((i-2)*11,-5-(i%2)*7,8+(i%2)*3,0,Math.PI*2);ctx.fill();}
      }
      ctx.restore();
    });

    bossFish.forEach(fish=>{
      ctx.save();
      ctx.translate(fish.x,fish.y);
      // 元の魚絵は左向き（頭が左、尾が右）。
      // 右へ泳ぐ時だけ反転し、常に進行方向へ頭を向ける。
      if(fish.vx>0) ctx.scale(-1,1);
      ctx.fillStyle='#72c75d';
      ctx.beginPath();
      ctx.ellipse(0,0,fish.r*1.25,fish.r*.72,0,0,Math.PI*2);
      ctx.fill();
      ctx.fillStyle='#e64b38';
      ctx.beginPath();
      ctx.moveTo(fish.r*.7,0);
      ctx.lineTo(fish.r*1.7,-fish.r*.7);
      ctx.lineTo(fish.r*1.7,fish.r*.7);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle='#fff';
      ctx.beginPath();ctx.arc(-fish.r*.45,-2,2.5,0,Math.PI*2);ctx.fill();
      ctx.restore();
    });

    abyssShocks.forEach(w=>{
      const a=Math.max(0,w.t/w.life);
      ctx.save();
      ctx.translate(w.x,w.y);
      // 衝撃波の進行方向に合わせて左右反転。
      // 右向き時は従来の形、左向き時は鏡映し。
      if(w.vx<0) ctx.scale(-1,1);
      ctx.globalCompositeOperation='lighter';
      ctx.globalAlpha=.55*a;
      ctx.strokeStyle='#d9ff8a';
      ctx.lineWidth=16;
      ctx.beginPath();
      ctx.arc(0,0,w.r,-1.08,1.08);
      ctx.stroke();
      ctx.globalAlpha=.82*(0.55+0.45*a);
      ctx.strokeStyle='#8fff2c';
      ctx.lineWidth=34;
      ctx.beginPath();
      ctx.arc(0,0,w.r*.84,-1.12,1.12);
      ctx.stroke();
      ctx.restore();
    });

    // ガブリエルさん：その場に残る小型渦
    engineerShots.forEach(q=>{
      const a=Math.max(0,q.t/q.life);
      ctx.save();ctx.translate(q.x,q.y);ctx.rotate(q.spin);
      ctx.globalCompositeOperation='lighter';
      ctx.globalAlpha=.70*a;ctx.strokeStyle='#d8fbff';ctx.lineWidth=3;
      ctx.beginPath();ctx.arc(0,0,q.r,.15*Math.PI,1.75*Math.PI);ctx.stroke();
      ctx.globalAlpha=.45*a;ctx.strokeStyle='#79d9e8';ctx.lineWidth=2;
      ctx.beginPath();ctx.arc(0,0,q.r-5,.2*Math.PI,1.7*Math.PI);ctx.stroke();
      ctx.restore();
    });

    aquaVortices.forEach(v=>{
      const a=Math.max(0,v.t/v.life);
      ctx.save();
      ctx.translate(v.x,v.y);
      ctx.rotate(v.spin);
      ctx.globalCompositeOperation='lighter';

      for(let i=0;i<3;i++){
        ctx.globalAlpha=(.44-i*.08)*Math.min(1,a*1.8);
        ctx.strokeStyle=i===0?'#e7ffff':(i===1?'#7ee5ff':'#37bee8');
        ctx.lineWidth=6-i*1.2;
        ctx.beginPath();
        ctx.arc(0,0,v.r-i*8,.20*Math.PI,1.78*Math.PI);
        ctx.stroke();
      }
      ctx.restore();
    });

    // ラファエルさん：控えめな三日月型の水圧カッター
    // 描画順だけは修正版のまま。見た目は最初の予定に近くする。
    kawazuGhosts.forEach(q=>{
      const a=Math.max(0,q.t/q.life);
      ctx.save();
      ctx.translate(q.x,q.y);
      ctx.globalAlpha=.28*a;
      ctx.fillStyle='#63d968';
      ctx.beginPath();
      ctx.ellipse(0,4,23,27,0,0,Math.PI*2);
      ctx.fill();
      ctx.fillStyle='#ff7138';
      ctx.beginPath();
      ctx.arc(-13,-20,10,0,Math.PI*2);
      ctx.arc(13,-20,10,0,Math.PI*2);
      ctx.fill();
      ctx.restore();
    });

    kawazuShots.forEach(p=>{
      const a=Math.max(0,p.t/p.life);
      ctx.save();
      ctx.translate(p.x,p.y);
      ctx.globalCompositeOperation='lighter';
      ctx.globalAlpha=.72*a;
      ctx.fillStyle='#c8f7ff';
      ctx.beginPath();
      ctx.arc(0,0,p.r,0,Math.PI*2);
      ctx.fill();
      ctx.globalAlpha=.35*a;
      ctx.strokeStyle='#6ee7ff';
      ctx.lineWidth=5;
      ctx.beginPath();
      ctx.arc(0,0,p.r+5,0,Math.PI*2);
      ctx.stroke();
      ctx.restore();
    });

    iceWalls.forEach(w=>{
      const a=Math.max(0,Math.min(1,w.t/.25,w.t));
      ctx.save(); ctx.translate(w.x,w.y); ctx.globalAlpha=.82*Math.min(1,w.t/.18); ctx.globalCompositeOperation='lighter';
      ctx.shadowColor='#9feeff';ctx.shadowBlur=20;
      const g=ctx.createLinearGradient(-14,-55,14,55);g.addColorStop(0,'rgba(238,255,255,.92)');g.addColorStop(.45,'rgba(126,225,246,.78)');g.addColorStop(1,'rgba(70,155,205,.72)');
      ctx.fillStyle=g;ctx.strokeStyle='#efffff';ctx.lineWidth=3;
      ctx.beginPath();ctx.moveTo(-10,-56);ctx.lineTo(14,-48);ctx.lineTo(11,-18);ctx.lineTo(18,7);ctx.lineTo(9,55);ctx.lineTo(-15,49);ctx.lineTo(-12,15);ctx.lineTo(-19,-8);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.globalAlpha=.65;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-8,-40);ctx.lineTo(7,-18);ctx.lineTo(-5,4);ctx.lineTo(10,27);ctx.stroke();
      ctx.restore();
    });

    lunarSlashes.forEach(q=>{
      ctx.save();ctx.translate(q.x,q.y);ctx.globalCompositeOperation='lighter';ctx.rotate(q.age*12*(q.dir||1));ctx.shadowColor='#dce5ff';ctx.shadowBlur=16;
      ctx.fillStyle='#eef3ff';ctx.beginPath();ctx.arc(0,0,25,-1.2,1.2);ctx.arc(-10,0,20,1.1,-1.1,true);ctx.closePath();ctx.fill();ctx.strokeStyle='#9fdbea';ctx.lineWidth=2;ctx.stroke();ctx.restore();
    });
    bloodMoons.forEach(m=>{
      const o=m.owner;if(!o)return;const p=Math.max(0,Math.min(1,1-m.t/m.life)),r=34;
      ctx.save();ctx.translate(o.x,o.y-105);ctx.shadowColor='#e9e6ff';ctx.shadowBlur=13;ctx.fillStyle='#e9e8f4';ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();
      ctx.save();ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.clip();ctx.fillStyle='#b61f35';ctx.fillRect(-r,r-2*r*p,2*r,2*r*p);ctx.restore();
      ctx.strokeStyle='#fff';ctx.globalAlpha=.55;ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.stroke();ctx.restore();
    });

    gravityZones.forEach(z=>{
      ctx.save();ctx.translate(z.x,z.y);ctx.globalCompositeOperation='lighter';
      const rr=z.arm>0?22+(z.maxR-22)*(1-z.arm/.42):z.maxR;
      ctx.globalAlpha=z.arm>0?.42:.26;ctx.strokeStyle='#72e4ed';ctx.lineWidth=3;ctx.shadowColor='#52dce8';ctx.shadowBlur=18;
      ctx.beginPath();ctx.arc(0,0,rr,0,Math.PI*2);ctx.stroke();
      ctx.globalAlpha=.18;ctx.fillStyle='#151b34';ctx.beginPath();ctx.arc(0,0,rr*.62,0,Math.PI*2);ctx.fill();
      ctx.restore();
    });
    gravityBalls.forEach(q=>{
      ctx.save();ctx.translate(q.x,q.y);ctx.globalCompositeOperation='lighter';ctx.shadowColor='#59e0eb';ctx.shadowBlur=22;
      const g=ctx.createRadialGradient(-5,-6,1,0,0,q.r*1.2);g.addColorStop(0,'#d8ffff');g.addColorStop(.2,'#74edf4');g.addColorStop(.55,'#354c7e');g.addColorStop(1,'#10152b');
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,q.r,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(117,235,242,.75)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,q.r+3,0,Math.PI*2);ctx.stroke();ctx.restore();
    });
    meteorDrops.forEach(m=>{if(!m.active)return;ctx.save();ctx.translate(m.x,m.y);ctx.globalCompositeOperation='lighter';ctx.shadowColor='#b9f5ff';ctx.shadowBlur=14;const g=ctx.createRadialGradient(-4,-5,1,0,0,m.r);g.addColorStop(0,'#fff');g.addColorStop(.3,'#c9f6ff');g.addColorStop(1,'#58b9d2');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,m.r,0,Math.PI*2);ctx.fill();ctx.globalAlpha=.5;ctx.strokeStyle='#dffcff';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(0,-m.r-22);ctx.lineTo(0,-m.r+1);ctx.stroke();ctx.restore();});

    jihalBolts.forEach(q=>{
      ctx.save();ctx.translate(q.x,q.y);ctx.globalCompositeOperation='lighter';
      const dir=Math.sign(q.vx)||1;ctx.scale(dir,1);
      ctx.shadowColor='#ffe44d';ctx.shadowBlur=20;
      // JUMP版：横長の雷槍。縦幅は抑え、正面への制圧力を強調。
      ctx.fillStyle='#fff36a';
      ctx.beginPath();
      ctx.moveTo(-38,-10);ctx.lineTo(3,-10);ctx.lineTo(-8,-2);
      ctx.lineTo(39,-2);ctx.lineTo(-9,13);ctx.lineTo(4,5);
      ctx.lineTo(-38,5);ctx.closePath();ctx.fill();
      ctx.strokeStyle='rgba(255,255,210,.9)';ctx.lineWidth=2;ctx.stroke();
      ctx.restore();
    });
    jihalBursts.forEach(b=>{ctx.save();ctx.translate(b.x,b.y);ctx.globalCompositeOperation='lighter';ctx.globalAlpha=Math.max(0,b.t/b.life);ctx.strokeStyle='#fff09a';ctx.shadowColor='#ffe85b';ctx.shadowBlur=15;ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,0,b.r,0,Math.PI*2);ctx.stroke();for(let i=0;i<8;i++){const a=i*Math.PI/4;ctx.beginPath();ctx.moveTo(Math.cos(a)*b.r*.45,Math.sin(a)*b.r*.45);ctx.lineTo(Math.cos(a)*b.r,Math.sin(a)*b.r);ctx.stroke();}ctx.restore();});

    remielFakeShots.forEach(q=>{ctx.save();ctx.translate(q.x,q.y);ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.90;ctx.shadowColor='#bdefff';ctx.shadowBlur=18;const g=ctx.createRadialGradient(-6,-7,2,0,0,q.r);g.addColorStop(0,'#ffffff');g.addColorStop(.38,'#d9f8ff');g.addColorStop(1,'#77cfe6');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,q.r,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#dffcff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,q.r+2,0,Math.PI*2);ctx.stroke();ctx.restore();});

    seraphielRays.forEach(r=>{
      const elapsed=r.life-r.t;
      ctx.save();ctx.globalCompositeOperation='lighter';
      if(elapsed<.32){
        const p=elapsed/.32;
        ctx.globalAlpha=.28+.32*p;ctx.strokeStyle='#fff2a6';ctx.lineWidth=2+5*p;
        ctx.shadowColor='#fff7c4';ctx.shadowBlur=14;
        ctx.beginPath();ctx.moveTo(r.x,r.y);ctx.lineTo(r.x+r.dir*innerWidth,r.y);ctx.stroke();
      }else{
        const fade=Math.max(0,Math.min(1,r.t/.12));
        ctx.globalAlpha=.72*fade;ctx.strokeStyle='#fff9d7';ctx.lineWidth=28;
        ctx.shadowColor='#fff0a0';ctx.shadowBlur=30;
        ctx.beginPath();ctx.moveTo(r.x,r.y);ctx.lineTo(r.x+r.dir*innerWidth,r.y);ctx.stroke();
        ctx.globalAlpha=.95*fade;ctx.strokeStyle='#ffffff';ctx.lineWidth=8;
        ctx.beginPath();ctx.moveTo(r.x,r.y);ctx.lineTo(r.x+r.dir*innerWidth,r.y);ctx.stroke();
      }
      ctx.restore();
    });

    samaelGates.forEach(g=>{
      const p=Math.max(0,Math.min(1,1-g.t/g.life));
      ctx.save(); ctx.translate(g.x,g.y); ctx.globalCompositeOperation='lighter';
      ctx.rotate(performance.now()/230);
      ctx.globalAlpha=(g.deadly?.48:.35)+.45*p;
      ctx.shadowColor=g.deadly?'#e6b8ff':'#c5f7ff';ctx.shadowBlur=g.deadly?28:20;
      for(let i=0;i<3;i++){
        ctx.strokeStyle=i===0?'#7b42c6':(i===1?'#b976ff':'#dffcff');
        ctx.lineWidth=8-i*2.2;
        ctx.beginPath();ctx.arc(0,0,14+i*7,-1.0+p*.8,4.2+p*1.2);ctx.stroke();
      }
      ctx.globalAlpha=.65*p;ctx.fillStyle='#eefeff';ctx.beginPath();ctx.arc(0,0,4+4*p,0,Math.PI*2);ctx.fill();
      ctx.restore();
    });

    flaurosPillars.forEach(p=>{ctx.save();const armed=!p.fired;ctx.globalCompositeOperation='lighter';if(armed){ctx.globalAlpha=.65;ctx.strokeStyle='#ff5138';ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(p.x,p.y,48,12,0,0,Math.PI*2);ctx.stroke();}else{const topY=Math.max(120,p.y-300);const g=ctx.createLinearGradient(p.x,p.y,p.x,topY);g.addColorStop(0,'#ff281d');g.addColorStop(.55,'#ff7a28');g.addColorStop(1,'rgba(255,235,120,.82)');ctx.fillStyle=g;ctx.shadowColor='#ff5a20';ctx.shadowBlur=28;ctx.beginPath();
ctx.moveTo(p.x-36,p.y);
ctx.quadraticCurveTo(p.x-29,p.y-105,p.x-23,topY+58);
ctx.lineTo(p.x-10,topY+30);
ctx.lineTo(p.x-16,topY+11);
ctx.lineTo(p.x-3,topY+23);
ctx.lineTo(p.x+2,topY-22);
ctx.lineTo(p.x+11,topY+18);
ctx.lineTo(p.x+22,topY+4);
ctx.lineTo(p.x+18,topY+39);
ctx.quadraticCurveTo(p.x+30,p.y-105,p.x+36,p.y);
ctx.closePath();ctx.fill();}ctx.restore();});
    flaurosClaws.forEach(c=>{if(c.t>.08)return;ctx.save();ctx.translate(c.x,c.y);ctx.globalCompositeOperation='lighter';ctx.strokeStyle='#ff3028';ctx.shadowColor='#ff1f18';ctx.shadowBlur=16;ctx.lineWidth=5;ctx.globalAlpha=.8;for(let j=-1;j<=1;j++){ctx.beginPath();ctx.moveTo(-34,-22+j*15);ctx.lineTo(36,18+j*15);ctx.stroke();}ctx.restore();});


    // サタナエル技エフェクト：ここは背景・キャラ描画後の実描画セクション。
    satanaelFlares.forEach(q=>{
      ctx.save();
      ctx.translate(q.x,q.y);
      ctx.globalCompositeOperation='lighter';

      const pulse=1+.10*Math.sin(performance.now()/85);
      ctx.scale(pulse,pulse);

      // ディザスターフレア：黒い核＋赤黒い炎＋後方の炎尾
      ctx.shadowColor='#ff1826';
      ctx.shadowBlur=30;
      const orb=ctx.createRadialGradient(-5,-5,2,0,0,q.r*1.45);
      orb.addColorStop(0,'#ff6b45');
      orb.addColorStop(.22,'#c0192b');
      orb.addColorStop(.52,'#3b030c');
      orb.addColorStop(.78,'#080106');
      orb.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=orb;
      ctx.beginPath();ctx.arc(0,0,q.r*1.45,0,Math.PI*2);ctx.fill();

      const d=Math.sign(q.vx)||1;
      ctx.scale(d,1);
      const tg=ctx.createLinearGradient(-100,0,12,0);
      tg.addColorStop(0,'rgba(0,0,0,0)');
      tg.addColorStop(.28,'rgba(8,0,4,.72)');
      tg.addColorStop(.62,'rgba(92,4,18,.78)');
      tg.addColorStop(1,'rgba(255,45,34,.50)');
      ctx.fillStyle=tg;
      ctx.beginPath();
      ctx.moveTo(-102,0);
      ctx.quadraticCurveTo(-60,-30,14,-18);
      ctx.quadraticCurveTo(-2,0,14,18);
      ctx.quadraticCurveTo(-60,30,-102,0);
      ctx.fill();

      ctx.strokeStyle='rgba(255,72,53,.9)';
      ctx.lineWidth=4;
      ctx.rotate(performance.now()/300);
      for(let i=0;i<3;i++){
        ctx.beginPath();
        ctx.arc(0,0,13+i*8,-1.1+i*.4,1.4+i*.4);
        ctx.stroke();
      }
      ctx.restore();
    });

    satanaelRays.forEach(r=>{
      const elapsed=r.life-r.t;
      ctx.save();
      if(elapsed<.32){
        // ダークレイ予兆
        const p=Math.max(0,Math.min(1,elapsed/.32));
        ctx.globalAlpha=.35+.45*p;
        ctx.strokeStyle='#731124';
        ctx.lineWidth=2+5*p;
        ctx.shadowColor='#e11c34';
        ctx.shadowBlur=16;
        ctx.beginPath();
        ctx.moveTo(r.x,r.y);
        ctx.lineTo(r.x+r.dir*innerWidth,r.y);
        ctx.stroke();

        ctx.globalCompositeOperation='lighter';
        const glow=ctx.createRadialGradient(r.x,r.y,1,r.x,r.y,28);
        glow.addColorStop(0,'rgba(255,105,105,.85)');
        glow.addColorStop(.32,'rgba(123,8,28,.72)');
        glow.addColorStop(1,'rgba(0,0,0,0)');
        ctx.fillStyle=glow;
        ctx.beginPath();ctx.arc(r.x,r.y,28,0,Math.PI*2);ctx.fill();
      }else{
        // セラフィックレイの黒版
        const fade=Math.max(.18,Math.min(1,r.t/.12));
        ctx.globalAlpha=.96*fade;
        ctx.strokeStyle='#020104';
        ctx.lineWidth=38;
        ctx.shadowColor='#c3132d';
        ctx.shadowBlur=34;
        ctx.beginPath();
        ctx.moveTo(r.x,r.y);
        ctx.lineTo(r.x+r.dir*innerWidth,r.y);
        ctx.stroke();

        ctx.globalAlpha=.90*fade;
        ctx.strokeStyle='#72101f';
        ctx.lineWidth=15;
        ctx.beginPath();
        ctx.moveTo(r.x,r.y);
        ctx.lineTo(r.x+r.dir*innerWidth,r.y);
        ctx.stroke();

        ctx.globalAlpha=.82*fade;
        ctx.strokeStyle='#e04a57';
        ctx.lineWidth=4;
        ctx.beginPath();
        ctx.moveTo(r.x,r.y);
        ctx.lineTo(r.x+r.dir*innerWidth,r.y);
        ctx.stroke();
      }
      ctx.restore();
    });

    satanaelPressures.forEach(p=>{
      const elapsed=p.life-p.t;
      const progress=Math.max(0,Math.min(1,(elapsed-.08)/.60));
      const frontY=-120+progress*(innerHeight+170);
      ctx.save();

      // ダークプレッシャー：上から黒い光の面が降りてくる
      const dg=ctx.createLinearGradient(0,frontY-280,0,frontY+90);
      dg.addColorStop(0,'rgba(3,0,8,.72)');
      dg.addColorStop(.54,'rgba(10,0,18,.60)');
      dg.addColorStop(.84,'rgba(103,0,31,.28)');
      dg.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=dg;
      ctx.fillRect(0,-10,innerWidth,Math.max(0,frontY+100));

      ctx.globalCompositeOperation='lighter';
      ctx.globalAlpha=.58;
      ctx.strokeStyle='#7c1029';
      ctx.lineWidth=8;
      ctx.shadowColor='#bd1538';
      ctx.shadowBlur=30;
      ctx.beginPath();
      ctx.moveTo(0,frontY);
      for(let x=0;x<=innerWidth;x+=45){
        ctx.lineTo(x,frontY+Math.sin(x*.021+performance.now()/160)*9);
      }
      ctx.stroke();
      ctx.restore();
    });

    satanaelWaves.forEach(p=>{
      if(!p.fired)return;
      ctx.save();
      ctx.globalCompositeOperation='lighter';
      const a=Math.max(.15,Math.min(1,p.t/(p.life||.34)));
      ctx.globalAlpha=.92*a;

      // インフェルノウェーブ：蓮の葉から通常ジャンプ高まで立ち上がる太い黒炎の壁
      const topY=p.y-300;
      const fg=ctx.createLinearGradient(p.x,p.y,p.x,topY);
      fg.addColorStop(0,'#160006');
      fg.addColorStop(.20,'#8d0a20');
      fg.addColorStop(.48,'#250008');
      fg.addColorStop(.72,'#ae0c27');
      fg.addColorStop(1,'rgba(38,0,8,.55)');
      ctx.fillStyle=fg;
      ctx.shadowColor='#c2112c';
      ctx.shadowBlur=28;
      ctx.beginPath();
      ctx.moveTo(p.x-44,p.y);
      ctx.bezierCurveTo(p.x-43,p.y-105,p.x-31,topY+72,p.x-18,topY+35);
      ctx.lineTo(p.x-8,topY+12);
      ctx.lineTo(p.x,topY-18);
      ctx.lineTo(p.x+10,topY+20);
      ctx.lineTo(p.x+23,topY+5);
      ctx.bezierCurveTo(p.x+34,topY+82,p.x+43,p.y-105,p.x+44,p.y);
      ctx.closePath();ctx.fill();

      ctx.globalAlpha=.62*a;
      ctx.fillStyle='#d31a2f';
      ctx.beginPath();
      ctx.moveTo(p.x-15,p.y);
      ctx.quadraticCurveTo(p.x-13,p.y-165,p.x-3,topY+58);
      ctx.lineTo(p.x+4,topY+26);
      ctx.lineTo(p.x+13,topY+62);
      ctx.quadraticCurveTo(p.x+18,p.y-155,p.x+16,p.y);
      ctx.closePath();ctx.fill();
      ctx.restore();
    });

    water2Shots.forEach(q=>{
      const a=1;
      if(q.style==='iceChargeOrb'&&q.trail){
        q.trail.forEach((v,i)=>{ctx.save();ctx.globalAlpha=Math.max(0,v.t/.75)*.42;ctx.fillStyle='#c8f7ff';ctx.strokeStyle='#efffff';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(v.x,v.y,10+q.r*.28,4+q.r*.10,0,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.restore();});
      }
      ctx.save(); ctx.translate(q.x,q.y); ctx.globalCompositeOperation='lighter'; ctx.globalAlpha=.9;
      const sp=Math.hypot(q.vx,q.vy)||1;
      const ang=Math.atan2(q.vy,q.vx);
      ctx.rotate(ang);

      if(q.style==='flameClaw'){ctx.rotate(q.spin||0);ctx.shadowColor='#ff3a20';ctx.shadowBlur=20;ctx.strokeStyle='#ff4028';ctx.lineWidth=6;for(let i=-1;i<=1;i++){ctx.beginPath();ctx.moveTo(-18,i*8);ctx.quadraticCurveTo(0,-15+i*7,24,i*5);ctx.stroke();}ctx.strokeStyle='#ffd05a';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-10,0);ctx.lineTo(27,0);ctx.stroke();
      }else if(q.style==='burning'){
        // 円形の核＋後方へ長く伸びる炎オーラ。
        const tail=34+Math.min(26,(q.reflected||0)*5);
        const g=ctx.createLinearGradient(-tail,0,q.r,0);
        g.addColorStop(0,'rgba(255,70,20,0)'); g.addColorStop(.45,'rgba(255,95,22,.48)'); g.addColorStop(1,'rgba(255,232,118,.95)');
        ctx.fillStyle=g; ctx.beginPath();
        ctx.moveTo(-tail,0); ctx.quadraticCurveTo(-q.r,-q.r*.85,q.r*.7,-q.r*.45); ctx.arc(q.r*.15,0,q.r*.9,-.5,.5); ctx.quadraticCurveTo(-q.r,q.r*.85,-tail,0); ctx.fill();
        ctx.shadowColor='#ff9a38';ctx.shadowBlur=20;ctx.fillStyle='#ffb13b';ctx.beginPath();ctx.arc(0,0,q.r,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#fff1a1';ctx.beginPath();ctx.arc(q.r*.18,-q.r*.12,q.r*.48,0,Math.PI*2);ctx.fill();
      }else if(q.style==='aquaSpin'){
        ctx.rotate(q.spin||0); ctx.shadowColor='#8feeff';ctx.shadowBlur=18;
        ctx.strokeStyle='#bffaff';ctx.lineWidth=4;
        for(let i=0;i<3;i++){ctx.rotate(Math.PI*2/3);ctx.beginPath();ctx.arc(0,0,q.r*.78,-1.0,1.0);ctx.stroke();}
        ctx.fillStyle='rgba(95,207,255,.52)';ctx.beginPath();ctx.arc(0,0,q.r*.72,0,Math.PI*2);ctx.fill();
      }else if(q.style==='whiteOrb'){
        ctx.shadowColor='#ffffff';ctx.shadowBlur=24;ctx.fillStyle='#f8ffff';ctx.beginPath();ctx.arc(0,0,q.r,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle='rgba(210,245,255,.9)';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,q.r+4,0,Math.PI*2);ctx.stroke();
      }else if(q.style==='iceOrb' || q.style==='iceChargeOrb'){
        const rr=q.r; ctx.shadowColor='#bdf7ff';ctx.shadowBlur=q.style==='iceChargeOrb'?28:20;
        const rg=ctx.createRadialGradient(-rr*.3,-rr*.35,2,0,0,rr*1.1);rg.addColorStop(0,'#ffffff');rg.addColorStop(.28,'#c9f7ff');rg.addColorStop(.72,'#69cfee');rg.addColorStop(1,'#277da5');
        ctx.fillStyle=rg;ctx.beginPath();ctx.arc(0,0,rr,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle='#efffff';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(-rr*.65,0);ctx.lineTo(-rr*.15,-rr*.55);ctx.lineTo(rr*.18,-rr*.12);ctx.lineTo(rr*.62,-rr*.48);ctx.stroke();
      }else if(q.style==='powerOrb'){
        const rg=ctx.createRadialGradient(-q.r*.25,-q.r*.25,2,0,0,q.r*1.2);
        rg.addColorStop(0,'#ff5b4b');rg.addColorStop(.45,'#751728');rg.addColorStop(1,'#140b12');
        ctx.shadowColor='#e22f45';ctx.shadowBlur=20;ctx.fillStyle=rg;ctx.beginPath();ctx.arc(0,0,q.r,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle='#ff7065';ctx.lineWidth=2;ctx.stroke();
      }else if(q.style==='bubble'){
        ctx.globalCompositeOperation='source-over';
        ctx.fillStyle='rgba(180,242,255,.16)';ctx.strokeStyle='rgba(236,255,255,.82)';ctx.lineWidth=3;
        ctx.beginPath();ctx.arc(0,0,q.r,0,Math.PI*2);ctx.fill();ctx.stroke();
        ctx.fillStyle='rgba(255,255,255,.78)';ctx.beginPath();ctx.ellipse(-q.r*.32,-q.r*.35,q.r*.22,q.r*.12,-.6,0,Math.PI*2);ctx.fill();
      }else if(q.style==='venomGloss'){
        const rg=ctx.createRadialGradient(-q.r*.3,-q.r*.35,1,0,0,q.r*1.15);
        rg.addColorStop(0,'#b56acb');rg.addColorStop(.18,'#7d269d');rg.addColorStop(.68,'#4b1268');rg.addColorStop(1,'#260833');
        ctx.shadowBlur=0;ctx.fillStyle=rg;ctx.beginPath();ctx.arc(0,0,q.r,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle='rgba(48,8,61,.9)';ctx.lineWidth=2;ctx.stroke();
        ctx.fillStyle='rgba(245,218,250,.70)';ctx.beginPath();ctx.ellipse(-q.r*.28,-q.r*.32,q.r*.23,q.r*.12,-.6,0,Math.PI*2);ctx.fill();
      }else if(q.style==='samaelVenom'){
        const rg=ctx.createRadialGradient(-q.r*.32,-q.r*.35,1,0,0,q.r*1.2);
        rg.addColorStop(0,'#b96fd0');rg.addColorStop(.18,'#8129a2');rg.addColorStop(.48,'#5b1678');rg.addColorStop(.78,'#3b0d52');rg.addColorStop(1,'#21062d');
        ctx.shadowBlur=0;ctx.fillStyle=rg;ctx.beginPath();ctx.arc(0,0,q.r,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle='rgba(55,9,72,.9)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,q.r+1,0,Math.PI*2);ctx.stroke();
        ctx.fillStyle='rgba(246,220,250,.72)';ctx.beginPath();ctx.ellipse(-q.r*.28,-q.r*.33,q.r*.22,q.r*.11,-.6,0,Math.PI*2);ctx.fill();
      }else if(q.style==='spinCutterBlade'){
        // カワズさん：回転ごとに十字の光刃を飛ばす。
        ctx.rotate(q.spin||0);
        ctx.globalCompositeOperation='lighter';
        ctx.shadowColor='#d9fbff';ctx.shadowBlur=22;
        ctx.globalAlpha=.95;
        ctx.strokeStyle='#f4ffff';ctx.lineWidth=5;ctx.lineCap='round';
        ctx.beginPath();ctx.moveTo(-28,0);ctx.lineTo(28,0);ctx.moveTo(0,-28);ctx.lineTo(0,28);ctx.stroke();
        ctx.globalAlpha=.55;
        ctx.strokeStyle='#70e8ff';ctx.lineWidth=10;
        ctx.beginPath();ctx.moveTo(-21,0);ctx.lineTo(21,0);ctx.moveTo(0,-21);ctx.lineTo(0,21);ctx.stroke();
        ctx.globalAlpha=.9;ctx.fillStyle='#ffffff';
        ctx.beginPath();ctx.arc(0,0,5,0,Math.PI*2);ctx.fill();
      }else if(q.style==='spinBlade'){
        // 水圧カッターを縦方向に潰した、薄い高速刃。
        ctx.rotate(q.spin||0);ctx.scale(1.35,.48);
        ctx.shadowColor='#8ef1ff';ctx.shadowBlur=14;
        ctx.fillStyle='rgba(115,229,255,.40)';ctx.beginPath();ctx.ellipse(0,0,20,13,0,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle='#e4ffff';ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,0,18,-1.1,1.1);ctx.stroke();
      }else if(q.style==='airGuillotine'){
        // ラファエル：真上/真下から垂直に走る、ギロチン刃型の風。
        // 外形は幅広い台形の刃＋鋭い斜め刃先。
        ctx.save();
        ctx.globalCompositeOperation='lighter';
        ctx.shadowColor='#bff7ff';
        ctx.shadowBlur=20;

        // 進行方向は外側ですでに回転済み。刃先を前方(+X)へ向ける。
        ctx.globalAlpha=.26;
        ctx.fillStyle='#7fe7ff';
        ctx.beginPath();
        ctx.moveTo(-34,-30);
        ctx.lineTo(16,-30);
        ctx.lineTo(38,0);
        ctx.lineTo(16,30);
        ctx.lineTo(-34,30);
        ctx.lineTo(-16,0);
        ctx.closePath();
        ctx.fill();

        ctx.globalAlpha=.94;
        ctx.fillStyle='#efffff';
        ctx.strokeStyle='#75d9f5';
        ctx.lineWidth=3;
        ctx.beginPath();
        ctx.moveTo(-27,-22);
        ctx.lineTo(12,-22);
        ctx.lineTo(31,0);
        ctx.lineTo(12,22);
        ctx.lineTo(-27,22);
        ctx.lineTo(-10,0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 刃の芯
        ctx.globalAlpha=.75;
        ctx.strokeStyle='#65cbe9';
        ctx.lineWidth=3;
        ctx.beginPath();
        ctx.moveTo(-17,-15);
        ctx.lineTo(18,0);
        ctx.lineTo(-17,15);
        ctx.stroke();

        // 後方へ流れる風
        ctx.globalAlpha=.32;
        ctx.strokeStyle='#dffcff';
        ctx.lineWidth=5;
        ctx.lineCap='round';
        for(let i=-1;i<=1;i++){
          ctx.beginPath();
          ctx.moveTo(-32,i*12);
          ctx.lineTo(-58,i*15);
          ctx.stroke();
        }
        ctx.restore();

      }else if(q.style==='carpBlade'){
        // カープ水圧カッターも通常の水圧カッターと同じ刃を使う。
        // ここに追加の90度回転は掛けず、上で計算済みの進行方向(ang)に沿わせる。
        // そのため弧を描くほど刃も自然に前方へ回転する。
        ctx.globalAlpha=.34;
        ctx.strokeStyle='#77e8ff';
        ctx.lineWidth=15;
        ctx.lineCap='round';
        ctx.beginPath();
        ctx.arc(0,0,28,-1.05,1.05);
        ctx.stroke();

        ctx.globalAlpha=.62;
        ctx.strokeStyle='#d8fbff';
        ctx.lineWidth=5;
        ctx.beginPath();
        ctx.arc(0,0,27,-1.03,1.03);
        ctx.stroke();

        ctx.globalAlpha=.38;
        ctx.strokeStyle='#69d9ff';
        ctx.lineWidth=3;
        ctx.beginPath();
        ctx.arc(-2,0,22,-1.0,1.0);
        ctx.stroke();

        ctx.globalAlpha=.42;
        ctx.fillStyle='#dffcff';
        ctx.beginPath();ctx.arc(-26,-9,3,0,Math.PI*2);ctx.fill();
        ctx.beginPath();ctx.arc(-35,7,2.5,0,Math.PI*2);ctx.fill();
        ctx.beginPath();ctx.arc(-44,-3,2,0,Math.PI*2);ctx.fill();
      }else{
        let fill='#8feeff', glow='#d9fbff';
        ctx.shadowColor=glow; ctx.shadowBlur=18;ctx.fillStyle=fill; ctx.beginPath(); ctx.arc(0,0,q.r,0,Math.PI*2); ctx.fill();
      }
      if((q.reflected||0)>=3 && q.style!=='bubble'){
        ctx.globalAlpha=.28*a;ctx.strokeStyle='#ffffff';ctx.lineWidth=2+(q.reflected||0)*.3;ctx.beginPath();ctx.arc(0,0,q.r+5+(q.reflected||0),0,Math.PI*2);ctx.stroke();
      }else if((q.reflected||0)>=2 && q.style==='bubble'){
        // バブルは二重の巨大泡にせず、表面が一瞬強く光る程度。
        ctx.globalAlpha=.42*a;ctx.strokeStyle='rgba(255,255,255,.85)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,q.r+2,0,Math.PI*2);ctx.stroke();
      }
      ctx.restore();
    });

    pressureBlades.forEach(p=>{
      const a=Math.max(0,p.t/p.life);

      ctx.save();
      ctx.translate(p.x,p.y);
      if(p.vx<0) ctx.scale(-1,1);
      ctx.rotate(Math.atan2(p.vy||0,Math.abs(p.vx||1)));

      ctx.globalCompositeOperation='lighter';

      // 薄い水色の三日月
      ctx.globalAlpha=.34*a;
      ctx.strokeStyle='#77e8ff';
      ctx.lineWidth=15;
      ctx.lineCap='round';
      ctx.beginPath();
      ctx.arc(0,0,28,-1.05,1.05);
      ctx.stroke();

      // 中心の細い白い水圧線
      ctx.globalAlpha=.62*a;
      ctx.strokeStyle='#d8fbff';
      ctx.lineWidth=5;
      ctx.beginPath();
      ctx.arc(0,0,27,-1.03,1.03);
      ctx.stroke();

      // 内側に少しだけ青
      ctx.globalAlpha=.38*a;
      ctx.strokeStyle='#69d9ff';
      ctx.lineWidth=3;
      ctx.beginPath();
      ctx.arc(-2,0,22,-1.0,1.0);
      ctx.stroke();

      // 後ろに小さな泡を少量
      ctx.globalAlpha=.42*a;
      ctx.fillStyle='#dffcff';

      ctx.beginPath();
      ctx.arc(-26,-9,3,0,Math.PI*2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(-35,7,2.5,0,Math.PI*2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(-44,-3,2,0,Math.PI*2);
      ctx.fill();

      ctx.restore();
    });

    burstWaves.forEach(b=>{
      const a=Math.max(0,b.t/b.life);
      const progress=1-a;
      const rr=b.radius+(b.max-b.radius)*progress;
      ctx.save();ctx.globalCompositeOperation='lighter';
      ctx.globalAlpha=.58*a;ctx.strokeStyle='#ff3447';ctx.lineWidth=8;ctx.beginPath();ctx.arc(b.x,b.y,rr,0,Math.PI*2);ctx.stroke();
      ctx.globalAlpha=.28*a;ctx.strokeStyle='#ff9a59';ctx.lineWidth=18;ctx.beginPath();ctx.arc(b.x,b.y,rr*.72,0,Math.PI*2);ctx.stroke();
      ctx.restore();
    });

    // ナマズさん：リリスさんの後ろから突進する、細長いナマズ
    catfishCharges.forEach(n=>{
      ctx.save();
      ctx.translate(n.x,n.y);
      if(n.vx<0) ctx.scale(-1,1);

      // 長い胴体
      ctx.fillStyle='#46535a';
      ctx.beginPath();
      ctx.ellipse(-10,0,92,28,0,0,Math.PI*2);
      ctx.fill();

      // 平たい頭
      ctx.fillStyle='#64777d';
      ctx.beginPath();
      ctx.ellipse(66,0,43,25,0,0,Math.PI*2);
      ctx.fill();

      // 尾びれ
      ctx.fillStyle='#3f4a50';
      ctx.beginPath();
      ctx.moveTo(-95,0);
      ctx.lineTo(-128,-27);
      ctx.lineTo(-118,0);
      ctx.lineTo(-128,27);
      ctx.closePath();
      ctx.fill();

      // 背びれ
      ctx.fillStyle='#56666c';
      ctx.beginPath();
      ctx.moveTo(-28,-25);
      ctx.lineTo(0,-45);
      ctx.lineTo(18,-24);
      ctx.closePath();
      ctx.fill();

      // 目
      ctx.fillStyle='#fff';
      ctx.beginPath();
      ctx.arc(79,-8,5,0,Math.PI*2);
      ctx.fill();
      ctx.fillStyle='#111';
      ctx.beginPath();
      ctx.arc(80,-8,2.5,0,Math.PI*2);
      ctx.fill();

      // 口
      ctx.strokeStyle='#29343a';
      ctx.lineWidth=3;
      ctx.beginPath();
      ctx.moveTo(93,5);
      ctx.lineTo(111,7);
      ctx.stroke();

      // 長いヒゲ
      ctx.strokeStyle='#8da0a5';
      ctx.lineWidth=3;
      ctx.lineCap='round';
      ctx.beginPath();
      ctx.moveTo(91,0); ctx.quadraticCurveTo(128,-14,154,-3);
      ctx.moveTo(91,4); ctx.quadraticCurveTo(130,20,158,10);
      ctx.moveTo(83,-1); ctx.quadraticCurveTo(118,-32,144,-29);
      ctx.stroke();

      ctx.restore();
    });

    // 水底の土煙も描画フェーズへ移動
    siltClouds.forEach(s=>{
      const a=Math.max(0,s.t/s.life);
      ctx.save();
      ctx.globalAlpha=(s.mega ? .76 : .42)*a;
      ctx.fillStyle=s.mega ? '#674323' : '#8a6848';
      ctx.beginPath();
      ctx.ellipse(s.x,s.y-4,s.radius*(s.mega?1.75:1.45),s.radius*(s.mega?.82:.58),0,0,Math.PI*2);
      ctx.fill();

      ctx.globalAlpha=(s.mega ? .48 : .22)*a;
      ctx.fillStyle=s.mega ? '#9a6938' : '#b08a62';
      ctx.beginPath();
      ctx.ellipse(s.x-10,s.y-12,s.radius*.75,s.radius*.42,-.25,0,Math.PI*2);
      ctx.ellipse(s.x+12,s.y-9,s.radius*.65,s.radius*.36,.2,0,Math.PI*2);
      ctx.fill();
      ctx.restore();
    });

    aquaTornadoes.forEach(t=>{
      const alpha=Math.max(0,t.t/t.life);
      const x1=t.startX, y1=t.startY, x2=t.endX, y2=t.endY;
      const dx=x2-x1, dy=y2-y1;
      const len=Math.hypot(dx,dy) || 1;
      const nx=-dy/len, ny=dx/len;

      ctx.save();
      ctx.globalCompositeOperation='lighter';

      // 中心の太い水流
      ctx.globalAlpha=.25*alpha;
      ctx.strokeStyle='#77e8ff';
      ctx.lineWidth=30;
      ctx.lineCap='round';
      ctx.beginPath();
      ctx.moveTo(x1,y1);
      ctx.lineTo(x2,y2);
      ctx.stroke();

      // 竜巻らしい螺旋ライン
      for(let s=0;s<3;s++){
        ctx.globalAlpha=(.55-.12*s)*alpha;
        ctx.strokeStyle=s===0?'#d8fbff':(s===1?'#69d9ff':'#239eea');
        ctx.lineWidth=5-s;
        ctx.beginPath();

        const steps=28;
        for(let i=0;i<=steps;i++){
          const u=i/steps;
          const baseX=x1+dx*u;
          const baseY=y1+dy*u;
          const wave=Math.sin(u*Math.PI*8 + performance.now()/110 + s*2.1);
          const amp=10+u*16;
          const px=baseX+nx*wave*amp;
          const py=baseY+ny*wave*amp;
          if(i===0) ctx.moveTo(px,py);
          else ctx.lineTo(px,py);
        }
        ctx.stroke();
      }

      // 小さな泡
      for(let i=0;i<8;i++){
        const u=((performance.now()/900)+(i/8))%1;
        const bx=x1+dx*u+nx*Math.sin(i*2.2)*14;
        const by=y1+dy*u+ny*Math.sin(i*2.2)*14;
        ctx.globalAlpha=.48*alpha;
        ctx.fillStyle='#dffcff';
        ctx.beginPath();
        ctx.arc(bx,by,2.5+(i%3),0,Math.PI*2);
        ctx.fill();
      }

      ctx.restore();
    });

    guardWaves.forEach(w=>{
      const a=Math.max(0,w.t/w.life);
      ctx.save();
      ctx.globalAlpha=a*.72;
      ctx.strokeStyle='#d9f8ff';
      ctx.lineWidth=7;
      ctx.lineCap='round';

      // 進行方向へ膨らむ短い水の波
      ctx.beginPath();
      if(w.dir>0){
        ctx.arc(w.x,w.y,w.r,-1.05,1.05);
      }else{
        ctx.arc(w.x,w.y,w.r,Math.PI-1.05,Math.PI+1.05);
      }
      ctx.stroke();

      ctx.globalAlpha=a*.42;
      ctx.lineWidth=3;
      ctx.beginPath();
      if(w.dir>0){
        ctx.arc(w.x-w.dir*8,w.y,w.r+10,-.9,.9);
      }else{
        ctx.arc(w.x-w.dir*8,w.y,w.r+10,Math.PI-.9,Math.PI+.9);
      }
      ctx.stroke();
      ctx.restore();
    });

    particles.forEach(p=>{p.t-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.92;p.vy*=.92;
      ctx.globalAlpha=Math.max(0,p.t/.42);ctx.fillStyle=p.type==='guard'?'#d9f5ff':'#fff3a3';
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
    });
    particles=particles.filter(p=>p.t>0);

    hitRings.forEach(r=>{
      r.t-=dt;
      const p=1-Math.max(0,r.t)/r.life;
      const radius=r.r+(r.max-r.r)*p;
      ctx.globalAlpha=Math.max(0,r.t/r.life);
      ctx.strokeStyle=r.type==='guard'?'#d9f5ff':'#fff7b0';
      ctx.lineWidth=r.type==='guard'?4:6;
      ctx.beginPath();
      ctx.arc(r.x,r.y,radius,0,Math.PI*2);
      ctx.stroke();
      ctx.globalAlpha=1;
    });
    hitRings=hitRings.filter(r=>r.t>0);
  }

  resize();
  requestAnimationFrame(loop);

  // MIXタイトルの「地上/水中バトル練習」から直接開始。
  if(mixPracticeMode){
    setTimeout(()=>{
      selectedFighter=['green','blue','yellow','orange'].includes(mixPracticeFighter)?mixPracticeFighter:'green';
      show('game');resize();startPractice();
      if(practiceExitButton){
        practiceExitButton.hidden=false;
        practiceExitButton.textContent='MIXタイトルへ戻る';
      }
    },80);
  }

  // MIXから呼ばれた場合はキャラ選択を飛ばして遭遇戦を開始。
  if(mixBattleMode && mixBattleContext){
    requestAnimationFrame(()=>{
      const playerIsAttacker=mixBattleContext.playerRole!=='defender';
      const pType=mixTypeFor(playerIsAttacker?mixBattleContext.attackerType:mixBattleContext.defenderType);
      const eType=mixTypeFor(playerIsAttacker?mixBattleContext.defenderType:mixBattleContext.attackerType);
      selectedFighter=pType||'green';
      selectedOpponent=eType||'black';
      document.documentElement.classList.remove('mix-battle-boot');
      show('game');resize();startGame('free',selectedOpponent);
      if(player)player.hp=Math.max(1,Math.min(100,playerIsAttacker?mixBattleContext.attackerHp:mixBattleContext.defenderHp));
      if(enemy){
        enemy.hp=Math.max(1,Math.min(100,playerIsAttacker?mixBattleContext.defenderHp:mixBattleContext.attackerHp));
        enemy.bossSpecialCooldown=Math.max(enemy.bossSpecialCooldown||0,1.2);
      }
      updateHud();
      if(practiceExitButton)practiceExitButton.hidden=true;
      if(mixMapReturn)mixMapReturn.style.display='none';
    });
  }
})();