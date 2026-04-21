/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth, UserRole } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Stethoscope, ShieldCheck, Lock, User, RefreshCw } from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>('terapis');
  const [captchaText, setCaptchaText] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaError, setCaptchaError] = useState(false);

  const generateCaptcha = useCallback(() => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(result);
    setCaptchaInput('');
    setCaptchaError(false);
  }, []);

  useEffect(() => {
    generateCaptcha();
  }, [generateCaptcha]);

  const handleLogin = () => {
    if (captchaInput.toUpperCase() !== captchaText) {
      setCaptchaError(true);
      generateCaptcha();
      return;
    }
    login(selectedRole);
  };

  const roles: { id: UserRole; label: string; desc: string; icon: React.ReactNode }[] = [
    { id: 'admin', label: 'Admin', desc: 'Akses penuh sistem & pengaturan', icon: <Lock size={20} /> },
    { id: 'dokter', label: 'Dokter Gigi', desc: 'Verifikasi diagnosa & tindakan', icon: <Stethoscope size={20} /> },
    { id: 'terapis', label: 'Terapis Gigi', desc: 'Pencatatan asuhan & edukasi', icon: <User size={20} /> },
    { id: 'staff', label: 'Administrasi', desc: 'Pendaftaran & penjadwalan', icon: <ShieldCheck size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-xl w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100"
        >
          <div className="text-center mb-8">
            <div className="bg-brand-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg shadow-brand-200">
               <Stethoscope size={32} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">DentaCare Pro</h1>
            <p className="text-slate-500">Sistem Asuhan Kesehatan Gigi dan Mulut</p>
          </div>

          <div className="space-y-4 mb-8">
            <p className="text-sm font-bold text-slate-700 uppercase tracking-widest text-center">Pilih Peran Akses</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {roles.map((r) => (
                 <button
                    key={r.id}
                    onClick={() => setSelectedRole(r.id)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${
                      selectedRole === r.id 
                        ? 'border-brand-600 bg-brand-50' 
                        : 'border-slate-100 hover:border-slate-200 bg-white'
                    }`}
                 >
                    <div className={`p-2 rounded-lg w-fit mb-2 ${selectedRole === r.id ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                       {r.icon}
                    </div>
                    <p className="font-bold text-slate-800 text-sm">{r.label}</p>
                    <p className="text-[10px] text-slate-500 font-medium leading-tight mt-1">{r.desc}</p>
                 </button>
               ))}
            </div>
          </div>

          <div className="space-y-4">
             <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email / NIP</label>
                <input 
                  type="text" 
                  defaultValue="admin@dentacare.pro"
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none transition-all font-medium"
                />
             </div>
             <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Kata Sandi</label>
                <input 
                  type="password" 
                  defaultValue="password123"
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none transition-all font-medium"
                />
             </div>

             {/* Captcha Section */}
             <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
               <div className="flex items-center justify-between">
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Keamanan Captcha</label>
                 <button 
                   onClick={generateCaptcha}
                   className="p-1 hover:bg-slate-200 rounded-md text-slate-400 transition-colors"
                 >
                   <RefreshCw size={14} />
                 </button>
               </div>
               <div className="flex items-center gap-4">
                 <div className="flex-1 bg-white border border-slate-200 rounded-xl p-3 text-center tracking-[0.5em] font-mono text-xl font-black text-brand-700 select-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
                   {captchaText}
                 </div>
                 <div className="flex-[1.2]">
                   <input 
                     type="text" 
                     placeholder="Ketik kode..."
                     value={captchaInput}
                     onChange={(e) => setCaptchaInput(e.target.value)}
                     className={`w-full p-3 bg-white border ${captchaError ? 'border-rose-300 ring-1 ring-rose-100' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all font-bold text-center uppercase`}
                   />
                 </div>
               </div>
               {captchaError && (
                 <p className="text-[10px] text-rose-500 font-bold text-right">Kode captcha salah, silakan coba lagi.</p>
               )}
             </div>
             
             <button 
                onClick={handleLogin}
                className="w-full py-4 bg-brand-600 text-white rounded-2xl font-bold hover:bg-brand-700 shadow-lg shadow-brand-200 transition-all mt-4"
              >
                Masuk ke Sistem
              </button>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-50 flex justify-center gap-6">
             <img src="https://upload.wikimedia.org/wikipedia/commons/b/be/Logo_Kementerian_Kesehatan_Republik_Indonesia.png" alt="Kemenkes" className="h-8 grayscale opacity-50" referrerPolicy="no-referrer" />
             <img src={`https://images.squarespace-cdn.com/content/v1/593796851b631bca0c8427f7/1498175787682-1NSRY0DRC8N9N5U7E7G6/WHO-logo.png`} alt="WHO" className="h-8 grayscale opacity-50" referrerPolicy="no-referrer" />
          </div>
        </motion.div>
      </div>
    </div>
  );
};
