const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./db-sqlite');

// 创建uploads目录
let uploadsDir;
if (process.env.NODE_ENV === 'development') {
  uploadsDir = path.join(__dirname, 'uploads');
} else {
  // 在打包后的应用中，使用用户数据目录
  const userDataPath = process.env.APPDATA || (process.platform === 'darwin' ? process.env.HOME + '/Library/Application Support' : process.env.HOME + '/.config');
  const appDataPath = path.join(userDataPath, 'Warehouse Management System');
  uploadsDir = path.join(appDataPath, 'uploads');
}

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// 配置multer用于文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // 生成文件名：柜号_时间戳.pdf
    const container = req.body.container || 'unknown';
    const timestamp = Date.now();
    cb(null, `${container}_${timestamp}.pdf`);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    console.log('File upload attempt:', file.originalname, 'mimetype:', file.mimetype);
    // 检查文件扩展名和MIME类型
    if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
      cb(null, true);
    } else {
      console.log('File rejected:', file.originalname, 'mimetype:', file.mimetype);
      cb(new Error('只允许上传PDF文件'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 限制10MB
  }
});

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务，用于访问上传的PDF文件
app.use('/uploads', express.static(uploadsDir));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});



// 用户认证
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await db.getUserByUsername(username);
    
    if (user && user.password === password) {
      res.json({
        success: true,
        user: {
          username: user.username,
          role: user.role
        }
      });
    } else {
      res.status(401).json({ success: false, message: '用户名或密码错误' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '登录失败' });
  }
});

// 物料字典
app.get('/api/materials', async (req, res) => {
  try {
    const data = await db.getAllMaterials();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '数据库读取失败' });
  }
});

app.post('/api/materials', async (req, res) => {
  try {
    const { code, name, unit } = req.body;
    const result = await db.insertMaterial(code, name, unit);
    res.status(201).json({ id: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '数据库写入失败' });
  }
});

// 辅料字典
app.get('/api/aux-materials', async (req, res) => {
  try {
    const data = await db.getAllAuxMaterials();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '数据库读取失败' });
  }
});

app.post('/api/aux-materials', async (req, res) => {
  try {
    const { code, name, unit } = req.body;
    const result = await db.insertAuxMaterial(code, name, unit);
    res.status(201).json({ id: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '数据库写入失败' });
  }
});

// 产品管理
app.get('/api/products', async (req, res) => {
  try {
    const data = await db.getAllProducts();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '数据库读取失败' });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { code, name, unit } = req.body;
    const result = await db.insertProduct(code, name, unit);
    res.status(201).json({ id: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '数据库写入失败' });
  }
});

// 产品配方管理
app.get('/api/product-bom', async (req, res) => {
  try {
    const data = await db.getAllProductBom();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '数据库读取失败' });
  }
});

app.post('/api/product-bom', async (req, res) => {
  try {
    const { product_code, material_code, quantity } = req.body;
    const result = await db.insertProductBom(product_code, material_code, quantity);
    res.status(201).json({ id: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '数据库写入失败' });
  }
});

// 原料入库
app.get('/api/raw-inout', async (req, res) => {
  try {
    const data = await db.getAllRawInout();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '数据库读取失败' });
  }
});

app.delete('/api/raw-inbound/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.deleteRawInbound(id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '删除失败' });
  }
});

app.delete('/api/aux-inbound/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.deleteAuxInbound(id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '删除失败' });
  }
});

app.delete('/api/product-inbound/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.deleteProductInbound(id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '删除失败' });
  }
});

app.delete('/api/raw-outbound/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.deleteRawOutById(id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '删除失败' });
  }
});

app.delete('/api/aux-outbound/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.deleteAuxOutbound(id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '删除失败' });
  }
});

app.delete('/api/product-outbound/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.deleteProductOutbound(id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '删除失败' });
  }
});

app.delete('/api/assets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.deleteAsset(id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '删除失败' });
  }
});

app.post('/api/raw-inout', upload.single('quality_report'), async (req, res) => {
  try {
    console.log('Raw inbound request received:', req.body);
    console.log('Uploaded file:', req.file);
    const { date, material_name, declaration_no, container, quantity, type } = req.body;
    
    // 获取上传的文件路径
    const qualityReportPath = req.file ? `/uploads/${req.file.filename}` : null;
    console.log('Quality report path:', qualityReportPath);
    
    const result = await db.insertRawInout(date, material_name, declaration_no, container, quantity, qualityReportPath);
    console.log('Raw inbound inserted successfully, ID:', result);
    res.status(201).json({ id: result });
  } catch (err) {
    console.error('Raw inbound error:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({ error: '数据库写入失败', details: err.message });
  }
});

app.delete('/api/raw-inout/:id', async (req, res) => {
  try {
    await db.deleteRawInoutById(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '删除失败' });
  }
});

// 辅料入库
app.get('/api/aux-inout', async (req, res) => {
  try {
    const data = await db.getAllAuxInout();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '数据库读取失败' });
  }
});

app.post('/api/aux-inout', upload.single('quality_report'), async (req, res) => {
  try {
    const { date, aux_code, aux_name, quantity, unit } = req.body;
    
    // 获取上传的文件路径
    const qualityReportPath = req.file ? `/uploads/${req.file.filename}` : null;
    
    const result = await db.insertAuxInout(date, aux_code, aux_name, quantity, unit, qualityReportPath);
    res.status(201).json({ id: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '数据库写入失败' });
  }
});

app.delete('/api/aux-inout/:id', async (req, res) => {
  try {
    await db.deleteAuxInoutById(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '删除失败' });
  }
});

// 原料出库
app.get('/api/raw-out', async (req, res) => {
  try {
    const data = await db.getAllRawOut();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '数据库读取失败' });
  }
});

app.post('/api/raw-out', async (req, res) => {
  try {
    const { material_name, quantity, container, outbound_date, purpose, operator, notes } = req.body;
    const result = await db.insertRawOut(material_name, quantity, container, outbound_date, purpose, operator, notes);
    res.status(201).json({ id: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '数据库写入失败' });
  }
});

app.delete('/api/raw-out/:id', async (req, res) => {
  try {
    await db.deleteRawOutById(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '删除失败' });
  }
});

// 原料出库
app.get('/api/raw-outbound', async (req, res) => {
  try {
    const data = await db.getAllRawOut();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '数据库读取失败' });
  }
});

app.post('/api/raw-outbound', async (req, res) => {
  try {
    const { material_name, quantity, container, outbound_date, purpose, operator, notes } = req.body;
    const result = await db.insertRawOut(material_name, quantity, container, outbound_date, purpose, operator, notes);
    res.status(201).json({ id: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '数据库写入失败' });
  }
});

// 辅料出库
app.get('/api/aux-outbound', async (req, res) => {
  try {
    const data = await db.getAllAuxOutbound();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '数据库读取失败' });
  }
});

app.post('/api/aux-outbound', async (req, res) => {
  try {
    const { date, aux_code, aux_name, container, quantity, destination } = req.body;
    const result = await db.insertAuxOutbound(date, aux_code, aux_name, container, quantity, destination);
    res.status(201).json({ id: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '数据库写入失败' });
  }
});

app.delete('/api/aux-outbound/:id', async (req, res) => {
  try {
    await db.deleteAuxOutboundById(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '删除失败' });
  }
});

// 产品出库
app.get('/api/product-outbound', async (req, res) => {
  try {
    const data = await db.getAllProductOutbound();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '数据库读取失败' });
  }
});

app.post('/api/product-outbound', async (req, res) => {
  try {
    const { product_name, batch_number, quantity, outbound_date, destination, operator, notes, aux_usage } = req.body;
    const result = await db.insertProductOutbound(product_name, batch_number, quantity, outbound_date, destination, operator, notes, aux_usage);
    res.status(201).json({ id: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '数据库写入失败' });
  }
});

app.delete('/api/product-outbound/:id', async (req, res) => {
  try {
    await db.deleteProductOutboundById(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '删除失败' });
  }
});

// 成品辅料对照表相关API
app.get('/api/product-aux-mapping', async (req, res) => {
  try {
    const data = await db.getAllProductAuxMapping();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '数据库读取失败' });
  }
});

app.get('/api/product-aux-mapping/:productName', async (req, res) => {
  try {
    const data = await db.getProductAuxMappingByProduct(req.params.productName);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '数据库读取失败' });
  }
});

app.post('/api/product-aux-mapping', async (req, res) => {
  try {
    const { product_name, product_code, material_name, material_code, usage_per_unit, unit, type } = req.body;
    const result = await db.insertProductAuxMapping(product_name, product_code, material_name, material_code, usage_per_unit, unit, type);
    res.status(201).json({ id: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '数据库写入失败' });
  }
});

// 仪表盘数据
app.get('/api/dashboard', async (req, res) => {
  try {
    // 获取各种统计数据
    const rawInboundData = await db.getAllRawInout();
    const auxInboundData = await db.getAllAuxInout();
    const productInboundData = await db.getAllProductInbound();
    const rawOutboundData = await db.getAllRawOut();
    const productOutboundData = await db.getAllProductOutbound();
    const productMappings = await db.getAllProductAuxMapping();

    // 计算库存统计
    const rawInventory = calculateRawInventory(rawInboundData, rawOutboundData);
    const auxInventory = calculateAuxInventory(auxInboundData, []);
    const productInventory = calculateProductInventory(productInboundData, productOutboundData);

    // 计算统计数据
    const stats = {
      total_raw_materials: rawInventory.length,
      total_aux_materials: auxInventory.length,
      total_products: productInventory.length,
      total_products_types: new Set(productMappings.map(m => m.product_name)).size,
      total_raw_types: new Set(rawInventory.map(r => r.materialName)).size,
      total_aux_types: new Set(auxInventory.map(a => a.materialName)).size,
      recent_inbound_records: rawInboundData.slice(0, 5),
      recent_outbound_records: rawOutboundData.slice(0, 5),
      low_stock_items: [...rawInventory, ...auxInventory, ...productInventory]
        .filter(item => item.remainingQuantity < 100) // 低库存阈值
        .slice(0, 10)
    };

    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '数据库读取失败' });
  }
});

// 辅助函数：计算原料库存
function calculateRawInventory(inboundData, outboundData) {
  const inventoryMap = new Map();
  
  inboundData.forEach(record => {
    const key = `${record.material_name}_${record.container}`;
    if (!inventoryMap.has(key)) {
      inventoryMap.set(key, {
        materialName: record.material_name,
        container: record.container,
        inboundQuantity: 0,
        outboundQuantity: 0,
        remainingQuantity: 0
      });
    }
    const item = inventoryMap.get(key);
    item.inboundQuantity += parseFloat(record.quantity) || 0;
  });

  outboundData.forEach(record => {
    const key = `${record.material_name}_${record.container}`;
    if (inventoryMap.has(key)) {
      const item = inventoryMap.get(key);
      item.outboundQuantity += parseFloat(record.quantity) || 0;
    }
  });

  inventoryMap.forEach(item => {
    item.remainingQuantity = item.inboundQuantity - item.outboundQuantity;
  });

  return Array.from(inventoryMap.values())
    .filter(item => item.remainingQuantity > 0)
    .sort((a, b) => b.remainingQuantity - a.remainingQuantity);
}

// 辅助函数：计算辅料库存
function calculateAuxInventory(inboundData, outboundData) {
  const inventoryMap = new Map();
  
  inboundData.forEach(record => {
    const key = `${record.aux_name}_${record.aux_code}`;
    if (!inventoryMap.has(key)) {
      inventoryMap.set(key, {
        materialName: record.aux_name,
        materialCode: record.aux_code,
        inboundQuantity: 0,
        outboundQuantity: 0,
        remainingQuantity: 0
      });
    }
    const item = inventoryMap.get(key);
    item.inboundQuantity += parseFloat(record.quantity) || 0;
  });

  return Array.from(inventoryMap.values())
    .filter(item => item.remainingQuantity > 0)
    .sort((a, b) => b.remainingQuantity - a.remainingQuantity);
}

// 辅助函数：计算成品库存
function calculateProductInventory(inboundData, outboundData) {
  const inventoryMap = new Map();
  
  inboundData.forEach(record => {
    const key = `${record.product_name}_${record.batch_number}`;
    if (!inventoryMap.has(key)) {
      inventoryMap.set(key, {
        materialName: record.product_name,
        batchNumber: record.batch_number,
        inboundQuantity: 0,
        outboundQuantity: 0,
        remainingQuantity: 0
      });
    }
    const item = inventoryMap.get(key);
    item.inboundQuantity += parseFloat(record.quantity) || 0;
  });

  outboundData.forEach(record => {
    const key = `${record.product_name}_${record.batch_number}`;
    if (inventoryMap.has(key)) {
      const item = inventoryMap.get(key);
      item.outboundQuantity += parseFloat(record.quantity) || 0;
    }
  });

  inventoryMap.forEach(item => {
    item.remainingQuantity = item.inboundQuantity - item.outboundQuantity;
  });

  return Array.from(inventoryMap.values())
    .filter(item => item.remainingQuantity > 0)
    .sort((a, b) => b.remainingQuantity - a.remainingQuantity);
}

// 资产管理API
app.get('/api/assets', async (req, res) => {
  try {
    const data = await db.getAllAssets();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '数据库读取失败' });
  }
});

app.get('/api/assets/:category', async (req, res) => {
  try {
    const data = await db.getAssetsByCategory(req.params.category);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '数据库读取失败' });
  }
});

app.post('/api/assets', async (req, res) => {
  try {
    const { 
      asset_name, asset_code, category, description, purchase_date, 
      purchase_price, current_value, location, status, responsible_person, 
      department, supplier, warranty_expiry, maintenance_cycle, 
      last_maintenance_date, next_maintenance_date, notes 
    } = req.body;
    
    const result = await db.insertAsset(
      asset_name, asset_code, category, description, purchase_date,
      purchase_price, current_value, location, status, responsible_person,
      department, supplier, warranty_expiry, maintenance_cycle,
      last_maintenance_date, next_maintenance_date, notes
    );
    res.status(201).json({ id: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '数据库写入失败' });
  }
});

app.put('/api/assets/:id', async (req, res) => {
  try {
    const { 
      asset_name, asset_code, category, description, purchase_date, 
      purchase_price, current_value, location, status, responsible_person, 
      department, supplier, warranty_expiry, maintenance_cycle, 
      last_maintenance_date, next_maintenance_date, notes 
    } = req.body;
    
    await db.updateAsset(
      req.params.id, asset_name, asset_code, category, description, purchase_date,
      purchase_price, current_value, location, status, responsible_person,
      department, supplier, warranty_expiry, maintenance_cycle,
      last_maintenance_date, next_maintenance_date, notes
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '数据库更新失败' });
  }
});

app.delete('/api/assets/:id', async (req, res) => {
  try {
    await db.deleteAssetById(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '删除失败' });
  }
});

// 资产维护记录API
app.get('/api/assets/:id/maintenance', async (req, res) => {
  try {
    const data = await db.getAssetMaintenance(req.params.id);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '数据库读取失败' });
  }
});

app.post('/api/assets/:id/maintenance', async (req, res) => {
  try {
    const { maintenance_date, maintenance_type, description, cost, technician, next_maintenance_date } = req.body;
    const result = await db.insertAssetMaintenance(
      req.params.id, maintenance_date, maintenance_type, description, cost, technician, next_maintenance_date
    );
    res.status(201).json({ id: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '数据库写入失败' });
  }
});

// 资产折旧记录API
app.get('/api/assets/:id/depreciation', async (req, res) => {
  try {
    const data = await db.getAssetDepreciation(req.params.id);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '数据库读取失败' });
  }
});

app.post('/api/assets/:id/depreciation', async (req, res) => {
  try {
    const { depreciation_date, depreciation_amount, remaining_value, depreciation_rate } = req.body;
    const result = await db.insertAssetDepreciation(
      req.params.id, depreciation_date, depreciation_amount, remaining_value, depreciation_rate
    );
    res.status(201).json({ id: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '数据库写入失败' });
  }
});

// 财务相关API
app.get('/api/finance/raw-inbound', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let data;
    if (startDate && endDate) {
      data = await db.getFinanceRawInboundByDateRange(startDate, endDate);
    } else {
      data = await db.getAllFinanceRawInbound();
    }
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '数据库读取失败' });
  }
});

app.post('/api/finance/raw-inbound', async (req, res) => {
  try {
    const { raw_inbound_id, material_name, container, quantity, cif_price, customs_fee, total_cost, unit_cost, import_date } = req.body;
    const result = await db.insertFinanceRawInbound(raw_inbound_id, material_name, container, quantity, cif_price, customs_fee, total_cost, unit_cost, import_date);
    res.status(201).json({ id: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '数据库写入失败' });
  }
});

app.put('/api/finance/raw-inbound/:id', async (req, res) => {
  try {
    const { cif_price, customs_fee, total_cost, unit_cost } = req.body;
    await db.updateFinanceRawInbound(req.params.id, cif_price, customs_fee, total_cost, unit_cost);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '数据库更新失败' });
  }
});

app.get('/api/finance/aux-inbound', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let data;
    if (startDate && endDate) {
      data = await db.getFinanceAuxInboundByDateRange(startDate, endDate);
    } else {
      data = await db.getAllFinanceAuxInbound();
    }
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '数据库读取失败' });
  }
});

app.post('/api/finance/aux-inbound', async (req, res) => {
  try {
    const { aux_inbound_id, aux_name, aux_code, quantity, unit_price, total_cost, import_date } = req.body;
    const result = await db.insertFinanceAuxInbound(aux_inbound_id, aux_name, aux_code, quantity, unit_price, total_cost, import_date);
    res.status(201).json({ id: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '数据库写入失败' });
  }
});

app.put('/api/finance/aux-inbound/:id', async (req, res) => {
  try {
    const { unit_price, total_cost } = req.body;
    await db.updateFinanceAuxInbound(req.params.id, unit_price, total_cost);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '数据库更新失败' });
  }
});

app.get('/api/finance/product-outbound', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let data;
    if (startDate && endDate) {
      data = await db.getFinanceProductOutboundByDateRange(startDate, endDate);
    } else {
      data = await db.getAllFinanceProductOutbound();
    }
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '数据库读取失败' });
  }
});

app.post('/api/finance/product-outbound', async (req, res) => {
  try {
    const { product_outbound_id, product_name, batch_number, quantity, cif_price, discount_rate, shipping_fee, customs_fee, total_revenue, unit_revenue, outbound_date } = req.body;
    const result = await db.insertFinanceProductOutbound(product_outbound_id, product_name, batch_number, quantity, cif_price, discount_rate, shipping_fee, customs_fee, total_revenue, unit_revenue, outbound_date);
    res.status(201).json({ id: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '数据库写入失败' });
  }
});

app.put('/api/finance/product-outbound/:id', async (req, res) => {
  try {
    const { cif_price, discount_rate, shipping_fee, customs_fee, total_revenue, unit_revenue } = req.body;
    await db.updateFinanceProductOutbound(req.params.id, cif_price, discount_rate, shipping_fee, customs_fee, total_revenue, unit_revenue);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '数据库更新失败' });
  }
});

app.get('/api/finance/summary', async (req, res) => {
  try {
    const data = await db.getAllFinanceSummary();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '数据库读取失败' });
  }
});

app.post('/api/finance/summary', async (req, res) => {
  try {
    const { period_start, period_end, total_raw_cost, total_aux_cost, total_product_revenue, gross_profit, profit_margin } = req.body;
    const result = await db.insertFinanceSummary(period_start, period_end, total_raw_cost, total_aux_cost, total_product_revenue, gross_profit, profit_margin);
    res.status(201).json({ id: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '数据库写入失败' });
  }
});

// 获取未录入财务数据的入库记录
app.get('/api/finance/unprocessed-raw-inbound', async (req, res) => {
  try {
    const rawInboundData = await db.getAllRawInout();
    const financeRawInboundData = await db.getAllFinanceRawInbound();
    
    const processedIds = new Set(financeRawInboundData.map(item => item.raw_inbound_id));
    const unprocessedData = rawInboundData.filter(item => !processedIds.has(item.id));
    
    res.json(unprocessedData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '数据库读取失败' });
  }
});

app.get('/api/finance/unprocessed-aux-inbound', async (req, res) => {
  try {
    const auxInboundData = await db.getAllAuxInout();
    const financeAuxInboundData = await db.getAllFinanceAuxInbound();
    
    const processedIds = new Set(financeAuxInboundData.map(item => item.aux_inbound_id));
    const unprocessedData = auxInboundData.filter(item => !processedIds.has(item.id));
    
    res.json(unprocessedData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '数据库读取失败' });
  }
});

app.get('/api/finance/unprocessed-product-outbound', async (req, res) => {
  try {
    const productOutboundData = await db.getAllProductOutbound();
    const financeProductOutboundData = await db.getAllFinanceProductOutbound();
    
    const processedIds = new Set(financeProductOutboundData.map(item => item.product_outbound_id));
    const unprocessedData = productOutboundData.filter(item => !processedIds.has(item.id));
    
    res.json(unprocessedData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '数据库读取失败' });
  }
});

// 品类数据参考
app.get('/api/reference-data', async (req, res) => {
  try {
    // 获取所有产品配方映射
    const productMappings = await db.getAllProductAuxMapping();
    
    // 按产品分组
    const products = {};
    productMappings.forEach(mapping => {
      const productKey = `${mapping.product_name}_${mapping.product_code}`;
      if (!products[productKey]) {
        products[productKey] = {
          product_name: mapping.product_name,
          product_code: mapping.product_code,
          raw_materials: [],
          auxiliary_materials: []
        };
      }
      
      if (mapping.type === 'raw') {
        products[productKey].raw_materials.push({
          material_name: mapping.material_name,
          material_code: mapping.material_code
        });
      } else if (mapping.type === 'aux') {
        products[productKey].auxiliary_materials.push({
          material_name: mapping.material_name,
          material_code: mapping.material_code
        });
      }
    });

    // 获取所有原料类型
    const rawMaterials = [...new Set(productMappings
      .filter(m => m.type === 'raw')
      .map(m => ({ name: m.material_name, code: m.material_code })))];

    // 获取所有辅料类型及其使用的产品
    const auxMaterialMap = {};
    productMappings
      .filter(m => m.type === 'aux')
      .forEach(mapping => {
        const key = `${mapping.material_name}_${mapping.material_code}`;
        if (!auxMaterialMap[key]) {
          auxMaterialMap[key] = {
            name: mapping.material_name,
            code: mapping.material_code,
            products: []
          };
        }
        if (!auxMaterialMap[key].products.includes(mapping.product_name)) {
          auxMaterialMap[key].products.push(mapping.product_name);
        }
      });
    
    const auxiliaryMaterials = Object.values(auxMaterialMap);

    res.json({
      products: Object.values(products),
      raw_materials: rawMaterials,
      auxiliary_materials: auxiliaryMaterials,
      total_products: Object.keys(products).length,
      total_raw_materials: rawMaterials.length,
      total_auxiliary_materials: auxiliaryMaterials.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '数据库读取失败' });
  }
});

// 文件上传相关API
app.post('/api/upload-quality-report', upload.single('quality_report'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '没有上传文件' });
    }
    
    const filePath = `/uploads/${req.file.filename}`;
    res.json({ 
      success: true, 
      filePath: filePath,
      filename: req.file.filename,
      originalName: req.file.originalname
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '文件上传失败' });
  }
});

// 获取文件列表
app.get('/api/quality-reports', async (req, res) => {
  try {
    const files = fs.readdirSync(uploadsDir);
    const pdfFiles = files.filter(file => file.endsWith('.pdf'));
    
    const fileList = pdfFiles.map(file => ({
      filename: file,
      path: `/uploads/${file}`,
      size: fs.statSync(path.join(uploadsDir, file)).size,
      uploadTime: fs.statSync(path.join(uploadsDir, file)).mtime
    }));
    
    res.json(fileList);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '获取文件列表失败' });
  }
});

// 删除文件
app.delete('/api/quality-reports/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(uploadsDir, filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: '文件不存在' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '删除文件失败' });
  }
});

// 成品入库
app.get('/api/product-inbound', async (req, res) => {
  try {
    const data = await db.getAllProductInbound();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '数据库读取失败' });
  }
});

app.post('/api/product-inbound', async (req, res) => {
  try {
    const { product_name, batch_number, quantity, inbound_date, production_date, expiry_date, operator, notes } = req.body;
    
    const result = await db.insertProductInbound(product_name, batch_number, quantity, inbound_date, production_date, expiry_date, operator, notes);
    res.status(201).json({ id: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '数据库写入失败' });
  }
});

app.delete('/api/product-inbound/:id', async (req, res) => {
  try {
    console.log('Attempting to delete product-inbound with ID:', req.params.id);
    const result = await db.deleteProductInboundById(req.params.id);
    console.log('Delete result:', result);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete product-inbound error:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({ error: '删除失败', details: err.message });
  }
});

// 资金记录
app.get('/api/capital', async (req, res) => {
  try {
    const data = await db.getAllCapital();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '数据库读取失败' });
  }
});

app.post('/api/capital', async (req, res) => {
  try {
    const { date, description, price, type } = req.body;
    const result = await db.insertCapital(date, description, price, type);
    res.status(201).json({ id: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '数据库写入失败' });
  }
});

app.delete('/api/capital/:id', async (req, res) => {
  try {
    await db.deleteCapitalById(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '删除失败' });
  }
});

// 库存数据
app.get('/api/stock', async (req, res) => {
  try {
    const data = await db.getAllStock();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '数据库读取失败' });
  }
});

app.post('/api/stock', async (req, res) => {
  try {
    const { code, name, unit, current_qty, actual_qty, difference, note } = req.body;
    const result = await db.insertStock(code, name, unit, current_qty, actual_qty, difference, note);
    res.status(201).json({ id: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '数据库写入失败' });
  }
});

app.put('/api/stock/:id', async (req, res) => {
  try {
    const { actual_qty, difference, note } = req.body;
    await db.updateStock(req.params.id, actual_qty, difference, note);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '更新失败' });
  }
});

// 操作日志
app.get('/api/logs', async (req, res) => {
  try {
    const data = await db.getAllLogs();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '数据库读取失败' });
  }
});

app.post('/api/logs', async (req, res) => {
  try {
    const { operation, table_name, record_id, details, user } = req.body;
    
    // 确保必需字段不为空
    if (!operation || !table_name || !user) {
      return res.status(400).json({ error: '缺少必需字段: operation, table_name, user' });
    }
    
    const result = await db.insertLog(operation, table_name, record_id || 0, details || '', user);
    res.status(201).json({ id: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '数据库写入失败' });
  }
});


const PORT = process.env.PORT || 4000;

// 只有在直接运行此文件时才启动服务器
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// 导出app以便其他模块可以使用
module.exports = app; 