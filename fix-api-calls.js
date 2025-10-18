#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 需要修复的文件列表
const filesToFix = [
  'src/pages/ReferenceDataPage.jsx',
  'src/pages/ProductOutboundPage.jsx',
  'src/pages/RawOutboundPage.jsx',
  'src/pages/ProductInboundPage.jsx',
  'src/pages/AuxInboundPage.jsx',
  'src/pages/InboundPage.jsx',
  'src/pages/CapitalPage.jsx'
];

// 修复函数
function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // 1. 添加api导入
    if (content.includes('fetch(API_BASE_URL') && !content.includes("import { api }")) {
      content = content.replace(
        /import API_BASE_URL from ["']\.\.\/config["'];?/,
        "import { api } from '../utils/api';"
      );
      modified = true;
    }

    // 2. 替换fetch调用
    const fetchReplacements = [
      // GET请求
      { from: /fetch\(API_BASE_URL \+ "([^"]+)"\)/g, to: 'api.get("$1")' },
      { from: /fetch\(API_BASE_URL \+ '([^']+)'\)/g, to: "api.get('$1')" },
      
      // POST请求
      { from: /fetch\(API_BASE_URL \+ "([^"]+)",\s*{\s*method:\s*['"]POST['"]/g, to: 'api.post("$1"' },
      { from: /fetch\(API_BASE_URL \+ '([^']+)',\s*{\s*method:\s*['"]POST['"]/g, to: "api.post('$1'" },
      
      // PUT请求
      { from: /fetch\(API_BASE_URL \+ "([^"]+)",\s*{\s*method:\s*['"]PUT['"]/g, to: 'api.put("$1"' },
      { from: /fetch\(API_BASE_URL \+ '([^']+)',\s*{\s*method:\s*['"]PUT['"]/g, to: "api.put('$1'" },
      
      // DELETE请求
      { from: /fetch\(API_BASE_URL \+ "([^"]+)",\s*{\s*method:\s*['"]DELETE['"]/g, to: 'api.delete("$1")' },
      { from: /fetch\(API_BASE_URL \+ '([^']+)',\s*{\s*method:\s*['"]DELETE['"]/g, to: "api.delete('$1')" }
    ];

    fetchReplacements.forEach(({ from, to }) => {
      if (from.test(content)) {
        content = content.replace(from, to);
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ 修复了 ${filePath}`);
    } else {
      console.log(`⏭️  ${filePath} 无需修复`);
    }
  } catch (error) {
    console.error(`❌ 修复 ${filePath} 时出错:`, error.message);
  }
}

// 执行修复
console.log('🔧 开始修复API调用...');
filesToFix.forEach(fixFile);
console.log('✅ 修复完成！');