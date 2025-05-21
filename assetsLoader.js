// src/assetsLoader.js
//
// ◆initAssets()         … ゲーム起動時に“共通 UI 画像”をプリロード
// ◆loadEnemyImage(id)   … 敵スプライトをステージ開始時にプリロード
// ◆images               … すべての Image オブジェクトをキャッシュ保持

export const images = {};                // key → HTMLImageElement

/* ------------------------------------------------------------------ */
/*  共通 UI 画像のプリロード                                           */
/* ------------------------------------------------------------------ */

const UI_IMAGE_PATHS = {
  logo:          '/assets/images/logo.png',
  buttonNormal:  '/assets/images/button_normal.png',
  buttonClick:   '/assets/images/button_click.png',
  buttonSelect:  '/assets/images/button_select.png',
  buttonInactive:'/assets/images/button_not_act.png',
  iconAttack:    '/assets/images/icon_attack.png',
  iconHeal:      '/assets/images/icon_heal.png',
  iconExp:       '/assets/images/icon_exp.png',
  iconHint:      '/assets/images/icon_hint.png',
  iconSetting:   '/assets/images/icon_setting.png',
  markerPref:    '/assets/images/marker_pref.png',
  markerLocked:  '/assets/images/marker_locked.png',
  markerCleared: '/assets/images/marker_cleared.png',
  hokkaido:      '/assets/images/hokkaido.png',   // ← duplicate key 修正
};

/** ゲーム起動時に await される共通プリロード関数 */
export async function initAssets() {
  const tasks = Object.entries(UI_IMAGE_PATHS).map(([key, src]) =>
    loadImage(src)
      .then(img => { images[key] = img; })
      .catch(() => console.warn(`⚠️ ${src} の読み込み失敗`))
  );
  await Promise.all(tasks);
}

/* ------------------------------------------------------------------ */
/*  敵スプライトの動的ロード                                           */
/* ------------------------------------------------------------------ */

/**
 * 敵画像を読み込み、images[enemyId] にキャッシュ
 * @param {string} enemyId 例: "1_夕張メロン"
 * @returns {Promise<HTMLImageElement|null>}
 */
export async function loadEnemyImage(enemyId) {
  if (images[enemyId]) return images[enemyId];   // キャッシュ済

  const path = `/assets/images/enemy/${encodeURIComponent(enemyId)}.png`;
  try {
    const img = await loadImage(path);
    images[enemyId] = img;
    return img;
  } catch {
    console.warn(`❌ 敵画像のロード失敗: ${path}`);
    return null;
  }
}

/* ------------------------------------------------------------------ */
/*  汎用ロードユーティリティ                                           */
/* ------------------------------------------------------------------ */

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = () => reject();
  });
}

/* ------------------------------------------------------------------ */
/*  JSON ローダ（データレイヤ）                                       */
/* ------------------------------------------------------------------ */

const DATA_BASE = '/data/';

/** すべてのゲームデータ JSON を一括ロード */
export async function loadAllGameData() {
  const files = ['kanji_g1_proto.json', 'enemies_proto.json', 'stages_proto.json'];
  const [kanji, enemy, stage] = await Promise.all(
    files.map(f => fetch(DATA_BASE + f).then(r => r.json()))
  );
  return { kanji, enemy, stage };
}
