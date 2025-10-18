import React, { useState, useEffect } from 'react';
import { useI18n } from '../contexts/I18nContext';
import { api } from '../utils/api';
import { 
  Home, 
  Package, 
  Box, 
  Database, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  Plus,
  ArrowUpRight,
  Truck,
  BarChart3,
  Activity
} from 'lucide-react';

export default function DashboardPage() {
  const { t } = useI18n();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/dashboard");
      if (!response.ok) {
        throw new Error(t('errors.dataLoadFailed'));
      }
      const data = await response.json();
      setDashboardData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: '#666' }}>{t('common.loading')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: '#dc3545' }}>{t('common.error')}: {error}</div>
      </div>
    );
  }

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
            <Home size={24} style={{ marginRight: '8px', verticalAlign: 'middle', color: '#007bff' }} />
            {t('dashboard.title')}
          </h1>
          <p style={{ margin: '8px 0 0 0', color: '#666' }}>
            {t('dashboard.subtitle')}
          </p>
        </div>

      </div>

      {/* 统计卡片 */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px', 
        marginBottom: '24px' 
      }}>
        <div style={{ 
          backgroundColor: 'white', padding: '20px', borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)', borderLeft: '4px solid #007bff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>{t('dashboard.rawMaterialStock')}</div>
              <div style={{ fontSize: '24px', fontWeight: '600', color: '#007bff' }}>
                {dashboardData?.total_raw_materials || 0}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {dashboardData?.total_raw_types || 0} {t('dashboard.types')}
              </div>
            </div>
            <Package size={32} color="#007bff" />
          </div>
        </div>

        <div style={{ 
          backgroundColor: 'white', padding: '20px', borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)', borderLeft: '4px solid #28a745'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>{t('dashboard.auxiliaryMaterialStock')}</div>
              <div style={{ fontSize: '24px', fontWeight: '600', color: '#28a745' }}>
                {dashboardData?.total_aux_materials || 0}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {dashboardData?.total_aux_types || 0} {t('dashboard.types')}
              </div>
            </div>
            <Box size={32} color="#28a745" />
          </div>
        </div>

        <div style={{ 
          backgroundColor: 'white', padding: '20px', borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)', borderLeft: '4px solid #ffc107'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>{t('dashboard.finishedProductStock')}</div>
              <div style={{ fontSize: '24px', fontWeight: '600', color: '#ffc107' }}>
                {dashboardData?.total_products || 0}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {dashboardData?.total_products_types || 0} {t('dashboard.products')}
              </div>
            </div>
            <Database size={32} color="#ffc107" />
          </div>
        </div>

        <div style={{ 
          backgroundColor: 'white', padding: '20px', borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)', borderLeft: '4px solid #dc3545'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>{t('dashboard.lowStockWarning')}</div>
              <div style={{ fontSize: '24px', fontWeight: '600', color: '#dc3545' }}>
                {dashboardData?.low_stock_items?.length || 0}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>{t('dashboard.needReplenishment')}</div>
            </div>
            <AlertTriangle size={32} color="#dc3545" />
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* 左侧：最近活动和库存状态 */}
        <div>
          {/* 最近入库记录 */}
          <div style={{ 
            backgroundColor: 'white', padding: '20px', borderRadius: '8px',
            marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <Clock size={20} style={{ marginRight: '8px', color: '#007bff' }} />
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>{t('dashboard.recentInboundRecords')}</h3>
            </div>
            {dashboardData?.recent_inbound_records?.length > 0 ? (
              <div style={{ display: 'grid', gap: '12px' }}>
                {dashboardData.recent_inbound_records.map((record, index) => (
                  <div key={index} style={{ 
                    padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '6px',
                    border: '1px solid #e9ecef'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: '500', fontSize: '14px' }}>
                          {record.material_name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {t('dashboard.containerNumber')}: {record.container} | {t('dashboard.quantity')}: {record.quantity}kg
                        </div>
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {formatDate(record.import_date)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: '#666', fontSize: '14px', textAlign: 'center', padding: '20px' }}>
                {t('dashboard.noInboundRecords')}
              </div>
            )}
          </div>

          {/* 最近出库记录 */}
          <div style={{ 
            backgroundColor: 'white', padding: '20px', borderRadius: '8px',
            marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <ArrowUpRight size={20} style={{ marginRight: '8px', color: '#28a745' }} />
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>{t('dashboard.recentOutboundRecords')}</h3>
            </div>
            {dashboardData?.recent_outbound_records?.length > 0 ? (
              <div style={{ display: 'grid', gap: '12px' }}>
                {dashboardData.recent_outbound_records.map((record, index) => (
                  <div key={index} style={{ 
                    padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '6px',
                    border: '1px solid #e9ecef'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: '500', fontSize: '14px' }}>
                          {record.material_name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {t('dashboard.containerNumber')}: {record.container} | {t('dashboard.quantity')}: {record.quantity}kg
                        </div>
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {formatDate(record.outbound_date)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: '#666', fontSize: '14px', textAlign: 'center', padding: '20px' }}>
                {t('dashboard.noOutboundRecords')}
              </div>
            )}
          </div>
        </div>

        {/* 右侧：快速操作和预警 */}
        <div>
          {/* 快速操作 */}
          <div style={{ 
            backgroundColor: 'white', padding: '20px', borderRadius: '8px',
            marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>{t('dashboard.quickOperations')}</h3>
            <div style={{ display: 'grid', gap: '12px' }}>
              <button 
                onClick={() => window.location.href = '/inbound'}
                style={{
                  padding: '12px 16px', border: 'none', borderRadius: '6px',
                  backgroundColor: '#007bff', color: 'white', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}
              >
                <span>{t('dashboard.rawMaterialInbound')}</span>
                <Package size={16} />
              </button>
              <button 
                onClick={() => window.location.href = '/aux-inbound'}
                style={{
                  padding: '12px 16px', border: 'none', borderRadius: '6px',
                  backgroundColor: '#28a745', color: 'white', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}
              >
                <span>{t('dashboard.auxiliaryMaterialInbound')}</span>
                <Box size={16} />
              </button>
              <button 
                onClick={() => window.location.href = '/product-inbound'}
                style={{
                  padding: '12px 16px', border: 'none', borderRadius: '6px',
                  backgroundColor: '#ffc107', color: 'white', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}
              >
                <span>{t('dashboard.finishedProductInbound')}</span>
                <Database size={16} />
              </button>
              <button 
                onClick={() => window.location.href = '/raw-outbound'}
                style={{
                  padding: '12px 16px', border: 'none', borderRadius: '6px',
                  backgroundColor: '#6c757d', color: 'white', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}
              >
                <span>{t('dashboard.rawMaterialOutbound')}</span>
                <ArrowUpRight size={16} />
              </button>
              <button 
                onClick={() => window.location.href = '/product-outbound'}
                style={{
                  padding: '12px 16px', border: 'none', borderRadius: '6px',
                  backgroundColor: '#fd7e14', color: 'white', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}
              >
                <span>{t('dashboard.finishedProductOutbound')}</span>
                <Truck size={16} />
              </button>
            </div>
          </div>

          {/* 低库存预警 */}
          <div style={{ 
            backgroundColor: 'white', padding: '20px', borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <AlertTriangle size={20} style={{ marginRight: '8px', color: '#dc3545' }} />
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>{t('dashboard.lowStockAlerts')}</h3>
            </div>
            {dashboardData?.low_stock_items?.length > 0 ? (
              <div style={{ display: 'grid', gap: '8px' }}>
                {dashboardData.low_stock_items.slice(0, 5).map((item, index) => (
                  <div key={index} style={{ 
                    padding: '8px 12px', backgroundColor: '#fff5f5', 
                    borderRadius: '4px', border: '1px solid #fed7d7'
                  }}>
                    <div style={{ fontWeight: '500', fontSize: '13px' }}>
                      {item.materialName}
                    </div>
                    <div style={{ fontSize: '11px', color: '#666' }}>
                      {t('dashboard.remaining')}: {item.remainingQuantity} {item.container ? `(${t('dashboard.containerNumber')}: ${item.container})` : ''}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: '#666', fontSize: '14px', textAlign: 'center', padding: '20px' }}>
                {t('dashboard.noLowStockAlerts')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 