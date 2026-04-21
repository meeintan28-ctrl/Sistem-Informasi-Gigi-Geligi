/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';

const diseaseData = [
  { name: 'Karies Gigi', count: 450 },
  { name: 'Gingivitis', count: 320 },
  { name: 'Periodontitis', count: 120 },
  { name: 'Halitosis', count: 80 },
  { name: 'Maloklusi', count: 60 },
];

const ageData = [
  { name: '0-12', value: 20 },
  { name: '13-18', value: 15 },
  { name: '19-45', value: 45 },
  { name: '46+', value: 20 },
];

const COLORS = ['#14b8a6', '#0d9488', '#0f766e', '#115e59', '#134e4a'];

export const Reports = () => {
  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Laporan & Analitik</h1>
          <p className="text-slate-500">Laporan epidemiologi dan agregat pelayanan sesuai standar WHO.</p>
        </div>
        <div className="flex items-center gap-2">
           <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600">
             <FileSpreadsheet size={18} />
             Excel
           </button>
           <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600">
             <FileText size={18} />
             PDF
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6">Prevalensi Penyakit Gigi</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={diseaseData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" fill="#14b8a6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6">Distribusi Usia Pasien (%)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ageData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {ageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-emerald-900 rounded-3xl p-8 text-white relative overflow-hidden">
         <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-2">Laporan Tahunan 2024</h3>
            <p className="text-emerald-100 mb-6 max-w-lg">
               Sistem telah secara otomatis mengagregasi data DMF-T dan OHI-S untuk pelaporan ke portal Kemenkes (SatuSehat).
            </p>
            <button className="px-6 py-3 bg-white text-emerald-900 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-50 transition-colors">
               <Download size={20} />
               Unduh Laporan Lengkap
            </button>
         </div>
         <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12">
            <FileText size={200} />
         </div>
      </div>
    </div>
  );
};
