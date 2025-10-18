#!/usr/bin/env node

/**
 * 批量修复API调用脚本
 * 将所有直接使用fetch的页面改为使用带认证的API工具
 */

const fs = require('fs');
const path = require('path');

// 需要修复的文件列表
const filesToFix = [
  'src/pages/AssetManagementPage.jsx',
  'src/pages/DataManagementPage.jsx',
  'src/pages/CapitalPage.jsx',
  'src/pages/ReferenceDataPage.jsx',
  'src/pages/InventoryPage.jsx',
  'src/pages/InboundPage.jsx',
  'src/pages/RawOutboundPage.jsx',
  'src/pages/AuxInboundPage.jsx',
  'src/pages/ProductInboundPage.jsx',
  'src/pages/ProductOutboundPage.jsx'
];

// 修复单个文件
function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // 1. 添加API工具导入
    if (content.includes('import API_BASE_URL from') && !content.includes('import { api }')) {
      content = content.replace(
        /import API_BASE_URL from ['"]\.\.\/config['"];?/g,
        "import API_BASE_URL from '../config';\nimport { api } from '../utils/api';"
      );
      modified = true;
    }

    // 2. 替换fetch调用为api.get
    content = content.replace(
      /fetch\(API_BASE_URL \+ ['"]([^'"]+)['"],\s*{\s*method:\s*['"]GET['"]/g,
      'api.get("$1")'
    );

    // 3. 替换fetch调用为api.post
    content = content.replace(
      /fetch\(API_BASE_URL \+ ['"]([^'"]+)['"],\s*{\s*method:\s*['"]POST['"]/g,
      'api.post("$1", data)'
    );

    // 4. 替换fetch调用为api.put
    content = content.replace(
      /fetch\(API_BASE_URL \+ ['"]([^'"]+)['"],\s*{\s*method:\s*['"]PUT['"]/g,
      'api.put("$1", data)'
    );

    // 5. 替换fetch调用为api.delete
    content = content.replace(
      /fetch\(API_BASE_URL \+ ['"]([^'"]+)['"],\s*{\s*method:\s*['"]DELETE['"]/g,
      'api.delete("$1")'
    );

    // 6. 处理Promise.all中的fetch调用
    content = content.replace(
      /fetch\(API_BASE_URL \+ ['"]([^'"]+)['"]\)/g,
      'api.get("$1")'
    );

    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ 已修复: ${filePath}`);
    } else {
      console.log(`⏭️  跳过: ${filePath} (无需修复)`);
    }
  } catch (error) {
    console.error(`❌ 修复失败: ${filePath}`, error.message);
  }
}

// 执行修复
console.log('🔧 开始修复API调用...');
filesToFix.forEach(fixFile);
console.log('✅ 修复完成！');
