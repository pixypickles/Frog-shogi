(() => {
  const BOARD_SIZE=9, TYPES=['king','rook','bishop','gold','silver','knight','lance','pawn'];
  const K={king:'王',rook:'飛',bishop:'角',gold:'金',silver:'銀',knight:'桂',lance:'香',pawn:'歩',tokin:'と'};
  const LABEL={king:'王／玉',rook:'飛車',bishop:'角行',gold:'金将 ×2',silver:'銀将 ×2',knight:'桂馬 ×2',lance:'香車 ×2',pawn:'歩兵 ×9',tokin:'と金'};
  // 大幅弱体化はしない。戦闘接続後に実戦で再調整する仮値。
  const ROLE_HP={king:100,rook:100,bishop:100,gold:100,silver:100,knight:98,lance:98,pawn:100,tokin:100};

  const CHARACTERS={
    angel:['セラフィエル','ジィハル','ラファエル','ウリエル','ミカエル','ガブリエル','レミエル','カワズさん'],
    demon:['サタナエル','フラウロス','ベルゼブブ','サマエル','ルシファー','リリス','サリエル','コカビエル']
  };
  const RECOMMENDED={
    angel:{king:'セラフィエル',rook:'ジィハル',bishop:'ラファエル',gold:'ウリエル',silver:'ミカエル',knight:'ガブリエル',lance:'レミエル',pawn:'モブさん',tokin:'カワズさん'},
    demon:{king:'サタナエル',rook:'フラウロス',bishop:'ベルゼブブ',gold:'サマエル',silver:'ルシファー',knight:'リリス',lance:'サリエル',pawn:'モブさん',tokin:'コカビエル'}
  };

  // JUMP v2.49 のキャラクター配色を、盤上で見分けやすい主色へ簡略化。
  const PALETTE={
    'ミカエル':{body:'#39cb4d',limb:'#2aa83d'},
    'ガブリエル':{body:'#31aee8',limb:'#238fc4'},
    'ラファエル':{body:'#e7cf3f',limb:'#bda923'},
    'ウリエル':{body:'#ef8b32',limb:'#c66b1f'},
    'ルシファー':{body:'#333b46',limb:'#202832'},
    'リリス':{body:'#f05a9d',limb:'#c43c7b'},
    'ベルゼブブ':{body:'#17121d',limb:'#30233a'},
    'サリエル':{body:'#5d6488',limb:'#474e73'},
    'コカビエル':{body:'#20263f',limb:'#151a2d'},
    'ジィハル':{body:'#244f78',limb:'#183c60'},
    'レミエル':{body:'#7eaebf',limb:'#5c8799'},
    'セラフィエル':{body:'#f1ead7',limb:'#cfc5a9'},
    'サタナエル':{body:'#4b0c12',limb:'#2e070b'},
    'サマエル':{body:'#2a183b',limb:'#1c102a'},
    'フラウロス':{body:'#c92825',limb:'#96191a'},
    'カワズさん':{body:'#4fbd55',limb:'#388f3e',eye:'#d71920'},
    'モブさん':{body:'#79b85a',limb:'#5a9442'}
  };

  // JUMP v2.49 の練習技リストから抜粋。盤面選択時の確認用。
  const MOVES={
    'ミカエル':['バーニングアッパー','バーニングキック','バーニングショット','バーニングサイクロン'],
    'ガブリエル':['アクアトルネード','アクアストリーム','アクアボルテックス','アクアショット'],
    'ラファエル':['エアカッター（2連）','エアーギロチン','エアブレード','ヒーリングバブル','エアホバー'],
    'ウリエル':['ホワイトカウンター','ガーディアンタックル','ホワイトオーラ','ホワイトショット'],
    'ルシファー':['ヘルクラッシュ','アビスチャージ','アイスショット','アイスウォール'],
    'リリス':['舌ラッシュ','バブルショット','ギロチンキック','バックスピンキック'],
    'ベルゼブブ':['ヴェノム・ウォーター','アビスショック','ベノムショット'],
    'サリエル':['ルナ・スラッシュ','イーブルアイ','ブラッドムーン','ムーンサルトキック'],
    'コカビエル':['グラビティボール','グラビティゾーン','メテオレイン','グラビティダイブ'],
    'ジィハル':['ボルトショット','ライトニングダッシュ','サンダーチャージ','スパークバースト'],
    'レミエル':['ミラージュ','ミラージュカウンター','アクアパリィ','フロストショット','ミラージュキック'],
    'セラフィエル':['セラフィックアッパー','セラフィックキック','セラフィックショット','セラフィックサイクロン','セラフィックレイ'],
    'サタナエル':['ディザスターフレア','ダークレイ','ダークプレッシャー','インフェルノウェーブ'],
    'サマエル':['ポイズンゲート','ヴェノムタン','デッドリー・アクア'],
    'フラウロス':['ヘルフレイム','フレイムクロー','レオパードラッシュ','インフェルノクロー'],
    'カワズさん':['ファントムラッシュ','水圧ラッシュ','ミラージュキック','スピンキックカッター','方向キー1回転＋舌（隠し）'],
    'モブさん':['前＋パンチ：バブルショット','上＋パンチ：かえる跳びアッパー']
  };

  const LOTUS=[
    [0,0],[0,1],[0,2],[0,4],[0,6],[0,7],[0,8],
    [1,0],[1,1],[1,2],[1,3],[1,5],[1,6],[1,7],[1,8],
    [2,0],[2,1],[2,3],[2,4],[2,5],[2,7],[2,8],
    [3,0],[3,2],[3,3],[3,4],[3,5],[3,6],[3,8],
    [4,0],[4,1],[4,2],[4,4],[4,6],[4,7],[4,8],
    [5,0],[5,2],[5,3],[5,4],[5,5],[5,6],[5,8],
    [6,0],[6,1],[6,3],[6,4],[6,5],[6,7],[6,8],
    [7,0],[7,1],[7,2],[7,4],[7,6],[7,7],[7,8],
    [8,0],[8,1],[8,2],[8,4],[8,6],[8,7],[8,8]
  ];
  const lotusSet=new Set(LOTUS.map(x=>x.join(',')));
  const $=id=>document.getElementById(id), boardEl=$('board'), statusText=$('statusText'), turnBadge=$('turnBadge'), moveCountEl=$('moveCount'), modal=$('battleModal');
  let assignments=JSON.parse(JSON.stringify(RECOMMENDED)), state;
  const emptyBoard=()=>Array.from({length:9},()=>Array(9).fill(null));
  const piece=(side,type)=>({side,type,name:type==='pawn'?'モブさん':assignments[side][type]});
  function promotePawn(p){return {...p,type:'tokin',name:assignments[p.side].tokin||'カワズさん',promoted:true};}
  function inPromotionZone(side,row){return side==='angel'?row<=2:row>=6;}

  function initialState(){
    const b=emptyBoard();
    const back=['lance','knight','silver','gold','king','gold','silver','knight','lance'];
    back.forEach((t,c)=>b[0][c]=piece('demon',t)); b[1][1]=piece('demon','rook'); b[1][7]=piece('demon','bishop'); for(let c=0;c<9;c++)b[2][c]=piece('demon','pawn');
    back.forEach((t,c)=>b[8][c]=piece('angel',t)); b[7][1]=piece('angel','bishop'); b[7][7]=piece('angel','rook'); for(let c=0;c<9;c++)b[6][c]=piece('angel','pawn');
    return {board:b,turn:'angel',selected:null,legal:[],moves:0,pendingBattle:null,cpuThinking:false,gameOver:false};
  }

  function frogMarkup(p){
    const pal=PALETTE[p.name]||{body:'#4fbd55',limb:'#388f3e'};
    const scale=p.type==='pawn'?.82:1;
    return `<div class="piece ${p.side} ${p.type}" style="--frog-scale:${scale};--frog-body:${pal.body};--frog-limb:${pal.limb};--frog-eye:${pal.eye||'#132127'}">
      <div class="frog-token">
        <span class="frog-leg left"></span><span class="frog-leg right"></span>
        <span class="frog-body"></span><span class="frog-eyes"></span><span class="frog-pupils"></span>
      </div>
      <span class="role-badge">${K[p.type]}</span>
      <span class="piece-name">${p.name}</span>
    </div>`;
  }

  function render(){
    boardEl.innerHTML='';
    // 大葉は撤去。小さい蓮の葉のみ。
    for(let r=0;r<9;r++)for(let c=0;c<9;c++){
      const cell=document.createElement('button'); cell.type='button'; cell.className=`cell ${lotusSet.has(`${r},${c}`)?'lotus':'water'}`; cell.style.setProperty('--leaf-rot',`${((r*17+c*29)%70)-35}deg`); cell.dataset.r=r;cell.dataset.c=c;
      const legal=state.legal.find(m=>m.r===r&&m.c===c); if(state.selected&&state.selected.r===r&&state.selected.c===c)cell.classList.add('selected'); if(legal)cell.classList.add(legal.capture?'capture':'legal');
      const marker=document.createElement('span');marker.className='move-dot';cell.appendChild(marker); const p=state.board[r][c];
      if(p)cell.insertAdjacentHTML('beforeend',frogMarkup(p));
      cell.addEventListener('click',onCellClick);boardEl.appendChild(cell);
    }
    const a=state.turn==='angel';
    turnBadge.textContent=a?'天使軍の手番':(state.cpuThinking?'悪魔軍 CPU 思考中…':'悪魔軍 CPU の手番');
    turnBadge.className=`turn-badge ${a?'angel':'demon'}`;
    moveCountEl.textContent=`${state.moves}手`; updateRosterSummary();
  }

  function showSelected(p){
    const panel=$('selectedPanel');
    if(!p){
      panel.classList.add('empty');
      $('selectedSide').textContent='駒を選択';
      $('selectedName').textContent='キャラクター情報';
      $('selectedRole').textContent='役割と技をここに表示します';
      $('selectedHp').textContent='HP —';
      $('selectedMoves').innerHTML='<span class="move-chip muted">自軍の駒をタップしてください</span>';
      $('selectedFrog').style.setProperty('--profile-body','#4fbd55');
      return;
    }
    panel.classList.remove('empty');
    const pal=PALETTE[p.name]||{body:'#4fbd55'};
    $('selectedFrog').style.setProperty('--profile-body',pal.body);
    $('selectedFrog').style.setProperty('--profile-eye',pal.eye||'#132127');
    $('selectedSide').textContent=p.side==='angel'?'天使軍':'悪魔軍';
    $('selectedName').textContent=p.name;
    $('selectedRole').textContent=`役割：${LABEL[p.type].replace(/ ×\d+/,'')}`;
    $('selectedHp').textContent=`役割HP ${ROLE_HP[p.type]}%`;
    const moves=MOVES[p.name]||['技データ未設定'];
    $('selectedMoves').innerHTML=moves.map(v=>`<span class="move-chip">${v}</span>`).join('');
  }

  function onCellClick(e){
    if(state.gameOver || state.pendingBattle || state.cpuThinking || state.turn==='demon')return;
    const r=+e.currentTarget.dataset.r,c=+e.currentTarget.dataset.c,p=state.board[r][c];
    if(state.selected){
      const m=state.legal.find(x=>x.r===r&&x.c===c);
      if(m)return attemptMove(state.selected.r,state.selected.c,r,c);
    }
    if(p&&p.side===state.turn){
      state.selected={r,c};state.legal=getLegalMoves(r,c);showSelected(p);
      statusText.textContent=`${p.name}（${K[p.type]}）を選択中。${state.legal.length}マスへ移動できます。`;
    }else{
      state.selected=null;state.legal=[];showSelected(p||null);
      statusText.textContent=p?'相手の駒です。自軍の駒を選んでください。':'自軍の駒を選んでください。';
    }
    render();
  }

  function attemptMove(fr,fc,tr,tc){
    const a=state.board[fr][fc],d=state.board[tr][tc];
    if(d){state.pendingBattle={fr,fc,tr,tc,attacker:a,defender:d};openBattle(state.pendingBattle);}
    else{const moved=(a.type==='pawn'&&inPromotionZone(a.side,tr))?promotePawn(a):a;state.board[tr][tc]=moved;state.board[fr][fc]=null;finishTurn(`${a.name}が移動しました。${moved.type==='tokin'?` ${moved.name}（と）に成りました！`:''}`);}
  }

  function saveBattleSnapshot(){
    try{
      state.cpuThinking=false;
      sessionStorage.setItem('pondShogiSnapshot',JSON.stringify({state,assignments}));
    }catch(e){console.warn('盤面保存に失敗',e);}
  }

  function openBattle(b){
    const terrain=lotusSet.has(`${b.tr},${b.tc}`)?'lotus':'water';
    const aHp=ROLE_HP[b.attacker.type];
    const dRoleHp=ROLE_HP[b.defender.type];
    const dStart=Math.max(1,Math.round(dRoleHp/3));
    const playerRole=b.attacker.side==='angel'?'attacker':'defender';
    const context={
      source:'pond-shogi-v0.6',
      attacker:b.attacker.name,
      defender:b.defender.name,
      attackerType:b.attacker.name,
      defenderType:b.defender.name,
      attackerHp:aHp,
      defenderHp:dStart,
      playerRole,
      terrain,
      node:`${b.fr},${b.fc}->${b.tr},${b.tc}`,
      returnUrl:'./index.html'
    };
    try{
      sessionStorage.removeItem('mixBattleResult');
      sessionStorage.setItem('mixBattle',JSON.stringify(context));
      saveBattleSnapshot();
    }catch(e){
      statusText.textContent='戦闘データの保存に失敗しました。';
      state.pendingBattle=null;
      render();
      return;
    }
    statusText.textContent=`${terrain==='lotus'?'蓮の葉ジャンプ':'水中'}バトルへ移動します…`;
    render();
    const battlePage=terrain==='lotus'?'./jump-battle.html':'./water-battle.html';
    location.href=`${battlePage}?mix=1&battle=1`;
  }

  function loadSavedBattle(){
    let snap=null,result=null;
    try{
      snap=JSON.parse(sessionStorage.getItem('pondShogiSnapshot')||'null');
      result=JSON.parse(sessionStorage.getItem('mixBattleResult')||'null');
    }catch(e){}
    if(!snap)return false;
    if(snap.assignments)assignments=snap.assignments;
    if(snap.state){
      state=snap.state;
      state.cpuThinking=false;
    }
    if(!result || !state || !state.pendingBattle)return true;

    const b=state.pendingBattle;
    state.pendingBattle=null;
    try{
      sessionStorage.removeItem('mixBattleResult');
      sessionStorage.removeItem('pondShogiSnapshot');
    }catch(e){}

    if(result.winner==='attacker'){
      const moved=(b.attacker.type==='pawn'&&inPromotionZone(b.attacker.side,b.tr))?promotePawn(b.attacker):b.attacker;
      state.board[b.tr][b.tc]=moved;
      state.board[b.fr][b.fc]=null;
      if(b.defender.type==='king'){
        setTimeout(()=>endGame(b.attacker.side,b.defender),0);
      }else{
        const terrainName=lotusSet.has(`${b.tr},${b.tc}`)?'蓮の葉':'水中';
        setTimeout(()=>finishTurn(`${terrainName}戦：${b.attacker.name}が${b.defender.name}を撃破。駒取り成立。${moved.type==='tokin'?` ${moved.name}（と）に成りました！`:''}`),0);
      }
    }else{
      const terrainName=lotusSet.has(`${b.tr},${b.tc}`)?'蓮の葉':'水中';
      setTimeout(()=>finishTurn(`${terrainName}戦：${b.defender.name}が防衛成功。攻撃を阻止しました。`),0);
    }
    return true;
  }

  // v0.6以降は実戦へ接続するため、旧・手動勝敗ボタンは通常使わない。
  $('attackerWins').onclick=()=>{};
  $('defenderWins').onclick=()=>{};
  $('cancelBattle').onclick=()=>{};

  function endGame(winnerSide, defeatedKing){
    state.gameOver=true;
    state.cpuThinking=false;
    state.selected=null;
    state.legal=[];
    showSelected(null);
    const winner=winnerSide==='angel'?'天使軍':'悪魔軍';
    statusText.textContent=`${defeatedKing.name}（王）が倒されました。${winner}の勝利！`;
    turnBadge.textContent=`${winner} 勝利`;
    turnBadge.className=`turn-badge ${winnerSide}`;
    render();
    // render() が手番表示を上書きするため、最後に勝利表示を固定
    turnBadge.textContent=`${winner} 勝利`;
  }

  function finishTurn(msg){
    state.selected=null;state.legal=[];state.moves++;
    state.turn=state.turn==='angel'?'demon':'angel';
    showSelected(null);statusText.textContent=msg;render();
    if(state.turn==='demon' && !state.pendingBattle) scheduleCpuMove();
  }

  const PIECE_VALUE={king:10000,rook:900,bishop:800,gold:600,silver:520,knight:360,lance:320,pawn:120,tokin:600};

  function scheduleCpuMove(){
    if(state.gameOver || state.cpuThinking || state.pendingBattle || state.turn!=='demon')return;
    state.cpuThinking=true;
    turnBadge.textContent='悪魔軍 CPU 思考中…';
    statusText.textContent='悪魔軍が次の一手を考えています。';
    setTimeout(cpuMove,650);
  }

  function cpuMove(){
    if(state.gameOver || state.turn!=='demon' || state.pendingBattle){state.cpuThinking=false;return;}
    const choices=[];
    for(let r=0;r<9;r++)for(let c=0;c<9;c++){
      const p=state.board[r][c];
      if(!p || p.side!=='demon')continue;
      for(const m of getLegalMoves(r,c)){
        const target=state.board[m.r][m.c];
        let score=Math.random()*35;
        if(target){
          score+=PIECE_VALUE[target.type]||0;
          score-=Math.max(0,(PIECE_VALUE[p.type]||0)-(PIECE_VALUE[target.type]||0))*.08;
        }
        // 少しだけ前進・中央進出を好む。完全ランダムより将棋らしくするための軽い評価。
        score += m.r*7;
        score += (4-Math.abs(4-m.c))*4;
        if(p.type==='king' && !target)score-=70;
        choices.push({fr:r,fc:c,tr:m.r,tc:m.c,score});
      }
    }
    state.cpuThinking=false;
    if(!choices.length){
      state.turn='angel';
      statusText.textContent='悪魔軍は動かせる駒がありません。天使軍の手番です。';
      render();
      return;
    }
    choices.sort((a,b)=>b.score-a.score);
    // 上位候補から少し揺らして毎回同じ手になりすぎないようにする
    const pool=choices.slice(0,Math.min(4,choices.length));
    const pick=pool[Math.floor(Math.random()*pool.length)];
    const p=state.board[pick.fr][pick.fc];
    statusText.textContent=`CPU：${p.name}（${K[p.type]}）が動きます。`;
    render();
    setTimeout(()=>attemptMove(pick.fr,pick.fc,pick.tr,pick.tc),280);
  }

  function getLegalMoves(r,c){
    const p=state.board[r][c];if(!p)return[];const f=p.side==='angel'?-1:1,out=[];
    const step=(dr,dc)=>add(r+dr,c+dc,p,out),ray=(dr,dc)=>{let rr=r+dr,cc=c+dc;while(inB(rr,cc)){const t=state.board[rr][cc];if(!t)out.push({r:rr,c:cc,capture:false});else{if(t.side!==p.side)out.push({r:rr,c:cc,capture:true});break;}rr+=dr;cc+=dc;}};
    switch(p.type){
      case'king':[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]].forEach(d=>step(...d));break;
      case'gold':case'tokin':[[f,-1],[f,0],[f,1],[0,-1],[0,1],[-f,0]].forEach(d=>step(...d));break;
      case'silver':[[f,-1],[f,0],[f,1],[-f,-1],[-f,1]].forEach(d=>step(...d));break;
      case'knight':[[2*f,-1],[2*f,1]].forEach(d=>step(...d));break;
      case'lance':ray(f,0);break;
      case'rook':[[-1,0],[1,0],[0,-1],[0,1]].forEach(d=>ray(...d));break;
      case'bishop':[[-1,-1],[-1,1],[1,-1],[1,1]].forEach(d=>ray(...d));break;
      case'pawn':step(f,0);
    }
    return out;
  }
  function add(r,c,p,out){if(!inB(r,c))return;const t=state.board[r][c];if(!t)out.push({r,c,capture:false});else if(t.side!==p.side)out.push({r,c,capture:true});}
  const inB=(r,c)=>r>=0&&r<9&&c>=0&&c<9;

  function buildEditor(){
    ['angel','demon'].forEach(side=>{const host=$(`${side}Editor`);host.innerHTML='';
      TYPES.forEach(type=>{const row=document.createElement('label');row.className='assign-row';row.innerHTML=`<span><b>${K[type]}</b><small>${LABEL[type]}</small></span>`;
        if(type==='pawn'){const fixed=document.createElement('div');fixed.className='fixed-assignment';fixed.textContent='モブさん（固定）';row.appendChild(fixed);}
        else{const sel=document.createElement('select');sel.dataset.side=side;sel.dataset.type=type;CHARACTERS[side].forEach(n=>{const o=document.createElement('option');o.value=n;o.textContent=n;sel.appendChild(o);});sel.value=assignments[side][type];sel.onchange=()=>validateAndApplyEditor();row.appendChild(sel);}host.appendChild(row);});
      const row=document.createElement('label');row.className='assign-row promoted-row';row.innerHTML='<span><b>と</b><small>成り後</small></span>';const sel=document.createElement('select');sel.dataset.side=side;sel.dataset.type='tokin';CHARACTERS[side].forEach(n=>{const o=document.createElement('option');o.value=n;o.textContent=n;sel.appendChild(o);});sel.value=assignments[side].tokin||RECOMMENDED[side].tokin;sel.onchange=()=>validateAndApplyEditor();row.appendChild(sel);host.appendChild(row);
    });
  }
  function validateAndApplyEditor(){
    const next={angel:{pawn:'モブさん'},demon:{pawn:'モブさん'}};let ok=true;
    ['angel','demon'].forEach(side=>{const used=new Set();document.querySelectorAll(`select[data-side="${side}"]`).forEach(sel=>{next[side][sel.dataset.type]=sel.value;if(sel.dataset.type!=='tokin'){if(used.has(sel.value))ok=false;used.add(sel.value);}});});
    $('editorWarning').hidden=ok;$('applyBtn').disabled=!ok;if(!ok)return;assignments=next;
  }
  function updateRosterSummary(){['angel','demon'].forEach(side=>{$(`${side}Roster`).textContent=TYPES.map(t=>`${K[t]} ${t==='pawn'?'モブさん':assignments[side][t]}`).concat([`と ${assignments[side].tokin}`]).join(' / ');});}
  $('recommendedBtn').onclick=()=>{assignments=JSON.parse(JSON.stringify(RECOMMENDED));buildEditor();$('editorWarning').hidden=true;$('applyBtn').disabled=false;};
  $('applyBtn').onclick=()=>{validateAndApplyEditor();if(!$('editorWarning').hidden)return;state=initialState();showSelected(null);statusText.textContent='編成を適用しました。天使軍はプレイヤー、悪魔軍はCPUです。';render();$('setupPanel').open=false;};
  $('resetBtn').onclick=()=>{if(confirm('現在の編成のまま盤面を初期状態に戻しますか？')){state=initialState();showSelected(null);statusText.textContent='盤面をリセットしました。天使軍から開始します。';render();}};

  const restored=loadSavedBattle();
  if(restored && state && state.pendingBattle){
    let hasResult=false,hasBattle=false;
    try{
      hasResult=!!sessionStorage.getItem('mixBattleResult');
      hasBattle=!!sessionStorage.getItem('mixBattle');
    }catch(e){}
    if(!hasResult && !hasBattle){
      state.pendingBattle=null;
      statusText.textContent='戦闘が中断されたため、盤面に戻りました。';
    }
  }
  if(!restored)state=initialState();
  buildEditor();showSelected(null);render();
})();
