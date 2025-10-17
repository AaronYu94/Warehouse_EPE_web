import React, { useState, useEffect } from 'react';
import { useI18n } from '../contexts/I18nContext';
import { 
  RefreshCw, 
  Cloud, 
  HardDrive, 
  Wifi, 
  WifiOff, 
  CheckCircle, 
  AlertCircle,
  Settings,
  Database,
  Users
} from 'lucide-react';

const SyncManagementPage = () => {
  const { t } = useI18n();
  const [syncStatus, setSyncStatus] = useState({
    isOnline: false,
    lastSyncTime: null,
    pendingChanges: 0,
    connectedClients: 0,
    syncMode: 'local' // local, cloud, websocket, file
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchSyncStatus();
    const interval = setInterval(fetchSyncStatus, 10000); // 每10秒更新一次
    return () => clearInterval(interval);
  }, []);

  const fetchSyncStatus = async () => {
    try {
      const response = await fetch('/api/sync/status');
      if (response.ok) {
        const data = await response.json();
        setSyncStatus(data);
      }
    } catch (error) {
      console.error('获取同步状态失败:', error);
    }
  };

  const handleManualSync = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/sync/manual', { method: 'POST' });
      if (response.ok) {
        alert('手动同步已触发');
        await fetchSyncStatus();
      }
    } catch (error) {
      console.error('手动同步失败:', error);
      alert('手动同步失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeSyncMode = async (mode) => {
    try {
      const response = await fetch('/api/sync/mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode })
      });
      
      if (response.ok) {
        setSyncStatus(prev => ({ ...prev, syncMode: mode }));
        alert(`同步模式已切换到: ${mode}`);
      }
    } catch (error) {
      console.error('切换同步模式失败:', error);
      alert('切换同步模式失败');
    }
  };

  const getSyncModeInfo = (mode) => {
    const modes = {
      local: {
        name: '本地模式',
        description: '仅使用本地数据库，不进行同步',
        icon: HardDrive,
        color: '#6c757d'
      },
      cloud: {
        name: '云端同步',
        description: '通过云端数据库进行设备间同步',
        icon: Cloud,
        color: '#007bff'
      },
      websocket: {
        name: '实时同步',
        description: '通过WebSocket实现实时数据同步',
        icon: Wifi,
        color: '#28a745'
      },
      file: {
        name: '文件同步',
        description: '通过共享文件夹进行数据库同步',
        icon: Database,
        color: '#ffc107'
      }
    };
    
    return modes[mode] || modes.local;
  };

  const currentMode = getSyncModeInfo(syncStatus.syncMode);

  return (
    <div style={{ padding: '24px', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* 页面标题 */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '24px', 
        padding: '20px', 
        backgroundColor: 'white',
        borderRadius: '8px', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600', color: '#007bff' }}>
            <Settings size={24} style={{ marginRight: '8px', verticalAlign: 'middle', color: '#007bff' }} />
            同步管理
          </h1>
          <p style={{ margin: '8px 0 0 0', color: '#666' }}>
            管理设备间的数据库同步设置
          </p>
        </div>
        
        <button
          onClick={handleManualSync}
          disabled={isLoading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            opacity: isLoading ? 0.6 : 1
          }}
        >
          <RefreshCw size={16} style={{ animation: isLoading ? 'spin 1s linear infinite' : 'none' }} />
          {isLoading ? '同步中...' : '手动同步'}
        </button>
      </div>

      {/* 同步状态卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* 当前同步模式 */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          border: `2px solid ${currentMode.color}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
            <currentMode.icon size={24} style={{ color: currentMode.color, marginRight: '8px' }} />
            <h3 style={{ margin: 0, color: currentMode.color }}>{currentMode.name}</h3>
          </div>
          <p style={{ margin: '8px 0', color: '#666' }}>{currentMode.description}</p>
        </div>

        {/* 连接状态 */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
            {syncStatus.isOnline ? (
              <Wifi size={24} style={{ color: '#28a745', marginRight: '8px' }} />
            ) : (
              <WifiOff size={24} style={{ color: '#dc3545', marginRight: '8px' }} />
            )}
            <h3 style={{ margin: 0, color: syncStatus.isOnline ? '#28a745' : '#dc3545' }}>
              {syncStatus.isOnline ? '在线' : '离线'}
            </h3>
          </div>
          <p style={{ margin: '8px 0', color: '#666' }}>
            网络连接状态
          </p>
        </div>

        {/* 同步统计 */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
            <Users size={24} style={{ color: '#007bff', marginRight: '8px' }} />
            <h3 style={{ margin: 0, color: '#007bff' }}>
              {syncStatus.connectedClients} 个设备
            </h3>
          </div>
          <p style={{ margin: '8px 0', color: '#666' }}>
            当前连接的设备数量
          </p>
        </div>
      </div>

      {/* 同步模式选择 */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '24px'
      }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#333' }}>同步模式</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {['local', 'cloud', 'websocket', 'file'].map(mode => {
            const modeInfo = getSyncModeInfo(mode);
            const isActive = syncStatus.syncMode === mode;
            
            return (
              <button
                key={mode}
                onClick={() => handleChangeSyncMode(mode)}
                style={{
                  padding: '12px',
                  border: `2px solid ${isActive ? modeInfo.color : '#dee2e6'}`,
                  borderRadius: '6px',
                  backgroundColor: isActive ? `${modeInfo.color}20` : 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
              >
                <modeInfo.icon size={16} style={{ color: modeInfo.color }} />
                <span style={{ color: isActive ? modeInfo.color : '#333', fontWeight: isActive ? 'bold' : 'normal' }}>
                  {modeInfo.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 同步历史 */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#333' }}>同步历史</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          {syncStatus.lastSyncTime ? (
            <CheckCircle size={16} style={{ color: '#28a745' }} />
          ) : (
            <AlertCircle size={16} style={{ color: '#ffc107' }} />
          )}
          <span style={{ color: '#666' }}>
            最后同步时间: {syncStatus.lastSyncTime ? new Date(syncStatus.lastSyncTime).toLocaleString() : '从未同步'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={16} style={{ color: '#dc3545' }} />
          <span style={{ color: '#666' }}>
            待同步变更: {syncStatus.pendingChanges} 条
          </span>
        </div>
      </div>
    </div>
  );
};

export default SyncManagementPage; 