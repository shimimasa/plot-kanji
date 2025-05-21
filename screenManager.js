// src/screenManager.js
//
// 役割：①<canvas>を各画面 init に渡す ②現在の画面に応じて draw 関数を呼ぶ
// “描画だけ” には依存しないよう battleDrawFn を外部注入にする

import { init as initTitle,       renderTitleScreen       } from './titleScreen.js';
import { init as initStage,       renderStageSelectScreen } from './stageSelectScreen.js';
import { init as initBattle, draw as drawBattleScreen } from './battleScreen.js';
import * as menuScreen   from './menuScreen.js';
import * as resultScreen from './resultScreen.js';
import * as gameOver     from './gameOverScreen.js';
import { audio }         from './main.js';


let canvas = null;
let currentScreen = 'title';        // デフォルトはタイトル

/* ---------------------------- 外部 API ----------------------------- */

/** main.js から呼んで <canvas> を登録 */
export const setCanvas = c => { canvas = c; };

/**
 * 画面遷移
 * @param {'title' | 'stageSelect' | 'battle' | 'menu' | 'resultWin' | 'gameOver'} next
 */


export function changeScreen(next) {
  console.log(`🌀 changeScreen(): ${currentScreen} → ${next}`);
  currentScreen = next;

  // ─── BGM 切り替えテーブル ───
  const bgmTable = {
    title:      'title',
    menu:       'title',
    stageSelect:'title',
    battle:     'battle',
    resultWin:  'victory',
    gameOver:   'defeat',
  };
  const key = bgmTable[next];
  if (key) audio.fadeToBGM(key, 1); // 1 秒クロスフェード

  switch (next) {
    case 'title':       initTitle(canvas);  break;
    case 'stageSelect': initStage(canvas);  break;
    case 'battle':      initBattle(canvas, () => changeScreen('resultWin')); // 新
    case 'menu':        menuScreen.init?.(canvas); break;
    case 'resultWin':   resultScreen.init?.(canvas); break;
    case 'gameOver':    gameOver.init?.(canvas); break;
    // 今後 newScreen を追加する時はここへ
  }
}

/**
 * 1 フレームごとに呼ばれる「描画ディスパッチャ」
 * @param {CanvasRenderingContext2D} ctx
 * @param {Function} [battleDrawFn]  - battle 画面用に main から注入
 */
export function callScreen(ctx, battleDrawFn = null) {
  switch (currentScreen) {
    case 'title':
      renderTitleScreen(ctx);
      break;
    case 'stageSelect':
      renderStageSelectScreen(ctx);
      break;
    case 'battle':
      if (battleDrawFn) battleDrawFn();     // battleScreen.draw() を実行
      break;
    case 'menu':
        menuScreen.renderMenuScreen(ctx); // ← これがなければ追加！
        break;
    case 'resultWin':
          resultScreen.renderResultWinScreen(ctx); // ← ★これが足りていない
          break;
    case 'gameOver':
          gameOver.renderGameOverScreen(ctx);
          break;  }
}




/* ----------------------- 状態取得ヘルパ (optional) --------------- */
export function getCurrentScreen() {
  return currentScreen;
}


