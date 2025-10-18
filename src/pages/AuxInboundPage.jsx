import { api } from '../utils/api';
import React, { useState, useEffect } from 'react';
import { Box, Plus, Search, Upload, Download } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';

export default function AuxInboundPage() {
  const { t } = useI18n();
  const [inboundRecords, setInboundRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    date: '',
    auxCode: '',
    auxName: '',
    quantity: '',
    unit: '',
    qualityReport: null
  });

  useEffect(() => {
    fetchInboundRecords();
  }, []);

  const fetchInboundRecords = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/aux-inout");
      if (response.ok) {
        const data = await response.json();
        setInboundRecords(data);
      }
    } catch (error) {
      console.error(t('auxInbound.networkError'), error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('date', formData.date);
      formDataToSend.append('aux_code', formData.auxCode);
      formDataToSend.append('aux_name', formData.auxName);
      formDataToSend.append('quantity', formData.quantity);
      formDataToSend.append('unit', formData.unit);
      
      if (formData.qualityReport) {
        formDataToSend.append('quality_report', formData.qualityReport);
      }

      const response = await api.post("/api/aux-inout",
        body: formDataToSend
      });

      if (response.ok) {
        const result = await response.json();
        console.log('辅料入库成功:', result);
        
        // 重置表单
        setFormData({
          date: '',
          auxCode: '',
          auxName: '',
          quantity: '',
          unit: '',
          qualityReport: null
        });
        setShowForm(false);
        
        // 重新获取数据
        await fetchInboundRecords();
      } else {
        const error = await response.json();
        alert(t('auxInbound.submitFailed') + ': ' + (error.error || t('errors.unknown')));
      }
    } catch (error) {
      console.error('入库失败:', error);
      alert(t('auxInbound.submitFailed') + ': ' + error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // 当选择辅料名称时，自动填充编码
    if (name === 'auxName') {
      const auxCodeMap = {
        '铝箔袋（真空包装袋）': 'TUINHOM',
        '纸箱': 'THUNGGIAY',
        '盐': 'MUOI',
        'Jumbo 袋': 'LABJB',
        '千斤包': 'LABJB',
        '甜蜜素': 'LASDS',
        '糖精钠': 'LASDC',
        '安赛蜜': 'LACFK',
        '三氯蔗糖': 'LASCL',
        '香兰素': 'LAVNL',
        '糖': 'LADTL',
        '坚果香精 0612': 'LARNC',
        '坚果香精': 'LARNC',
        '坚果香料包': 'LARNC',
        '牧场鲜奶粉末香精 444-1': 'LAPMF',
        '牧场鲜奶粉末香精': 'LAPMF',
        '奶味香精 0265': 'LAMFV',
        '奶味香精': 'LAMFV',
        '复合抗氧化剂': 'LACAN',
        '木瓜蛋白酶粉 0313': 'LAPAP',
        '味精': 'BOTNGOT',
        '双氧水': 'H2O2',
        '托板': 'PALET'
      };
      
      const auxCode = auxCodeMap[value] || '';
      setFormData(prev => ({ ...prev, auxCode }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setFormData(prev => ({ ...prev, qualityReport: file }));
    } else {
      alert(t('auxInbound.selectPDFFile'));
      e.target.value = '';
    }
  };

  const downloadQualityReport = (filePath) => {
    if (filePath) {
      const url = API_BASE_URL + filePath;
      window.open(url, '_blank');
    }
  };

  const filteredRecords = inboundRecords.filter(record =>
    record.aux_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.aux_code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <Box size={24} style={{ marginRight: '8px', verticalAlign: 'middle', color: '#007bff' }} />
            {t('auxInbound.pageTitle')}
          </h1>
          <p style={{ margin: '8px 0 0 0', color: '#666' }}>
            {t('auxInbound.pageSubtitle')}
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
          {t('auxInbound.addInbound')}
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
            placeholder={t('auxInbound.searchPlaceholder')}
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
            {t('auxInbound.newInbound')}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>{t('auxInbound.dateLabel')}</label>
                <input 
                  type="date" 
                  name="date" 
                  value={formData.date} 
                  onChange={handleInputChange} 
                  required
                  style={{ padding: '10px 12px', border: '1px solid #ddd', borderRadius: '4px', width: '100%' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>{t('auxInbound.auxNameLabel')}</label>
                <select 
                  name="auxName" 
                  value={formData.auxName} 
                  onChange={handleInputChange} 
                  required
                  style={{ padding: '10px 12px', border: '1px solid #ddd', borderRadius: '4px', width: '100%' }}
                >
                  <option value="">{t('auxInbound.selectAux')}</option>
                  <option value="铝箔袋（真空包装袋）">{t('auxInbound.aluminumFoilBag')}</option>
                  <option value="纸箱">{t('auxInbound.cardboardBox')}</option>
                  <option value="盐">{t('auxInbound.salt')}</option>
                  <option value="Jumbo 袋">{t('auxInbound.jumboBag')}</option>
                  <option value="千斤包">{t('auxInbound.thousandJinBag')}</option>
                  <option value="甜蜜素">{t('auxInbound.saccharin')}</option>
                  <option value="糖精钠">{t('auxInbound.sodiumSaccharin')}</option>
                  <option value="安赛蜜">{t('auxInbound.acesulfame')}</option>
                  <option value="三氯蔗糖">{t('auxInbound.sucralose')}</option>
                  <option value="香兰素">{t('auxInbound.vanillin')}</option>
                  <option value="糖">{t('auxInbound.sugar')}</option>
                  <option value="坚果香精 0612">{t('auxInbound.nutFlavor0612')}</option>
                  <option value="坚果香精">{t('auxInbound.nutFlavor')}</option>
                  <option value="坚果香料包">{t('auxInbound.nutFlavorPack')}</option>
                  <option value="牧场鲜奶粉末香精 444-1">{t('auxInbound.dairyPowderFlavor444')}</option>
                  <option value="牧场鲜奶粉末香精">{t('auxInbound.dairyPowderFlavor')}</option>
                  <option value="奶味香精 0265">{t('auxInbound.dairyFlavor0265')}</option>
                  <option value="奶味香精">{t('auxInbound.dairyFlavor')}</option>
                  <option value="复合抗氧化剂">{t('auxInbound.antioxidant')}</option>
                  <option value="木瓜蛋白酶粉 0313">{t('auxInbound.papainPowder')}</option>
                  <option value="味精">{t('auxInbound.monosodiumGlutamate')}</option>
                  <option value="双氧水">{t('auxInbound.hydrogenPeroxide')}</option>
                  <option value="托板">{t('auxInbound.pallet')}</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>{t('auxInbound.auxCodeLabel')}</label>
                <input 
                  type="text" 
                  name="auxCode" 
                  value={formData.auxCode} 
                  onChange={handleInputChange} 
                  required
                  placeholder={t('auxInbound.enterAuxCode')}
                  style={{ padding: '10px 12px', border: '1px solid #ddd', borderRadius: '4px', width: '100%' }} 
                  readOnly
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>{t('auxInbound.quantityLabel')}</label>
                <input 
                  type="number" 
                  name="quantity" 
                  value={formData.quantity} 
                  onChange={handleInputChange} 
                  required
                  step="0.001"
                  placeholder={t('auxInbound.enterQuantity')}
                  style={{ padding: '10px 12px', border: '1px solid #ddd', borderRadius: '4px', width: '100%' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>{t('auxInbound.unitLabel')}</label>
                <select 
                  name="unit" 
                  value={formData.unit} 
                  onChange={handleInputChange} 
                  required
                  style={{ padding: '10px 12px', border: '1px solid #ddd', borderRadius: '4px', width: '100%' }}
                >
                  <option value="">{t('auxInbound.selectUnit')}</option>
                  <option value="kg">{t('auxInbound.kg')}</option>
                  <option value="g">{t('auxInbound.g')}</option>
                  <option value="个">{t('auxInbound.piece')}</option>
                  <option value="箱">{t('auxInbound.box')}</option>
                  <option value="包">{t('auxInbound.pack')}</option>
                  <option value="袋">{t('auxInbound.bag')}</option>
                  <option value="瓶">{t('auxInbound.bottle')}</option>
                  <option value="罐">{t('auxInbound.can')}</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>{t('auxInbound.qualityReportLabel')}</label>
                <div style={{ 
                  border: '2px dashed #ddd', 
                  borderRadius: '4px', 
                  padding: '20px', 
                  textAlign: 'center',
                  backgroundColor: formData.qualityReport ? '#f8f9fa' : 'white'
                }}>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    id="quality-report-upload"
                  />
                  <label htmlFor="quality-report-upload" style={{ cursor: 'pointer', display: 'block' }}>
                    <Upload size={24} style={{ marginBottom: '8px', color: '#666' }} />
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      {formData.qualityReport ? formData.qualityReport.name : t('auxInbound.clickToUploadPDF')}
                    </div>
                  </label>
                </div>
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
                {t('auxInbound.cancel')}
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
                {t('auxInbound.saveInbound')}
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
                <th style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', fontWeight: '600', fontSize: '14px' }}>{t('auxInbound.dateHeader')}</th>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', fontWeight: '600', fontSize: '14px' }}>{t('auxInbound.auxCodeHeader')}</th>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', fontWeight: '600', fontSize: '14px' }}>{t('auxInbound.auxNameHeader')}</th>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', fontWeight: '600', fontSize: '14px' }}>{t('auxInbound.quantityHeader')}</th>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', fontWeight: '600', fontSize: '14px' }}>{t('auxInbound.unitHeader')}</th>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', fontWeight: '600', fontSize: '14px' }}>{t('auxInbound.qualityReportHeader')}</th>
              </tr>
            </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ padding: '12px 16px', textAlign: 'center' }}>{t('auxInbound.loading')}</td>
              </tr>
            ) : filteredRecords.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '12px 16px', textAlign: 'center' }}>{t('auxInbound.noRecords')}</td>
              </tr>
            ) : (
              filteredRecords.map(record => (
                <tr key={record.id}>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6' }}>{record.date}</td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6' }}>{record.aux_code}</td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6' }}>{record.aux_name}</td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6' }}>{record.quantity}</td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6' }}>{record.unit}</td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6' }}>
                    {record.quality_report_path ? (
                      <button
                        onClick={() => downloadQualityReport(record.quality_report_path)}
                        style={{
                          padding: '4px 8px',
                          border: 'none',
                          borderRadius: '4px',
                          backgroundColor: '#28a745',
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Download size={12} />
                        {t('auxInbound.download')}
                      </button>
                    ) : (
                      <span style={{ color: '#999' }}>{t('auxInbound.noFile')}</span>
                    )}
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
