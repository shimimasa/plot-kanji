// js/stageSelectScreen.js
import { gameState } from './gameState.js';
import { drawButton, isMouseOverRect } from './uiRenderer.js';
import { resetStageProgress } from './gameState.js';  // 追加
import { changeScreen } from './screenManager.js';
import { images } from './assetsLoader.js';
const stages = [
  { id: "hokkaido", name: "北海道", x: 180, y: 120 }
  // 今後、他県を追加（x, y 座標は相対位置で調整）
];

// stageSelectScreen.js


let backButton = {
  x: 20,
  y: 520,
  width: 120,
  height: 40,
  text: 'もどる'
};

// stageSelectScreen.js
let localCanvas = null;

export function init(canvas) {
  localCanvas = canvas;
  // クリックイベントは main.js に一元化したため不要
}


// クリック矩形 → 新ハンドラへ
export function handleTitleClick(x, y) {
  if (isMouseOverRect(x, y, startButton)) changeScreen('stageSelect');
}
export function handleStageSelectClick(x, y,event) {
  console.log(`🖱 ステージ選択クリック: (${x}, ${y})`);

  // 戻るボタン
  if (isMouseOverRect(x, y, backButton)) {
    console.log("🔙 もどるボタン押下");
    changeScreen('title');
    return;
  }

  // 北海道マーカー
  const markerX = 370;
  const markerY = 250;
  const markerSize = 32;

  if (
    x >= markerX &&
    x <= markerX + markerSize &&
    y >= markerY &&
    y <= markerY + markerSize
  ) {
    console.log("🗾 北海道ステージ押下 → battleへ");
    const stageId = 'hokkaido_area1';
    gameState.currentStageId = 'hokkaido_area1';
    resetStageProgress('hokkaido_area1');
    changeScreen('battle');
  }
}

export function cleanup() {
    localCanvas?.removeEventListener('click', selectClickHandler);
  }
  

export function renderStageSelectScreen(ctx) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // 北海道背景
  if (images.hokkaido) {
    ctx.drawImage(images.hokkaido, 200, 100, 400, 300);
  }

  // 北海道マーカー
  if (images.markerPref) {
    ctx.drawImage(images.markerPref, 370, 250, 32, 32);
  }

  // 戻るボタン
  if (images.buttonNormal) {
    ctx.drawImage(images.buttonNormal, 20, 520, 120, 40);
    ctx.fillStyle = 'white';
    ctx.font = '20px sans-serif';
    ctx.fillText('もどる', 40, 547);
  }
}




const markerSize = 64;




// ★★★ main.jsのinitGameでloadAllStageClearStatusが呼ばれ、gameState.stageProgressに結果が格納されている前提 ★★★

let hokkaidoStageButton, backToMenuButton;
// (他のステージボタンも同様に定義)


export function update(gameState) {
    if (gameState.mouseClick) {
        if (hokkaidoStageButton && isMouseOverRect(gameState.mouseClick.x, gameState.mouseClick.y, hokkaidoStageButton)) {
            console.log('Hokkaido stage selected');
            gameState.currentStageId = hokkaidoStageButton.stageId;
            changeScreen('battle', { stageId: 'hokkaido_area1' }); // 必要に応じて引数を渡す
        gameState.mouseClick = null;
        } else if (backToMenuButton && isMouseOverRect(gameState.mouseClick.x, gameState.mouseClick.y, backToMenuButton)) {
            gameState.currentScreen = 'menu';
        gameState.mouseClick = null;
        }
        // 他のステージボタンのクリック処理
    }
 // 最後に必ずクリア
 gameState.mouseClick = null;}

export function draw(ctx, gameState) {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '40px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ステージ選択', ctx.canvas.width / 2, 100);

    // 北海道エリア1ボタンの描画
    if (hokkaidoStageButton) {
        let hokkaidoButtonColor = '#e94560';
        let hokkaidoButtonText = hokkaidoStageButton.text;
        // gameState.stageProgress が存在し、該当ステージIDのデータがあるか確認
        if (gameState.stageProgress &&
            gameState.stageProgress[hokkaidoStageButton.stageId] &&
            gameState.stageProgress[hokkaidoStageButton.stageId].cleared) {
            hokkaidoButtonColor = '#2ecc71';
            hokkaidoButtonText += ' ★クリア';
        }
        drawButton(ctx, hokkaidoStageButton.x, hokkaidoStageButton.y, hokkaidoStageButton.width, hokkaidoStageButton.height, hokkaidoButtonText, hokkaidoButtonColor);
    }
    // 他のステージボタンも同様に描画

    if (backToMenuButton) {
        drawButton(ctx, backToMenuButton.x, backToMenuButton.y, backToMenuButton.width, backToMenuButton.height, backToMenuButton.text);
    }
    // プレイヤー情報表示など
}

