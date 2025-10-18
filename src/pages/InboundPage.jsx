import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, Upload, FileText, Download } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';
import { api } from '../utils/api';

export default function InboundPage() {
  const { t } = useI18n();
  const [inboundRecords, setInboundRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    importDate: '',
    materialName: '',
    declarationNo: '',
    containerNo: '',
    quantity: '',
    qualityReport: null
  });

  useEffect(() => {
    fetchInboundRecords();
  }, []);

  const fetchInboundRecords = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/raw-inout");
      if (response.ok) {
        const data = await response.json();
        setInboundRecords(data);
      }
    } catch (error) {
      console.error(t('inbound.networkError'), error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('date', formData.importDate);
      formDataToSend.append('material_name', formData.materialName);
      formDataToSend.append('declaration_no', formData.declarationNo);
      formDataToSend.append('container', formData.containerNo);
      formDataToSend.append('quantity', formData.quantity);
      formDataToSend.append('type', 'in');
      
      if (formData.qualityReport) {
        formDataToSend.append('quality_report', formData.qualityReport);
      }

      const response = await api.post("/api/raw-inout",
        body: formDataToSend
      });

      if (response.ok) {
        const result = await response.json();
        console.log('入库成功:', result);
        
        // 重置表单
        setFormData({
          importDate: '',
          materialName: '',
          declarationNo: '',
          containerNo: '',
          quantity: '',
          qualityReport: null
        });
        setShowForm(false);
        
        // 重新获取数据
        await fetchInboundRecords();
      } else {
        const error = await response.json();
        alert(t('inbound.submitFailed') + ': ' + (error.error || t('errors.unknown')));
      }
    } catch (error) {
      console.error('入库失败:', error);
      alert(t('inbound.submitFailed') + ': ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setFormData(prev => ({ ...prev, qualityReport: file }));
    } else {
      alert(t('inbound.selectPDFFile'));
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
    record.material_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.container?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.declaration_no?.toLowerCase().includes(searchTerm.toLowerCase())
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
            <Package size={24} style={{ marginRight: '8px', verticalAlign: 'middle', color: '#007bff' }} />
            {t('inbound.pageTitle')}
          </h1>
          <p style={{ margin: '8px 0 0 0', color: '#666' }}>
            {t('inbound.pageSubtitle')}
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
          {t('inbound.addInbound')}
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
            placeholder={t('inbound.searchPlaceholder')}
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
            {t('inbound.newInbound')}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>{t('inbound.importDateLabel')}</label>
                <input 
                  type="date" 
                  name="importDate" 
                  value={formData.importDate} 
                  onChange={handleInputChange} 
                  required
                  style={{ padding: '10px 12px', border: '1px solid #ddd', borderRadius: '4px', width: '100%' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>{t('inbound.materialNameLabel')}</label>
                <select 
                  name="materialName" 
                  value={formData.materialName} 
                  onChange={handleInputChange} 
                  required
                  style={{ padding: '10px 12px', border: '1px solid #ddd', borderRadius: '4px', width: '100%' }}
                >
                  <option value="">{t('inbound.selectMaterial')}</option>
                  <option value="巴旦木仁原料">{t('inbound.almondKernel')}</option>
                  <option value="巴旦木原料">{t('inbound.almond')}</option>
                  <option value="榛子原料">{t('inbound.hazelnut')}</option>
                  <option value="夏威夷果原料">{t('inbound.macadamia')}</option>
                  <option value="鹰嘴豆原料">{t('inbound.chickpea')}</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>{t('inbound.declarationNoLabel')}</label>
                <input 
                  type="text" 
                  name="declarationNo" 
                  value={formData.declarationNo} 
                  onChange={handleInputChange} 
                  required
                  placeholder={t('inbound.enterDeclarationNo')}
                  style={{ padding: '10px 12px', border: '1px solid #ddd', borderRadius: '4px', width: '100%' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>{t('inbound.containerNoLabel')}</label>
                <input 
                  type="text" 
                  name="containerNo" 
                  value={formData.containerNo} 
                  onChange={handleInputChange} 
                  required
                  placeholder={t('inbound.enterContainerNo')}
                  style={{ padding: '10px 12px', border: '1px solid #ddd', borderRadius: '4px', width: '100%' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>{t('inbound.quantityLabel')}</label>
                <input 
                  type="number" 
                  name="quantity" 
                  value={formData.quantity} 
                  onChange={handleInputChange} 
                  required
                  step="0.001"
                  placeholder={t('inbound.enterQuantity')}
                  style={{ padding: '10px 12px', border: '1px solid #ddd', borderRadius: '4px', width: '100%' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>{t('inbound.qualityReportLabel')}</label>
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
                      {formData.qualityReport ? formData.qualityReport.name : t('inbound.clickToUploadPDF')}
                    </div>
                  </label>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button 
                type="button" 
                onClick={() => setShowForm(false)}
                disabled={uploading}
                style={{ 
                  padding: '10px 20px', 
                  border: 'none', 
                  borderRadius: '6px', 
                  backgroundColor: '#6c757d', 
                  color: 'white', 
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  opacity: uploading ? 0.6 : 1
                }}
              >
                {t('inbound.cancel')}
              </button>
              <button 
                type="submit"
                disabled={uploading}
                style={{ 
                  padding: '10px 20px', 
                  border: 'none', 
                  borderRadius: '6px', 
                  backgroundColor: '#007bff', 
                  color: 'white', 
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  opacity: uploading ? 0.6 : 1
                }}
              >
                {uploading ? t('inbound.saving') : t('inbound.saveInbound')}
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
              <th style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', fontWeight: '600', fontSize: '14px' }}>{t('inbound.importDateHeader')}</th>
              <th style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', fontWeight: '600', fontSize: '14px' }}>{t('inbound.materialNameHeader')}</th>
              <th style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', fontWeight: '600', fontSize: '14px' }}>{t('inbound.declarationNoHeader')}</th>
              <th style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', fontWeight: '600', fontSize: '14px' }}>{t('inbound.containerNoHeader')}</th>
              <th style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', fontWeight: '600', fontSize: '14px' }}>{t('inbound.quantityHeader')}</th>
              <th style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', fontWeight: '600', fontSize: '14px' }}>{t('inbound.qualityReportHeader')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ padding: '12px 16px', textAlign: 'center' }}>{t('inbound.loading')}</td>
              </tr>
            ) : filteredRecords.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '12px 16px', textAlign: 'center' }}>{t('inbound.noRecords')}</td>
              </tr>
            ) : (
              filteredRecords.map(record => (
                <tr key={record.id}>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6' }}>{record.date}</td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6' }}>{record.material_name}</td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6' }}>{record.declaration_no || '-'}</td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6' }}>{record.container}</td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6' }}>{record.quantity}</td>
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
                        {t('inbound.download')}
                      </button>
                    ) : (
                      <span style={{ color: '#999' }}>{t('inbound.noFile')}</span>
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