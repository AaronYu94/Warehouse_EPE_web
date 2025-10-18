import { api } from '../utils/api';
import React, { useState, useEffect } from 'react';
import { Database, Plus, Search, Calendar, User } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';

export default function ProductInboundPage() {
  const { t, language, forceUpdate } = useI18n();
  const [inboundRecords, setInboundRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    productName: '',
    batchNumber: '',
    quantity: '',
    inboundDate: '',
    productionDate: '',
    expiryDate: '',
    operator: '',
    notes: ''
  });

  useEffect(() => {
    fetchInboundRecords();
  }, []);

  const fetchInboundRecords = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/product-inbound");
      if (response.ok) {
        const data = await response.json();
        setInboundRecords(data);
      }
    } catch (error) {
      console.error(t('productInbound.networkError'), error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // 转换字段名以匹配后端API
      const apiData = {
        product_name: formData.productName,
        batch_number: formData.batchNumber,
        quantity: formData.quantity,
        inbound_date: formData.inboundDate,
        production_date: formData.productionDate,
        expiry_date: formData.expiryDate,
        operator: formData.operator,
        notes: formData.notes
      };
      
      const response = await api.post("/api/product-inbound",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('成品入库成功:', result);
        
        // 重置表单
        setFormData({
          productName: '',
          batchNumber: '',
          quantity: '',
          inboundDate: '',
          productionDate: '',
          expiryDate: '',
          operator: '',
          notes: ''
        });
        setShowForm(false);
        
        // 重新获取数据
        await fetchInboundRecords();
      } else {
        const error = await response.json();
        alert(t('productInbound.submitFailed') + ': ' + (error.error || t('errors.unknown')));
      }
    } catch (error) {
      console.error('入库失败:', error);
      alert(t('productInbound.submitFailed') + ': ' + error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const filteredRecords = inboundRecords.filter(record =>
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
            <Database size={24} style={{ marginRight: '8px', verticalAlign: 'middle', color: '#007bff' }} />
            {t('productInbound.pageTitle')}
          </h1>
          <p style={{ margin: '8px 0 0 0', color: '#666' }}>
            {t('productInbound.pageSubtitle')}
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
          {t('productInbound.addInbound')}
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
            placeholder={t('productInbound.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '10px 12px 10px 40px', border: '1px solid #ddd',
              borderRadius: '4px', fontSize: '14px', width: '100%'
            }}
          />
        </div>
      </div>

      {/* 新增入库表单 */}
      {showForm && (
        <div style={{ 
          backgroundColor: 'white', padding: '24px', borderRadius: '8px',
          marginBottom: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600' }}>
            {t('productInbound.newInbound')}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>{t('productInbound.productNameLabel')}</label>
                <select 
                  name="productName" 
                  value={formData.productName} 
                  onChange={handleInputChange} 
                  required
                  style={{ padding: '10px 12px', border: '1px solid #ddd', borderRadius: '4px', width: '100%' }}
                >
                  <option value="">{t('productInbound.selectProduct')}</option>
                  <option value="烘干巴旦木仁">{t('productInbound.driedAlmondKernel')}</option>
                  <option value="烘烤榛子，有壳">{t('productInbound.roastedHazelnut')}</option>
                  <option value="烘烤加盐夏威夷果">{t('productInbound.roastedSaltedMacadamia')}</option>
                  <option value="烘烤加盐巴旦木">{t('productInbound.roastedSaltedAlmond')}</option>
                  <option value="烘烤加盐夏威夷果仁">{t('productInbound.roastedSaltedMacadamiaKernel')}</option>
                  <option value="盐炒鹰嘴豆">{t('productInbound.saltedChickpea')}</option>
                  <option value="烘烤加盐巴旦木，B类">{t('productInbound.roastedSaltedAlmondB')}</option>
                  <option value="烘烤加盐夏威夷果，B类">{t('productInbound.roastedSaltedMacadamiaB')}</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>{t('productInbound.batchNumberLabel')}</label>
                <input 
                  type="text" 
                  name="batchNumber" 
                  value={formData.batchNumber} 
                  onChange={handleInputChange} 
                  required
                  placeholder={t('productInbound.enterBatchNumber')}
                  style={{ padding: '10px 12px', border: '1px solid #ddd', borderRadius: '4px', width: '100%' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>{t('productInbound.quantityLabel')}</label>
                <input 
                  type="number" 
                  name="quantity" 
                  value={formData.quantity} 
                  onChange={handleInputChange} 
                  required
                  step="1"
                  placeholder={t('productInbound.enterQuantity')}
                  style={{ padding: '10px 12px', border: '1px solid #ddd', borderRadius: '4px', width: '100%' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>{t('productInbound.inboundDateLabel')}</label>
                <input 
                  type="date" 
                  name="inboundDate" 
                  value={formData.inboundDate} 
                  onChange={handleInputChange} 
                  required
                  style={{ padding: '10px 12px', border: '1px solid #ddd', borderRadius: '4px', width: '100%' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>{t('productInbound.productionDateLabel')}</label>
                <input 
                  type="date" 
                  name="productionDate" 
                  value={formData.productionDate} 
                  onChange={handleInputChange} 
                  style={{ padding: '10px 12px', border: '1px solid #ddd', borderRadius: '4px', width: '100%' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>{t('productInbound.expiryDateLabel')}</label>
                <input 
                  type="date" 
                  name="expiryDate" 
                  value={formData.expiryDate} 
                  onChange={handleInputChange} 
                  style={{ padding: '10px 12px', border: '1px solid #ddd', borderRadius: '4px', width: '100%' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>{t('productInbound.operatorLabel')}</label>
                <input 
                  type="text" 
                  name="operator" 
                  value={formData.operator} 
                  onChange={handleInputChange} 
                  placeholder={t('productInbound.enterOperator')}
                  style={{ padding: '10px 12px', border: '1px solid #ddd', borderRadius: '4px', width: '100%' }} 
                />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>{t('productInbound.notesLabel')}</label>
                <textarea 
                  name="notes" 
                  value={formData.notes} 
                  onChange={handleInputChange} 
                  placeholder={t('productInbound.enterNotes')}
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
                {t('productInbound.cancel')}
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
                {t('productInbound.saveInbound')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 入库记录表格 */}
      <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
                          <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', fontWeight: '600', fontSize: '14px' }}>{t('productInbound.productNameHeader')}</th>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', fontWeight: '600', fontSize: '14px' }}>{t('productInbound.batchNumberHeader')}</th>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', fontWeight: '600', fontSize: '14px' }}>{t('productInbound.quantityHeader')}</th>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', fontWeight: '600', fontSize: '14px' }}>{t('productInbound.inboundDateHeader')}</th>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', fontWeight: '600', fontSize: '14px' }}>{t('productInbound.productionDateHeader')}</th>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', fontWeight: '600', fontSize: '14px' }}>{t('productInbound.expiryDateHeader')}</th>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', fontWeight: '600', fontSize: '14px' }}>{t('productInbound.operatorHeader')}</th>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', fontWeight: '600', fontSize: '14px' }}>{t('productInbound.notesHeader')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ padding: '12px 16px', textAlign: 'center' }}>{t('productInbound.loading')}</td>
              </tr>
            ) : filteredRecords.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ padding: '12px 16px', textAlign: 'center' }}>{t('productInbound.noRecords')}</td>
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
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6' }}>
                    {record.quantity}
                  </td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6' }}>
                    {formatDate(record.inbound_date)}
                  </td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6' }}>
                    {formatDate(record.production_date)}
                  </td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6' }}>
                    {formatDate(record.expiry_date)}
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