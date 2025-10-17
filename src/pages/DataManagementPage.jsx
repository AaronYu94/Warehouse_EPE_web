import API_BASE_URL from "../config";
import React, { useState, useEffect } from 'react';
import { Trash2, Eye, AlertTriangle, Shield, Database } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';

const DataManagementPage = () => {
  const { t } = useI18n();
  const [allData, setAllData] = useState({
    rawInbound: [],
    auxInbound: [],
    productInbound: [],
    rawOutbound: [],
    productOutbound: [],
    assets: [],
    financeData: []
  });
  const [loading, setLoading] = useState(true);
  const [deleteCode, setDeleteCode] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [activeTab, setActiveTab] = useState('raw-inbound');

  const tabs = [
    { id: 'raw-inbound', label: t('dataManagement.rawInboundData'), icon: Database },
    { id: 'aux-inbound', label: t('dataManagement.auxInboundData'), icon: Database },
    { id: 'product-inbound', label: t('dataManagement.productInboundData'), icon: Database },
    { id: 'raw-outbound', label: t('dataManagement.rawOutboundData'), icon: Database },
    { id: 'product-outbound', label: t('dataManagement.productOutboundData'), icon: Database },
    { id: 'assets', label: t('dataManagement.assetData'), icon: Database },
    { id: 'finance', label: t('dataManagement.financialData'), icon: Database }
  ];

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [
        rawInboundRes,
        auxInboundRes,
        productInboundRes,
        rawOutboundRes,
        productOutboundRes,
        assetsRes,
        financeRes
      ] = await Promise.all([
        fetch(API_BASE_URL + "/api/raw-inout"),
        fetch(API_BASE_URL + "/api/aux-inout"),
        fetch(API_BASE_URL + "/api/product-inbound"),
        fetch(API_BASE_URL + "/api/raw-outbound"),
        fetch(API_BASE_URL + "/api/product-outbound"),
        fetch(API_BASE_URL + "/api/assets"),
        fetch(API_BASE_URL + "/api/finance/raw-inbound")
      ]);

      const data = {
        rawInbound: await rawInboundRes.json(),
        auxInbound: await auxInboundRes.json(),
        productInbound: await productInboundRes.json(),
        rawOutbound: await rawOutboundRes.json(),
        productOutbound: await productOutboundRes.json(),
        assets: await assetsRes.json(),
        financeData: await financeRes.json()
      };

      setAllData(data);
    } catch (error) {
      console.error(t('dataManagement.getDataFailed'), error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (data, type) => {
    setSelectedData({ data, type });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (deleteCode !== 'IMSURE') {
      alert(t('dataManagement.codeError'));
      return;
    }

    try {
      console.log('Deleting data:', selectedData);
      console.log('API URL:', API_BASE_URL + "/api/" + selectedData.type + "/" + selectedData.data.id);
      const response = await fetch(
        API_BASE_URL + "/api/" + selectedData.type + "/" + selectedData.data.id,
        {
          method: 'DELETE'
        }
      );

      if (response.ok) {
        alert(t('dataManagement.deleteSuccess'));
        setShowDeleteModal(false);
        setDeleteCode('');
        fetchAllData(); // 重新获取数据
      } else {
        alert(t('dataManagement.deleteFailed'));
      }
    } catch (error) {
      console.error('删除失败:', error);
      alert(t('dataManagement.deleteFailed'));
    }
  };

  const getDataByTab = () => {
    switch (activeTab) {
      case 'raw-inbound':
        return allData.rawInbound;
      case 'aux-inbound':
        return allData.auxInbound;
      case 'product-inbound':
        return allData.productInbound;
      case 'raw-outbound':
        return allData.rawOutbound;
      case 'product-outbound':
        return allData.productOutbound;
      case 'assets':
        return allData.assets;
      case 'finance':
        return allData.financeData;
      default:
        return [];
    }
  };

  const renderDataTable = (data) => {
    if (!data || data.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          {t('dataManagement.noData')}
        </div>
      );
    }

    const columns = Object.keys(data[0] || {}).filter(key => key !== 'id');

    return (
      <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse', 
          fontSize: '12px',
          minWidth: '800px',
          tableLayout: 'fixed'
        }}>
          <thead style={{ backgroundColor: '#f8f9fa' }}>
            <tr>
              <th style={{ 
                padding: '8px', 
                textAlign: 'left', 
                borderBottom: '1px solid #dee2e6',
                width: '60px'
              }}>ID</th>
              {columns.map(column => (
                <th key={column} style={{ 
                  padding: '8px', 
                  textAlign: 'left', 
                  borderBottom: '1px solid #dee2e6',
                  width: column === 'date' ? '100px' : 
                         column === 'material_name' || column === 'product_name' ? '150px' :
                         column === 'declaration_no' ? '80px' :
                         column === 'container' ? '60px' :
                         column === 'quantity' ? '80px' :
                         column === 'quality_report_path' ? '120px' : '100px'
                }}>
                  {column}
                </th>
              ))}
              <th style={{ 
                padding: '8px', 
                textAlign: 'center', 
                borderBottom: '1px solid #dee2e6',
                width: '80px'
              }}>{t('dataManagement.operation')}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={item.id || index} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '8px' }}>{item.id || index + 1}</td>
                {columns.map(column => (
                  <td key={column} style={{ 
                    padding: '8px', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: column === 'date' ? '100px' : 
                              column === 'material_name' || column === 'product_name' ? '150px' :
                              column === 'declaration_no' ? '80px' :
                              column === 'container' ? '60px' :
                              column === 'quantity' ? '80px' :
                              column === 'quality_report_path' ? '120px' : '100px'
                  }}>
                    {typeof item[column] === 'object' ? JSON.stringify(item[column]) : String(item[column] || '')}
                  </td>
                ))}
                <td style={{ padding: '8px', textAlign: 'center' }}>
                  <button
                    onClick={() => handleDelete(item, activeTab)}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Trash2 size={12} />
                    {t('dataManagement.delete')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '100%', 
      overflowX: 'hidden',
      boxSizing: 'border-box',
      width: '100%'
    }}>
      {/* 页面标题 */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        border: '2px solid #dc3545'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
          <AlertTriangle size={24} style={{ color: '#dc3545', marginRight: '12px' }} />
          <h1 style={{ margin: 0, color: '#dc3545', fontSize: '24px' }}>{t('dataManagement.title')} - {t('dataManagement.dangerousOperation')}</h1>
        </div>
        <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
          {t('dataManagement.description')}
        </p>
      </div>

      {/* 标签页 */}
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <div style={{ 
          display: 'flex', 
          borderBottom: '1px solid #eee',
          backgroundColor: '#f8f9fa',
          overflowX: 'auto',
          maxWidth: '100%'
        }}>
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '8px 12px',
                  border: 'none',
                  backgroundColor: activeTab === tab.id ? '#007bff' : 'transparent',
                  color: activeTab === tab.id ? 'white' : '#666',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  fontWeight: activeTab === tab.id ? '500' : 'normal',
                  whiteSpace: 'nowrap',
                  minWidth: '0',
                  flexShrink: 0
                }}
              >
                <Icon size={12} />
                <span style={{ 
                  maxWidth: '120px', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
        
        <div style={{ 
          padding: '20px',
          maxWidth: '100%',
          overflowX: 'auto'
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div>{t('dataManagement.loading')}</div>
            </div>
          ) : (
            renderDataTable(getDataByTab())
          )}
        </div>
      </div>

      {/* 删除确认模态框 */}
      {showDeleteModal && (
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
            borderRadius: '8px',
            padding: '24px',
            width: '90%',
            maxWidth: '500px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
              <Shield size={24} style={{ color: '#dc3545', marginRight: '12px' }} />
              <h3 style={{ margin: 0, color: '#dc3545' }}>{t('dataManagement.confirmDelete')}</h3>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <p style={{ margin: '0 0 12px 0', color: '#666' }}>
                {t('dataManagement.deleteWarning')}
              </p>
              <div style={{ 
                backgroundColor: '#f8f9fa', 
                padding: '12px', 
                borderRadius: '4px',
                fontSize: '12px',
                maxHeight: '100px',
                overflow: 'auto'
              }}>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                  {JSON.stringify(selectedData?.data, null, 2)}
                </pre>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#dc3545' }}>
                {t('dataManagement.enterCode')}
              </label>
              <input
                type="password"
                value={deleteCode}
                onChange={(e) => setDeleteCode(e.target.value)}
                placeholder={t('dataManagement.codePlaceholder')}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #dc3545',
                  borderRadius: '4px',
                  fontSize: '16px',
                  textAlign: 'center',
                  letterSpacing: '2px'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteCode('');
                }}
                style={{
                  padding: '10px 20px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              >
                {t('dataManagement.cancel')}
              </button>
              <button
                onClick={confirmDelete}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                {t('dataManagement.confirmDeleteButton')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataManagementPage; 