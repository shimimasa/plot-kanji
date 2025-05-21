// src/gameState.js
//
// すべての一時データを 1 か所に集約し、他モジュールは「読む／書く」だけ。
// これ以上の入れ子は作らず、必要に応じてプロパティを追加していく方針。
export const battleState = {
  turn: 'player', // 'player' または 'enemy'
  inputEnabled: true,
  message: '',
  comboCount: 0
};


export const gameState = {
    /* 画面遷移 ------------------------------------------------------------- */
            // 'title' | 'menu' | 'battle' | 'stageClear' ...
    currentStageId: null,
  
    /* プレイヤー ----------------------------------------------------------- */
    playerName: '',
    playerStats: {
      hp: 100, maxHp: 100,
      level: 1, exp: 0,
      attack: 10,
      healCount: 3,
      nextLevelExp: 100,
    },
  
    /* バトル --------------------------------------------------------------- */
    enemies: [],                   // ステージ開始時にセット
    currentEnemyIndex: 0,
    currentEnemy: null,            // enemies[currentEnemyIndex]
  
    kanjiPool: [],                 // ステージ開始時にセット
    currentKanji: { text: '', readings: [], meaning: '' },
    showHint: false,
  };
  
  export function updatePlayerStats(changes) {
    Object.assign(gameState.playerStats, changes);
  }
  
  export function setCurrentEnemy(enemy) {
    gameState.currentEnemy = enemy;
  }
  
  export function addPlayerExp(exp) {
    gameState.playerStats.exp += exp;
    
    // レベルアップ判定も一元化
    checkLevelUp();
  }

  function checkLevelUp() {
  if (gameState.playerStats.exp >= gameState.playerStats.nextLevelExp) {
    gameState.playerStats.level++;
    gameState.playerStats.maxHp += 10;
    gameState.playerStats.hp = gameState.playerStats.maxHp;
    gameState.playerStats.exp -= gameState.playerStats.nextLevelExp;
    gameState.playerStats.nextLevelExp = calculateNextLevelExp(gameState.playerStats.level);
    
    // レベルアップイベントを発火することも可能
    // dispatchEvent(new CustomEvent('levelup', { detail: { level: gameState.playerStats.level } }));
    
    return true;
  }
  return false;
}

  /* ---- 🔧 ラッパ関数（必要最低限だけ用意） ----------------------------- */
  
  export function updatePlayerName(newName) {
    gameState.playerName = newName.trim();
  }
  
  export function resetStageProgress(stageId) {
    gameState.currentStageId     = stageId;
    gameState.currentEnemyIndex  = 0;
    gameState.currentEnemy       = null;
    gameState.enemies            = [];
    gameState.kanjiPool          = [];
  }
  
  // nextLevelExpを計算するヘルパー関数（GDDのテーブルに基づく）
// gameState.jsなどに移しても良い
function calculateNextLevelExp(level) {
  if (level === 1) return 100; // Lv1→Lv2
  if (level === 2) return 180; // Lv2→Lv3
  if (level === 3) return 280; // Lv3→Lv4
  // GDDで定義したテーブルに基づき、以降も追加
  return (level * 100) + Math.pow(level, 2) * 20; // 仮の計算式 (より急なカーブ)
}