import API_BASE_URL from "./config";
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import MainPage from './pages/MainPage';

import LoginPage from './pages/LoginPage';
import InventoryPage from './pages/InventoryPage';
import InboundPage from './pages/InboundPage';
import AuxInboundPage from './pages/AuxInboundPage';
import ProductInboundPage from './pages/ProductInboundPage';
import RawOutboundPage from './pages/RawOutboundPage';
import ProductOutboundPage from './pages/ProductOutboundPage';
import ReferenceDataPage from './pages/ReferenceDataPage';
import DashboardPage from './pages/DashboardPage';
import AssetManagementPage from './pages/AssetManagementPage';
import FinancePage from './pages/FinancePage';
import DataManagementPage from './pages/DataManagementPage';
import { I18nProvider } from './contexts/I18nContext';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { sidebarStyle, mainStyle } from './styles';

export default function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/*" element={
              <div style={{ display:'flex', height:'100vh', position: 'relative' }}>
                <Sidebar />
                <main style={mainStyle}>
                  <Routes>
                    <Route path="/"            element={<DashboardPage />} />

                    <Route path="/inbound"     element={<InboundPage />} />
                    <Route path="/aux-inbound" element={<AuxInboundPage />} />
                    <Route path="/product-inbound" element={<ProductInboundPage />} />
                    <Route path="/raw-outbound" element={<RawOutboundPage />} />
                    <Route path="/product-outbound" element={<ProductOutboundPage />} />
                    <Route path="/inventory"   element={<InventoryPage />} />
                    <Route path="/reference-data" element={<ReferenceDataPage />} />
                    <Route path="/asset-management" element={<AssetManagementPage />} />
                    <Route path="/finance" element={<FinancePage />} />
                    <Route path="/data-management" element={<DataManagementPage />} />
                    <Route path="*"            element={<MainPage />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            } />
          </Routes>
        </Router>
      </AuthProvider>
    </I18nProvider>
  );
}
