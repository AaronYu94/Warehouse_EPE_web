import React, { useState, useEffect } from 'react';
import { Package, TrendingUp, BarChart3, Database } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';
import { api } from '../utils/api';

export default function InventoryPage() {
  const { t } = useI18n();
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summaryData, setSummaryData] = useState({
    totalMaterials: 0,
    totalContainers: 0,
    totalQuantity: 0
  });

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    setLoading(true);
    try {
      // 获取原料入库数据
      const rawInboundResponse = await api.get("/api/raw-inout");
      const rawInboundData = rawInboundResponse.ok ? await rawInboundResponse.json() : [];
      
      // 获取原料出库数据
      const rawOutboundResponse = await api.get("/api/raw-out");
      const rawOutboundData = rawOutboundResponse.ok ? await rawOutboundResponse.json() : [];
      
      // 获取辅料入库数据
      const auxInboundResponse = await api.get("/api/aux-inout");
      const auxInboundData = auxInboundResponse.ok ? await auxInboundResponse.json() : [];
      
      // 获取辅料出库数据
      const auxOutboundResponse = await api.get("/api/aux-outbound");
      const auxOutboundData = auxOutboundResponse.ok ? await auxOutboundResponse.json() : [];
      
      // 获取成品入库数据
      const productInboundResponse = await api.get("/api/product-inbound");
      const productInboundData = productInboundResponse.ok ? await productInboundResponse.json() : [];
      
      // 获取成品出库数据
      const productOutboundResponse = await api.get("/api/product-outbound");
      const productOutboundData = productOutboundResponse.ok ? await productOutboundResponse.json() : [];
      
      // 计算库存
      const rawInventory = calculateRawInventory(rawInboundData, rawOutboundData);
      const auxInventory = calculateAuxInventory(auxInboundData, auxOutboundData);
      const productInventory = calculateProductInventory(productInboundData, productOutboundData);
      const allInventory = [...rawInventory, ...auxInventory, ...productInventory];
      setInventoryData(allInventory);
      
      // 计算汇总数据
      const summary = calculateSummary(allInventory);
      setSummaryData(summary);
    } catch (error) {
      console.error('获取库存数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateRawInventory = (inboundData, outboundData) => {
    const inventoryMap = new Map();
    
    // 处理入库数据
    inboundData.forEach(record => {
      const key = `${record.material_name}_${record.container}`;
      if (!inventoryMap.has(key)) {
        inventoryMap.set(key, {
          type: 'raw',
          materialName: record.material_name,
          container: record.container,
          declarationNo: record.declaration_no,
          inboundQuantity: 0,
          outboundQuantity: 0,
          remainingQuantity: 0
        });
      }
      const item = inventoryMap.get(key);
      item.inboundQuantity += parseFloat(record.quantity) || 0;
    });
    
    // 处理出库数据
    outboundData.forEach(record => {
      const key = `${record.material_name}_${record.container}`;
      if (inventoryMap.has(key)) {
        const item = inventoryMap.get(key);
        item.outboundQuantity += parseFloat(record.quantity) || 0;
      }
    });
    
    // 计算剩余数量
    inventoryMap.forEach(item => {
      item.remainingQuantity = item.inboundQuantity - item.outboundQuantity;
    });
    
    // 转换为数组并按剩余数量排序
    return Array.from(inventoryMap.values())
      .filter(item => item.remainingQuantity > 0)
      .sort((a, b) => b.remainingQuantity - a.remainingQuantity);
  };

  const calculateAuxInventory = (inboundData, outboundData) => {
    const inventoryMap = new Map();
    
    // 处理入库数据
    inboundData.forEach(record => {
      const key = `${record.aux_name}`;
      if (!inventoryMap.has(key)) {
        inventoryMap.set(key, {
          type: 'aux',
          materialName: record.aux_name,
          auxCode: record.aux_code,
          unit: record.unit,
          inboundQuantity: 0,
          outboundQuantity: 0,
          remainingQuantity: 0
        });
      }
      const item = inventoryMap.get(key);
      item.inboundQuantity += parseFloat(record.quantity) || 0;
    });
    
    // 处理出库数据
    outboundData.forEach(record => {
      const key = `${record.aux_name}`;
      if (inventoryMap.has(key)) {
        const item = inventoryMap.get(key);
        item.outboundQuantity += parseFloat(record.quantity) || 0;
      }
    });
    
    // 计算剩余数量
    inventoryMap.forEach(item => {
      item.remainingQuantity = item.inboundQuantity - item.outboundQuantity;
    });
    
    // 转换为数组并按剩余数量排序
    return Array.from(inventoryMap.values())
      .filter(item => item.remainingQuantity > 0)
      .sort((a, b) => b.remainingQuantity - a.remainingQuantity);
  };

  const calculateProductInventory = (inboundData, outboundData) => {
    const inventoryMap = new Map();
    
    // 处理入库数据
    inboundData.forEach(record => {
      const key = `${record.product_name}_${record.batch_number}`;
      if (!inventoryMap.has(key)) {
        inventoryMap.set(key, {
          type: 'product',
          materialName: record.product_name,
          batchNumber: record.batch_number,
          unit: 'kg',
          inboundQuantity: 0,
          outboundQuantity: 0,
          remainingQuantity: 0,
          productionDate: record.production_date,
          expiryDate: record.expiry_date,
          operator: record.operator
        });
      }
      const item = inventoryMap.get(key);
      item.inboundQuantity += parseFloat(record.quantity) || 0;
    });
    
    // 处理出库数据
    outboundData.forEach(record => {
      const key = `${record.product_name}_${record.batch_number}`;
      if (inventoryMap.has(key)) {
        const item = inventoryMap.get(key);
        item.outboundQuantity += parseFloat(record.quantity) || 0;
      }
    });
    
    // 计算剩余数量
    inventoryMap.forEach(item => {
      item.remainingQuantity = item.inboundQuantity - item.outboundQuantity;
    });
    
    // 转换为数组并按剩余数量排序
    return Array.from(inventoryMap.values())
      .filter(item => item.remainingQuantity > 0)
      .sort((a, b) => b.remainingQuantity - a.remainingQuantity);
  };

  const calculateSummary = (inventory) => {
    const materialSet = new Set();
    const containerSet = new Set();
    let totalQuantity = 0;
    
    inventory.forEach(item => {
      materialSet.add(item.materialName);
      containerSet.add(item.container);
      totalQuantity += item.remainingQuantity;
    });
    
    return {
      totalMaterials: materialSet.size,
      totalContainers: containerSet.size,
      totalQuantity: totalQuantity
    };
  };

  const getMaterialSummary = () => {
    const materialMap = new Map();
    
    inventoryData.forEach(item => {
      if (!materialMap.has(item.materialName)) {
        materialMap.set(item.materialName, {
          materialName: item.materialName,
          type: item.type,
          totalQuantity: 0,
          containers: new Set(),
          unit: item.unit || 'kg'
        });
      }
      const material = materialMap.get(item.materialName);
      material.totalQuantity += item.remainingQuantity;
      if (item.container) {
        material.containers.add(item.container);
      }
    });
    
    return Array.from(materialMap.values()).map(item => ({
      ...item,
      containerCount: item.containers.size,
      containers: Array.from(item.containers)
    }));
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* 页面头部 */}
      <div style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '24px', padding: '20px', backgroundColor: 'white',
        borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div>
                      <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600', color: '#007bff' }}>
            <BarChart3 size={24} style={{ marginRight: '8px', verticalAlign: 'middle', color: '#007bff' }} />
            {t('inventory.inventoryLedger')}
          </h1>
          <p style={{ margin: '8px 0 0 0', color: '#666' }}>
            {t('inventory.inventoryDescription')}
          </p>
        </div>
        <button 
          onClick={fetchInventoryData}
          style={{
            padding: '10px 20px', border: 'none', borderRadius: '6px',
            backgroundColor: '#28a745', color: 'white', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          <TrendingUp size={16} />
          {t('inventory.refreshData')}
        </button>
      </div>

      {/* 汇总卡片 */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '16px', 
        marginBottom: '24px' 
      }}>
        <div style={{ 
          backgroundColor: 'white', padding: '20px', borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textAlign: 'center'
        }}>
          <Package size={32} style={{ color: '#007bff', marginBottom: '8px' }} />
          <div style={{ fontSize: '24px', fontWeight: '600', color: '#333' }}>
            {summaryData.totalMaterials}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>{t('inventory.rawMaterialTypes')}</div>
        </div>
        
        <div style={{ 
          backgroundColor: 'white', padding: '20px', borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textAlign: 'center'
        }}>
          <BarChart3 size={32} style={{ color: '#28a745', marginBottom: '8px' }} />
          <div style={{ fontSize: '24px', fontWeight: '600', color: '#333' }}>
            {summaryData.totalContainers}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>{t('inventory.cabinetsUsed')}</div>
        </div>
        
        <div style={{ 
          backgroundColor: 'white', padding: '20px', borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textAlign: 'center'
        }}>
          <TrendingUp size={32} style={{ color: '#ffc107', marginBottom: '8px' }} />
          <div style={{ fontSize: '24px', fontWeight: '600', color: '#333' }}>
            {summaryData.totalQuantity.toFixed(2)}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>{t('inventory.totalInventory')}</div>
        </div>
      </div>

      {/* 原料汇总 */}
      <div style={{ 
        backgroundColor: 'white', padding: '24px', borderRadius: '8px',
        marginBottom: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600' }}>
          {t('inventory.materialSummary')}
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                              <th style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', fontWeight: '600', fontSize: '14px' }}>{t('inventory.materialNameHeader')}</th>
              <th style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', fontWeight: '600', fontSize: '14px' }}>{t('inventory.typeHeader')}</th>
              <th style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', fontWeight: '600', fontSize: '14px' }}>{t('inventory.totalInventoryHeader')}</th>
              <th style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', fontWeight: '600', fontSize: '14px' }}>{t('inventory.cabinetsUsedHeader')}</th>
              <th style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', fontWeight: '600', fontSize: '14px' }}>{t('inventory.cabinetListHeader')}</th>
              </tr>
            </thead>
            <tbody>
                          {loading ? (
              <tr>
                <td colSpan="5" style={{ padding: '12px 16px', textAlign: 'center' }}>{t('inventory.loading')}</td>
              </tr>
            ) : getMaterialSummary().length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '12px 16px', textAlign: 'center' }}>{t('inventory.noInventoryData')}</td>
              </tr>
              ) : (
                                  getMaterialSummary().map((item, index) => (
                    <tr key={index}>
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', fontWeight: '500' }}>
                        {item.materialName}
                      </td>
                                        <td style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6' }}>
                    <span style={{
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      backgroundColor: item.type === 'raw' ? '#007bff' : item.type === 'aux' ? '#28a745' : '#ffc107',
                      color: 'white'
                    }}>
                      {item.type === 'raw' ? '原料' : item.type === 'aux' ? '辅料' : '成品'}
                    </span>
                  </td>
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6' }}>
                        {item.totalQuantity.toFixed(2)} {item.unit}
                      </td>
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6' }}>
                        {item.containerCount}
                      </td>
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {item.containers.map((container, idx) => (
                            <span key={idx} style={{
                              padding: '2px 6px',
                              backgroundColor: '#e9ecef',
                              borderRadius: '4px',
                              fontSize: '12px',
                              color: '#495057'
                            }}>
                              {container}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 详细库存表格 */}
      <div style={{ 
        backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
      }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #dee2e6' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
            {t('inventory.detailedInventoryLedger')}
          </h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                              <th style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', fontWeight: '600', fontSize: '14px' }}>{t('inventory.materialNameHeader')}</th>
              <th style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', fontWeight: '600', fontSize: '14px' }}>{t('inventory.typeHeader')}</th>
              <th style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', fontWeight: '600', fontSize: '14px' }}>{t('inventory.cabinetCodeBatchHeader')}</th>
              <th style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', fontWeight: '600', fontSize: '14px' }}>{t('inventory.declarationNoHeader')}</th>
              <th style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', fontWeight: '600', fontSize: '14px' }}>{t('inventory.inboundQuantityHeader')}</th>
              <th style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', fontWeight: '600', fontSize: '14px' }}>{t('inventory.outboundQuantityHeader')}</th>
              <th style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', fontWeight: '600', fontSize: '14px' }}>{t('inventory.remainingQuantityHeader')}</th>
              </tr>
            </thead>
            <tbody>
                          {loading ? (
              <tr>
                <td colSpan="7" style={{ padding: '12px 16px', textAlign: 'center' }}>{t('inventory.loading')}</td>
              </tr>
            ) : inventoryData.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: '12px 16px', textAlign: 'center' }}>{t('inventory.noInventoryData')}</td>
              </tr>
              ) : (
                inventoryData.map((item, index) => (
                                  <tr key={index}>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', fontWeight: '500' }}>
                    {item.materialName}
                  </td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6' }}>
                    <span style={{
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      backgroundColor: item.type === 'raw' ? '#007bff' : item.type === 'aux' ? '#28a745' : '#ffc107',
                      color: 'white'
                    }}>
                      {item.type === 'raw' ? t('inventory.rawMaterial') : item.type === 'aux' ? t('inventory.auxiliaryMaterial') : t('inventory.finishedProduct')}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6' }}>
                    {item.type === 'raw' ? item.container : item.type === 'aux' ? item.auxCode : item.batchNumber}
                  </td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6' }}>
                    {item.declarationNo || '-'}
                  </td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', color: '#28a745' }}>
                    {item.inboundQuantity.toFixed(2)} {item.type === 'raw' ? 'kg' : item.unit}
                  </td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', color: '#dc3545' }}>
                    {item.outboundQuantity.toFixed(2)} {item.type === 'raw' ? 'kg' : item.unit}
                  </td>
                  <td style={{ 
                    padding: '12px 16px', 
                    borderBottom: '1px solid #dee2e6', 
                    fontWeight: '600',
                    color: item.remainingQuantity > 0 ? '#007bff' : '#dc3545'
                  }}>
                    {item.remainingQuantity.toFixed(2)} {item.type === 'raw' ? 'kg' : item.unit}
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
