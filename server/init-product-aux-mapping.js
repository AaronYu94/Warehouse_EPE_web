const db = require('./db-sqlite');

async function initProductAuxMapping() {
  try {
    console.log('开始初始化成品-原料-辅料对照表...');
    
    const testMappingData = [
      // 烘干巴旦木仁 (LAFX-ALK)
      { product_name: '烘干巴旦木仁', product_code: 'LAFX-ALK', material_name: '巴旦木仁原料', material_code: 'LAHN2', usage_per_unit: 1, unit: 'kg', type: 'raw' },
      { product_name: '烘干巴旦木仁', product_code: 'LAFX-ALK', material_name: '铝箔袋（真空包装袋）', material_code: 'TUINHOM', usage_per_unit: 1, unit: '个', type: 'aux' },
      { product_name: '烘干巴旦木仁', product_code: 'LAFX-ALK', material_name: '纸箱', material_code: 'THUNGGIAY', usage_per_unit: 0.05, unit: '个', type: 'aux' },
      { product_name: '烘干巴旦木仁', product_code: 'LAFX-ALK', material_name: '盐', material_code: 'MUOI', usage_per_unit: 0.02, unit: 'kg', type: 'aux' },
      
      // 烘烤榛子，有壳 (LAFX-HZN)
      { product_name: '烘烤榛子，有壳', product_code: 'LAFX-HZN', material_name: '榛子原料', material_code: 'LAHP1', usage_per_unit: 1, unit: 'kg', type: 'raw' },
      { product_name: '烘烤榛子，有壳', product_code: 'LAFX-HZN', material_name: 'Jumbo 袋', material_code: 'LABJB', usage_per_unit: 1, unit: '个', type: 'aux' },
      
      // 烘烤加盐夏威夷果 (LAFX-IMC)
      { product_name: '烘烤加盐夏威夷果', product_code: 'LAFX-IMC', material_name: '夏威夷果原料', material_code: 'LAMAC1', usage_per_unit: 1, unit: 'kg', type: 'raw' },
      { product_name: '烘烤加盐夏威夷果', product_code: 'LAFX-IMC', material_name: '甜蜜素', material_code: 'LASDS', usage_per_unit: 0.001, unit: 'kg', type: 'aux' },
      { product_name: '烘烤加盐夏威夷果', product_code: 'LAFX-IMC', material_name: '糖精钠', material_code: 'LASDC', usage_per_unit: 0.001, unit: 'kg', type: 'aux' },
      { product_name: '烘烤加盐夏威夷果', product_code: 'LAFX-IMC', material_name: '安赛蜜', material_code: 'LACFK', usage_per_unit: 0.001, unit: 'kg', type: 'aux' },
      { product_name: '烘烤加盐夏威夷果', product_code: 'LAFX-IMC', material_name: '三氯蔗糖', material_code: 'LASCL', usage_per_unit: 0.001, unit: 'kg', type: 'aux' },
      { product_name: '烘烤加盐夏威夷果', product_code: 'LAFX-IMC', material_name: '香兰素', material_code: 'LAVNL', usage_per_unit: 0.001, unit: 'kg', type: 'aux' },
      { product_name: '烘烤加盐夏威夷果', product_code: 'LAFX-IMC', material_name: '糖', material_code: 'LADTL', usage_per_unit: 0.05, unit: 'kg', type: 'aux' },
      { product_name: '烘烤加盐夏威夷果', product_code: 'LAFX-IMC', material_name: '坚果香精 0612', material_code: 'LARNC', usage_per_unit: 0.01, unit: 'kg', type: 'aux' },
      { product_name: '烘烤加盐夏威夷果', product_code: 'LAFX-IMC', material_name: '牧场鲜奶粉末香精 444-1', material_code: 'LAPMF', usage_per_unit: 0.01, unit: 'kg', type: 'aux' },
      { product_name: '烘烤加盐夏威夷果', product_code: 'LAFX-IMC', material_name: '奶味香精 0265', material_code: 'LAMFV', usage_per_unit: 0.01, unit: 'kg', type: 'aux' },
      { product_name: '烘烤加盐夏威夷果', product_code: 'LAFX-IMC', material_name: '盐', material_code: 'MUOI', usage_per_unit: 0.02, unit: 'kg', type: 'aux' },
      { product_name: '烘烤加盐夏威夷果', product_code: 'LAFX-IMC', material_name: '千斤包', material_code: 'LABJB', usage_per_unit: 1, unit: '个', type: 'aux' },
      { product_name: '烘烤加盐夏威夷果', product_code: 'LAFX-IMC', material_name: '铝箔袋', material_code: 'TUINHOM', usage_per_unit: 1, unit: '个', type: 'aux' },
      
      // 烘烤加盐巴旦木 (LAFX-IAL)
      { product_name: '烘烤加盐巴旦木', product_code: 'LAFX-IAL', material_name: '巴旦木原料', material_code: 'LAHN1', usage_per_unit: 1, unit: 'kg', type: 'raw' },
      { product_name: '烘烤加盐巴旦木', product_code: 'LAFX-IAL', material_name: '坚果香精 0612', material_code: 'LANFV', usage_per_unit: 0.01, unit: 'kg', type: 'aux' },
      { product_name: '烘烤加盐巴旦木', product_code: 'LAFX-IAL', material_name: '复合抗氧化剂', material_code: 'LACAN', usage_per_unit: 0.005, unit: 'kg', type: 'aux' },
      { product_name: '烘烤加盐巴旦木', product_code: 'LAFX-IAL', material_name: '糖', material_code: 'LADTL', usage_per_unit: 0.05, unit: 'kg', type: 'aux' },
      { product_name: '烘烤加盐巴旦木', product_code: 'LAFX-IAL', material_name: '木瓜蛋白酶粉 0313', material_code: 'LAPAP', usage_per_unit: 0.001, unit: 'kg', type: 'aux' },
      { product_name: '烘烤加盐巴旦木', product_code: 'LAFX-IAL', material_name: '牧场鲜奶粉末香精 444-1', material_code: 'LAPMF', usage_per_unit: 0.01, unit: 'kg', type: 'aux' },
      { product_name: '烘烤加盐巴旦木', product_code: 'LAFX-IAL', material_name: '奶味香精 0265', material_code: 'LAMFV', usage_per_unit: 0.01, unit: 'kg', type: 'aux' },
      { product_name: '烘烤加盐巴旦木', product_code: 'LAFX-IAL', material_name: '千斤包', material_code: 'LABJB', usage_per_unit: 1, unit: '个', type: 'aux' },
      { product_name: '烘烤加盐巴旦木', product_code: 'LAFX-IAL', material_name: '盐', material_code: 'MUOI', usage_per_unit: 0.02, unit: 'kg', type: 'aux' },
      { product_name: '烘烤加盐巴旦木', product_code: 'LAFX-IAL', material_name: '味精', material_code: 'BOTNGOT', usage_per_unit: 0.005, unit: 'kg', type: 'aux' },
      { product_name: '烘烤加盐巴旦木', product_code: 'LAFX-IAL', material_name: '双氧水', material_code: 'H2O2', usage_per_unit: 0.01, unit: 'kg', type: 'aux' },
      
      // 烘烤加盐夏威夷果仁 (LAFX-IMCS) - 第二个版本
      { product_name: '烘烤加盐夏威夷果仁', product_code: 'LAFX-IMCS', material_name: '夏威夷果原料', material_code: 'LAMAC1', usage_per_unit: 1, unit: 'kg', type: 'raw' },
      { product_name: '烘烤加盐夏威夷果仁', product_code: 'LAFX-IMCS', material_name: '盐', material_code: 'MUOI', usage_per_unit: 0.02, unit: 'kg', type: 'aux' },
      { product_name: '烘烤加盐夏威夷果仁', product_code: 'LAFX-IMCS', material_name: '铝箔袋（真空包装袋）', material_code: 'TUINHOM', usage_per_unit: 1, unit: '个', type: 'aux' },
      { product_name: '烘烤加盐夏威夷果仁', product_code: 'LAFX-IMCS', material_name: '纸箱', material_code: 'THUNGGIAY', usage_per_unit: 0.05, unit: '个', type: 'aux' },
      
      // 盐炒鹰嘴豆 (LAFX-IGP)
      { product_name: '盐炒鹰嘴豆', product_code: 'LAFX-IGP', material_name: '鹰嘴豆原料', material_code: 'LADG1', usage_per_unit: 1, unit: 'kg', type: 'raw' },
      { product_name: '盐炒鹰嘴豆', product_code: 'LAFX-IGP', material_name: '盐', material_code: 'MUOI', usage_per_unit: 0.02, unit: 'kg', type: 'aux' },
      { product_name: '盐炒鹰嘴豆', product_code: 'LAFX-IGP', material_name: '铝箔袋（真空包装袋）', material_code: 'TUINHOM', usage_per_unit: 1, unit: '个', type: 'aux' },
      { product_name: '盐炒鹰嘴豆', product_code: 'LAFX-IGP', material_name: '纸箱', material_code: 'THUNGGIAY', usage_per_unit: 0.05, unit: '个', type: 'aux' },
      { product_name: '盐炒鹰嘴豆', product_code: 'LAFX-IGP', material_name: '托板', material_code: 'PALET', usage_per_unit: 0.01, unit: '个', type: 'aux' },
      
      // 烘烤加盐巴旦木，B类 (LAFX-IAL1)
      { product_name: '烘烤加盐巴旦木，B类', product_code: 'LAFX-IAL1', material_name: '巴旦木原料', material_code: 'LAHN1', usage_per_unit: 1, unit: 'kg', type: 'raw' },
      { product_name: '烘烤加盐巴旦木，B类', product_code: 'LAFX-IAL1', material_name: '坚果香精 0612', material_code: 'LANFV', usage_per_unit: 0.01, unit: 'kg', type: 'aux' },
      { product_name: '烘烤加盐巴旦木，B类', product_code: 'LAFX-IAL1', material_name: '复合抗氧化剂', material_code: 'LACAN', usage_per_unit: 0.005, unit: 'kg', type: 'aux' },
      { product_name: '烘烤加盐巴旦木，B类', product_code: 'LAFX-IAL1', material_name: '坚果香料包', material_code: 'LARNC', usage_per_unit: 0.01, unit: 'kg', type: 'aux' },
      { product_name: '烘烤加盐巴旦木，B类', product_code: 'LAFX-IAL1', material_name: '糖', material_code: 'LADTL', usage_per_unit: 0.05, unit: 'kg', type: 'aux' },
      { product_name: '烘烤加盐巴旦木，B类', product_code: 'LAFX-IAL1', material_name: '木瓜蛋白酶粉 0313', material_code: 'LAPAP', usage_per_unit: 0.001, unit: 'kg', type: 'aux' },
      { product_name: '烘烤加盐巴旦木，B类', product_code: 'LAFX-IAL1', material_name: '牧场鲜奶粉末香精', material_code: 'LAPMF', usage_per_unit: 0.01, unit: 'kg', type: 'aux' },
      { product_name: '烘烤加盐巴旦木，B类', product_code: 'LAFX-IAL1', material_name: '奶味香精', material_code: 'LAMFV', usage_per_unit: 0.01, unit: 'kg', type: 'aux' },
      { product_name: '烘烤加盐巴旦木，B类', product_code: 'LAFX-IAL1', material_name: '千斤包', material_code: 'LABJB', usage_per_unit: 1, unit: '个', type: 'aux' },
      { product_name: '烘烤加盐巴旦木，B类', product_code: 'LAFX-IAL1', material_name: '盐', material_code: 'MUOI', usage_per_unit: 0.02, unit: 'kg', type: 'aux' },
      { product_name: '烘烤加盐巴旦木，B类', product_code: 'LAFX-IAL1', material_name: '味精', material_code: 'BOTNGOT', usage_per_unit: 0.005, unit: 'kg', type: 'aux' },
      { product_name: '烘烤加盐巴旦木，B类', product_code: 'LAFX-IAL1', material_name: '双氧水', material_code: 'H2O2', usage_per_unit: 0.01, unit: 'kg', type: 'aux' },
      
      // 烘烤加盐夏威夷果，B类 (LAFX-IMC1)
      { product_name: '烘烤加盐夏威夷果，B类', product_code: 'LAFX-IMC1', material_name: '夏威夷果原料', material_code: 'LAMAC1', usage_per_unit: 1, unit: 'kg', type: 'raw' },
      { product_name: '烘烤加盐夏威夷果，B类', product_code: 'LAFX-IMC1', material_name: '甜蜜素', material_code: 'LASDS', usage_per_unit: 0.001, unit: 'kg', type: 'aux' },
      { product_name: '烘烤加盐夏威夷果，B类', product_code: 'LAFX-IMC1', material_name: '糖精钠', material_code: 'LASDC', usage_per_unit: 0.001, unit: 'kg', type: 'aux' },
      { product_name: '烘烤加盐夏威夷果，B类', product_code: 'LAFX-IMC1', material_name: '安赛蜜', material_code: 'LACFK', usage_per_unit: 0.001, unit: 'kg', type: 'aux' },
      { product_name: '烘烤加盐夏威夷果，B类', product_code: 'LAFX-IMC1', material_name: '三氯蔗糖', material_code: 'LASCL', usage_per_unit: 0.001, unit: 'kg', type: 'aux' },
      { product_name: '烘烤加盐夏威夷果，B类', product_code: 'LAFX-IMC1', material_name: '香兰素', material_code: 'LAVNL', usage_per_unit: 0.001, unit: 'kg', type: 'aux' },
      { product_name: '烘烤加盐夏威夷果，B类', product_code: 'LAFX-IMC1', material_name: '糖', material_code: 'LADTL', usage_per_unit: 0.05, unit: 'kg', type: 'aux' },
      { product_name: '烘烤加盐夏威夷果，B类', product_code: 'LAFX-IMC1', material_name: '坚果香精', material_code: 'LARNC', usage_per_unit: 0.01, unit: 'kg', type: 'aux' },
      { product_name: '烘烤加盐夏威夷果，B类', product_code: 'LAFX-IMC1', material_name: '牧场鲜奶粉末香精', material_code: 'LAPMF', usage_per_unit: 0.01, unit: 'kg', type: 'aux' },
      { product_name: '烘烤加盐夏威夷果，B类', product_code: 'LAFX-IMC1', material_name: '奶味香精', material_code: 'LAMFV', usage_per_unit: 0.01, unit: 'kg', type: 'aux' },
      { product_name: '烘烤加盐夏威夷果，B类', product_code: 'LAFX-IMC1', material_name: '千斤包', material_code: 'LABJB', usage_per_unit: 1, unit: '个', type: 'aux' }
    ];

    for (const data of testMappingData) {
      await db.insertProductAuxMapping(
        data.product_name, 
        data.product_code,
        data.material_name, 
        data.material_code, 
        data.usage_per_unit, 
        data.unit,
        data.type
      );
    }
    
    console.log('成品-原料-辅料对照表初始化完成！');
    console.log('对照表记录:', testMappingData.length, '条');
  } catch (error) {
    console.error('初始化成品-原料-辅料对照表失败:', error);
  }
}

initProductAuxMapping(); 