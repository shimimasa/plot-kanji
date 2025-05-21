// js/settingsScreen.js
import { gameState } from './gameState.js';
import { drawButton, isMouseOverRect } from './uiRenderer.js';
import { getCurrentUser } from './firebaseController.js'; // getCurrentUser をインポート

let backToMenuButtonSettings, resetButton; // resetButton を追加


export function init(canvas) {
    console.log("settingsScreen.init called with canvas:", canvas); // ★デバッグ用
    if (!canvas) {
        console.error("settingsScreen.init: canvas is undefined! Cannot initialize buttons.");
        backToMenuButtonSettings = undefined;
        return;
    }
    backToMenuButtonSettings = { x: canvas.width / 2 - 125, y: canvas.height - 100, width: 250, height: 50, text: 'メインメニューへもどる' };
    console.log("settingsScreen buttons initialized:", backToMenuButtonSettings); // ★デバッグ
    resetButton = { x: canvas.width / 2 - 125, y: 250, width: 250, height: 50, text: 'データリセット（はじめから）', color: '#c0392b' }; // 赤色など警告色
}

async function resetPlayerData() {
    const user = getCurrentUser();
    if (user && user.uid) {
        if (confirm("本当に全てのデータをリセットしてはじめから遊びますか？この操作は元に戻せません。")) {
            try {
                // Firestoreのデータを削除 (profile と progress)
                const profileRef = firebase.firestore().collection('users').doc(user.uid).collection('profile').doc('playerStats');
                await profileRef.delete();
                console.log("Player profile data deleted from Firestore.");

                const progressCollectionRef = firebase.firestore().collection('users').doc(user.uid).collection('progress');
                const progressSnapshot = await progressCollectionRef.get();
                const batch = firebase.firestore().batch();
                progressSnapshot.docs.forEach(doc => batch.delete(doc.ref));
                await batch.commit();
                console.log("Player progress data deleted from Firestore.");

                // ローカルのgameStateを初期化
                gameState.playerName = ""; // 名前を空に戻す
                Object.assign(gameState.playerStats, { // GDDの初期値に戻す
                    level: 1, exp: 0, maxHp: 100, attack: 10, nextLevelExp: 100, healCount: 3
                });
                gameState.stageProgress = {}; // ステージ進捗もリセット
                // localStorageもクリアするなら
                // localStorage.removeItem('playerName');

                alert("データをリセットしました。タイトル画面に戻ります。");
                gameState.currentScreen = 'title'; // タイトルに戻って名前入力からやり直す
            } catch (error) {
                console.error("データリセット中にエラー:", error);
                alert("データのリセットに失敗しました。");
            }
        }
    } else {
        alert("データのリセットに失敗しました (ユーザー情報なし)。");
    }
}

export function update(gameState) {
    if (gameState.mouseClick) {
        if (backToMenuButtonSettings && isMouseOverRect(gameState.mouseClick.x, gameState.mouseClick.y, backToMenuButtonSettings)) {
            gameState.currentScreen = 'menu';
        } else if (resetButton && isMouseOverRect(gameState.mouseClick.x, gameState.mouseClick.y, resetButton)) {
            console.log("Reset data button clicked");
            resetPlayerData(); // ★データリセット関数を呼び出し
        }
    }
 // 最後に必ずクリア
 gameState.mouseClick = null;}

export function draw(ctx, gameState) {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.fillStyle = 'white';
    ctx.font = '40px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('設定', ctx.canvas.width / 2, 100);
    if (resetButton) {
        drawButton(ctx, resetButton.x, resetButton.y, resetButton.width, resetButton.height, resetButton.text, resetButton.color);
    }
    if (backToMenuButtonSettings) {
        drawButton(ctx, backToMenuButtonSettings.x, backToMenuButtonSettings.y, backToMenuButtonSettings.width, backToMenuButtonSettings.height, backToMenuButtonSettings.text);
    } else {
        // console.warn("settingsScreen.draw: backToMenuButtonSettings is undefined"); // デバッグ用
    }
}

export function cleanup() {
    console.log("settingsScreen cleanup");
    backToMenuButtonSettings = undefined;
}