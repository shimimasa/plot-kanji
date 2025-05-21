/* ----------------------------- 依存モジュール ----------------------------- */
import { gameState }       from './gameState.js';
import { setCanvas, changeScreen, callScreen } from './screenManager.js';
import { cleanup as titleCleanup }       from './titleScreen.js';
import { cleanup as stageCleanup }       from './stageSelectScreen.js';
import { initAssets }      from './assetsLoader.js';
import { loadAllGameData } from './dataLoader.js';
import { init as initBattleScreen,
         draw as drawBattleScreen,
         handleClick as battleClick } from './battleScreen.js';
import { initializeFirebaseServices,
         signInAnonymouslyIfNeeded,
         loadAllStageClearStatus } from './firebaseController.js';
import { handleTitleClick } from './titleScreen.js';
import { handleStageSelectClick } from './stageSelectScreen.js';
import { getCurrentScreen } from './screenManager.js';
import { AudioManager }   from './audioManager.js';
import { handleMenuClick } from './menuScreen.js';

/* ----------------------------- DOM / Canvas ----------------------------- */
const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');
setCanvas(canvas);
// ★ ここで AudioManager を生成して export
export const audio = new AudioManager();

// ────────────────
// モバイルブラウザの自動再生制限対策：
// 最初のユーザー操作のときだけ BGM を始動させる
// ────────────────
document.body.addEventListener(
  'pointerdown',
  () => {
    audio.playBGM('title');   // タイトル曲をループ再生
  },
  { once: true }
);

/* ---------------- Canvas Click Dispatcher ---------------- */
canvas.addEventListener('click', (event) => {
  const { left, top } = canvas.getBoundingClientRect();
  const x = event.clientX - left, y = event.clientY - top;
  
  const screen = getCurrentScreen();
  console.log(`🖱 canvas click at (${x}, ${y}) → current screen: ${screen}`);

  let handled = false;

    switch (screen) {
        case 'title':       handleTitleClick(x, y,event); break;
        case 'stageSelect': handleStageSelectClick(x, y,event); break;
        case 'battle':      battleClick(x, y,event); break;
        case 'menu':        handleMenuClick(x, y,event); break;
    // 画面ごとのハンドラを 1 本に
    
    }
      // イベント処理済みなら伝播を止める
  if (handled) {
    event.preventDefault();
    event.stopPropagation();
  }
  });


  
/* ----------------------------- アプリ初期化 ----------------------------- */
(async function initGame() {
  console.log('🔧 Init start');
  // 1) 画像 & JSON プリロード
  await Promise.all([initAssets(), loadAllGameData()]);

  // 2) Firebase
  if (!initializeFirebaseServices()) return;
  const user = await signInAnonymouslyIfNeeded();
  console.log('UID:', user?.uid);
  await loadAllStageClearStatus();

  // 3) BattleScreen 側のセットアップ
   // 🔽 ここでステージ ID を仮にセット
  gameState.currentStageId = 'hokkaido_area1';
  await initBattleScreen(canvas);

  // 4) 画面遷移：とりあえずタイトルへ
  changeScreen('title');

  console.log('✅ Init done → Start loop');
  requestAnimationFrame(loop);
})();

/* ----------------------------- メインループ ----------------------------- */
function loop() {
  // 今回は title/menu/battle すべて callScreen 内で描画
  callScreen(ctx, drawBattleScreen);   // battle なら第二引数が呼ばれる
  requestAnimationFrame(loop);
}
