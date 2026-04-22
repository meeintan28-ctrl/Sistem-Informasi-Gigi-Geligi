/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CalendarCheck, 
  Activity, 
  Bell, 
  ArrowUpRight, 
  ArrowDownRight,
  ClipboardCheck,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  Cell
} from 'recharts';
import { motion } from 'framer-motion';
import { patientService, appointmentService } from '../lib/services';

const stats = [
  { label: 'Total Pasien', value: '1,284', icon: <Users size={20} />, color: 'bg-blue-500', trend: '+12%', up: true },
  { label: 'Kunjungan Hari Ini', value: '24', icon: <CalendarCheck size={20} />, color: 'bg-brand-500', trend: '+5', up: true },
  { label: 'Rata-rata DMF-T', value: '3.2', icon: <Activity size={20} />, color: 'bg-amber-500', trend: '-0.2', up: true },
  { label: 'Pending Follow-up', value: '8', icon: <Bell size={20} />, color: 'bg-rose-500', trend: '-2', up: false },
];

const dmftData: any[] = [];

const prevalenceData = [
  { name: 'Karies', value: 0, color: '#f59e0b' },
  { name: 'Gingivitis', value: 0, color: '#14b8a6' },
  { name: 'Periodontitis', value: 0, color: '#f43f5e' },
  { name: 'Sehat', value: 0, color: '#10b981' },
];

const StatCard = (props: { stat: any, index: number, key?: any }) => {
  const { stat, index } = props;
  return (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
  >
    <div className="flex justify-between items-start mb-4">
      <div className={`${stat.color} p-3 rounded-xl text-white shadow-lg`}>
        {stat.icon}
      </div>
      <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${stat.up ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
        {stat.trend}
        {stat.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
      </div>
    </div>
    <h3 className="text-slate-500 text-sm font-medium">{stat.label}</h3>
    <p className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</p>
  </motion.div>
  );
};

export const Dashboard = () => {
  const [patientCount, setPatientCount] = useState(0);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const ps = await patientService.getAll();
      const apps = await appointmentService.getToday();
      if (ps) setPatientCount(ps.length);
      if (apps) setAppointments(apps);
      setLoading(false);
    };
    fetchData();
  }, []);

  const stats = [
    { label: 'Total Pasien', value: patientCount.toLocaleString(), icon: <Users size={20} />, color: 'bg-blue-500', trend: '0%', up: true },
    { label: 'Kunjungan Hari Ini', value: appointments.length.toString(), icon: <CalendarCheck size={20} />, color: 'bg-brand-500', trend: '0', up: true },
    { label: 'Rata-rata DMF-T', value: '0.0', icon: <Activity size={20} />, color: 'bg-amber-500', trend: '0', up: true },
    { label: 'Pending Follow-up', value: '0', icon: <Bell size={20} />, color: 'bg-rose-500', trend: '0', up: false },
  ];
  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Ringkasan</h1>
          <p className="text-slate-500">Selamat datang kembali di sistem DentaCare Pro.</p>
        </div>
        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-100 self-start">
          <button className="px-4 py-2 text-sm font-semibold bg-brand-600 text-white rounded-lg shadow-sm">Harian</button>
          <button className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700">Bulanan</button>
          <button className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700">Tahunan</button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <StatCard key={stat.label} stat={stat} index={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Trend Indeks DMF-T</h3>
              <p className="text-sm text-slate-500">Pemantauan kesehatan gigi rata-rata populasi</p>
            </div>
            <TrendingUp size={20} className="text-slate-400" />
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dmftData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="index" 
                  stroke="#14b8a6" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: '#14b8a6', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Prevalence Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Status Kesehatan Gigi</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={prevalenceData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                  width={80}
                />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                  {prevalenceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-3">
             {prevalenceData.map((item) => (
               <div key={item.name} className="flex items-center justify-between text-sm">
                 <div className="flex items-center gap-2 text-slate-600">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                    {item.name}
                 </div>
                 <span className="font-bold text-slate-800">{item.value}%</span>
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Follow-ups */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between">
            <h3 className="font-bold text-slate-800">Notifikasi Follow-up</h3>
            <span className="bg-slate-50 text-slate-400 text-xs px-2 py-1 rounded-full font-bold">0 Mendesak</span>
          </div>
          <div className="divide-y divide-slate-50">
            <div className="p-10 text-center text-slate-500 text-sm">Tidak ada follow-up mendesak.</div>
          </div>
          <button className="w-full py-3 text-sm font-semibold text-slate-500 bg-slate-50 hover:bg-slate-100 transition-colors">
            Lihat Semua Follow-up
          </button>
        </div>

        {/* Today's Appointments */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between">
            <h3 className="font-bold text-slate-800">Antrean Hari Ini</h3>
            <ClipboardCheck size={18} className="text-brand-600" />
          </div>
          <div className="divide-y divide-slate-50 min-h-[100px]">
            {loading ? (
              <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-brand-600" /></div>
            ) : appointments.length === 0 ? (
              <div className="p-10 text-center text-slate-500 text-sm">Tidak ada antrean hari ini.</div>
            ) : (
              appointments.map((app, i) => (
                <div key={app.id || i} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors cursor-pointer">
                  <div className="text-xs font-bold text-slate-400 w-12">{app.time}</div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-800">{app.patientName}</p>
                    <p className="text-xs text-slate-500">{app.type}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${app.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-brand-50 text-brand-700'}`}>
                    {app.status === 'completed' ? 'Selesai' : 'Antre'}
                  </div>
                </div>
              ))
            )}
          </div>
          <button className="w-full py-3 text-sm font-semibold text-slate-500 bg-slate-50 hover:bg-slate-100 transition-colors">
            Kelola Antrean
          </button>
        </div>
      </div>
    </div>
  );
};
