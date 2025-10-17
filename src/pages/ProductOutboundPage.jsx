import API_BASE_URL from "../config";
import React, { useState, useEffect } from 'react';
import { TrendingUp, Plus, Search, Calendar, User } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';

export default function ProductOutboundPage() {
  const { t } = useI18n();
  const [outboundRecords, setOutboundRecords] = useState([]);
  const [productInboundData, setProductInboundData] = useState([]);
  const [auxMappingData, setAuxMappingData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showAuxUsageModal, setShowAuxUsageModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);

  const [formData, setFormData] = useState({
    productName: '',
    batchNumbers: [], // 改为数组支持多个批次号
    quantities: [], // 改为数组支持每个批次的出库数量
    totalQuantity: '', // 总出库数量
    outboundDate: '',
    destination: '',
    operator: '',
    notes: '',
    grade: '' // 新增分级字段
  });

  const [auxUsageData, setAuxUsageData] = useState([]);
  
  // 分级选项 - 仅用于烘烤加盐夏威夷果仁
  const gradeOptions = [
    { value: '', label: '请选择分级' },
    { value: 'Whole kernel 18-20', label: 'Whole kernel 18-20mm' },
    { value: 'Whole kernel 16-18', label: 'Whole kernel 16-18mm' },
    { value: 'Whole kernel 14-16', label: 'Whole kernel 14-16mm' },
    { value: 'Whole kernel 12-14', label: 'Whole kernel 12-14mm' },
    { value: 'Half Kernel 18-20', label: 'Half Kernel 18-20mm' },
    { value: 'Half Kernel 16-18', label: 'Half Kernel 16-18mm' },
    { value: 'Half Kernel 14-16', label: 'Half Kernel 14-16mm' },
    { value: 'Half Kernel 12-14', label: 'Half Kernel 12-14mm' },
    { value: 'Pieces 9-17(style)', label: 'Pieces 9-17mm(style)' },
    { value: 'Pieces 8-14(style)', label: 'Pieces 8-14mm(style)' },
    { value: 'Dark Color 18-20', label: 'Dark Color 18-20mm' },
    { value: 'Dark Color 16-18', label: 'Dark Color 16-18mm' },
    { value: 'Dark Color 14-16', label: 'Dark Color 14-16mm' },
    { value: 'Dark Color 12-14', label: 'Dark Color 12-14mm' }
  ];

  useEffect(() => {
    fetchOutboundRecords();
    fetchProductInboundData();
    fetchAuxMappingData();
  }, []);

  const fetchOutboundRecords = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_BASE_URL + "/api/product-outbound");
      if (response.ok) {
        const data = await response.json();
        setOutboundRecords(data);
      }
    } catch (error) {
      console.error('获取成品出库记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductInboundData = async () => {
    try {
      const response = await fetch(API_BASE_URL + "/api/product-inbound");
      if (response.ok) {
        const data = await response.json();
        setProductInboundData(data);
      }
    } catch (error) {
      console.error('获取成品入库记录失败:', error);
    }
  };

  const fetchAuxMappingData = async () => {
    try {
      const response = await fetch(API_BASE_URL + "/api/product-aux-mapping");
      if (response.ok) {
        const data = await response.json();
        setAuxMappingData(data);
      }
    } catch (error) {
      console.error('获取成品辅料对照表失败:', error);
    }
  };

  const handleProductChange = async (productName) => {
    setFormData(prev => ({ 
      ...prev, 
      productName,
      grade: '' // 重置分级
    }));
    setSelectedProduct(productName);
    
    // 获取该产品的原料和辅料对照表
    try {
      const response = await fetch(API_BASE_URL + "/api/product-aux-mapping/" + encodeURIComponent(productName));
      if (response.ok) {
        const mappingData = await response.json();
        const materialUsage = mappingData.map(item => ({
          materialName: item.material_name,
          materialCode: item.material_code,
          usagePerUnit: item.usage_per_unit,
          unit: item.unit,
          type: item.type,
          totalUsage: 0
        }));
        setAuxUsageData(materialUsage);
      }
    } catch (error) {
      console.error('获取原料辅料对照表失败:', error);
    }
  };

  const handleQuantityChange = (quantity) => {
    setFormData(prev => ({ ...prev, quantity }));
    
    // 更新原料和辅料用量
    const updatedMaterialUsage = auxUsageData.map(item => ({
      ...item,
      totalUsage: (parseFloat(quantity) || 0) * item.usagePerUnit
    }));
    setAuxUsageData(updatedMaterialUsage);
  };

  const handleMaterialUsageChange = (index, value) => {
    const updatedMaterialUsage = [...auxUsageData];
    updatedMaterialUsage[index].totalUsage = parseFloat(value) || 0;
    setAuxUsageData(updatedMaterialUsage);
  };

  // 添加批次号
  const addBatchNumber = () => {
    setFormData(prev => ({
      ...prev,
      batchNumbers: [...prev.batchNumbers, ''],
      quantities: [...prev.quantities, '']
    }));
  };

  // 删除批次号
  const removeBatchNumber = (index) => {
    setFormData(prev => ({
      ...prev,
      batchNumbers: prev.batchNumbers.filter((_, i) => i !== index),
      quantities: prev.quantities.filter((_, i) => i !== index)
    }));
  };

  // 更新批次号
  const updateBatchNumber = (index, value) => {
    setFormData(prev => ({
      ...prev,
      batchNumbers: prev.batchNumbers.map((batch, i) => i === index ? value : batch)
    }));
  };

  // 更新批次数量
  const updateBatchQuantity = (index, value) => {
    setFormData(prev => ({
      ...prev,
      quantities: prev.quantities.map((qty, i) => i === index ? value : qty)
    }));
    
    // 计算总数量
    const newQuantities = [...formData.quantities];
    newQuantities[index] = value;
    const total = newQuantities.reduce((sum, qty) => sum + (parseFloat(qty) || 0), 0);
    setFormData(prev => ({ ...prev, totalQuantity: total.toString() }));
    
    // 更新原料和辅料用量
    const updatedMaterialUsage = auxUsageData.map(item => ({
      ...item,
      totalUsage: (parseFloat(total) || 0) * item.usagePerUnit
    }));
    setAuxUsageData(updatedMaterialUsage);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (auxUsageData.length > 0) {
      setShowAuxUsageModal(true);
      return;
    }
    
    await submitOutboundRecord();
  };

  const submitOutboundRecord = async () => {
    try {
      const materialUsageJson = JSON.stringify(auxUsageData);
      
      // 处理产品名称 - 如果是烘烤加盐夏威夷果仁且有分级，则附加分级信息
      let finalProductName = formData.productName;
      if (formData.productName === '烘烤加盐夏威夷果仁' && formData.grade) {
        finalProductName = `${formData.productName} - ${formData.grade}`;
      }
      
      // 为每个批次号创建出库记录
      for (let i = 0; i < formData.batchNumbers.length; i++) {
        const batchNumber = formData.batchNumbers[i];
        const quantity = formData.quantities[i];
        
        if (batchNumber && quantity && parseFloat(quantity) > 0) {
          // 转换字段名以匹配后端API
          const apiData = {
            product_name: finalProductName,
            batch_number: batchNumber,
            quantity: quantity,
            outbound_date: formData.outboundDate,
            destination: formData.destination,
            operator: formData.operator,
            notes: formData.notes,
            aux_usage: materialUsageJson
          };
          
          const response = await fetch(API_BASE_URL + "/api/product-outbound", {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(apiData)
          });

          if (!response.ok) {
            const error = await response.json();
            alert('出库失败: ' + (error.error || '未知错误'));
            return;
          }
          
          const result = await response.json();
          console.log('成品出库成功:', result);
        }
      }
      
      // 所有批次出库成功后，重置表单
      setFormData({
        productName: '',
        batchNumbers: [],
        quantities: [],
        totalQuantity: '',
        outboundDate: '',
        destination: '',
        operator: '',
        notes: '',
        grade: ''
      });
      setAuxUsageData([]);
      setShowForm(false);
      setShowAuxUsageModal(false);
      
      // 重新获取数据
      await fetchOutboundRecords();
      
    } catch (error) {
      console.error('出库失败:', error);
      alert('出库失败: ' + error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'productName') {
      handleProductChange(value);
    }
  };

  const filteredRecords = outboundRecords.filter(record =>
    record.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.batch_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('zh-CN');
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
            <TrendingUp size={24} style={{ marginRight: '8px', verticalAlign: 'middle', color: '#007bff' }} />
            {t('outbound.productOutboundTitle')}
          </h1>
          <p style={{ margin: '8px 0 0 0', color: '#666' }}>
            {t('outbound.productOutboundDescription')}
          </p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: '10px 20px', border: 'none', borderRadius: '6px',
            backgroundColor: '#007bff', color: 'white', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          <Plus size={16} />
          {t('outbound.addProductOutbound')}
        </button>
      </div>

      {/* 搜索栏 */}
      <div style={{ 
        backgroundColor: 'white', padding: '16px', borderRadius: '8px',
        marginBottom: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ 
            position: 'absolute', left: '12px', top: '50%', 
            transform: 'translateY(-50%)', color: '#666' 
          }} />
          <input
            type="text"
            placeholder={t('outbound.searchProductPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '10px 12px 10px 40px', border: '1px solid #ddd',
              borderRadius: '4px', fontSize: '14px', width: '100%'
            }}
          />
        </div>
      </div>

      {/* 新增出库表单 */}
      {showForm && (
        <div style={{ 
          backgroundColor: 'white', padding: '24px', borderRadius: '8px',
          marginBottom: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600' }}>
            {t('outbound.newProductOutboundRecord')}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>{t('outbound.productNameLabel')}</label>
                <select 
                  name="productName" 
                  value={formData.productName} 
                  onChange={handleInputChange} 
                  required
                  style={{ padding: '10px 12px', border: '1px solid #ddd', borderRadius: '4px', width: '100%' }}
                >
                  <option value="">{t('outbound.selectProduct')}</option>
                  <option value="烘干巴旦木仁">{t('outbound.driedAlmondKernel')}</option>
                  <option value="烘烤榛子，有壳">{t('outbound.roastedHazelnut')}</option>
                  <option value="烘烤加盐夏威夷果">{t('outbound.roastedSaltedMacadamia')}</option>
                  <option value="烘烤加盐巴旦木">{t('outbound.roastedSaltedAlmond')}</option>
                  <option value="烘烤加盐夏威夷果仁">{t('outbound.roastedSaltedMacadamiaKernel')}</option>
                  <option value="盐炒鹰嘴豆">{t('outbound.saltedChickpea')}</option>
                  <option value="烘烤加盐巴旦木，B类">{t('outbound.roastedSaltedAlmondB')}</option>
                  <option value="烘烤加盐夏威夷果，B类">{t('outbound.roastedSaltedMacadamiaB')}</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>{t('outbound.batchNumberManagement')}</label>
                <div style={{ marginBottom: '10px' }}>
                  <button 
                    type="button"
                    onClick={addBatchNumber}
                    style={{
                      padding: '6px 12px',
                      border: '1px solid #007bff',
                      borderRadius: '4px',
                      backgroundColor: 'white',
                      color: '#007bff',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    {t('outbound.addBatchNumber')}
                  </button>
                </div>
                {formData.batchNumbers.map((batchNumber, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    gap: '8px', 
                    marginBottom: '8px',
                    alignItems: 'center'
                  }}>
                    <input 
                      type="text" 
                      value={batchNumber} 
                      onChange={(e) => updateBatchNumber(index, e.target.value)} 
                      placeholder={t('outbound.enterBatchNumber')}
                      required
                      style={{ 
                        padding: '8px 12px', 
                        border: '1px solid #ddd', 
                        borderRadius: '4px', 
                        flex: 1 
                      }}
                    />
                    <input 
                      type="number" 
                      value={formData.quantities[index] || ''} 
                      onChange={(e) => updateBatchQuantity(index, e.target.value)} 
                      placeholder={t('outbound.quantity')}
                      required
                      style={{ 
                        padding: '8px 12px', 
                        border: '1px solid #ddd', 
                        borderRadius: '4px', 
                        width: '100px' 
                      }}
                    />
                    <button 
                      type="button"
                      onClick={() => removeBatchNumber(index)}
                      style={{
                        padding: '6px 10px',
                        border: '1px solid #dc3545',
                        borderRadius: '4px',
                        backgroundColor: 'white',
                        color: '#dc3545',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      {t('common.delete')}
                    </button>
                  </div>
                ))}
                {formData.batchNumbers.length > 0 && (
                  <div style={{ 
                    marginTop: '8px', 
                    padding: '8px', 
                    backgroundColor: '#f8f9fa', 
                    borderRadius: '4px',
                    fontSize: '14px',
                    color: '#666'
                  }}>
                    总出库数量: {formData.totalQuantity || '0'} kg
                  </div>
                )}
              </div>
              {/* 分级选择 - 仅当选择烘烤加盐夏威夷果仁时显示 */}
              {formData.productName === '烘烤加盐夏威夷果仁' && (
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>{t('outbound.grade')} *</label>
                  <select 
                    name="grade" 
                    value={formData.grade} 
                    onChange={handleInputChange} 
                    required
                    style={{ padding: '10px 12px', border: '1px solid #ddd', borderRadius: '4px', width: '100%' }}
                  >
                    {gradeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>{t('outbound.quantity')} *</label>
                <input 
                  type="number" 
                  name="quantity" 
                  value={formData.quantity} 
                  onChange={handleInputChange} 
                  required
                  step="1"
                  placeholder={t('outbound.enterQuantity')}
                  style={{ padding: '10px 12px', border: '1px solid #ddd', borderRadius: '4px', width: '100%' }} 
                />
              </div>
              <div>
                                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>{t('outbound.outboundDate')} *</label>
                <input 
                  type="date" 
                  name="outboundDate" 
                  value={formData.outboundDate} 
                  onChange={handleInputChange} 
                  required
                  style={{ padding: '10px 12px', border: '1px solid #ddd', borderRadius: '4px', width: '100%' }} 
                />
              </div>
              <div>
                                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>{t('outbound.destination')}</label>
                <input 
                  type="text" 
                  name="destination" 
                  value={formData.destination} 
                  onChange={handleInputChange} 
                  placeholder={t('outbound.enterDestination')}
                  style={{ padding: '10px 12px', border: '1px solid #ddd', borderRadius: '4px', width: '100%' }} 
                />
              </div>
              <div>
                                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>{t('outbound.operator')}</label>
                <input 
                  type="text" 
                  name="operator" 
                  value={formData.operator} 
                  onChange={handleInputChange} 
                  placeholder={t('outbound.enterOperator')}
                  style={{ padding: '10px 12px', border: '1px solid #ddd', borderRadius: '4px', width: '100%' }} 
                />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>{t('outbound.notes')}</label>
                <textarea 
                  name="notes" 
                  value={formData.notes} 
                  onChange={handleInputChange} 
                  placeholder={t('outbound.enterNotes')}
                  rows="3"
                  style={{ 
                    padding: '10px 12px', 
                    border: '1px solid #ddd', 
                    borderRadius: '4px', 
                    width: '100%',
                    resize: 'vertical'
                  }} 
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button 
                type="button" 
                onClick={() => setShowForm(false)}
                style={{ 
                  padding: '10px 20px', 
                  border: 'none', 
                  borderRadius: '6px', 
                  backgroundColor: '#6c757d', 
                  color: 'white', 
                  cursor: 'pointer'
                }}
              >
                取消
              </button>
              <button 
                type="submit"
                style={{ 
                  padding: '10px 20px', 
                  border: 'none', 
                  borderRadius: '6px', 
                  backgroundColor: '#007bff', 
                  color: 'white', 
                  cursor: 'pointer'
                }}
              >
                下一步
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 辅料用量确认模态框 */}
      {showAuxUsageModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600' }}>
              原料和辅料用量确认
            </h3>
            <p style={{ margin: '0 0 16px 0', color: '#666' }}>
              请确认本次出库的原料和辅料用量，系统将自动从库存中扣减：
            </p>
            
            <div style={{ marginBottom: '20px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <th style={{ padding: '8px', borderBottom: '1px solid #dee2e6', textAlign: 'left' }}>类型</th>
                    <th style={{ padding: '8px', borderBottom: '1px solid #dee2e6', textAlign: 'left' }}>材料名称</th>
                    <th style={{ padding: '8px', borderBottom: '1px solid #dee2e6', textAlign: 'left' }}>编码</th>
                    <th style={{ padding: '8px', borderBottom: '1px solid #dee2e6', textAlign: 'left' }}>单位用量</th>
                    <th style={{ padding: '8px', borderBottom: '1px solid #dee2e6', textAlign: 'left' }}>总用量</th>
                  </tr>
                </thead>
                <tbody>
                  {auxUsageData.map((item, index) => (
                    <tr key={index}>
                      <td style={{ padding: '8px', borderBottom: '1px solid #dee2e6' }}>
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          backgroundColor: item.type === 'raw' ? '#007bff' : '#28a745',
                          color: 'white'
                        }}>
                          {item.type === 'raw' ? '原料' : '辅料'}
                        </span>
                      </td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #dee2e6' }}>
                        {item.materialName}
                      </td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #dee2e6' }}>
                        {item.materialCode}
                      </td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #dee2e6' }}>
                        {item.usagePerUnit} {item.unit}
                      </td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #dee2e6' }}>
                        <input
                          type="number"
                          value={item.totalUsage}
                          onChange={(e) => handleMaterialUsageChange(index, e.target.value)}
                          step="0.01"
                          style={{ padding: '4px 8px', border: '1px solid #ddd', borderRadius: '4px', width: '80px' }}
                        />
                        <span style={{ marginLeft: '4px' }}>{item.unit}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setShowAuxUsageModal(false)}
                style={{ 
                  padding: '10px 20px', 
                  border: 'none', 
                  borderRadius: '6px', 
                  backgroundColor: '#6c757d', 
                  color: 'white', 
                  cursor: 'pointer'
                }}
              >
                {t('outbound.cancel')}
              </button>
              <button 
                onClick={submitOutboundRecord}
                style={{ 
                  padding: '10px 20px', 
                  border: 'none', 
                  borderRadius: '6px', 
                  backgroundColor: '#28a745', 
                  color: 'white', 
                  cursor: 'pointer'
                }}
              >
                {t('outbound.saveOutbound')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 出库记录表格 */}
      <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', fontWeight: '600', fontSize: '14px' }}>{t('outbound.productNameHeader')}</th>
              <th style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', fontWeight: '600', fontSize: '14px' }}>{t('outbound.batchNumberHeader')}</th>
              <th style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', fontWeight: '600', fontSize: '14px' }}>{t('outbound.outboundQuantityHeader')}</th>
              <th style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', fontWeight: '600', fontSize: '14px' }}>{t('outbound.outboundDateHeader')}</th>
              <th style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', fontWeight: '600', fontSize: '14px' }}>{t('outbound.destinationHeader')}</th>
              <th style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', fontWeight: '600', fontSize: '14px' }}>{t('outbound.operatorHeader')}</th>
              <th style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', fontWeight: '600', fontSize: '14px' }}>{t('outbound.notesHeader')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ padding: '12px 16px', textAlign: 'center' }}>{t('outbound.loading')}</td>
              </tr>
            ) : filteredRecords.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: '12px 16px', textAlign: 'center' }}>{t('outbound.noRecords')}</td>
              </tr>
            ) : (
              filteredRecords.map(record => (
                <tr key={record.id}>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', fontWeight: '500' }}>
                    {record.product_name}
                  </td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6' }}>
                    {record.batch_number}
                  </td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', color: '#dc3545' }}>
                    {record.quantity}
                  </td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6' }}>
                    {formatDate(record.outbound_date)}
                  </td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6' }}>
                    {record.destination || '-'}
                  </td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6' }}>
                    {record.operator || '-'}
                  </td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6' }}>
                    {record.notes || '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 