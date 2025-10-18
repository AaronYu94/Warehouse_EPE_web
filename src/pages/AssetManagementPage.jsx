import React, { useState, useEffect } from 'react';
import { useI18n } from '../contexts/I18nContext';
import { api } from '../utils/api';
import { Plus, Edit, Trash2, Search, Filter, Download, Eye, Settings } from 'lucide-react';
import { 
  pageTitleStyle, 
  pageDescriptionStyle, 
  cardStyle, 
  primaryButtonStyle, 
  secondaryButtonStyle, 
  dangerButtonStyle,
  inputStyle,
  selectStyle,
  statusTagStyle,
  categoryTagStyle,
  theme
} from '../styles';

const AssetManagementPage = () => {
  const { t } = useI18n();
  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [depreciationRecords, setDepreciationRecords] = useState([]);
  const [formData, setFormData] = useState({
    asset_name: '',
    asset_code: '',
    category: 'factory',
    description: '',
    purchase_date: '',
    purchase_price: '',
    current_value: '',
    location: '',
    status: 'active',
    responsible_person: '',
    department: '',
    supplier: '',
    warranty_expiry: '',
    maintenance_cycle: '',
    last_maintenance_date: '',
    next_maintenance_date: '',
    notes: ''
  });

  const categories = [
    { value: 'factory', label: t('assetManagement.categories.factory'), color: '#007bff' },
    { value: 'machine', label: t('assetManagement.categories.machine'), color: '#28a745' },
    { value: 'vehicle', label: t('assetManagement.categories.vehicle'), color: '#ffc107' },
    { value: 'equipment', label: t('assetManagement.categories.equipment'), color: '#dc3545' },
    { value: 'other', label: t('assetManagement.categories.other'), color: '#6c757d' }
  ];

  const statusOptions = [
    { value: 'active', label: t('assetManagement.statusOptions.active'), color: '#28a745' },
    { value: 'inactive', label: t('assetManagement.statusOptions.inactive'), color: '#ffc107' },
    { value: 'maintenance', label: t('assetManagement.statusOptions.maintenance'), color: '#ffc107' },
    { value: 'retired', label: t('assetManagement.statusOptions.retired'), color: '#dc3545' }
  ];

  useEffect(() => {
    fetchAssets();
  }, []);

  useEffect(() => {
    filterAssets();
  }, [assets, selectedCategory, searchTerm]);

  const fetchAssets = async () => {
    const maxRetries = 3;
    let retryCount = 0;
    
    const attemptFetch = async () => {
      try {
        console.log(`正在获取资产数据... (尝试 ${retryCount + 1}/${maxRetries})`);
        const response = await api.get("/api/assets");
        
        if (!response.ok) {
          throw new Error('HTTP error! status: ' + response.status);
        }
        
        const data = await response.json();
        console.log('获取到资产数据:', data.length, '条记录');
        setAssets(data);
        return true;
      } catch (error) {
        console.error('获取资产数据失败 (尝试 ' + (retryCount + 1) + '):', error);
        retryCount++;
        
        if (retryCount < maxRetries) {
          console.log("等待 2 秒后重试...");
          await new Promise(resolve => setTimeout(resolve, 2000));
          return await attemptFetch();
        } else {
          console.error('所有重试都失败了');
          alert('无法连接到服务器，请检查服务器是否正在运行。错误: ' + error.message);
          return false;
        }
      }
    };
    
    await attemptFetch();
  };

  const filterAssets = () => {
    let filtered = assets;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(asset => asset.category === selectedCategory);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(asset => 
        asset.asset_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.asset_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredAssets(filtered);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = showEditModal ? API_BASE_URL + "/api/assets/" + selectedAsset.id : API_BASE_URL + "/api/assets";
      const method = showEditModal ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setShowAddModal(false);
        setShowEditModal(false);
        setFormData({
          asset_name: '',
          asset_code: '',
          category: 'factory',
          description: '',
          purchase_date: '',
          purchase_price: '',
          current_value: '',
          location: '',
          status: 'active',
          responsible_person: '',
          department: '',
          supplier: '',
          warranty_expiry: '',
          maintenance_cycle: '',
          last_maintenance_date: '',
          next_maintenance_date: '',
          notes: ''
        });
        fetchAssets();
      }
    } catch (error) {
      console.error('保存资产失败:', error);
    }
  };

  const handleEdit = (asset) => {
    setSelectedAsset(asset);
    setFormData({
      asset_name: asset.asset_name,
      asset_code: asset.asset_code,
      category: asset.category,
      description: asset.description || '',
      purchase_date: asset.purchase_date || '',
      purchase_price: asset.purchase_price || '',
      current_value: asset.current_value || '',
      location: asset.location || '',
      status: asset.status,
      responsible_person: asset.responsible_person || '',
      department: asset.department || '',
      supplier: asset.supplier || '',
      warranty_expiry: asset.warranty_expiry || '',
      maintenance_cycle: asset.maintenance_cycle || '',
      last_maintenance_date: asset.last_maintenance_date || '',
      next_maintenance_date: asset.next_maintenance_date || '',
      notes: asset.notes || ''
    });
    setShowEditModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('确定要删除这个资产吗？')) {
      try {
        const response = await api.delete("/api/assets/" + id);
        if (response.ok) {
          fetchAssets();
        }
      } catch (error) {
        console.error('删除资产失败:', error);
      }
    }
  };

  const handleViewDetails = async (asset) => {
    setSelectedAsset(asset);
    try {
      const [maintenanceRes, depreciationRes] = await Promise.all([
        api.get("/api/assets/" + asset.id + "/maintenance"),
        api.get("/api/assets/" + asset.id + "/depreciation")
      ]);
      const maintenanceData = await maintenanceRes.json();
      const depreciationData = await depreciationRes.json();
      setMaintenanceRecords(maintenanceData);
      setDepreciationRecords(depreciationData);
      setShowDetailModal(true);
    } catch (error) {
      console.error('获取详细信息失败:', error);
    }
  };

  const getCategoryLabel = (category) => {
    return categories.find(c => c.value === category)?.label || category;
  };

  const getStatusLabel = (status) => {
    return statusOptions.find(s => s.value === status)?.label || status;
  };

  const getStatusColor = (status) => {
    return statusOptions.find(s => s.value === status)?.color || '#6c757d';
  };

  const getCategoryColor = (category) => {
    return categories.find(c => c.value === category)?.color || '#6c757d';
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* 页面标题 */}
      <div style={cardStyle}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <div>
            <h1 style={pageTitleStyle}>
              <Settings size={24} style={{ marginRight: '8px', verticalAlign: 'middle', color: theme.colors.primary }} />
              {t('assetManagement.title')}
            </h1>
            <p style={pageDescriptionStyle}>
              {t('assetManagement.description')}
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            style={primaryButtonStyle}
          >
            <Plus size={16} />
            {t('assetManagement.addAsset')}
          </button>
        </div>
      </div>

      {/* 筛选和搜索 */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={16} />
            <span style={{ fontSize: '14px', color: theme.colors.gray[600] }}>{t('assetManagement.categoryFilter')}:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={selectStyle}
            >
              <option value="all">{t('assetManagement.allCategories')}</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Search size={16} />
            <input
              type="text"
              placeholder={t('assetManagement.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ ...inputStyle, width: '300px' }}
            />
          </div>
        </div>
      </div>

      {/* 资产列表 */}
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #eee' }}>
          <h3 style={{ margin: '0', color: '#333' }}>
            {t('assetManagement.assetList')} ({filteredAssets.length})
          </h3>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>{t('assetManagement.assetNameHeader')}</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>{t('assetManagement.assetCodeHeader')}</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>{t('assetManagement.categoryHeader')}</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>{t('assetManagement.statusHeader')}</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>{t('assetManagement.locationHeader')}</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>{t('assetManagement.responsiblePersonHeader')}</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>{t('assetManagement.currentValueHeader')}</th>
                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{t('assetManagement.operationsHeader')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map(asset => (
                <tr key={asset.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>
                    <div style={{ fontWeight: '500' }}>{asset.asset_name}</div>
                    {asset.description && (
                      <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                        {asset.description}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '12px' }}>{asset.asset_code}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      backgroundColor: getCategoryColor(asset.category) + '20',
                      color: getCategoryColor(asset.category)
                    }}>
                      {getCategoryLabel(asset.category)}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      backgroundColor: getStatusColor(asset.status) + '20',
                      color: getStatusColor(asset.status)
                    }}>
                      {getStatusLabel(asset.status)}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>{asset.location || '-'}</td>
                  <td style={{ padding: '12px' }}>{asset.responsible_person || '-'}</td>
                  <td style={{ padding: '12px' }}>
                    {asset.current_value ? `¥${asset.current_value.toLocaleString()}` : '-'}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button
                        onClick={() => handleViewDetails(asset)}
                        style={{
                          padding: '4px 8px',
                          border: 'none',
                          backgroundColor: '#17a2b8',
                          color: 'white',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        <Eye size={12} />
                      </button>
                      <button
                        onClick={() => handleEdit(asset)}
                        style={{
                          padding: '4px 8px',
                          border: 'none',
                          backgroundColor: '#ffc107',
                          color: 'white',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        <Edit size={12} />
                      </button>
                      <button
                        onClick={() => handleDelete(asset.id)}
                        style={{
                          padding: '4px 8px',
                          border: 'none',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 新增/编辑资产模态框 */}
      {(showAddModal || showEditModal) && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '30px',
            width: '90%',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2 style={{ margin: '0 0 20px 0' }}>
              {showAddModal ? t('assetManagement.addAsset') : t('assetManagement.editRecord')}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    {t('assetManagement.assetName')} *
                  </label>
                  <input
                    type="text"
                    name="asset_name"
                    value={formData.asset_name}
                    onChange={handleInputChange}
                    required
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    {t('assetManagement.assetCode')} *
                  </label>
                  <input
                    type="text"
                    name="asset_code"
                    value={formData.asset_code}
                    onChange={handleInputChange}
                    required
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    {t('assetManagement.category')} *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    {t('assetManagement.status')} *
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                  >
                    {statusOptions.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    {t('assetManagement.purchaseDate')}
                  </label>
                  <input
                    type="date"
                    name="purchase_date"
                    value={formData.purchase_date}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    {t('assetManagement.purchasePrice')}
                  </label>
                  <input
                    type="number"
                    name="purchase_price"
                    value={formData.purchase_price}
                    onChange={handleInputChange}
                    step="0.01"
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    {t('assetManagement.currentValue')}
                  </label>
                  <input
                    type="number"
                    name="current_value"
                    value={formData.current_value}
                    onChange={handleInputChange}
                    step="0.01"
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    {t('assetManagement.location')}
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    {t('assetManagement.responsiblePerson')}
                  </label>
                  <input
                    type="text"
                    name="responsible_person"
                    value={formData.responsible_person}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    {t('assetManagement.department')}
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    {t('assetManagement.supplier')}
                  </label>
                  <input
                    type="text"
                    name="supplier"
                    value={formData.supplier}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    {t('assetManagement.warrantyExpiry')}
                  </label>
                  <input
                    type="date"
                    name="warranty_expiry"
                    value={formData.warranty_expiry}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    {t('assetManagement.maintenanceCycle')}（天）
                  </label>
                  <input
                    type="number"
                    name="maintenance_cycle"
                    value={formData.maintenance_cycle}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    {t('assetManagement.lastMaintenanceDate')}
                  </label>
                  <input
                    type="date"
                    name="last_maintenance_date"
                    value={formData.last_maintenance_date}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    {t('assetManagement.nextMaintenanceDate')}
                  </label>
                  <input
                    type="date"
                    name="next_maintenance_date"
                    value={formData.next_maintenance_date}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
              </div>
              
              <div style={{ marginTop: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  {t('assetManagement.description')}
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              
              <div style={{ marginTop: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  {t('assetManagement.notes')}
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                  }}
                  style={{
                    padding: '10px 20px',
                    border: '1px solid #ddd',
                    backgroundColor: 'white',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {t('assetManagement.cancel')}
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {showAddModal ? t('assetManagement.addAsset') : t('assetManagement.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 资产详情模态框 */}
      {showDetailModal && selectedAsset && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '30px',
            width: '90%',
            maxWidth: '1000px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>{t('assetManagement.assetDetails')}</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #ddd',
                  backgroundColor: 'white',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                {t('assetManagement.cancel')}
              </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
              <div>
                <h3>{t('assetManagement.basicInfo')}</h3>
                <div style={{ display: 'grid', gap: '10px' }}>
                  <div><strong>资产名称:</strong> {selectedAsset.asset_name}</div>
                  <div><strong>资产编码:</strong> {selectedAsset.asset_code}</div>
                  <div><strong>分类:</strong> {getCategoryLabel(selectedAsset.category)}</div>
                  <div><strong>状态:</strong> {getStatusLabel(selectedAsset.status)}</div>
                  <div><strong>位置:</strong> {selectedAsset.location || '-'}</div>
                  <div><strong>负责人:</strong> {selectedAsset.responsible_person || '-'}</div>
                  <div><strong>部门:</strong> {selectedAsset.department || '-'}</div>
                  <div><strong>供应商:</strong> {selectedAsset.supplier || '-'}</div>
                </div>
              </div>
              
              <div>
                <h3>{t('assetManagement.financialInfo')}</h3>
                <div style={{ display: 'grid', gap: '10px' }}>
                  <div><strong>购买日期:</strong> {selectedAsset.purchase_date || '-'}</div>
                  <div><strong>购买价格:</strong> {selectedAsset.purchase_price ? `¥${selectedAsset.purchase_price.toLocaleString()}` : '-'}</div>
                  <div><strong>当前价值:</strong> {selectedAsset.current_value ? `¥${selectedAsset.current_value.toLocaleString()}` : '-'}</div>
                  <div><strong>保修到期:</strong> {selectedAsset.warranty_expiry || '-'}</div>
                </div>
              </div>
            </div>
            
            {selectedAsset.description && (
              <div style={{ marginBottom: '20px' }}>
                <h3>{t('assetManagement.description')}</h3>
                <p>{selectedAsset.description}</p>
              </div>
            )}
            
            {selectedAsset.notes && (
              <div style={{ marginBottom: '20px' }}>
                <h3>{t('assetManagement.notes')}</h3>
                <p>{selectedAsset.notes}</p>
              </div>
            )}
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <h3>{t('assetManagement.maintenanceRecords')} ({maintenanceRecords.length})</h3>
                {maintenanceRecords.length > 0 ? (
                  <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {maintenanceRecords.map(record => (
                      <div key={record.id} style={{ 
                        padding: '10px', 
                        border: '1px solid #eee', 
                        borderRadius: '4px', 
                        marginBottom: '10px' 
                      }}>
                        <div><strong>日期:</strong> {record.maintenance_date}</div>
                        <div><strong>类型:</strong> {record.maintenance_type}</div>
                        <div><strong>描述:</strong> {record.description || '-'}</div>
                        <div><strong>费用:</strong> {record.cost ? `¥${record.cost}` : '-'}</div>
                        <div><strong>技术人员:</strong> {record.technician || '-'}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#666' }}>{t('assetManagement.noMaintenanceRecords')}</p>
                )}
              </div>
              
              <div>
                <h3>{t('assetManagement.depreciationRecords')} ({depreciationRecords.length})</h3>
                {depreciationRecords.length > 0 ? (
                  <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {depreciationRecords.map(record => (
                      <div key={record.id} style={{ 
                        padding: '10px', 
                        border: '1px solid #eee', 
                        borderRadius: '4px', 
                        marginBottom: '10px' 
                      }}>
                        <div><strong>日期:</strong> {record.depreciation_date}</div>
                        <div><strong>折旧金额:</strong> ¥{record.depreciation_amount}</div>
                        <div><strong>剩余价值:</strong> ¥{record.remaining_value}</div>
                        <div><strong>折旧率:</strong> {record.depreciation_rate ? `${record.depreciation_rate}%` : '-'}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#666' }}>{t('assetManagement.noDepreciationRecords')}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetManagementPage; 