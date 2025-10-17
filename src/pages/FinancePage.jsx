import API_BASE_URL from "../config";
import React, { useState, useEffect } from 'react';
import { useI18n } from '../contexts/I18nContext';
import { DollarSign, TrendingUp, TrendingDown, Calendar, Filter, Edit, Eye, Upload, Download, Save, FileSpreadsheet } from 'lucide-react';
import { 
  pageTitleStyle, 
  pageDescriptionStyle, 
  cardStyle, 
  primaryButtonStyle, 
  secondaryButtonStyle,
  tabStyle,
  inputStyle,
  selectStyle,
  theme
} from '../styles';

// 静态导入xlsx库
let XLSX = null;
try {
  XLSX = require('xlsx');
} catch (error) {
  console.warn('xlsx库未找到，Excel导出功能将不可用');
}

const FinancePage = () => {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState('import-cost');
  const [financeData, setFinanceData] = useState({
    importCosts: [],
    exportSales: [],
    lastUpdated: new Date().toISOString()
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // 从localStorage加载数据
  useEffect(() => {
    loadFinanceData();
  }, []);

  const loadFinanceData = () => {
    try {
      const savedData = localStorage.getItem('financeData');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setFinanceData(parsedData);
      }
    } catch (error) {
      console.error('加载财务数据失败:', error);
    }
  };

  // 保存数据到localStorage
  const saveFinanceData = (newData) => {
    try {
      const dataToSave = {
        ...newData,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem('financeData', JSON.stringify(dataToSave));
      setFinanceData(dataToSave);
      setMessage('数据已保存');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('保存财务数据失败:', error);
      setMessage('保存失败');
    }
  };

  // 导入JSON文件
  const handleImportJSON = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);
        
        // 转换导入的数据格式
        const convertedData = {
          importCosts: jsonData.rawInboundData?.map(item => ({
            id: item.id,
            productName: item.material_name,
            containerNumber: item.container,
            quantity: item.quantity,
            date: item.date,
            importPrice: '',
            customsFee: '',
            shippingFee: '',
            totalImportCost: ''
          })) || [],
          exportSales: jsonData.productOutboundData?.map(item => ({
            id: item.id,
            batchNumber: item.batch_number,
            productName: item.product_name,
            unitPrice: '',
            quantity: item.quantity,
            exportDate: item.outbound_date,
            totalPrice: '',
            customsFee: '',
            totalSalesAfterCustoms: '',
            totalSales: ''
          })) || [],
          lastUpdated: new Date().toISOString()
        };

        saveFinanceData(convertedData);
        setMessage('JSON文件导入成功');
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        console.error('解析JSON文件失败:', error);
        setMessage('JSON文件格式错误');
        setTimeout(() => setMessage(''), 3000);
      }
    };
    reader.readAsText(file);
  };

  // 导出JSON文件
  const handleExportJSON = () => {
    const exportData = {
      reportName: `财务报告_${new Date().toLocaleDateString()}`,
      calculatedAt: new Date().toLocaleString('zh-CN'),
      importCosts: financeData.importCosts,
      exportSales: financeData.exportSales,
      lastUpdated: financeData.lastUpdated
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `财务报告_${new Date().toLocaleDateString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 导出Excel文件
  const handleExportExcel = async () => {
    try {
      // 检查xlsx库是否可用
      if (!XLSX) {
        setMessage('Excel导出功能不可用，xlsx库未安装');
        setTimeout(() => setMessage(''), 3000);
        return;
      }
      
      // 创建工作簿
      const workbook = XLSX.utils.book_new();
      
      // 准备入口成本数据
      const importCostsData = [
        [
          '产品名称',
          '柜号', 
          '数量',
          '日期',
          '入口价格',
          '清关费',
          '运输费',
          '入口总成本'
        ],
        ...financeData.importCosts.map(item => [
          item.productName,
          item.containerNumber,
          item.quantity,
          item.date,
          item.importPrice,
          item.customsFee,
          item.shippingFee,
          item.totalImportCost
        ])
      ];
      
      // 准备销售出口数据
      const exportSalesData = [
        [
          '批次号',
          '产品名称',
          '单位价格',
          '数量',
          '出口日期',
          '总价',
          '清关费',
          '减去清关费后销售总价',
          '总销售额'
        ],
        ...financeData.exportSales.map(item => [
          item.batchNumber,
          item.productName,
          item.unitPrice,
          item.quantity,
          item.exportDate,
          item.totalPrice,
          item.customsFee,
          item.totalSalesAfterCustoms,
          item.totalSalesAfterCustoms // 总销售额等于减去清关费后的销售总价
        ])
      ];
      
      // 添加汇总信息
      const summaryData = [
        ['财务报告汇总'],
        [''],
        ['报告生成时间:', new Date().toLocaleString('zh-CN')],
        ['最后更新时间:', new Date(financeData.lastUpdated).toLocaleString('zh-CN')],
        [''],
        ['入口成本记录总数:', financeData.importCosts.length],
        ['销售出口记录总数:', financeData.exportSales.length],
        [''],
        ['总销售额:', `$${calculateTotalSales().toFixed(2)}`],
        [''],
        ['入口成本明细:'],
        ['总入口成本:', `$${calculateTotalImportCost().toFixed(2)}`],
        [''],
        ['销售出口明细:'],
        ['总销售出口额:', `$${calculateTotalExportSales().toFixed(2)}`]
      ];
      
      // 创建工作表
      const importCostsSheet = XLSX.utils.aoa_to_sheet(importCostsData);
      const exportSalesSheet = XLSX.utils.aoa_to_sheet(exportSalesData);
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      
      // 设置列宽
      const importCostsColWidths = [
        { wch: 20 }, // 产品名称
        { wch: 15 }, // 柜号
        { wch: 10 }, // 数量
        { wch: 12 }, // 日期
        { wch: 15 }, // 入口价格
        { wch: 15 }, // 清关费
        { wch: 15 }, // 运输费
        { wch: 18 }  // 入口总成本
      ];
      
      const exportSalesColWidths = [
        { wch: 12 }, // 批次号
        { wch: 20 }, // 产品名称
        { wch: 15 }, // 单位价格
        { wch: 10 }, // 数量
        { wch: 12 }, // 出口日期
        { wch: 12 }, // 总价
        { wch: 15 }, // 清关费
        { wch: 25 }, // 减去清关费后销售总价
        { wch: 15 }  // 总销售额
      ];
      
      const summaryColWidths = [
        { wch: 30 }, // 标签
        { wch: 20 }  // 数值
      ];
      
      importCostsSheet['!cols'] = importCostsColWidths;
      exportSalesSheet['!cols'] = exportSalesColWidths;
      summarySheet['!cols'] = summaryColWidths;
      
      // 添加工作表到工作簿（使用安全的名称，避免特殊字符）
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
      XLSX.utils.book_append_sheet(workbook, importCostsSheet, 'ImportCosts');
      XLSX.utils.book_append_sheet(workbook, exportSalesSheet, 'ExportSales');
      
      // 导出Excel文件
      const fileName = `财务报告_${new Date().toLocaleDateString()}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
      setMessage('Excel文件导出成功');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('导出Excel失败:', error);
      setMessage(`导出Excel失败: ${error.message}`);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // 更新入口成本数据
  const updateImportCost = (index, field, value) => {
    const newImportCosts = [...financeData.importCosts];
    newImportCosts[index] = { ...newImportCosts[index], [field]: value };
    
    // 自动计算总成本
    if (['importPrice', 'customsFee', 'shippingFee'].includes(field)) {
      const item = newImportCosts[index];
      const importPrice = parseFloat(item.importPrice) || 0;
      const customsFee = parseFloat(item.customsFee) || 0;
      const shippingFee = parseFloat(item.shippingFee) || 0;
      newImportCosts[index].totalImportCost = (importPrice + customsFee + shippingFee).toFixed(2);
    }
    
    saveFinanceData({ ...financeData, importCosts: newImportCosts });
  };

  // 更新出口销售数据
  const updateExportSale = (index, field, value) => {
    const newExportSales = [...financeData.exportSales];
    newExportSales[index] = { ...newExportSales[index], [field]: value };
    
    // 自动计算总价和销售总额
    if (['unitPrice', 'quantity'].includes(field)) {
      const item = newExportSales[index];
      const unitPrice = parseFloat(item.unitPrice) || 0;
      const quantity = parseFloat(item.quantity) || 0;
      newExportSales[index].totalPrice = (unitPrice * quantity).toFixed(2);
    }
    
    if (['totalPrice', 'customsFee'].includes(field)) {
      const item = newExportSales[index];
      const totalPrice = parseFloat(item.totalPrice) || 0;
      const customsFee = parseFloat(item.customsFee) || 0;
      newExportSales[index].totalSalesAfterCustoms = (totalPrice - customsFee).toFixed(2);
    }
    
    saveFinanceData({ ...financeData, exportSales: newExportSales });
  };

  // 添加新的入口成本记录
  const addImportCost = () => {
    const newRecord = {
      id: Date.now(),
      productName: '',
      containerNumber: '',
      quantity: '',
      date: '',
      importPrice: '',
      customsFee: '',
      shippingFee: '',
      totalImportCost: ''
    };
    saveFinanceData({
      ...financeData,
      importCosts: [...financeData.importCosts, newRecord]
    });
  };

  // 添加新的出口销售记录
  const addExportSale = () => {
    const newRecord = {
      id: Date.now(),
      batchNumber: '',
      productName: '',
      unitPrice: '',
      quantity: '',
      exportDate: '',
      totalPrice: '',
      customsFee: '',
      totalSalesAfterCustoms: '',
      totalSales: ''
    };
    saveFinanceData({
      ...financeData,
      exportSales: [...financeData.exportSales, newRecord]
    });
  };

  // 删除记录
  const deleteRecord = (type, index) => {
    if (window.confirm('确定要删除这条记录吗？')) {
      if (type === 'import') {
        const newImportCosts = financeData.importCosts.filter((_, i) => i !== index);
        saveFinanceData({ ...financeData, importCosts: newImportCosts });
      } else {
        const newExportSales = financeData.exportSales.filter((_, i) => i !== index);
        saveFinanceData({ ...financeData, exportSales: newExportSales });
      }
    }
  };

  // 计算总销售额
  const calculateTotalSales = () => {
    return financeData.exportSales.reduce((total, item) => {
      return total + (parseFloat(item.totalSalesAfterCustoms) || 0);
    }, 0);
  };

  // 计算总入口成本
  const calculateTotalImportCost = () => {
    return financeData.importCosts.reduce((total, item) => {
      return total + (parseFloat(item.totalImportCost) || 0);
    }, 0);
  };

  // 计算总出口销售额
  const calculateTotalExportSales = () => {
    return financeData.exportSales.reduce((total, item) => {
      return total + (parseFloat(item.totalPrice) || 0);
    }, 0);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* 页面标题 */}
      <div style={cardStyle}>
        <div>
          <h1 style={pageTitleStyle}>
            <DollarSign size={24} style={{ marginRight: '8px', verticalAlign: 'middle', color: theme.colors.primary }} />
            {t('financeManagement.title')}
          </h1>
          <p style={pageDescriptionStyle}>
            {t('financeManagement.description')}
          </p>
        </div>
      </div>

      {/* 操作按钮 */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="file"
            accept=".json"
            onChange={handleImportJSON}
            style={{ display: 'none' }}
            id="import-json"
          />
          <label htmlFor="import-json" style={primaryButtonStyle}>
            <Upload size={16} style={{ marginRight: '8px' }} />
            导入JSON
          </label>
          
          <button onClick={handleExportJSON} style={secondaryButtonStyle}>
            <Download size={16} style={{ marginRight: '8px' }} />
            导出JSON
          </button>
          
          <button 
            onClick={handleExportExcel} 
            style={XLSX ? primaryButtonStyle : { ...primaryButtonStyle, opacity: 0.5, cursor: 'not-allowed' }}
            disabled={!XLSX}
            title={!XLSX ? 'Excel导出功能不可用' : '导出Excel文件'}
          >
            <FileSpreadsheet size={16} style={{ marginRight: '8px' }} />
            导出Excel
          </button>
          
          <button onClick={() => saveFinanceData(financeData)} style={primaryButtonStyle}>
            <Save size={16} style={{ marginRight: '8px' }} />
            保存
          </button>
          
          {message && (
            <span style={{ 
              padding: '8px 12px', 
              backgroundColor: message.includes('成功') || message.includes('已保存') ? '#d4edda' : '#f8d7da',
              color: message.includes('成功') || message.includes('已保存') ? '#155724' : '#721c24',
              borderRadius: '4px',
              fontSize: '14px'
            }}>
              {message}
            </span>
          )}
        </div>
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
          backgroundColor: theme.colors.gray[100]
        }}>
          <button
            onClick={() => setActiveTab('import-cost')}
            style={tabStyle(activeTab === 'import-cost')}
          >
            <TrendingDown size={16} style={{ marginRight: '8px' }} />
            入口成本
          </button>
          <button
            onClick={() => setActiveTab('export-sales')}
            style={tabStyle(activeTab === 'export-sales')}
          >
            <TrendingUp size={16} style={{ marginRight: '8px' }} />
            销售出口
          </button>
        </div>
        
        <div style={{ padding: '20px' }}>
          {/* 入口成本表格 */}
          {activeTab === 'import-cost' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, color: '#333' }}>
                  入口成本记录
                </h3>
                <button onClick={addImportCost} style={primaryButtonStyle}>
                  添加记录
                </button>
              </div>
              
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8f9fa' }}>
                      <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>
                        产品名称                      </th>
                      <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>
                        柜号                      </th>
                      <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>
                        数量                      </th>
                      <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>
                        日期                      </th>
                      <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>
                        入口价格                      </th>
                      <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>
                        清关费                      </th>
                      <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>
                        运输费                      </th>
                      <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>
                        入口总成本                      </th>
                      <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'center' }}>
                        操作                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {financeData.importCosts.map((item, index) => (
                      <tr key={item.id} style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#f8f9fa' }}>
                        <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>
                          <input
                            type="text"
                            value={item.productName}
                            onChange={(e) => updateImportCost(index, 'productName', e.target.value)}
                            style={{ width: '100%', padding: '4px', border: '1px solid #ddd', borderRadius: '4px' }}
                            placeholder="产品名称"
                          />
                        </td>
                        <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>
                          <input
                            type="text"
                            value={item.containerNumber}
                            onChange={(e) => updateImportCost(index, 'containerNumber', e.target.value)}
                            style={{ width: '100%', padding: '4px', border: '1px solid #ddd', borderRadius: '4px' }}
                            placeholder="柜号"
                          />
                        </td>
                        <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateImportCost(index, 'quantity', e.target.value)}
                            style={{ width: '100%', padding: '4px', border: '1px solid #ddd', borderRadius: '4px' }}
                            placeholder="数量"
                          />
                        </td>
                        <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>
                          <input
                            type="date"
                            value={item.date}
                            onChange={(e) => updateImportCost(index, 'date', e.target.value)}
                            style={{ width: '100%', padding: '4px', border: '1px solid #ddd', borderRadius: '4px' }}
                          />
                        </td>
                        <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>
                          <input
                            type="number"
                            step="0.01"
                            value={item.importPrice}
                            onChange={(e) => updateImportCost(index, 'importPrice', e.target.value)}
                            style={{ width: '100%', padding: '4px', border: '1px solid #ddd', borderRadius: '4px' }}
                            placeholder="0.00"
                          />
                        </td>
                        <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>
                          <input
                            type="number"
                            step="0.01"
                            value={item.customsFee}
                            onChange={(e) => updateImportCost(index, 'customsFee', e.target.value)}
                            style={{ width: '100%', padding: '4px', border: '1px solid #ddd', borderRadius: '4px' }}
                            placeholder="0.00"
                          />
                        </td>
                        <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>
                          <input
                            type="number"
                            step="0.01"
                            value={item.shippingFee}
                            onChange={(e) => updateImportCost(index, 'shippingFee', e.target.value)}
                            style={{ width: '100%', padding: '4px', border: '1px solid #ddd', borderRadius: '4px' }}
                            placeholder="0.00"
                          />
                        </td>
                        <td style={{ padding: '8px', border: '1px solid #dee2e6', backgroundColor: '#e9ecef' }}>
                          <input
                            type="number"
                            value={item.totalImportCost}
                            readOnly
                            style={{ width: '100%', padding: '4px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f8f9fa' }}
                          />
                        </td>
                        <td style={{ padding: '8px', border: '1px solid #dee2e6', textAlign: 'center' }}>
                          <button
                            onClick={() => deleteRecord('import', index)}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            删除
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 销售出口表格 */}
          {activeTab === 'export-sales' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, color: '#333' }}>
                  销售出口记录
                </h3>
                <button onClick={addExportSale} style={primaryButtonStyle}>
                  添加记录
                </button>
              </div>
              
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8f9fa' }}>
                      <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>
                        批次号                      </th>
                      <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>
                        产品名称                      </th>
                      <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>
                        单位价格                      </th>
                      <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>
                        数量                      </th>
                      <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>
                        出口日期 xuất
                      </th>
                      <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>
                        总价                      </th>
                      <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>
                        清关费                      </th>
                      <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>
                        减去清关费后销售总价                      </th>
                      <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>
                        总销售额                      </th>
                      <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'center' }}>
                        操作                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {financeData.exportSales.map((item, index) => (
                      <tr key={item.id} style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#f8f9fa' }}>
                        <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>
                          <input
                            type="text"
                            value={item.batchNumber}
                            onChange={(e) => updateExportSale(index, 'batchNumber', e.target.value)}
                            style={{ width: '100%', padding: '4px', border: '1px solid #ddd', borderRadius: '4px' }}
                            placeholder="批次号"
                          />
                        </td>
                        <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>
                          <input
                            type="text"
                            value={item.productName}
                            onChange={(e) => updateExportSale(index, 'productName', e.target.value)}
                            style={{ width: '100%', padding: '4px', border: '1px solid #ddd', borderRadius: '4px' }}
                            placeholder="产品名称"
                          />
                        </td>
                        <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>
                          <input
                            type="number"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => updateExportSale(index, 'unitPrice', e.target.value)}
                            style={{ width: '100%', padding: '4px', border: '1px solid #ddd', borderRadius: '4px' }}
                            placeholder="0.00"
                          />
                        </td>
                        <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateExportSale(index, 'quantity', e.target.value)}
                            style={{ width: '100%', padding: '4px', border: '1px solid #ddd', borderRadius: '4px' }}
                            placeholder="数量"
                          />
                        </td>
                        <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>
                          <input
                            type="date"
                            value={item.exportDate}
                            onChange={(e) => updateExportSale(index, 'exportDate', e.target.value)}
                            style={{ width: '100%', padding: '4px', border: '1px solid #ddd', borderRadius: '4px' }}
                          />
                        </td>
                        <td style={{ padding: '8px', border: '1px solid #dee2e6', backgroundColor: '#e9ecef' }}>
                          <input
                            type="number"
                            value={item.totalPrice}
                            readOnly
                            style={{ width: '100%', padding: '4px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f8f9fa' }}
                          />
                        </td>
                        <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>
                          <input
                            type="number"
                            step="0.01"
                            value={item.customsFee}
                            onChange={(e) => updateExportSale(index, 'customsFee', e.target.value)}
                            style={{ width: '100%', padding: '4px', border: '1px solid #ddd', borderRadius: '4px' }}
                            placeholder="0.00"
                          />
                        </td>
                        <td style={{ padding: '8px', border: '1px solid #dee2e6', backgroundColor: '#e9ecef' }}>
                          <input
                            type="number"
                            value={item.totalSalesAfterCustoms}
                            readOnly
                            style={{ width: '100%', padding: '4px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f8f9fa' }}
                          />
                        </td>
                        <td style={{ padding: '8px', border: '1px solid #dee2e6', backgroundColor: '#e9ecef' }}>
                          <input
                            type="number"
                            value={item.totalSalesAfterCustoms}
                            readOnly
                            style={{ width: '100%', padding: '4px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f8f9fa' }}
                          />
                        </td>
                        <td style={{ padding: '8px', border: '1px solid #dee2e6', textAlign: 'center' }}>
                          <button
                            onClick={() => deleteRecord('export', index)}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            删除
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* 总销售额显示 */}
              <div style={{ 
                marginTop: '20px', 
                padding: '16px', 
                backgroundColor: '#f8f9fa', 
                borderRadius: '8px',
                border: '1px solid #dee2e6'
              }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>
                  总销售额: ${calculateTotalSales().toFixed(2)}
                </h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                  最后更新: {new Date(financeData.lastUpdated).toLocaleString('zh-CN')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancePage; 