const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'warehouse.db');
const db = new sqlite3.Database(dbPath);

console.log('开始初始化数据库数据...');

// 物料字典数据
const materials = [
  // 原料
  { code: 'LAHN2', name: '巴旦木仁原料', unit: '公斤' },
  { code: 'LAHP1', name: '榛子原料', unit: '公斤' },
  { code: 'LAMAC1', name: '夏威夷果原料', unit: '公斤' },
  { code: 'LAHN1', name: '巴旦木原料', unit: '公斤' },
  { code: 'LADG1', name: '鹰嘴豆原料', unit: '公斤' },
  
  // 辅料
  { code: 'MUOI', name: '盐', unit: '公斤' },
  { code: 'TUINHOM', name: '铝箔袋', unit: '个' },
  { code: 'THUNGGIAY', name: '纸箱', unit: '个' },
  { code: 'LABJB', name: '千斤包', unit: '个' },
  { code: 'LASDS', name: '甜蜜素', unit: '公斤' },
  { code: 'LASDC', name: '糖精钠', unit: '公斤' },
  { code: 'LACFK', name: '安赛蜜', unit: '公斤' },
  { code: 'LASCL', name: '三氯蔗糖', unit: '公斤' },
  { code: 'LAVNL', name: '香兰素', unit: '公斤' },
  { code: 'LADTL', name: '糖', unit: '公斤' },
  { code: 'LARNC', name: '坚果香精 0612', unit: '公斤' },
  { code: 'LAPMF', name: '牧场鲜奶粉末香精 444-1', unit: '公斤' },
  { code: 'LAMFV', name: '奶味香精 0265', unit: '公斤' },
  { code: 'LANFV', name: '坚果香精 0612', unit: '公斤' },
  { code: 'LACAN', name: '复合抗氧化剂', unit: '公斤' },
  { code: 'LAPAP', name: '坚果炒货起酥渗透剂 0313', unit: '公斤' },
  { code: 'BOTNGOT', name: '味精', unit: '公斤' },
  { code: 'H2O2', name: '双氧水', unit: '公斤' },
  { code: 'PALET', name: '托板', unit: '个' }
];

// 产品数据
const products = [
  { code: 'LAFX-ALK', name: '烘干巴旦木仁', unit: '公斤' },
  { code: 'LAFX-HZN', name: '烘烤榛子', unit: '公斤' },
  { code: 'LAFX-IMC', name: '烘烤加盐夏威夷果', unit: '公斤' },
  { code: 'LAFX-IAL', name: '烘烤加盐巴旦木', unit: '公斤' },
  { code: 'LAFX-IMC1', name: '烘烤加盐夏威夷果（B类）', unit: '公斤' },
  { code: 'LAFX-IAL1', name: '烘烤加盐巴旦木（B类）', unit: '公斤' },
  { code: 'LAFX-DG', name: '盐炒鹰嘴豆', unit: '公斤' },
  { code: 'LAFX-IMCS', name: '烘烤加盐夏威夷果仁', unit: '公斤' }
];

// 产品配方数据
const productBom = [
  // 产品 1 - 烘干巴旦木仁 LAFX-ALK
  { product_code: 'LAFX-ALK', material_code: 'LAHN2' },
  { product_code: 'LAFX-ALK', material_code: 'MUOI' },
  { product_code: 'LAFX-ALK', material_code: 'TUINHOM' },
  { product_code: 'LAFX-ALK', material_code: 'THUNGGIAY' },
  
  // 产品 2 - 烘烤榛子 LAFX-HZN
  { product_code: 'LAFX-HZN', material_code: 'LAHP1' },
  { product_code: 'LAFX-HZN', material_code: 'LABJB' },
  
  // 产品 3 - 烘烤加盐夏威夷果 LAFX-IMC
  { product_code: 'LAFX-IMC', material_code: 'LAMAC1' },
  { product_code: 'LAFX-IMC', material_code: 'LASDS' },
  { product_code: 'LAFX-IMC', material_code: 'LASDC' },
  { product_code: 'LAFX-IMC', material_code: 'LACFK' },
  { product_code: 'LAFX-IMC', material_code: 'LASCL' },
  { product_code: 'LAFX-IMC', material_code: 'LAVNL' },
  { product_code: 'LAFX-IMC', material_code: 'LADTL' },
  { product_code: 'LAFX-IMC', material_code: 'LARNC' },
  { product_code: 'LAFX-IMC', material_code: 'LAPMF' },
  { product_code: 'LAFX-IMC', material_code: 'LAMFV' },
  { product_code: 'LAFX-IMC', material_code: 'MUOI' },
  { product_code: 'LAFX-IMC', material_code: 'LABJB' },
  { product_code: 'LAFX-IMC', material_code: 'TUINHOM' },
  
  // 产品 4 - 烘烤加盐巴旦木 LAFX-IAL
  { product_code: 'LAFX-IAL', material_code: 'LAHN1' },
  { product_code: 'LAFX-IAL', material_code: 'LANFV' },
  { product_code: 'LAFX-IAL', material_code: 'LACAN' },
  { product_code: 'LAFX-IAL', material_code: 'LADTL' },
  { product_code: 'LAFX-IAL', material_code: 'LAPAP' },
  { product_code: 'LAFX-IAL', material_code: 'LAPMF' },
  { product_code: 'LAFX-IAL', material_code: 'LAMFV' },
  { product_code: 'LAFX-IAL', material_code: 'LABJB' },
  { product_code: 'LAFX-IAL', material_code: 'MUOI' },
  { product_code: 'LAFX-IAL', material_code: 'BOTNGOT' },
  { product_code: 'LAFX-IAL', material_code: 'H2O2' },
  
  // 产品 5 - 烘烤加盐夏威夷果（B类）LAFX-IMC1
  { product_code: 'LAFX-IMC1', material_code: 'LAMAC1' },
  { product_code: 'LAFX-IMC1', material_code: 'LASDS' },
  { product_code: 'LAFX-IMC1', material_code: 'LASDC' },
  { product_code: 'LAFX-IMC1', material_code: 'LACFK' },
  { product_code: 'LAFX-IMC1', material_code: 'LASCL' },
  { product_code: 'LAFX-IMC1', material_code: 'LAVNL' },
  { product_code: 'LAFX-IMC1', material_code: 'LADTL' },
  { product_code: 'LAFX-IMC1', material_code: 'LARNC' },
  { product_code: 'LAFX-IMC1', material_code: 'LAPMF' },
  { product_code: 'LAFX-IMC1', material_code: 'LAMFV' },
  { product_code: 'LAFX-IMC1', material_code: 'LABJB' },
  
  // 产品 6 - 烘烤加盐巴旦木（B类）LAFX-IAL1
  { product_code: 'LAFX-IAL1', material_code: 'LAHN1' },
  { product_code: 'LAFX-IAL1', material_code: 'LANFV' },
  { product_code: 'LAFX-IAL1', material_code: 'LACAN' },
  { product_code: 'LAFX-IAL1', material_code: 'LARNC' },
  { product_code: 'LAFX-IAL1', material_code: 'LADTL' },
  { product_code: 'LAFX-IAL1', material_code: 'LAPAP' },
  { product_code: 'LAFX-IAL1', material_code: 'LAPMF' },
  { product_code: 'LAFX-IAL1', material_code: 'LAMFV' },
  { product_code: 'LAFX-IAL1', material_code: 'LABJB' },
  { product_code: 'LAFX-IAL1', material_code: 'MUOI' },
  { product_code: 'LAFX-IAL1', material_code: 'BOTNGOT' },
  { product_code: 'LAFX-IAL1', material_code: 'H2O2' },
  
  // 产品 7 - 盐炒鹰嘴豆 LAFX-DG
  { product_code: 'LAFX-DG', material_code: 'LADG1' },
  { product_code: 'LAFX-DG', material_code: 'MUOI' },
  { product_code: 'LAFX-DG', material_code: 'TUINHOM' },
  { product_code: 'LAFX-DG', material_code: 'THUNGGIAY' },
  { product_code: 'LAFX-DG', material_code: 'PALET' },
  
  // 产品 8 - 烘烤加盐夏威夷果仁 LAFX-IMC-N
  { product_code: 'LAFX-IMC-N', material_code: 'LAMAC1' },
  { product_code: 'LAFX-IMC-N', material_code: 'MUOI' },
  { product_code: 'LAFX-IMC-N', material_code: 'TUINHOM' },
  { product_code: 'LAFX-IMC-N', material_code: 'THUNGGIAY' }
];

async function initData() {
  try {
    // 插入物料字典
    console.log('插入物料字典...');
    for (const material of materials) {
      await new Promise((resolve, reject) => {
        db.run('INSERT OR IGNORE INTO materials (code, name, unit) VALUES (?, ?, ?)', 
          [material.code, material.name, material.unit], function(err) {
          if (err) reject(err);
          else resolve();
        });
      });
    }
    console.log('✅ 物料字典插入完成');

    // 插入产品
    console.log('插入产品...');
    for (const product of products) {
      await new Promise((resolve, reject) => {
        db.run('INSERT OR IGNORE INTO products (code, name, unit) VALUES (?, ?, ?)', 
          [product.code, product.name, product.unit], function(err) {
          if (err) reject(err);
          else resolve();
        });
      });
    }
    console.log('✅ 产品插入完成');

    // 插入产品配方
    console.log('插入产品配方...');
    for (const bom of productBom) {
      await new Promise((resolve, reject) => {
        db.run('INSERT OR IGNORE INTO product_bom (product_code, material_code) VALUES (?, ?)', 
          [bom.product_code, bom.material_code], function(err) {
          if (err) reject(err);
          else resolve();
        });
      });
    }
    console.log('✅ 产品配方插入完成');

    console.log('🎉 所有数据初始化完成！');
  } catch (err) {
    console.error('❌ 初始化失败:', err);
  } finally {
    db.close();
  }
}

initData(); 