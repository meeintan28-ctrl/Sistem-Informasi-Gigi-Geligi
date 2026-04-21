/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  MoreVertical, 
  User, 
  Phone, 
  MapPin, 
  Calendar,
  Filter,
  Download,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { patientService } from '../lib/services';

export const PatientList = () => {
  const [search, setSearch] = useState('');
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      const data = await patientService.getAll();
      if (data) setPatients(data);
      setLoading(false);
    };
    fetchPatients();
  }, []);

  const filteredPatients = patients.filter(p => 
    p.name?.toLowerCase().includes(search.toLowerCase()) || 
    p.rm?.toLowerCase().includes(search.toLowerCase()) ||
    p.nik?.includes(search)
  );

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Data Master Pasien</h1>
          <p className="text-slate-500">Kelola informasi demografi dan profil kesehatan pasien.</p>
        </div>
        <div className="flex items-center gap-3">
           <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
             <Download size={18} />
             Export
           </button>
           <button className="flex items-center gap-2 px-4 py-2 bg-brand-600 rounded-xl text-sm font-semibold text-white hover:bg-brand-700 shadow-lg shadow-brand-200 transition-all">
             <Plus size={18} />
             Tambah Pasien
           </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari pasien berdasarkan NIK, Nama, atau No. RM..."
            className="w-full pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600">
           <Filter size={18} />
           Filter
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto h-full">
          {loading ? (
            <div className="flex items-center justify-center p-20">
               <Loader2 className="animate-spin text-brand-600" size={32} />
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="p-20 text-center text-slate-500">Tidak ada data pasien ditemukan.</div>
          ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Pasien</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Info Kontak</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Demografi</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Kunjungan Terakhir</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 tracking-tight">
              {filteredPatients.map((p, i) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={p.id} 
                  className="hover:bg-slate-50 transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-brand-100 group-hover:text-brand-600 transition-colors">
                        <User size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 leading-none">{p.name}</p>
                        <p className="text-xs text-slate-500 mt-1">{p.rm}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                         <Phone size={12} className="text-slate-400" />
                         {p.phone || '-'}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 line-clamp-1 max-w-[180px]">
                         <MapPin size={12} className="text-slate-400 shrink-0" />
                         {p.address || '-'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.gender === 'L' ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'}`}>
                         {p.gender === 'L' ? 'L' : 'P'}
                       </span>
                       <span className="text-xs text-slate-600 font-medium">{p.age ? `${p.age} thn` : '-'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                       <Calendar size={12} className="text-slate-400" />
                       {p.lastVisit || 'Belum ada'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                     <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                       <div className="w-1 h-1 rounded-full bg-emerald-500" />
                       Aktif
                     </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 transition-colors">
                       <MoreVertical size={16} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
        <div className="p-4 border-t border-slate-50 bg-slate-50/50 flex items-center justify-between">
           <p className="text-xs text-slate-500">Menampilkan {filteredPatients.length} dari {patients.length} pasien</p>
           <div className="flex items-center gap-2">
              <button className="px-3 py-1 text-xs font-bold text-slate-400 disabled:opacity-50" disabled>Sebelumnya</button>
              <button className="px-3 py-1 text-xs font-bold text-brand-600">Selanjutnya</button>
           </div>
        </div>
      </div>
    </div>
  );
};
