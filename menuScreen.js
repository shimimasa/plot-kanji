// js/menuScreen.js
import { gameState } from './gameState.js';
import { drawButton, isMouseOverRect } from './uiRenderer.js';

import { changeScreen } from './screenManager.js';
import { images } from './assetsLoader.js';

const menuItems = [
  { text: "ゲームスタート", screen: "stageSelect", x: 150, y: 200 },
  { text: "せってい", screen: "settings", x: 150, y: 280 }
];

const buttonWidth = 200;
const buttonHeight = 60;

export function renderMenuScreen(ctx) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // 各ボタンを描画
  for (const item of menuItems) {
    // 背景画像
    if (images.buttonNormal) {
      ctx.drawImage(images.buttonNormal, item.x, item.y, buttonWidth, buttonHeight);
    }

    // テキスト
    ctx.fillStyle = "white";
    ctx.font = "20px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(item.text, item.x + buttonWidth / 2, item.y + 38);
  }
}

export function handleMenuClick(x, y,event) {
  for (const item of menuItems) {
    if (
      x >= item.x &&
      x <= item.x + buttonWidth &&
      y >= item.y &&
      y <= item.y + buttonHeight
    ) {
      changeScreen(item.screen);
      break;
    }
  }
}



// ボタンの情報を保持する変数は、init関数内で初期化されるようにする
let startAdventureButton;
let settingsButtonMenu;
// let backToTitleButton; // もしタイトルへ戻るボタンが必要なら

export function init(canvas) { // canvas を引数として受け取る
    // この関数は画面が表示されるたびに呼ばれる可能性があるため、
    // ボタンの位置やサイズはここで canvas のサイズに基づいて計算するのが良い
    if (!canvas) {
        console.error("menuScreen.init: canvas is undefined! Cannot initialize buttons.");
        return;
    }
    console.log("menuScreen.init called"); // initが呼ばれているか確認

    const centerX = canvas.width / 2;
    startAdventureButton = { x: centerX - 150, y: 250, width: 300, height: 60, text: '冒険を始める' };
    settingsButtonMenu = { x: centerX - 100, y: 330, width: 200, height: 50, text: '設定' };
    // backToTitleButton = { x: centerX - 100, y: 410, width: 200, height: 50, text: 'タイトルへ戻る' };

    console.log("menuScreen buttons initialized:", startAdventureButton, settingsButtonMenu);
}

export function update(gameState) { // gameStateのみ受け取る (canvasはinitで受け取ったものを内部で保持 or screenManager経由でアクセス)
    if (gameState.mouseClick) {
        // startAdventureButton などが init で正しく定義されていることを前提とする
        if (startAdventureButton && isMouseOverRect(gameState.mouseClick.x, gameState.mouseClick.y, startAdventureButton)) {
            console.log('Start Adventure button clicked from menu');
            gameState.currentScreen = 'stageSelect';
        } else if (settingsButtonMenu && isMouseOverRect(gameState.mouseClick.x, gameState.mouseClick.y, settingsButtonMenu)) {
            console.log('Settings button clicked on menu');
            gameState.currentScreen = 'settings';
        }
        // else if (backToTitleButton && isMouseOverRect(gameState.mouseClick.x, gameState.mouseClick.y, backToTitleButton)) {
        //     console.log('Back to title from menu');
        //     gameState.currentScreen = 'title';
        // }
        // mouseClick は main.js の gameLoop の最後でリセットされる
    }
 // 最後に必ずクリア
 gameState.mouseClick = null;}

export function draw(ctx, gameState) {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.fillStyle = 'white';
    ctx.font = '40px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('メインメニュー', ctx.canvas.width / 2, 100);

    if (gameState.playerName) {
        ctx.font = '20px sans-serif';
        ctx.fillText(`ようこそ、${gameState.playerName} さん`, ctx.canvas.width / 2, 150);
    }

    // ボタンの描画（ボタンオブジェクトが未定義でないことを確認してから描画）
    if (startAdventureButton) {
        drawButton(ctx, startAdventureButton.x, startAdventureButton.y, startAdventureButton.width, startAdventureButton.height, startAdventureButton.text, '#2ecc71', 'white');
    } else {
        // console.warn("menuScreen.draw: startAdventureButton is undefined"); // デバッグ用
    }

    if (settingsButtonMenu) {
        drawButton(ctx, settingsButtonMenu.x, settingsButtonMenu.y, settingsButtonMenu.width, settingsButtonMenu.height, settingsButtonMenu.text, '#3498db', 'white');
    } else {
        // console.warn("menuScreen.draw: settingsButtonMenu is undefined"); // デバッグ用
    }

    // if (backToTitleButton) {
    //     drawButton(ctx, backToTitleButton.x, backToTitleButton.y, backToTitleButton.width, backToTitleButton.height, backToTitleButton.text, '#e74c3c', 'white');
    // }
}

export function cleanup() {
    console.log("menuScreen cleanup");
    // この画面で動的に追加したイベントリスナーなどがあればここで削除する
    // 今回はボタンオブジェクトを init で再定義するので、特にクリーンアップは不要かもしれません
    // startAdventureButton = undefined; // オブジェクトを未定義に戻す (任意)
    // settingsButtonMenu = undefined;
}