// battleScreen.js  ★全文貼り替え推奨
import { gameState, battleState } from './gameState.js'; // battleState を追加
import { drawButton, isMouseOverRect } from './uiRenderer.js';
import { loadEnemyImage } from './assetsLoader.js';
import { getEnemiesByStageId, getKanjiByStageId } from './dataLoader.js';
import { audio } from './audio.js';   // 追加
import { changeScreen, getCurrentScreen } from './screenManager.js'; // getCurrentScreen を追加
const BTN = {
  attack: { x: 250, y: 400, w: 100, h: 50, label: 'こうげき' },
  heal:   { x: 370, y: 400, w: 100, h: 50, label: 'かいふく' },
  hint:   { x: 490, y: 400, w: 100, h: 50, label: 'ヒント' },
};


let canvas, ctx, inputEl, victoryCallback = null;

export async function init(canvasEl, onVictory) {
  if (!gameState.currentStageId) {
    alert('ステージIDが未設定です。タイトルに戻ります。');
    changeScreen('title');
    return;
  }
  console.log("🧪 battleScreen.init() 実行");
  console.log("🔍 現在の stageId:", gameState.currentStageId);
  const stageId = gameState.currentStageId;

  canvas = canvasEl;
  victoryCallback = onVictory;   // ← 受け取って保持
  ctx     = canvas.getContext('2d');
  inputEl = document.getElementById('kanjiInput');          // ← DOM はここで確実に

  // ---------- ステージデータ ----------
  gameState.enemies = getEnemiesByStageId(gameState.currentStageId);
  gameState.kanjiPool = getKanjiByStageId(gameState.currentStageId);
  console.log("📦 漢字数:", gameState.kanjiPool.length);
  console.log("📦 敵数:", gameState.enemies.length);
  if (!gameState.kanjiPool.length) {
        alert('このステージに紐づく漢字データがありません。\nステージ選択へ戻ります。');
        changeScreen('stageSelect');
        return;
      }
  gameState.currentEnemyIndex = 0;

  // ---------- 敵画像プリロード ----------
  for (const e of gameState.enemies) {
    e.img = await loadEnemyImage(e.image);                  // 画像を img オブジェクトに保持
    e.hp  = e.hp || 10;
  }

  pickNextEnemy();
  pickNextKanji();
}

// ---------- メイン描画 ----------
export function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  /* 漢字 & ヒント */
  ctx.fillStyle = 'white';
  ctx.font = '80px serif';
  ctx.textAlign = 'center';
  ctx.fillText(gameState.currentKanji.text, canvas.width / 2, 200);

  if (gameState.showHint) {
    ctx.font = '20px sans-serif';
    ctx.fillStyle = 'yellow';
    ctx.fillText(`ヒント: ${gameState.currentKanji.meaning}`, canvas.width / 2, 250);
  }

  /* 敵 */
  const enemy = gameState.currentEnemy;
  if (enemy?.img) ctx.drawImage(enemy.img, 480, 80, 240, 120);

  /* プレイヤー情報 */
  ctx.fillStyle = 'white';
  ctx.font = '18px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`HP: ${gameState.playerStats.hp}/${gameState.playerStats.maxHp}`, 50, canvas.height - 80);
  ctx.fillText(`Lv: ${gameState.playerStats.level}  EXP: ${gameState.playerStats.exp}`, 50, canvas.height - 60);

  /* ボタン */
  Object.values(BTN).forEach(b => drawButton(ctx, b.x, b.y, b.w, b.h, b.label));

  /* 入力欄 */
  if (inputEl) { inputEl.style.display = 'block'; }
}

// ---------- クリック処理（1 か所に統合） ----------
// battleScreen.js の handleClick 関数を修正
export function handleClick(x, y, event) {
  if (isMouseOverRect(x, y, BTN.attack)) {
    event.preventDefault();  // イベント伝播を防止
    event.stopPropagation(); // イベント伝播を防止
    onAttack();
    return true; // イベント処理済みを示す
  }
  else if (isMouseOverRect(x, y, BTN.heal)) {
    event.preventDefault();
    event.stopPropagation();
    onHeal();
    return true;
  }
  else if (isMouseOverRect(x, y, BTN.hint)) {
    event.preventDefault();
    event.stopPropagation();
    onHint();
    return true;
  }
  return false; // イベント未処理を示す
}

// ---------- バトルロジック ----------
// battleScreen.js の onAttack 関数内で
function onAttack() {
  if (battleState.turn !== 'player' || !battleState.inputEnabled) return;
  
  battleState.inputEnabled = false; // 入力を一時的に無効化
  
  const answer = normalizeReading(inputEl.value);
  const isCorrect = gameState.currentKanji.readings.includes(answer);

  if (isCorrect) {
    // プレイヤーの攻撃処理
    audio.playSE('correct');
    gameState.currentEnemy.hp -= gameState.playerStats.attack;
    addPlayerExp(3);
    audio.playSE('attack');
    battleState.comboCount++;
    
    // 敵が倒れたかチェック
    if (gameState.currentEnemy.hp <= 0) {
      // 敵全滅チェック
      // ...
    } else {
      // 敵の番に移行
      setTimeout(() => {
        battleState.turn = 'enemy';
        enemyTurn();
      }, 1000); // アニメーション用の遅延
    }
  } else {
    // 不正解処理
    audio.playSE('wrong');
    battleState.comboCount = 0;
    
    // 敵の番に移行
    setTimeout(() => {
      battleState.turn = 'enemy';
      enemyTurn();
    }, 1000);
  }
  
  inputEl.value = '';
}

function enemyTurn() {
  // 敵の攻撃処理
  gameState.playerStats.hp -= gameState.currentEnemy.atk;
  audio.playSE('damage');
  
  // プレイヤー死亡チェック
  if (gameState.playerStats.hp <= 0) {
    gameState.playerStats.hp = 0;
    setTimeout(() => {
      changeScreen('gameOver');
    }, 1500);
    return;
  }
  
  // プレイヤーの番に戻る
  setTimeout(() => {
    battleState.turn = 'player';
    battleState.inputEnabled = true;
    pickNextKanji();
  }, 1000);
}


function onHeal() {
  console.log('🩹 かいふくコマンド押下');
  if (gameState.playerStats.healCount > 0) {
    audio.playSE('heal'); // ✅ 回復SE
    gameState.playerStats.hp = Math.min(
      gameState.playerStats.maxHp,
      gameState.playerStats.hp + 30
    );
    gameState.playerStats.healCount--;
    pickNextKanji();  // ★★★ 追加！攻撃後と同じ状態遷移で必ず次の漢字に進む
  }
}

function onHint() {
  gameState.showHint = !gameState.showHint;
}

function pickNextEnemy() {
  if (gameState.currentEnemyIndex >= gameState.enemies.length) {
    console.log('🏁 pickNextEnemy: 敵全滅（nullを代入）');
    gameState.currentEnemy = null;  // ← これで明示
    return;
  }
  gameState.currentEnemy = gameState.enemies[gameState.currentEnemyIndex];
  console.log('🎯 次の敵:', gameState.currentEnemy.name);
}



export function pickNextKanji() {
  console.log('🧪 pickNextKanji() 開始');

  let pool = gameState.kanjiPool;

  // 🔁 空なら再生成
  if (!pool || pool.length === 0) {
    const stageId = gameState.currentStageId;
    if (!stageId) {
      console.error('❌ ステージIDが未設定');
      changeScreen('title');
      return;
    }

    const fresh = getKanjiByStageId(stageId).slice();
    console.log('🔁 漢字再生成 → 件数:', fresh.length);

    if (fresh.length > 0) {
      gameState.kanjiPool = fresh;
      pool = fresh;
    } else {
      // ✅ "現在の画面" が battle のときだけ、勝利画面へ遷移させるように限定する
      if (
          gameState.currentEnemyIndex >= gameState.enemies.length ||
          gameState.currentEnemy?.hp <= 0
          ) {
      if (getCurrentScreen() === 'battle') {
      console.log('🏆 敵全滅 → 勝利画面へ');
      victoryCallback && victoryCallback();
      } else {
      console.log('📛 勝利条件は満たしたが、画面が battle ではないので遷移しません');
      }
  return;
}

      console.warn('⚠ データ不整合：敵は残ってるが漢字なし');
      alert('漢字データが不足しているため、バトル継続できません。');
      return;
    }
  }

  // ✅ 通常の漢字抽出
  const k = pool[Math.floor(Math.random() * pool.length)];
  if (!k) {
    alert('❌ 漢字データが不正です。');
    return;
  }

  gameState.currentKanji = {
    text: k.kanji,
    readings: getReadings(k),
    meaning: k.meaning,
  };

  gameState.showHint = false;
  console.log('✅ 次の漢字:', k.kanji);
}

export function cleanup() {                 // screenManager から今後呼べるように
  if (inputEl) inputEl.style.display = 'none';
}

/* ---------- ユーティリティ ---------- */
const hiraShift = ch => String.fromCharCode(ch.charCodeAt(0) - 0x60);
const toHira = s => s.replace(/[\u30a1-\u30f6]/g, hiraShift).trim();

// getReadings 関数も改善
function getReadings(k) {
  const set = new Set();
  if (k.kunyomi) {
    k.kunyomi.split(' ').forEach(r => {
      if (r) set.add(toHira(r.trim()));
    });
  }
  if (k.onyomi) {
    k.onyomi.split(' ').forEach(r => {
      if (r) set.add(toHira(r.trim()));
    });
  }
  return [...set].filter(Boolean); // undefined や空文字を除外
}

// battleScreen.js の normalizeReading 関数を改善
function normalizeReading(input) {
  if (!input) return '';
  // 全角スペース、半角スペースをトリム
  let normalized = input.trim().replace(/\s+/g, '');
  // カタカナをひらがなに変換
  normalized = toHira(normalized);
  return normalized;
}
