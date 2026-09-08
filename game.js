(() => {
  const BOARD_SIZE = 9;
  const boardEl = document.getElementById('board');
  const statusText = document.getElementById('statusText');
  const turnBadge = document.getElementById('turnBadge');
  const moveCountEl = document.getElementById('moveCount');
  const resetBtn = document.getElementById('resetBtn');
  const modal = document.getElementById('battleModal');
  const attackerName = document.getElementById('attackerName');
  const defenderName = document.getElementById('defenderName');
  const terrainPill = document.getElementById('terrainPill');
  const battleHint = document.getElementById('battleHint');

  const TYPE_KANJI = { king:'王', rook:'飛', bishop:'角', gold:'金', silver:'銀', knight:'桂', lance:'香', pawn:'歩' };

  const ROSTER = {
    angel: {
      king:'セラフィエル', rook:'ジィハル', bishop:'ラファエル', gold:'ウリエル',
      silver:'ミカエル', knight:'ガブリエル', lance:'レミエル', pawn:'天使兵'
    },
    demon: {
      king:'サタナエル', rook:'フラウロス', bishop:'ベルゼブブ', gold:'サマエル',
      silver:'ルシファー', knight:'リリス', lance:'サリエル', pawn:'悪魔兵'
    }
  };

  // 盤の地形。true = 蓮の葉、false = 水中。
  // 左右対称寄りにしつつ、中央は水中戦が起きやすい配置。
  const LOTUS = [
    [0,0],[0,2],[0,4],[0,6],[0,8],
    [1,1],[1,3],[1,5],[1,7],
    [2,0],[2,4],[2,8],
    [3,2],[3,6],
    [4,0],[4,4],[4,8],
    [5,2],[5,6],
    [6,0],[6,4],[6,8],
    [7,1],[7,3],[7,5],[7,7],
    [8,0],[8,2],[8,4],[8,6],[8,8]
  ];
  const lotusSet = new Set(LOTUS.map(([r,c]) => `${r},${c}`));

  let state;

  function emptyBoard(){ return Array.from({length:BOARD_SIZE}, () => Array(BOARD_SIZE).fill(null)); }
  function piece(side,type){ return {side,type,name:ROSTER[side][type]}; }

  function initialState(){
    const b = emptyBoard();
    // カスタム「7ネームド + 9モブ歩」編成。角2つは空けて見通しを確保。
    const back = ['lance','knight','silver','king','gold','bishop','rook'];
    const cols = [1,2,3,4,5,6,7];
    back.forEach((t,i) => b[0][cols[i]] = piece('demon',t));
    for(let c=0;c<9;c++) b[2][c] = piece('demon','pawn');

    const angelBack = ['rook','bishop','gold','king','silver','knight','lance'];
    angelBack.forEach((t,i) => b[8][cols[i]] = piece('angel',t));
    for(let c=0;c<9;c++) b[6][c] = piece('angel','pawn');

    return { board:b, turn:'angel', selected:null, legal:[], moves:0, pendingBattle:null };
  }

  function render(){
    boardEl.innerHTML='';
    for(let r=0;r<9;r++){
      for(let c=0;c<9;c++){
        const cell=document.createElement('button');
        cell.type='button';
        cell.className=`cell ${lotusSet.has(`${r},${c}`)?'lotus':'water'}`;
        cell.style.setProperty('--leaf-rot', `${((r*17+c*29)%70)-35}deg`);
        cell.dataset.r=r; cell.dataset.c=c;
        cell.setAttribute('role','gridcell');
        const isSelected = state.selected && state.selected.r===r && state.selected.c===c;
        const legal = state.legal.find(m => m.r===r && m.c===c);
        if(isSelected) cell.classList.add('selected');
        if(legal){ cell.classList.add(legal.capture?'capture':'legal'); }
        const marker=document.createElement('span'); marker.className='move-dot'; cell.appendChild(marker);
        const p=state.board[r][c];
        if(p){
          const el=document.createElement('div');
          el.className=`piece ${p.side}${p.type==='pawn'?' mob':''}`;
          el.innerHTML=`<span class="piece-kanji">${TYPE_KANJI[p.type]}</span><span class="piece-name">${p.name}</span>`;
          cell.appendChild(el);
          cell.setAttribute('aria-label',`${p.side==='angel'?'天使軍':'悪魔軍'} ${p.name} ${TYPE_KANJI[p.type]}`);
        } else cell.setAttribute('aria-label',`${r+1}行${c+1}列 空き`);
        cell.addEventListener('click', onCellClick);
        boardEl.appendChild(cell);
      }
    }
    const angelTurn = state.turn==='angel';
    turnBadge.textContent = angelTurn ? '天使軍の手番' : '悪魔軍の手番';
    turnBadge.className = `turn-badge ${angelTurn?'angel':'demon'}`;
    moveCountEl.textContent = `${state.moves}手`;
  }

  function onCellClick(e){
    if(state.pendingBattle) return;
    const r=Number(e.currentTarget.dataset.r), c=Number(e.currentTarget.dataset.c);
    const p=state.board[r][c];

    if(state.selected){
      const move=state.legal.find(m=>m.r===r && m.c===c);
      if(move){ attemptMove(state.selected.r,state.selected.c,r,c); return; }
    }

    if(p && p.side===state.turn){
      state.selected={r,c};
      state.legal=getLegalMoves(r,c);
      statusText.textContent=`${p.name}（${TYPE_KANJI[p.type]}）を選択中。${state.legal.length}マスへ移動できます。`;
    } else {
      state.selected=null; state.legal=[];
      statusText.textContent='自軍の駒を選んでください。';
    }
    render();
  }

  function attemptMove(fr,fc,tr,tc){
    const attacker=state.board[fr][fc], defender=state.board[tr][tc];
    if(defender){
      state.pendingBattle={fr,fc,tr,tc,attacker,defender};
      openBattle(state.pendingBattle);
    } else {
      state.board[tr][tc]=attacker; state.board[fr][fc]=null;
      finishTurn(`${attacker.name}が移動しました。`);
    }
  }

  function openBattle(b){
    const terrain = lotusSet.has(`${b.tr},${b.tc}`) ? 'lotus' : 'water';
    attackerName.textContent=`${b.attacker.name}（${TYPE_KANJI[b.attacker.type]}）`;
    defenderName.textContent=`${b.defender.name}（${TYPE_KANJI[b.defender.type]}）`;
    terrainPill.textContent=terrain==='lotus'?'蓮の葉ジャンプバトル':'水中バトル';
    terrainPill.className=`terrain-pill ${terrain==='lotus'?'lotus':''}`;
    battleHint.textContent='今回は戦闘未接続のため、結果を手動で選びます。攻撃側勝利なら通常の駒取り、防御成功なら両駒とも元の位置に残ります。';
    modal.hidden=false;
  }

  document.getElementById('attackerWins').addEventListener('click',()=>{
    const b=state.pendingBattle; if(!b)return;
    state.board[b.tr][b.tc]=b.attacker; state.board[b.fr][b.fc]=null;
    modal.hidden=true; state.pendingBattle=null;
    finishTurn(`${b.attacker.name}が${b.defender.name}を撃破。駒取り成立。`);
  });

  document.getElementById('defenderWins').addEventListener('click',()=>{
    const b=state.pendingBattle; if(!b)return;
    modal.hidden=true; state.pendingBattle=null;
    finishTurn(`${b.defender.name}が防衛成功。攻撃は阻止されました。`);
  });

  document.getElementById('cancelBattle').addEventListener('click',()=>{
    modal.hidden=true; state.pendingBattle=null; state.selected=null; state.legal=[];
    statusText.textContent='戦闘をキャンセルしました。'; render();
  });

  function finishTurn(message){
    state.selected=null; state.legal=[]; state.moves++;
    state.turn=state.turn==='angel'?'demon':'angel';
    statusText.textContent=message; render();
  }

  function getLegalMoves(r,c){
    const p=state.board[r][c]; if(!p)return[];
    const forward=p.side==='angel'?-1:1;
    const out=[];
    const step=(dr,dc)=>addIfValid(r+dr,c+dc,p,out);
    const ray=(dr,dc)=>{
      let rr=r+dr, cc=c+dc;
      while(inBounds(rr,cc)){
        const target=state.board[rr][cc];
        if(!target){out.push({r:rr,c:cc,capture:false});}
        else {if(target.side!==p.side) out.push({r:rr,c:cc,capture:true}); break;}
        rr+=dr; cc+=dc;
      }
    };

    switch(p.type){
      case 'king': [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]].forEach(d=>step(...d)); break;
      case 'gold': [[forward,-1],[forward,0],[forward,1],[0,-1],[0,1],[-forward,0]].forEach(d=>step(...d)); break;
      case 'silver': [[forward,-1],[forward,0],[forward,1],[-forward,-1],[-forward,1]].forEach(d=>step(...d)); break;
      case 'knight': [[2*forward,-1],[2*forward,1]].forEach(d=>step(...d)); break;
      case 'lance': ray(forward,0); break;
      case 'rook': [[-1,0],[1,0],[0,-1],[0,1]].forEach(d=>ray(...d)); break;
      case 'bishop': [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(d=>ray(...d)); break;
      case 'pawn': step(forward,0); break;
    }
    return out;
  }

  function addIfValid(r,c,p,out){
    if(!inBounds(r,c))return;
    const target=state.board[r][c];
    if(!target) out.push({r,c,capture:false});
    else if(target.side!==p.side) out.push({r,c,capture:true});
  }
  const inBounds=(r,c)=>r>=0&&r<9&&c>=0&&c<9;

  resetBtn.addEventListener('click',()=>{
    if(confirm('盤面を初期状態に戻しますか？')){state=initialState(); statusText.textContent='盤面をリセットしました。'; render();}
  });

  state=initialState();
  render();
})();
