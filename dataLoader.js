// js/dataLoader.js

let stageData = [];
let enemyData = [];
let kanjiData = [];
let stageKanjiMap = {};

export async function loadAllGameData() {
  try {
    console.log("外部JSONファイルの読み込みを開始します...");

    const kanjiPath = '/data/kanji_g1_proto.json';
    const enemyPath = '/data/enemies_proto.json';
    const stagePath = '/data/stages_proto.json';

    const kanjiResponse = await fetch(kanjiPath);
    if (!kanjiResponse.ok) throw new Error(`漢字データの読み込みに失敗: ${kanjiResponse.statusText}`);
    kanjiData = await kanjiResponse.json();
    console.log("漢字データ読み込み完了");

    const enemyResponse = await fetch(enemyPath);
    if (!enemyResponse.ok) throw new Error(`敵データの読み込みに失敗: ${enemyResponse.statusText}`);
    enemyData = await enemyResponse.json();
    console.log("敵データ読み込み完了");

    const stageResponse = await fetch(stagePath);
    if (!stageResponse.ok) throw new Error(`ステージデータの読み込みに失敗: ${stageResponse.statusText}`);
    stageData = await stageResponse.json();
    console.log("ステージデータ読み込み完了");

    // 🔽 正しいマッピング処理（stageIdごとにグループ化）
    const kanjiMap = {};
    for (const k of kanjiData) {
      const sid = k.stageId;
      if (!kanjiMap[sid]) kanjiMap[sid] = [];
      kanjiMap[sid].push(k);
    }
    setStageKanjiMap(kanjiMap);

    return { kanjiData, enemyData, stageData };
  } catch (error) {
    console.error("ゲームデータの読み込み中にエラーが発生しました:", error);
    return null;
  }
}


export function getEnemiesByStageId(stageId) {
  const stage = stageData.find(s => s.stageId === stageId);
  if (!stage || !stage.enemyIdList) return [];
  return enemyData.filter(e => stage.enemyIdList.includes(e.id));
}

export function setStageKanjiMap(map) {
  stageKanjiMap = map;
}

export function getKanjiByStageId(stageId) {
  if (!stageKanjiMap || !stageKanjiMap[stageId]) {
    console.warn(`stageKanjiMap[${stageId}] が見つかりません`);
    return [];
  }
  return stageKanjiMap[stageId];
}


