(() => {
  const BOARD_SIZE=9, TYPES=['king','rook','bishop','gold','silver','knight','lance','pawn'];
  const K={king:'王',rook:'飛',bishop:'角',gold:'金',silver:'銀',knight:'桂',lance:'香',pawn:'歩'};
  const LABEL={king:'王／玉',rook:'飛車',bishop:'角行',gold:'金将 ×2',silver:'銀将 ×2',knight:'桂馬 ×2',lance:'香車 ×2',pawn:'歩兵 ×9'};
  // 大幅弱体化はしない。戦闘接続後に実戦で再調整する仮値。
  const ROLE_HP={king:100,rook:100,bishop:100,gold:100,silver:100,knight:98,lance:98,pawn:95};

  const CHARACTERS={
    angel:['セラフィエル','ジィハル','ラファエル','ウリエル','ミカエル','ガブリエル','レミエル','カワズさん'],
    demon:['サタナエル','フラウロス','ベルゼブブ','サマエル','ルシファー','リリス','サリエル','コカビエル']
  };
  const RECOMMENDED={
    angel:{king:'セラフィエル',rook:'ジィハル',bishop:'ラファエル',gold:'ウリエル',silver:'ミカエル',knight:'ガブリエル',lance:'レミエル',pawn:'カワズさん'},
    demon:{king:'サタナエル',rook:'フラウロス',bishop:'ベルゼブブ',gold:'サマエル',silver:'ルシファー',knight:'リリス',lance:'サリエル',pawn:'コカビエル'}
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
    'カワズさん':{body:'#4fbd55',limb:'#388f3e'}
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
    'カワズさん':['ファントムラッシュ','水圧ラッシュ','ミラージュキック','スピンキックカッター','方向キー1回転＋舌（隠し）']
  };

  const LOTUS=[[0,0],[0,2],[0,4],[0,6],[0,8],[1,1],[1,3],[1,5],[1,7],[2,0],[2,4],[2,8],[3,2],[3,6],[4,0],[4,4],[4,8],[5,2],[5,6],[6,0],[6,4],[6,8],[7,1],[7,3],[7,5],[7,7],[8,0],[8,2],[8,4],[8,6],[8,8]];
  const lotusSet=new Set(LOTUS.map(x=>x.join(',')));
  const $=id=>document.getElementById(id), boardEl=$('board'), statusText=$('statusText'), turnBadge=$('turnBadge'), moveCountEl=$('moveCount'), modal=$('battleModal');
  let assignments=JSON.parse(JSON.stringify(RECOMMENDED)), state;
  const emptyBoard=()=>Array.from({length:9},()=>Array(9).fill(null));
  const piece=(side,type)=>({side,type,name:assignments[side][type]});

  function initialState(){
    const b=emptyBoard();
    const back=['lance','knight','silver','gold','king','gold','silver','knight','lance'];
    back.forEach((t,c)=>b[0][c]=piece('demon',t)); b[1][1]=piece('demon','rook'); b[1][7]=piece('demon','bishop'); for(let c=0;c<9;c++)b[2][c]=piece('demon','pawn');
    back.forEach((t,c)=>b[8][c]=piece('angel',t)); b[7][1]=piece('angel','bishop'); b[7][7]=piece('angel','rook'); for(let c=0;c<9;c++)b[6][c]=piece('angel','pawn');
    return {board:b,turn:'angel',selected:null,legal:[],moves:0,pendingBattle:null};
  }

  function frogMarkup(p){
    const pal=PALETTE[p.name]||{body:'#4fbd55',limb:'#388f3e'};
    const scale=p.type==='pawn'?.94:1;
    return `<div class="piece ${p.side}" style="--frog-scale:${scale};--frog-body:${pal.body};--frog-limb:${pal.limb}">
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
    for(let r=0;r<9;r++)for(let c=0;c<9;c++){
      const cell=document.createElement('button'); cell.type='button'; cell.className=`cell ${lotusSet.has(`${r},${c}`)?'lotus':'water'}`; cell.style.setProperty('--leaf-rot',`${((r*17+c*29)%70)-35}deg`); cell.dataset.r=r;cell.dataset.c=c;
      const legal=state.legal.find(m=>m.r===r&&m.c===c); if(state.selected&&state.selected.r===r&&state.selected.c===c)cell.classList.add('selected'); if(legal)cell.classList.add(legal.capture?'capture':'legal');
      const marker=document.createElement('span');marker.className='move-dot';cell.appendChild(marker); const p=state.board[r][c];
      if(p)cell.insertAdjacentHTML('beforeend',frogMarkup(p));
      cell.addEventListener('click',onCellClick);boardEl.appendChild(cell);
    }
    const a=state.turn==='angel';turnBadge.textContent=a?'天使軍の手番':'悪魔軍の手番';turnBadge.className=`turn-badge ${a?'angel':'demon'}`;moveCountEl.textContent=`${state.moves}手`; updateRosterSummary();
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
    $('selectedSide').textContent=p.side==='angel'?'天使軍':'悪魔軍';
    $('selectedName').textContent=p.name;
    $('selectedRole').textContent=`役割：${LABEL[p.type].replace(/ ×\d+/,'')}`;
    $('selectedHp').textContent=`役割HP ${ROLE_HP[p.type]}%`;
    const moves=MOVES[p.name]||['技データ未設定'];
    $('selectedMoves').innerHTML=moves.map(v=>`<span class="move-chip">${v}</span>`).join('');
  }

  function onCellClick(e){
    if(state.pendingBattle)return;
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
    else{state.board[tr][tc]=a;state.board[fr][fc]=null;finishTurn(`${a.name}が移動しました。`);}
  }

  function openBattle(b){
    const terrain=lotusSet.has(`${b.tr},${b.tc}`)?'lotus':'water';
    $('attackerName').textContent=`${b.attacker.name}（${K[b.attacker.type]}）`;
    $('defenderName').textContent=`${b.defender.name}（${K[b.defender.type]}）`;
    const aHp=ROLE_HP[b.attacker.type], dRoleHp=ROLE_HP[b.defender.type], dStart=Math.round(dRoleHp/3);
    $('attackerHp').textContent=`HP ${aHp}%（役割補正）`;
    $('defenderHp').textContent=`HP 約${dStart}%（役割HPの1/3）`;
    $('terrainPill').textContent=terrain==='lotus'?'蓮の葉ジャンプバトル':'水中バトル';
    $('terrainPill').className=`terrain-pill ${terrain==='lotus'?'lotus':''}`;
    $('battleHint').textContent='戦闘はまだ未接続です。攻撃側勝利なら駒取り成立、防御成功なら両駒が元の位置に残ります。';
    modal.hidden=false;
  }

  $('attackerWins').onclick=()=>{const b=state.pendingBattle;if(!b)return;state.board[b.tr][b.tc]=b.attacker;state.board[b.fr][b.fc]=null;modal.hidden=true;state.pendingBattle=null;finishTurn(`${b.attacker.name}が${b.defender.name}を撃破。駒取り成立。`);};
  $('defenderWins').onclick=()=>{const b=state.pendingBattle;if(!b)return;modal.hidden=true;state.pendingBattle=null;finishTurn(`${b.defender.name}が防衛成功。攻撃は阻止されました。`);};
  $('cancelBattle').onclick=()=>{modal.hidden=true;state.pendingBattle=null;state.selected=null;state.legal=[];showSelected(null);statusText.textContent='戦闘をキャンセルしました。';render();};

  function finishTurn(msg){state.selected=null;state.legal=[];state.moves++;state.turn=state.turn==='angel'?'demon':'angel';showSelected(null);statusText.textContent=msg;render();}

  function getLegalMoves(r,c){
    const p=state.board[r][c];if(!p)return[];const f=p.side==='angel'?-1:1,out=[];
    const step=(dr,dc)=>add(r+dr,c+dc,p,out),ray=(dr,dc)=>{let rr=r+dr,cc=c+dc;while(inB(rr,cc)){const t=state.board[rr][cc];if(!t)out.push({r:rr,c:cc,capture:false});else{if(t.side!==p.side)out.push({r:rr,c:cc,capture:true});break;}rr+=dr;cc+=dc;}};
    switch(p.type){
      case'king':[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]].forEach(d=>step(...d));break;
      case'gold':[[f,-1],[f,0],[f,1],[0,-1],[0,1],[-f,0]].forEach(d=>step(...d));break;
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
    ['angel','demon'].forEach(side=>{
      const host=$(`${side}Editor`);host.innerHTML='';
      TYPES.forEach(type=>{
        const row=document.createElement('label');row.className='assign-row';row.innerHTML=`<span><b>${K[type]}</b><small>${LABEL[type]}</small></span>`;
        const sel=document.createElement('select');sel.dataset.side=side;sel.dataset.type=type;
        CHARACTERS[side].forEach(n=>{const o=document.createElement('option');o.value=n;o.textContent=n;sel.appendChild(o);});
        sel.value=assignments[side][type];sel.onchange=()=>validateAndApplyEditor();row.appendChild(sel);host.appendChild(row);
      });
    });
  }
  function validateAndApplyEditor(){
    const next={angel:{},demon:{}};let ok=true;
    ['angel','demon'].forEach(side=>{
      const used=new Set();
      document.querySelectorAll(`select[data-side="${side}"]`).forEach(sel=>{next[side][sel.dataset.type]=sel.value;if(used.has(sel.value))ok=false;used.add(sel.value);});
    });
    $('editorWarning').hidden=ok;$('applyBtn').disabled=!ok;if(!ok)return;assignments=next;
  }
  function updateRosterSummary(){['angel','demon'].forEach(side=>{$(`${side}Roster`).textContent=TYPES.map(t=>`${K[t]} ${assignments[side][t]}`).join(' / ');});}
  $('recommendedBtn').onclick=()=>{assignments=JSON.parse(JSON.stringify(RECOMMENDED));buildEditor();$('editorWarning').hidden=true;$('applyBtn').disabled=false;};
  $('applyBtn').onclick=()=>{validateAndApplyEditor();if(!$('editorWarning').hidden)return;state=initialState();showSelected(null);statusText.textContent='編成を適用して盤面を初期化しました。';render();$('setupPanel').open=false;};
  $('resetBtn').onclick=()=>{if(confirm('現在の編成のまま盤面を初期状態に戻しますか？')){state=initialState();showSelected(null);statusText.textContent='盤面をリセットしました。';render();}};

  buildEditor();state=initialState();showSelected(null);render();
})();
