/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Play, Sparkles, ExternalLink, Bookmark } from 'lucide-react';

const videos = [
  {
    id: '-sbCmdHEEs4',
    title: 'Edukasi Kesehatan Gigi dan Mulut - Kemenkes RI',
    description: 'Pentingnya menjaga kesehatan gigi dan mulut sejak dini untuk mencegah berbagai penyakit.',
    category: 'Dasar'
  },
  {
    id: 'k2f1qD5gL3s',
    title: 'Cara Menggosok Gigi yang Benar',
    description: 'Teknik menyikat gigi yang efektif untuk membersihkan plak dan sisa makanan secara menyeluruh.',
    category: 'Teknik'
  },
  {
    id: 'DdVTN0bU7gI',
    title: 'Pencegahan Gigi Berlubang (Karies)',
    description: 'Tips dan trik untuk menghindari karies gigi pada anak-anak dan orang dewasa.',
    category: 'Pencegahan'
  },
  {
    id: '7kGXQDwT6IA',
    title: 'Gusi Berdarah? Ini Penyebabnya',
    description: 'Mengenal kesehatan gusi dan tanda-tanda awal radang gusi (gingivitis).',
    category: 'Penyakit'
  },
  {
    id: 'k5Kz3xQzqF0',
    title: 'Nutrisi untuk Gigi yang Kuat',
    description: 'Makanan dan minuman yang baik untuk pertumbuhan dan kekuatan gigi.',
    category: 'Nutrisi'
  },
  {
    id: 'dz80Wr7wM4s',
    title: 'Perawatan Gigi di Puskesmas',
    description: 'Layanan kesehatan gigi dan mulut yang tersedia di fasilitas kesehatan tingkat pertama.',
    category: 'Layanan'
  },
  {
    id: 'l7DqdousY0k',
    title: 'Pentingnya Kontrol Rutin ke TGM',
    description: 'Mengapa Anda harus mengunjungi Terapis Gigi minimal 6 bulan sekali.',
    category: 'Edukasi'
  }
];

export const Education = () => {
  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <Sparkles className="text-brand-600" size={32} />
            Edukasi & Promosi Kesehatan
          </h1>
          <p className="text-slate-500 font-medium mt-1">Materi edukasi visual untuk pasien dan tenaga kesehatan gigi.</p>
        </div>
      </div>

      {/* Featured Video */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative aspect-video w-full max-h-[500px] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-brand-100 group"
      >
        <iframe 
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${videos[0].id}?rel=0`}
          title={videos[0].title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
        <div className="absolute top-6 left-6 flex gap-2">
            <span className="bg-brand-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">Video Utama</span>
        </div>
      </motion.div>

      {/* Video Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {videos.slice(1).map((video, idx) => (
          <motion.div 
            key={video.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden hover:shadow-xl hover:shadow-brand-50 transition-all group"
          >
            <div className="relative aspect-video">
              <img 
                src={`https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`} 
                alt={video.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/40 transition-colors flex items-center justify-center">
                <a 
                  href={`https://www.youtube.com/watch?v=${video.id}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-brand-600 shadow-xl opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300"
                >
                  <Play size={20} fill="currentColor" />
                </a>
              </div>
              <div className="absolute top-4 left-4">
                <span className="bg-white/90 backdrop-blur-sm text-slate-800 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm border border-slate-100">
                  {video.category}
                </span>
              </div>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex justify-between items-start gap-2">
                <h3 className="font-bold text-slate-800 group-hover:text-brand-600 transition-colors line-clamp-2">
                  {video.title}
                </h3>
                <Bookmark size={18} className="text-slate-300 hover:text-brand-500 cursor-pointer transition-colors shrink-0" />
              </div>
              <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">
                {video.description}
              </p>
              <div className="pt-4 flex items-center justify-between">
                <a 
                  href={`https://www.youtube.com/embed/${video.id}`} 
                  className="text-brand-600 text-xs font-bold flex items-center gap-1.5 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Play size={12} fill="currentColor" /> Putar Video
                </a>
                <button className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
                  <ExternalLink size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Promotion Banner */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="bg-brand-600 rounded-[3rem] p-10 text-white relative overflow-hidden flex flex-col md:flex-row items-center gap-8"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl" />
        
        <div className="flex-1 space-y-4 relative z-10 text-center md:text-left">
          <h2 className="text-3xl font-black tracking-tight">Butuh Materi Tambahan?</h2>
          <p className="text-brand-100 font-medium max-w-lg">
            Kami menyediakan poster, brosur, dan aset visual lainnya yang siap cetak untuk klinik atau puskesmas Anda.
          </p>
          <div className="pt-4 flex flex-wrap justify-center md:justify-start gap-4">
            <button className="bg-white text-brand-700 px-8 py-3 rounded-2xl font-black text-sm shadow-xl hover:bg-brand-50 transition-all transform hover:-translate-y-1">
              Unduh Koleksi Poster
            </button>
            <button className="bg-brand-700/50 text-white border border-brand-400 px-8 py-3 rounded-2xl font-black text-sm hover:bg-brand-700 transition-all">
              Hubungi Media Center
            </button>
          </div>
        </div>
        <div className="w-48 h-48 bg-white/20 rounded-[2.5rem] flex items-center justify-center backdrop-blur-md relative z-10 border border-white/30">
          <Library size={80} className="text-white opacity-80" />
        </div>
      </motion.div>
    </div>
  );
};

const Library = ({ size, className }: { size: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <path d="M6 12h4" />
    <path d="M14 12h4" />
    <path d="M6 10h12" />
    <path d="M6 14h12" />
  </svg>
);
