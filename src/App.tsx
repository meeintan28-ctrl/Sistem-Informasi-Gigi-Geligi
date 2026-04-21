/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { PatientList } from './pages/PatientList';
import { RecordCreate } from './pages/RecordCreate';
import { Appointments } from './pages/Appointments';
import { Reports } from './pages/Reports';
import { Education } from './pages/Education';
import { Login } from './pages/Login';
import { AuthProvider, useAuth } from './context/AuthContext';

const MaintenancePage = ({ title }: { title: string }) => (
  <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm text-center py-20">
    <div className="bg-brand-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
       <span className="text-2xl">🚧</span>
    </div>
    <h1 className="text-2xl font-bold mb-2">{title}</h1>
    <p className="text-slate-500">Modul ini sedang disiapkan sesuai standar Kemenkes RI.</p>
  </div>
);

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/patients" element={<PatientList />} />
          <Route path="/records" element={<RecordCreate />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/education" element={<Education />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/security" element={<MaintenancePage title="Keamanan & Audit Data" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
