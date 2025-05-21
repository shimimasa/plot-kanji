// src/gameOverScreen.js
// プレイヤー敗北時の画面（Game Over Screen）

import { changeScreen } from './screenManager.js';
import { drawButton, isMouseOverRect } from './uiRenderer.js';
import { audio } from './audio.js';

let canvas = null;
let ctx = null;

const retryButton = {
  x: 250,
  y: 380,
  width: 150,
  height: 50,
  text: 'リトライ'
};

const backToTitleButton = {
  x: 430,
  y: 380,
  width: 150,
  height: 50,
  text: 'タイトルへ'
};

export function init(c) {
  canvas = c;
  ctx = canvas.getContext('2d');

  // 敗北SEを再生
  audio.playSE('defeat');

  // イベントリスナー登録
  canvas.addEventListener('click', handleClick);
}

export function cleanup() {
  canvas?.removeEventListener('click', handleClick);
}

function handleClick(e) {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  if (isMouseOverRect(x, y, retryButton)) {
    audio.playSE('appear'); // 決定SE
    changeScreen('stageSelect'); // ステージ選択に戻る（同じステージをリトライ）
  }

  if (isMouseOverRect(x, y, backToTitleButton)) {
    audio.playSE('appear'); // 決定SE
    changeScreen('title'); // タイトル画面に戻る
  }
}

export function renderGameOverScreen(ctx) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'red';
  ctx.font = '48px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('ゲームオーバー', canvas.width / 2, 150);

  ctx.fillStyle = 'white';
  ctx.font = '24px sans-serif';
  ctx.fillText('ざんねん！またチャレンジしてね', canvas.width / 2, 200);

  drawButton(ctx, retryButton.x, retryButton.y, retryButton.width, retryButton.height, retryButton.text);
  drawButton(ctx, backToTitleButton.x, backToTitleButton.y, backToTitleButton.width, backToTitleButton.height, backToTitleButton.text);
}
