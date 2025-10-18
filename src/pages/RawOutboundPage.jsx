import { api } from '../utils/api';
import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Plus, Search, Calendar, User } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';

export default function RawOutboundPage() {
  const { t } = useI18n();
  const [outboundRecords, setOutboundRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    materialName: '',
    quantity: '',
    container: '',
    outboundDate: '',
    purpose: '',
    operator: '',
    notes: ''
  });

  useEffect(() => {
    fetchOutboundRecords();
  }, []);

  const fetchOutboundRecords = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/raw-out");
      if (response.ok) {
        const data = await response.json();
        setOutboundRecords(data);
      }
    } catch (error) {
              console.error(t('errors.dataLoadFailed'), error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // 转换字段名以匹配后端API
      const apiData = {
        material_name: formData.materialName,
        quantity: formData.quantity,
        container: formData.container,
        outbound_date: formData.outboundDate,
        purpose: formData.purpose,
        operator: formData.operator,
        notes: formData.notes
      };
      
      const response = await api.post("/api/raw-out",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('原料出库成功:', result);
        
        // 重置表单
        setFormData({
          materialName: '',
          quantity: '',
          container: '',
          outboundDate: '',
          purpose: '',
          operator: '',
          notes: ''
        });
        setShowForm(false);
        
        // 重新获取数据
        await fetchOutboundRecords();
      } else {
        const error = await response.json();
        alert(t('outbound.outboundFailed') + ': ' + (error.error || t('errors.unknown')));
      }
    } catch (error) {
      console.error('出库失败:', error);
      alert(t('outbound.outboundFailed') + ': ' + error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const filteredRecords = outboundRecords.filter(record =>
    record.material_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.container?.toLowerCase().includes(searchTerm.toLowerCase())
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
            <ArrowUpRight size={24} style={{ marginRight: '8px', verticalAlign: 'middle', color: '#007bff' }} />
            {t('outbound.rawOutbound')}
          </h1>
          <p style={{ margin: '8px 0 0 0', color: '#666' }}>
            {t('outbound.description')}
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
          {t('outbound.addOutbound')}
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
            placeholder={t('outbound.searchPlaceholder')}
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
            {t('outbound.newOutboundRecord')}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>{t('outbound.materialNameLabel')}</label>
                <select 
                  name="materialName" 
                  value={formData.materialName} 
                  onChange={handleInputChange} 
                  required
                  style={{ padding: '10px 12px', border: '1px solid #ddd', borderRadius: '4px', width: '100%' }}
                >
                  <option value="">{t('outbound.selectMaterial')}</option>
                  <option value="巴旦木仁原料">{t('outbound.almondKernelMaterial')}</option>
                  <option value="巴旦木原料">{t('outbound.almondMaterial')}</option>
                  <option value="榛子原料">{t('outbound.hazelnutMaterial')}</option>
                  <option value="夏威夷果原料">{t('outbound.macadamiaMaterial')}</option>
                  <option value="鹰嘴豆原料">{t('outbound.chickpeaMaterial')}</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>{t('outbound.quantityLabel')}</label>
                <input 
                  type="number" 
                  name="quantity" 
                  value={formData.quantity} 
                  onChange={handleInputChange} 
                  required
                  step="0.001"
                  placeholder={t('outbound.enterQuantity')}
                  style={{ padding: '10px 12px', border: '1px solid #ddd', borderRadius: '4px', width: '100%' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>{t('outbound.containerLabel')}</label>
                <input 
                  type="text" 
                  name="container" 
                  value={formData.container} 
                  onChange={handleInputChange} 
                  required
                  placeholder={t('outbound.enterContainer')}
                  style={{ padding: '10px 12px', border: '1px solid #ddd', borderRadius: '4px', width: '100%' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>{t('outbound.outboundDateLabel')}</label>
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
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>{t('outbound.purposeLabel')}</label>
                <input 
                  type="text" 
                  name="purpose" 
                  value={formData.purpose} 
                  onChange={handleInputChange} 
                  placeholder={t('outbound.enterPurpose')}
                  style={{ padding: '10px 12px', border: '1px solid #ddd', borderRadius: '4px', width: '100%' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>{t('outbound.operatorLabel')}</label>
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
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>{t('outbound.notesLabel')}</label>
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
                {t('outbound.cancel')}
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
                {t('outbound.saveOutbound')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 出库记录表格 */}
      <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', fontWeight: '600', fontSize: '14px' }}>{t('outbound.materialNameHeader')}</th>
              <th style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', fontWeight: '600', fontSize: '14px' }}>{t('outbound.quantityHeader')}</th>
              <th style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', fontWeight: '600', fontSize: '14px' }}>{t('outbound.containerHeader')}</th>
              <th style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', fontWeight: '600', fontSize: '14px' }}>{t('outbound.outboundDateHeader')}</th>
              <th style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', fontWeight: '600', fontSize: '14px' }}>{t('outbound.purposeHeader')}</th>
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
                    {record.material_name}
                  </td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', color: '#dc3545' }}>
                    {record.quantity}
                  </td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6' }}>
                    {record.container}
                  </td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6' }}>
                    {formatDate(record.outbound_date)}
                  </td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6' }}>
                    {record.purpose || '-'}
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