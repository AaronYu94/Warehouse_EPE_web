import React, { useState } from "react";

// translation
const translations = {
  zh: {
    nav: ["原料入库", "原料出库", "库存台账", "财务利润表", "月度库存统计", "操作日志", "资本记录"],
    language: "语言"
  },
  vi: {
    nav: ["Nhập", "Xuất", "Sổ kho", "Báo cáo lợi nhuận", "Thống kê tồn kho", "Nhật ký", "Ghi vốn"],
    language: "Ngôn ngữ"
  }
};
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";

// styles
const sidebarStyle = {
  width: 240,
  borderRight: '1px solid #e0e0e0',
  padding: 16,
  background: '#fafafa',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '2px 0 5px rgba(0,0,0,0.05)',
  fontFamily: 'Arial, sans-serif'
};
const mainStyle = { flex: 1, padding: 24, background: '#fff', fontFamily: 'Arial, sans-serif' };
const buttonStyle = code => ({
  margin: '4px 8px 4px 0',
  padding: '6px 12px',
  border: '1px solid #aaa',
  borderRadius: 4,
  background: code.active ? '#1976d2' : '#fff',
  color: code.active ? '#fff' : '#333',
  cursor: 'pointer'
});
const linkStyle = isActive => ({
  textDecoration: 'none',
  color: isActive ? '#1976d2' : '#333',
  fontWeight: isActive ? 'bold' : 'normal',
  display: 'block',
  padding: '4px 0'
});

const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: 16 };
const cellStyle = { border: '1px solid #ccc', padding: 8, textAlign: 'left' };


const rawInbound = [
  { date: '2025-01-21', code: 'P001', name: '巴旦木仁', container: 'KOCU4396560', qty: '19,958.4 KG' },
  { date: '2024-11-27', code: 'P001', name: '巴旦木仁', container: 'KOCU5031211', qty: '19,958.4 KG' }
];
const auxInbound = [
  { date: '2025-01-21', code: 'ALB001', name: 'Túi màng nhôm (铝箔袋)', container: 'HMMU6409110', qty: '2,240 个' },
  { date: '2025-01-21', code: 'CTN001', name: 'Thùng carton (纸箱)', container: 'HMMU6409111', qty: '2,240 个' },
  { date: '2025-01-21', code: 'MUOI', name: 'Muối (盐)', container: 'HMMU6409112', qty: '95 KG' },
  { date: '2025-01-21', code: 'LABJB', name: 'Bao jumbo (千斤包)', container: 'HMMU6409113', qty: '50 个' },
  { date: '2025-01-21', code: 'BOTNGOT', name: 'Bột ngọt (味精)', container: 'HMMU6409114', qty: '100 KG' },
  { date: '2025-01-21', code: 'H2O2', name: 'H₂O₂ (双氧水)', container: 'HMMU6409115', qty: '200 KG' }
];
const rawOutbound = [
  { date: '2025-05-19', container: 'FSCU5931279', name: '巴旦木仁', qty: '9,337.5 KG' },
  { date: '2025-05-28', container: 'SZLU9221155', name: '巴旦木仁', qty: '10,022.0 KG' }
];
const auxOutbound = [
  { date: '2025-05-19', container: 'FSCU5931279', code: 'ALB001', name: 'Túi màng nhôm (铝箔袋)', qty: '2,240 个' },
  { date: '2025-05-28', container: 'SZLU9221155', code: 'CTN001', name: 'Thùng carton (纸箱)', qty: '802 个' },
  { date: '2025-05-28', container: 'SZLU9221155', code: 'MUOI', name: 'Muối (盐)', qty: '90 KG' },
  { date: '2025-05-28', container: 'SZLU9221155', code: 'LABJB', name: 'Bao jumbo (千斤包)', qty: '20 个' },
  { date: '2025-05-28', container: 'SZLU9221155', code: 'BOTNGOT', name: 'Bột ngọt (味精)', qty: '50 KG' },
  { date: '2025-05-28', container: 'SZLU9221155', code: 'H2O2', name: 'H₂O₂ (双氧水)', qty: '100 KG' }
];
const dataLedger = [
  { date: '2025-01-21', code: 'P001', type: 'IN', qty: '19,958.4', ref: 'KOCU4396560' },
  { date: '2025-05-19', code: 'P001', type: 'OUT', qty: '9,337.5', ref: 'FSCU5931279' }
];
const dataProfit = [
  { id: 1, container: 'SZLU9221155', product: '巴旦木仁', cost: 5.00, qty: 10022.0, amount: 50110.0, tax: 2505.5, total: 52615.5, profit: 4000 }
];
const dataMonthly = [
  { item: '巴旦木仁', start: 5000.0, inbound: 19958.4, outbound: 9337.5, end: 15620.9 }
];
const dataLogs = [
  { time: '2025-06-01 10:00', user: 'admin', module: '原料入库', action: '上传映射表' }
];

const capitalRecords = [
  { category: '机器设备', id: 'EQP-001', name: '包装机', value: '¥150,000', purchaseDate: '2024-03-15', note: '主要用于袋装' },
  { category: '仓库设施', id: 'WH-001', name: '冷藏库', value: '¥800,000', purchaseDate: '2023-11-01', note: '温控 0-4℃' },
  { category: '厂房建筑', id: 'BLD-001', name: '主厂房', value: '¥5,200,000', purchaseDate: '2022-05-20', note: '占地 5000㎡' }
];

function InboundPage() {
  return (
    <div>
      <h2>原料入库</h2>
      <table style={tableStyle}>
        <thead>
          <tr>
            {['日期','物料编码','名称','柜号','数量'].map(col => (
              <th key={col} style={cellStyle}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rawInbound.map((r, i) => (
            <tr key={i} style={{ background: i % 2 ? '#fafafa' : '#fff' }}>
              <td style={cellStyle}>{r.date}</td>
              <td style={cellStyle}>{r.code}</td>
              <td style={cellStyle}>{r.name}</td>
              <td style={cellStyle}>
                <a href="#qc" style={{ color: '#1976d2', textDecoration: 'underline' }}>
                  {r.container}
                </a>
              </td>
              <td style={cellStyle}>{r.qty}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ marginTop: 32 }}>辅料入库</h2>
      <table style={tableStyle}>
        <thead>
          <tr>
            {['日期','辅料编码','名称','柜号','数量'].map(col => (
              <th key={col} style={cellStyle}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {auxInbound.map((r, i) => (
            <tr key={i} style={{ background: i % 2 ? '#fafafa' : '#fff' }}>
              <td style={cellStyle}>{r.date}</td>
              <td style={cellStyle}>{r.code}</td>
              <td style={cellStyle}>{r.name}</td>
              <td style={cellStyle}>
                <a href="#qc" style={{ color: '#1976d2', textDecoration: 'underline' }}>
                  {r.container}
                </a>
              </td>
              <td style={cellStyle}>{r.qty}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 id="qc" style={{ marginTop: 32 }}>质检数据</h2>
      <table style={tableStyle}>
        <thead>
          <tr>
            {['检验项','标准值','实际值','判定'].map(col => (
              <th key={col} style={cellStyle}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[
            { item: '水分含量', std: '≤5%', actual: '4.8%', result: '合格' },
            { item: '杂质比例', std: '≤1%', actual: '0.5%', result: '合格' },
            { item: '胶质含量', std: '≤0.3%', actual: '0.2%', result: '合格' }
          ].map((r, i) => (
            <tr key={i} style={{ background: i % 2 ? '#fafafa' : '#fff' }}>
              <td style={cellStyle}>{r.item}</td>
              <td style={cellStyle}>{r.std}</td>
              <td style={cellStyle}>{r.actual}</td>
              <td style={cellStyle}>{r.result}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OutboundPage() {
  return (
    <div>
      <h2>原料出库</h2>
      <table style={tableStyle}>
        <thead>
          <tr>
            {['日期','柜号','名称','数量'].map(col => (
              <th key={col} style={cellStyle}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rawOutbound.map((r, i) => (
            <tr key={i} style={{ background: i % 2 ? '#fafafa' : '#fff' }}>
              <td style={cellStyle}>{r.date}</td>
              <td style={cellStyle}>
                <a href="#qc" style={{ color:'#1976d2', textDecoration:'underline' }}>
                  {r.container}
                </a>
              </td>
              <td style={cellStyle}>{r.name}</td>
              <td style={cellStyle}>{r.qty}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ marginTop: 32 }}>辅料出库</h2>
      <table style={tableStyle}>
        <thead>
          <tr>
            {['日期','柜号','名称','数量'].map(col => (
              <th key={col} style={cellStyle}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {auxOutbound.map((r, i) => (
            <tr key={i} style={{ background: i % 2 ? '#fafafa' : '#fff' }}>
              <td style={cellStyle}>{r.date}</td>
              <td style={cellStyle}>
                <a href="#qc" style={{ color:'#1976d2', textDecoration:'underline' }}>
                  {r.container}
                </a>
              </td>
              <td style={cellStyle}>{r.name}</td>
              <td style={cellStyle}>{r.qty}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 id="qc" style={{ marginTop: 32 }}>质检数据</h2>
      <table style={tableStyle}>
        <thead>
          <tr>
            {['检验项','标准值','实际值','判定'].map(col => (
              <th key={col} style={cellStyle}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[
            { item: '水分含量', std: '≤5%',   actual: '4.9%',  result: '合格' },
            { item: '杂质比例', std: '≤1%',   actual: '0.8%',  result: '合格' },
            { item: '颗粒大小', std: '8-12mm', actual: '11mm',  result: '合格' }
          ].map((qc, i) => (
            <tr key={i} style={{ background: i % 2 ? '#fafafa' : '#fff' }}>
              <td style={cellStyle}>{qc.item}</td>
              <td style={cellStyle}>{qc.std}</td>
              <td style={cellStyle}>{qc.actual}</td>
              <td style={cellStyle}>{qc.result}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


function LedgerPage() {
  return (
    <div>
      <h1 style={{ color: '#1976d2' }}>库存台账</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
        <thead><tr>
          {['日期', '物料编码', '事务类型', '数量', '参考'].map(col => <th key={col} style={{ borderBottom: '1px solid #ccc', padding: 8, textAlign: 'left' }}>{col}</th>)}
        </tr></thead>
        <tbody>{dataLedger.map((r, i) => (
          <tr key={i} style={{ background: i % 2 ? '#fafafa' : '#fff' }}>
            <td style={{ padding: 8 }}>{r.date}</td>
            <td style={{ padding: 8 }}>{r.code}</td>
            <td style={{ padding: 8 }}>{r.type}</td>
            <td style={{ padding: 8 }}>{r.qty}</td>
            <td style={{ padding: 8 }}>{r.ref}</td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}
function ProfitReportPage() {
  return (
    <div>
      <h1 style={{ color: '#1976d2' }}>财务利润表</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
        <thead><tr>
          {['序号', '柜号', '产品', '成本价', '数量', '金额', '税费', '总费用', '利润'].map(col => <th key={col} style={{ borderBottom: '1px solid #ccc', padding: 8, textAlign: 'left' }}>{col}</th>)}
        </tr></thead>
        <tbody>{dataProfit.map((r, i) => (
          <tr key={i} style={{ background: i % 2 ? '#fafafa' : '#fff' }}>
            <td style={{ padding: 8 }}>{r.id}</td>
            <td style={{ padding: 8 }}>{r.container}</td>
            <td style={{ padding: 8 }}>{r.product}</td>
            <td style={{ padding: 8 }}>${r.cost.toFixed(2)}</td>
            <td style={{ padding: 8 }}>{r.qty.toFixed(2)}</td>
            <td style={{ padding: 8 }}>${r.amount.toFixed(2)}</td>
            <td style={{ padding: 8 }}>${r.tax.toFixed(2)}</td>
            <td style={{ padding: 8 }}>${r.total.toFixed(2)}</td>
            <td style={{ padding: 8 }}>${r.profit}</td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}
function MonthlyInventoryPage() {
  return (
    <div>
      <h1 style={{ color: '#1976d2' }}>每月库存统计</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
        <thead><tr>
          {['物料', '期初库存', '本期入库', '本期出库', '期末库存'].map(col => <th key={col} style={{ borderBottom: '1px solid #ccc', padding: 8, textAlign: 'left' }}>{col}</th>)}
        </tr></thead>
        <tbody>{dataMonthly.map((r, i) => (
          <tr key={i} style={{ background: i % 2 ? '#fafafa' : '#fff' }}>
            <td style={{ padding: 8 }}>{r.item}</td>
            <td style={{ padding: 8 }}>{r.start.toFixed(2)}</td>
            <td style={{ padding: 8 }}>{r.inbound.toFixed(2)}</td>
            <td style={{ padding: 8 }}>{r.outbound.toFixed(2)}</td>
            <td style={{ padding: 8 }}>{r.end.toFixed(2)}</td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}
function LogsPage() {
  return (
    <div>
      <h1 style={{ color: '#1976d2' }}>操作日志</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
        <thead><tr>
          {['时间', '用户', '模块', '操作'].map(col => <th key={col} style={{ borderBottom: '1px solid #ccc', padding: 8, textAlign: 'left' }}>{col}</th>)}
        </tr></thead>
        <tbody>{dataLogs.map((r, i) => (
          <tr key={i} style={{ background: i % 2 ? '#fafafa' : '#fff' }}>
            <td style={{ padding: 8 }}>{r.time}</td>
            <td style={{ padding: 8 }}>{r.user}</td>
            <td style={{ padding: 8 }}>{r.module}</td>
            <td style={{ padding: 8 }}>{r.action}</td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

function CapitalPage() {
  return (
    <div>
      <h1 style={{ color: '#1976d2' }}>资本记录</h1>
      <table style={tableStyle}>
        <thead>
          <tr>
            {['资产类别','编号','名称','价值','购置日期','备注'].map(col => (
              <th key={col} style={cellStyle}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {capitalRecords.map((r,i) => (
            <tr key={i} style={{ background: i % 2 ? '#fafafa' : '#fff' }}>
              <td style={cellStyle}>{r.category}</td>
              <td style={cellStyle}>{r.id}</td>
              <td style={cellStyle}>{r.name}</td>
              <td style={cellStyle}>{r.value}</td>
              <td style={cellStyle}>{r.purchaseDate}</td>
              <td style={cellStyle}>{r.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function App() {
  const [lang, setLang] = useState('zh');
  return (
    <Router>
      <div style={{ display: 'flex', height: '100vh' }}>
        <aside style={sidebarStyle}>
          <div style={{ marginBottom: 16, fontSize: 14, color: '#555' }}>{translations[lang].language}:</div>
          <div style={{ marginBottom: 24 }}>
            {['zh', 'vi'].map(code => (
              <button key={code} onClick={() => setLang(code)} style={buttonStyle({ active: lang === code })}>{code.toUpperCase()}</button>
            ))}
          </div>
          <nav style={{ flex: 1 }}>
            {translations[lang].nav.map((label, i) => (
              <NavLink key={i} to={`/p/${i}`} style={({ isActive }) => linkStyle(isActive)}>{label}</NavLink>
            ))}
          </nav>
        </aside>
        <main style={mainStyle}>
          <Routes>
            <Route path="/p/0" element={<InboundPage />} />
            <Route path="/p/1" element={<OutboundPage />} />
            <Route path="/p/2" element={<LedgerPage />} />
            <Route path="/p/3" element={<ProfitReportPage />} />
            <Route path="/p/4" element={<MonthlyInventoryPage />} />
            <Route path="/p/5" element={<LogsPage />} />
            <Route path="/p/6" element={<CapitalPage />} />
            <Route path="*" element={<InboundPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

// mount the app to the root element
const root = createRoot(document.getElementById('root'));
root.render(<App />);
