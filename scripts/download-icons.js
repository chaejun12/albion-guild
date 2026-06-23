/**
 * Albion Online 아이콘 이미지 일괄 다운로드 스크립트
 * 실행: node scripts/download-icons.js
 * 의존성: npm install node-fetch (Node 18+ 미만)
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { WEAPONS, ARMOR_CHEST, ARMOR_HEAD, ARMOR_SHOES, CAPES, FOOD, POTIONS } from '../src/data/items.js';

const RENDER_BASE = 'https://render.albiononline.com/v1/item';
const SIZE = 64;
const OUT_DIR = path.resolve('public/icons');

// 출력 폴더 생성
const FOLDERS = ['weapons', 'armor/chest', 'armor/head', 'armor/shoes', 'capes', 'food', 'potions'];
FOLDERS.forEach(f => fs.mkdirSync(path.join(OUT_DIR, f), { recursive: true }));

function download(uniqueName, destPath) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(destPath)) { resolve(); return; }
    const url = `${RENDER_BASE}/${uniqueName}.png?size=${SIZE}`;
    const file = fs.createWriteStream(destPath);
    https.get(url, res => {
      if (res.statusCode !== 200) { reject(new Error(`${res.statusCode} ${uniqueName}`)); return; }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', reject);
  });
}

async function downloadBatch(items, subDir) {
  const dir = path.join(OUT_DIR, subDir);
  let ok = 0, fail = 0;
  for (const item of items) {
    const dest = path.join(dir, `${item.id}.png`);
    try {
      await download(item.id, dest);
      ok++;
    } catch (e) {
      console.error(`  ✗ ${item.id}: ${e.message}`);
      fail++;
    }
    // 서버 부하 방지
    await new Promise(r => setTimeout(r, 80));
  }
  console.log(`[${subDir}] ✓ ${ok}  ✗ ${fail}`);
}

async function main() {
  console.log('알비온 아이콘 다운로드 시작...\n');

  // 무기
  for (const [category, items] of Object.entries(WEAPONS)) {
    await downloadBatch(items, `weapons`);
  }

  // 방어구
  for (const [type, items] of Object.entries(ARMOR_CHEST)) {
    await downloadBatch(items, `armor/chest`);
  }
  for (const [type, items] of Object.entries(ARMOR_HEAD)) {
    await downloadBatch(items, `armor/head`);
  }
  for (const [type, items] of Object.entries(ARMOR_SHOES)) {
    await downloadBatch(items, `armor/shoes`);
  }

  // 나머지
  await downloadBatch(CAPES,   'capes');
  await downloadBatch(FOOD,    'food');
  await downloadBatch(POTIONS, 'potions');

  console.log('\n완료!');
  console.log(`저장 위치: ${OUT_DIR}`);
}

main().catch(console.error);
