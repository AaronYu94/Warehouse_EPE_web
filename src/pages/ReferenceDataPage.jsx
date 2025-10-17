import API_BASE_URL from "../config";
import React, { useState, useEffect } from 'react';
import { useI18n } from '../contexts/I18nContext';
import { Activity, Package, Box, Search, Filter, Download } from 'lucide-react';

export default function ReferenceDataPage() {
  const { t } = useI18n();
  const [referenceData, setReferenceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('products');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchReferenceData();
  }, []);

  const fetchReferenceData = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_BASE_URL + "/api/reference-data");
      if (!response.ok) {
        throw new Error('获取数据失败');
      }
      const data = await response.json();
      setReferenceData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = referenceData?.products?.filter(product => {
    const matchesSearch = product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.product_code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  }) || [];

  const filteredRawMaterials = referenceData?.raw_materials?.filter(material => {
    const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  }) || [];

  const filteredAuxMaterials = referenceData?.auxiliary_materials?.filter(material => {
    const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  }) || [];

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: '#666' }}>{t('referenceData.loading')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: '#dc3545' }}>{t('referenceData.error')}: {error}</div>
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
            <Activity size={24} style={{ marginRight: '8px', verticalAlign: 'middle', color: '#007bff' }} />
            {t('referenceData.categoryDataReference')}
          </h1>
          <p style={{ margin: '8px 0 0 0', color: '#666' }}>
            {t('referenceData.categoryDataDescription')}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ 
            padding: '8px 16px', backgroundColor: '#e9ecef', borderRadius: '6px',
            fontSize: '14px', color: '#495057'
          }}>
            {t('referenceData.totalSummary', { 
              products: referenceData?.total_products || 0, 
              rawMaterials: referenceData?.total_raw_materials || 0, 
              auxMaterials: referenceData?.total_auxiliary_materials || 0 
            })}
          </div>
        </div>
      </div>

      {/* 搜索和筛选 */}
      <div style={{ 
        backgroundColor: 'white', padding: '16px', borderRadius: '8px',
        marginBottom: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ 
              position: 'absolute', left: '12px', top: '50%', 
              transform: 'translateY(-50%)', color: '#666' 
            }} />
            <input
              type="text"
              placeholder={t('referenceData.searchProductPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '10px 12px 10px 40px', border: '1px solid #ddd',
                borderRadius: '4px', fontSize: '14px', width: '100%'
              }}
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{
              padding: '10px 12px', border: '1px solid #ddd',
              borderRadius: '4px', fontSize: '14px'
            }}
          >
            <option value="all">{t('referenceData.allTypes')}</option>
            <option value="products">{t('referenceData.productsOnly')}</option>
            <option value="raw">{t('referenceData.rawOnly')}</option>
            <option value="aux">{t('referenceData.auxOnly')}</option>
          </select>
        </div>
      </div>

      {/* 标签页 */}
      <div style={{ 
        backgroundColor: 'white', borderRadius: '8px',
        marginBottom: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ 
          display: 'flex', borderBottom: '1px solid #dee2e6'
        }}>
          <button
            onClick={() => setActiveTab('products')}
            style={{
              padding: '16px 24px', border: 'none', backgroundColor: 'transparent',
              cursor: 'pointer', fontSize: '14px', fontWeight: '500',
              borderBottom: activeTab === 'products' ? '2px solid #007bff' : '2px solid transparent',
              color: activeTab === 'products' ? '#007bff' : '#666'
            }}
          >
            <Package size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            {t('referenceData.productRecipes')} ({filteredProducts.length})
          </button>
          <button
            onClick={() => setActiveTab('raw')}
            style={{
              padding: '16px 24px', border: 'none', backgroundColor: 'transparent',
              cursor: 'pointer', fontSize: '14px', fontWeight: '500',
              borderBottom: activeTab === 'raw' ? '2px solid #007bff' : '2px solid transparent',
              color: activeTab === 'raw' ? '#007bff' : '#666'
            }}
          >
            <Package size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            {t('referenceData.rawMaterialTypes')} ({filteredRawMaterials.length})
          </button>
          <button
            onClick={() => setActiveTab('aux')}
            style={{
              padding: '16px 24px', border: 'none', backgroundColor: 'transparent',
              cursor: 'pointer', fontSize: '14px', fontWeight: '500',
              borderBottom: activeTab === 'aux' ? '2px solid #007bff' : '2px solid transparent',
              color: activeTab === 'aux' ? '#007bff' : '#666'
            }}
          >
            <Box size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            {t('referenceData.auxiliaryMaterialTypes')} ({filteredAuxMaterials.length})
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          {activeTab === 'products' && (
            <div>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600' }}>
                {t('referenceData.productRecipeDetails')}
              </h3>
              {filteredProducts.map((product, index) => (
                <div key={index} style={{ 
                  border: '1px solid #dee2e6', borderRadius: '8px', 
                  marginBottom: '16px', overflow: 'hidden'
                }}>
                  <div style={{ 
                    backgroundColor: '#f8f9fa', padding: '16px',
                    borderBottom: '1px solid #dee2e6'
                  }}>
                    <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
                      {product.product_name}
                    </h4>
                    <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '14px' }}>
                      {t('referenceData.productCode')}: {product.product_code}
                    </p>
                  </div>
                  <div style={{ padding: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div>
                        <h5 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#007bff' }}>
                          {t('referenceData.rawMaterials')} ({product.raw_materials.length})
                        </h5>
                        {product.raw_materials.length > 0 ? (
                          <div style={{ display: 'grid', gap: '8px' }}>
                            {product.raw_materials.map((material, idx) => (
                              <div key={idx} style={{ 
                                padding: '8px 12px', backgroundColor: '#f8f9fa',
                                borderRadius: '4px', fontSize: '13px'
                              }}>
                                <div style={{ fontWeight: '500' }}>{material.material_name}</div>
                                <div style={{ color: '#666', fontSize: '12px' }}>
                                  编码: {material.material_code}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ color: '#666', fontSize: '13px' }}>{t('referenceData.noRawMaterials')}</div>
                        )}
                      </div>
                      <div>
                        <h5 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#28a745' }}>
                          {t('referenceData.auxiliaryMaterials')} ({product.auxiliary_materials.length})
                        </h5>
                        {product.auxiliary_materials.length > 0 ? (
                          <div style={{ display: 'grid', gap: '8px' }}>
                            {product.auxiliary_materials.map((material, idx) => (
                              <div key={idx} style={{ 
                                padding: '8px 12px', backgroundColor: '#f8f9fa',
                                borderRadius: '4px', fontSize: '13px'
                              }}>
                                <div style={{ fontWeight: '500' }}>{material.material_name}</div>
                                <div style={{ color: '#666', fontSize: '12px' }}>
                                  编码: {material.material_code}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ color: '#666', fontSize: '13px' }}>{t('referenceData.noAuxiliaryMaterials')}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'raw' && (
            <div>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600' }}>
                {t('referenceData.rawMaterialTypeList')}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                {filteredRawMaterials.map((material, index) => (
                  <div key={index} style={{ 
                    padding: '16px', border: '1px solid #dee2e6', borderRadius: '8px',
                    backgroundColor: 'white'
                  }}>
                    <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: '8px' }}>
                      {material.name}
                    </div>
                    <div style={{ color: '#666', fontSize: '14px' }}>
                      编码: {material.code}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'aux' && (
            <div>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600' }}>
                {t('referenceData.auxiliaryMaterialTypeList')}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                {filteredAuxMaterials.map((material, index) => (
                  <div key={index} style={{ 
                    padding: '16px', border: '1px solid #dee2e6', borderRadius: '8px',
                    backgroundColor: 'white'
                  }}>
                    <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: '8px' }}>
                      {material.name}
                    </div>
                    <div style={{ color: '#666', fontSize: '14px', marginBottom: '8px' }}>
                      编码: {material.code}
                    </div>
                    {material.products && material.products.length > 0 && (
                      <div>
                        <div style={{ fontSize: '12px', color: '#007bff', fontWeight: '500', marginBottom: '4px' }}>
                          {t('referenceData.usedProducts')} ({material.products.length}):
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {material.products.map((product, idx) => (
                            <span key={idx} style={{
                              padding: '2px 6px',
                              backgroundColor: '#e3f2fd',
                              color: '#1976d2',
                              borderRadius: '4px',
                              fontSize: '11px',
                              border: '1px solid #bbdefb'
                            }}>
                              {product}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 