// src/resultWinScreen.js
// ステージクリア後の画面（Victory Screen）

import { changeScreen } from './screenManager.js';
import { drawButton, isMouseOverRect } from './uiRenderer.js';
import { audio } from './audio.js';

let canvas = null;
let ctx = null;

const nextStageButton = {
  x: 300,
  y: 400,
  width: 200,
  height: 50,
  text: '次のステージへ'
};

export function init(c) {
    canvas = c;
    ctx = canvas.getContext('2d');
  
    audio.playSE('victory');  // ← defeat ではなく勝利用のSEを使いましょう！
  
    canvas.addEventListener('click', handleClick);
  }


export function cleanup() {
  canvas?.removeEventListener('click', handleClick);
}

function handleClick(e) {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  if (isMouseOverRect(x, y, nextStageButton)) {
    audio.playSE('appear'); // 決定SE
    changeScreen('stageSelect'); // ステージ選択画面に戻る（※必要に応じて menu などに変更可）
  }
}

export function renderResultWinScreen(ctx) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'yellow';
  ctx.font = '48px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('ステージクリア！', canvas.width / 2, 150);

  ctx.font = '24px sans-serif';
  ctx.fillStyle = 'white';
  ctx.fillText('おめでとうございます！', canvas.width / 2, 200);

  // 次のステージへボタン
  drawButton(ctx, nextStageButton.x, nextStageButton.y, nextStageButton.width, nextStageButton.height, nextStageButton.text);
}

