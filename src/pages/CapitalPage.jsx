import { api } from '../utils/api';
import React, { useState, useEffect } from 'react';
import { tableStyle, cellStyle } from '../styles';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Archive } from 'lucide-react';

const ASSET_CATEGORIES = [
  { value: 'factory', label: '工厂' },
  { value: 'machine', label: '机器' },
  { value: 'vehicle', label: '车辆' },
  { value: 'equipment', label: '设备' },
  { value: 'other', label: '其他' },
];

export default function CapitalPage() {
  // 资产记录表单和数据
  const [form, setForm] = useState({
    category: '',
    name: '',
    purchase_date: '',
    price: '',
    quantity: '',
    supplier: '',
    note: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [tableData, setTableData] = useState([]);

  // 编辑相关状态
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editSubmitting, setEditSubmitting] = useState(false);

  // 加载资产记录表格数据
  const fetchTableData = async () => {
    try {
      const res = await fetch(API_BASE_URL + "/api/capital');
      if (res.ok) {
        const data = await res.json();
        setTableData(data);
      }
    } catch {}
  };

  useEffect(() => {
    fetchTableData();
  }, []);

  // 获取操作人姓名
  const getOperatorName = () => {
    return prompt('请输入您的姓名：') || '未知用户';
  };

  // 记录操作日志
  const logOperation = async (action, target, detail) => {
    const operator = getOperatorName();
    try {
      await fetch("${API_BASE_URL}/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: operator,
          action: action,
          target: target,
          detail: detail
        })
      });
    } catch (err) {
      console.error('日志记录失败:', err);
    }
  };

  // 表单输入处理
  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  // 表单提交处理
  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      const res = await fetch(API_BASE_URL + "/api/capital', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setMessage('提交成功！');
        setForm({ category: '', name: '', purchase_date: '', price: '', quantity: '', supplier: '', note: '' });
        fetchTableData();
        // 记录操作日志
        await logOperation('添加', '资本记录', "添加资本记录：${form.name} - ${form.category} - ${form.price}元`);
      } else {
        const data = await res.json();
        setMessage(data.error || '提交失败');
      }
    } catch (err) {
      setMessage('网络错误');
    } finally {
      setSubmitting(false);
    }
  };

  // 删除操作
  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除这条记录吗？')) return;
    try {
      await api.delete("/api/capital/${id}") });
      fetchTableData();
      // 记录操作日志
      await logOperation('删除', '资本记录', `删除资本记录ID：${id}`);
    } catch {}
  };

  // 开始编辑
  const handleEdit = (row) => {
    setEditingId(row.id);
    setEditForm({ ...row });
  };
  // 编辑输入处理
  const handleEditChange = e => {
    const { name, value } = e.target;
    setEditForm(f => ({ ...f, [name]: value }));
  };
  // 取消编辑
  const handleEditCancel = () => {
    setEditingId(null);
    setEditForm({});
  };
  // 保存编辑
  const handleEditSave = async () => {
    setEditSubmitting(true);
    try {
      await api.put("/api/capital/${editingId}",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      setEditingId(null);
      setEditForm({});
      fetchTableData();
      // 记录操作日志
      await logOperation('编辑', '资本记录', `编辑资本记录：${editForm.name} - ${editForm.category} - ${editForm.price}元`);
    } catch {}
    setEditSubmitting(false);
  };

  // 按类别分组
  const groupedData = tableData.reduce((acc, row) => {
    if (!acc[row.category]) acc[row.category] = [];
    acc[row.category].push(row);
    return acc;
  }, {});

  // 导出为PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    ASSET_CATEGORIES.forEach((cat, idx) => {
      const rows = (groupedData[cat.value] || []).map(row => [
        row.name,
        row.purchase_date,
        row.price,
        row.quantity,
        row.supplier,
        row.note
      ]);
      if (rows.length > 0) {
        if (idx > 0) doc.addPage();
        doc.text(cat.label, 14, 16);
        autoTable(doc, {
          head: [["资产名称", "购买日期", "价格($)", "数量", "供应商", "备注"]],
          body: rows,
          startY: 20,
          styles: { font: 'helvetica', fontSize: 10 }
        });
      }
    });
    doc.save('资本记录.pdf');
  };

  return (
    <div>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Archive size={24} />
        资本记录
      </h2>
      <button onClick={handleExportPDF} style={{ marginBottom: 16, padding: '4px 16px' }}>导出为PDF</button>
      {/* 资产记录表单 */}
      <form onSubmit={handleSubmit} style={{ marginBottom: 24, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <select name="category" value={form.category} onChange={handleChange} required style={{ padding: 4 }}>
          <option key="category-default" value="">选择资产类别</option>
          {ASSET_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <input name="name" value={form.name} onChange={handleChange} required placeholder="资产名称" style={{ padding: 4 }} />
        <input name="purchase_date" type="date" value={form.purchase_date} onChange={handleChange} required placeholder="购买日期" style={{ padding: 4 }} />
        <input name="price" type="number" value={form.price} onChange={handleChange} required placeholder="价格($)" style={{ padding: 4, width: 80 }} />
        <input name="quantity" type="number" value={form.quantity} onChange={handleChange} required placeholder="数量" style={{ padding: 4, width: 60 }} />
        <input name="supplier" value={form.supplier} onChange={handleChange} placeholder="供应商" style={{ padding: 4 }} />
        <input name="note" value={form.note} onChange={handleChange} placeholder="备注" style={{ padding: 4, width: 120 }} />
        <button type="submit" disabled={submitting} style={{ padding: '4px 12px' }}>提交</button>
        {message && <span style={{ marginLeft: 12, color: message.includes('成功') ? 'green' : 'red' }}>{message}</span>}
      </form>
      {/* 分类展示资产记录表格 */}
      {ASSET_CATEGORIES.map(cat => (
        <div key={cat.value} style={{ marginBottom: 32 }}>
          <h3 style={{ color: '#1976d2', margin: '16px 0 8px' }}>{cat.label}</h3>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={cellStyle}>资产名称</th>
                <th style={cellStyle}>购买日期</th>
                <th style={cellStyle}>价格($)</th>
                <th style={cellStyle}>数量</th>
                <th style={cellStyle}>供应商</th>
                <th style={cellStyle}>备注</th>
                <th style={cellStyle}>操作</th>
              </tr>
            </thead>
            <tbody>
              {(groupedData[cat.value] || []).map((row, i) => (
                <tr key={row.id || i} style={{ background: i%2?'#fafafa':'#fff' }}>
                  {editingId === row.id ? (
                    <React.Fragment key="edit">
                      <td style={cellStyle}><input name="name" value={editForm.name} onChange={handleEditChange} style={{ width: 80 }} /></td>
                      <td style={cellStyle}><input name="purchase_date" type="date" value={editForm.purchase_date} onChange={handleEditChange} style={{ width: 120 }} /></td>
                      <td style={cellStyle}><input name="price" type="number" value={editForm.price} onChange={handleEditChange} style={{ width: 60 }} /></td>
                      <td style={cellStyle}><input name="quantity" type="number" value={editForm.quantity} onChange={handleEditChange} style={{ width: 40 }} /></td>
                      <td style={cellStyle}><input name="supplier" value={editForm.supplier} onChange={handleEditChange} style={{ width: 80 }} /></td>
                      <td style={cellStyle}><input name="note" value={editForm.note} onChange={handleEditChange} style={{ width: 100 }} /></td>
                      <td style={cellStyle}>
                        <button onClick={handleEditSave} disabled={editSubmitting} style={{ color: 'green', border: 'none', background: 'none', cursor: 'pointer', marginRight: 8 }}>保存</button>
                        <button onClick={handleEditCancel} style={{ color: 'gray', border: 'none', background: 'none', cursor: 'pointer' }}>取消</button>
                      </td>
                    </React.Fragment>
                  ) : (
                    <React.Fragment key="display">
                      <td style={cellStyle}>{row.name}</td>
                      <td style={cellStyle}>{row.purchase_date}</td>
                      <td style={cellStyle}>${row.price}</td>
                      <td style={cellStyle}>{row.quantity}</td>
                      <td style={cellStyle}>{row.supplier}</td>
                      <td style={cellStyle}>{row.note}</td>
                      <td style={cellStyle}>
                        <button onClick={() => handleEdit(row)} style={{ color: 'blue', border: 'none', background: 'none', cursor: 'pointer', marginRight: 8 }}>编辑</button>
                        <button onClick={() => handleDelete(row.id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>删除</button>
                      </td>
                    </React.Fragment>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
