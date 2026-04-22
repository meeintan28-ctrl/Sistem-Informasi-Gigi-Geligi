/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  ClipboardPlus, 
  Calendar, 
  BarChart3, 
  ShieldAlert, 
  LogOut, 
  Menu, 
  X,
  Stethoscope,
  ChevronRight,
  Video
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick?: () => void;
  key?: string | number;
}

const SidebarItem = (props: SidebarItemProps) => {
  const { to, icon, label, active, onClick } = props;
  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
        active 
          ? "bg-brand-600 text-white shadow-lg shadow-brand-200" 
          : "text-slate-600 hover:bg-brand-50 hover:text-brand-700"
      )}
    >
      <div className={cn("transition-transform duration-200 group-hover:scale-110", active ? "text-white" : "text-brand-500 group-hover:text-brand-600")}>
        {icon}
      </div>
      <span className="font-medium">{label}</span>
      {active && <motion.div layoutId="active-pill" className="ml-auto"><ChevronRight size={16} /></motion.div>}
    </Link>
  );
};

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    { to: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/patients', icon: <Users size={20} />, label: 'Data Pasien' },
    { to: '/records', icon: <ClipboardPlus size={20} />, label: 'Rekam Dental' },
    { to: '/appointments', icon: <Calendar size={20} />, label: 'Jadwal' },
    { to: '/education', icon: <Video size={20} />, label: 'Edukasi' },
    { to: '/reports', icon: <BarChart3 size={20} />, label: 'Laporan' },
    { to: '/security', icon: <ShieldAlert size={20} />, label: 'Keamanan' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {!isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ 
          width: isSidebarOpen ? 280 : 0,
          x: isSidebarOpen ? 0 : -280
        }}
        className="fixed lg:static inset-y-0 left-0 bg-white border-r border-slate-200 z-50 flex flex-col"
      >
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
          <div className="bg-brand-600 p-2 rounded-xl text-white">
            <Stethoscope size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">DentaCare Pro</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Dental Hygiene System</p>
          </div>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
              active={location.pathname === item.to}
            />
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-colors w-full group"
          >
            <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30">
          <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 lg:hidden"
          >
            <Menu size={20} />
          </button>

          <div className="hidden lg:block">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              {menuItems.find(item => item.to === location.pathname)?.label || 'Overview'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-800">{user?.displayName}</p>
              <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
               <img src={`https://ui-avatars.com/api/?name=${user?.displayName}&background=random`} alt="Avatar" referrerPolicy="no-referrer" />
            </div>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </section>
      </main>
    </div>
  );
};
