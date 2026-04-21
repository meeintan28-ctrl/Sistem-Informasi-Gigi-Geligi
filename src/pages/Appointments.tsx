/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  MapPin, 
  MoreHorizontal,
  Activity,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format, addDays, startOfToday, isSameDay } from 'date-fns';
import { id } from 'date-fns/locale';
import { appointmentService } from '../lib/services';

export const Appointments = () => {
  const [selectedDate, setSelectedDate] = useState(startOfToday());
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
     const fetchAppointments = async () => {
        setLoading(true);
        const data = await appointmentService.getToday();
        if (data) setAppointments(data);
        setLoading(false);
     };
     fetchAppointments();
  }, [selectedDate]);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfToday(), i - 3));
  const dayAppointments = appointments.filter(app => isSameDay(new Date(app.date), selectedDate));

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Jadwal & Kunjungan</h1>
          <p className="text-slate-500">Kelola antrean dan reservasi pasien.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-brand-600 rounded-xl text-sm font-semibold text-white hover:bg-brand-700 shadow-lg shadow-brand-200 transition-all">
          <Plus size={18} />
          Booking Baru
        </button>
      </div>

      {/* Mini Calendar Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
           <h2 className="font-bold text-lg text-slate-800">{format(selectedDate, 'MMMM yyyy', { locale: id })}</h2>
           <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"><ChevronLeft size={20} /></button>
              <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"><ChevronRight size={20} /></button>
           </div>
        </div>

        <div className="grid grid-cols-7 gap-2 sm:gap-4">
           {weekDays.map((day, i) => (
             <button
               key={i}
               onClick={() => setSelectedDate(day)}
               className={`flex flex-col items-center p-3 rounded-2xl transition-all ${
                 isSameDay(day, selectedDate) 
                   ? 'bg-brand-600 text-white shadow-lg shadow-brand-100' 
                   : 'hover:bg-slate-50 text-slate-500'
               }`}
             >
               <span className="text-[10px] font-bold uppercase tracking-widest mb-1">{format(day, 'EEE', { locale: id })}</span>
               <span className="text-lg font-bold">{format(day, 'd')}</span>
               {isSameDay(day, startOfToday()) && !isSameDay(day, selectedDate) && (
                 <div className="w-1 h-1 rounded-full bg-brand-500 mt-1" />
               )}
             </button>
           ))}
        </div>
      </div>

      {/* Appointment List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
           <h3 className="font-bold text-slate-800 flex items-center gap-2 px-2">
             <Clock size={18} className="text-brand-600" />
             Antrean {format(selectedDate, 'eeee, d MMMM', { locale: id })}
           </h3>
           
           <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center p-20">
                   <Loader2 className="animate-spin text-brand-600" size={32} />
                </div>
              ) : dayAppointments.length > 0 ? (
                dayAppointments.map((app, i) => (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={app.id}
                    className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group cursor-pointer"
                  >
                    <div className="flex items-center gap-5">
                       <div className="bg-brand-50 text-brand-600 px-3 py-2 rounded-xl text-center min-w-[70px]">
                          <p className="text-xs font-bold uppercase tracking-wider">Jam</p>
                          <p className="text-lg font-bold">{app.time}</p>
                       </div>
                       <div className="flex-1">
                          <p className="font-bold text-slate-800 text-lg group-hover:text-brand-600 transition-colors">{app.patient}</p>
                          <div className="flex items-center gap-4 mt-1">
                             <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                <Activity size={14} className="text-brand-500" />
                                {app.type}
                             </div>
                             <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                <MapPin size={14} className="text-slate-400" />
                                Poli Gigi 1
                             </div>
                          </div>
                       </div>
                       <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
                          <MoreHorizontal size={20} />
                       </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                   <CalendarIcon size={40} className="text-slate-200 mx-auto mb-4" />
                   <p className="text-slate-500 font-medium">Tidak ada janji temu untuk hari ini.</p>
                </div>
              )}
           </div>
        </div>

        <div className="space-y-6">
           <div className="bg-gradient-to-br from-brand-600 to-brand-700 p-6 rounded-3xl text-white shadow-xl shadow-brand-100">
              <h3 className="font-bold text-lg mb-2">Ringkasan Hari Ini</h3>
              <div className="space-y-4 mt-6">
                 <div className="flex items-center justify-between">
                    <span className="text-brand-100 text-sm">Total Pasien</span>
                    <span className="font-bold text-xl">0</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-brand-100 text-sm">Terselesaikan</span>
                    <span className="font-bold text-xl">0</span>
                 </div>
                 <div className="h-2 bg-brand-500/30 rounded-full mt-4 overflow-hidden">
                    <div className="h-full bg-white w-[0%]" />
                 </div>
                 <p className="text-[10px] text-brand-100 uppercase tracking-widest font-bold">0% Progress Pelayanan</p>
              </div>
           </div>

           <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h4 className="font-bold text-slate-800 mb-4">Tips Efisiensi</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pastikan pasien mendapatkan reminder WhatsApp 24 jam sebelum jadwal untuk mengurangi angka "No-Show".
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};
