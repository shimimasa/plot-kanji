import { changeScreen } from './screenManager.js';
import { images } from './assetsLoader.js';
import { drawButton, isMouseOverRect } from './uiRenderer.js';
import { audio } from './audio.js'; // 追加

let startButton = {
  x: 320,
  y: 400,
  width: 160,
  height: 50,
  text: 'スタート'
};

let localCanvas = null;

export function cleanup() {
  localCanvas?.removeEventListener('click', titleClickHandler);
}

function titleClickHandler(e) {
  const { left, top } = localCanvas.getBoundingClientRect();
  const x = e.clientX - left, y = e.clientY - top;
  if (isMouseOverRect(x, y, startButton)) {
    audio.playSE('appear'); // ✅ ボタンSE追加
    changeScreen('menu');   // ← 'stageSelect' から 'menu' に変更済み
  }
}

export function init(c) {
  localCanvas = c;
  c.addEventListener('click', titleClickHandler);
}

export function renderTitleScreen(ctx) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  if (images.logo) {
    ctx.drawImage(images.logo, 250, 100, 300, 100);
  }

  if (images.buttonNormal) {
    ctx.drawImage(images.buttonNormal, startButton.x, startButton.y, startButton.width, startButton.height);
  }

  ctx.fillStyle = 'white';
  ctx.font = '28px sans-serif';
  ctx.fillText(startButton.text, startButton.x + 20, startButton.y + 35);
}

// titleScreen.js
export function handleTitleClick(x, y, event) { // event を追加
  if (isMouseOverRect(x, y, startButton)) {
    console.log('✅ スタートボタン押下');
    changeScreen('stageSelect'); // または 'menu' など、意図する画面へ
    return true; // クリックを処理したので true を返す
  }
  return false; // それ以外は false を返す
}

let settingsButton; // ボタンの情報を保持




export function update(gameState) {
  if (gameState.mouseClick) {
      const click = gameState.mouseClick;

      if (startButton && isMouseOverRect(click.x, click.y, startButton)) {
          console.log('Start button clicked on title');

          if (!gameState.playerName || ["ななしのごんべえ", "ゲスト", "新規プレイヤー"].includes(gameState.playerName)) {
              gameState.currentScreen = 'playerNameInput';
          } else {
              gameState.currentScreen = 'menu';
          }

      } else if (settingsButton && isMouseOverRect(click.x, click.y, settingsButton)) {
          gameState.currentScreen = 'settings';
      }

      // ✅ ← 忘れずにマウスクリックを消費
      gameState.mouseClick = null;
  }
}


export function draw(ctx) {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.fillStyle = 'white';
    ctx.font = '48px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('漢字読みバトル RPG', ctx.canvas.width / 2, 150);
    ctx.font = '20px sans-serif';
    ctx.fillText('(プロトタイプ)', ctx.canvas.width / 2, 200);

    drawButton(ctx, startButton.x, startButton.y, startButton.width, startButton.height, startButton.text);
    drawButton(ctx, settingsButton.x, settingsButton.y, settingsButton.width, settingsButton.height, settingsButton.text);

    ctx.font = '12px sans-serif';
    ctx.fillText('© あなたの名前 2025', ctx.canvas.width / 2, ctx.canvas.height - 30);
}