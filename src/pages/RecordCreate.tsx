/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  ChevronLeft, 
  Save, 
  Search, 
  Plus, 
  History,
  Activity,
  FileText,
  HeartPulse,
  Loader2,
  Stethoscope,
  Weight,
  Thermometer,
  Users,
  User,
  TrendingUp,
  Sparkles,
  PenTool
} from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import { GoogleGenAI } from "@google/genai";
import { Odontogram } from '../components/Odontogram';
import { DENTAL_HYGIENE_DIAGNOSES } from '../constants/diagnoses';

// PatientType is imported from services

import { useAuth } from '../context/AuthContext';
import { patientService, recordService, type Patient as PatientType } from '../lib/services';

export const RecordCreate = () => {
  const { user } = useAuth();
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const [step, setStep] = useState(1);
  const [search, setSearch] = useState('');
  const [patients, setPatients] = useState<PatientType[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientType | null>(null);
  const [teethData, setTeethData] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingPatient, setIsAddingPatient] = useState(false);
  
  // Data Master New Patient
  const [newPatient, setNewPatient] = useState<Partial<PatientType>>({
    name: '',
    nik: '',
    rm: `RM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    gender: 'L',
    birthDate: '',
    birthPlace: '',
    religion: '',
    occupation: '',
    education: '',
    maritalStatus: '',
    address: '',
    phone: '',
    bloodType: '',
    ethnicity: '',
    insurance: '',
    incomeRange: '',
    hobbies: '',
    weight: 0,
    height: 0
  });
  
  // 1. Vital Signs
  const [vitalSigns, setVitalSigns] = useState({
    bloodPressure: '',
    pulse: 0,
    respiration: 0,
    temperature: 36.5
  });

  // 2. Health History (Medis, Sosial, Pharma)
  const [healthHistory, setHealthHistory] = useState({
    medis: {
      keadaanSehat: true,
      penyakitSerius: '',
      pembekuanDarah: '',
      alergi: { makanan: '', obat: '', anestesi: '', cuaca: '' }
    },
    social: '',
    pharma: {
      consumingDrugs: false,
      drugNames: '',
      sideEffects: '',
      regularity: false
    }
  });

  // 3. Dental History
  const [dentalHistory, setDentalHistory] = useState({
    keluhanUtama: '',
    bagianI: { // Experience
      alasanKunjungan: '',
      kekhawatiran: [],
      rontgen2Tahun: false,
      komplikasiPerawatan: '',
    },
    bagianII: { // Self-care
      alatRumah: [],
      frekuensiSikat: 2,
      kesulitanMembersihkan: false,
    },
    habits: {
      merokok: false,
      kebiasaanLain: ''
    }
  });

  // 4. Clinical Exam
  const [clinicalExam, setClinicalExam] = useState({
    extraIntraOral: {} as Record<string, string>,
    ohis: { di: 0, ci: 0 },
    dmft: { d: 0, m: 0, f: 0 },
    plaqueControl: 0
  });

  // 5. Diagnosis & Planning
  const [diagnosisState, setDiagnosisState] = useState<Record<string, any>>({});
  const [interventions, setInterventions] = useState<string[]>([]);
  const [aiInterventionSuggestions, setAiInterventionSuggestions] = useState('');
  const [evaluation, setEvaluation] = useState('');
  const [goals, setGoals] = useState('');
  const [signatures, setSignatures] = useState({
    patient: '',
    guardian: '',
    officer: ''
  });
  const [isAiAnalyzing, setIsAiAnalyzing] = useState<Record<string, boolean>>({});
  const [isAiGeneratingInterventions, setIsAiGeneratingInterventions] = useState(false);

  const sigPadPatient = React.useRef<SignatureCanvas | null>(null);
  const sigPadGuardian = React.useRef<SignatureCanvas | null>(null);
  const sigPadOfficer = React.useRef<SignatureCanvas | null>(null);

  useEffect(() => {
    const fetchPatients = async () => {
      const data = await patientService.getAll();
      if (data) setPatients(data as PatientType[]);
    };
    fetchPatients();
  }, []);

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.nik.includes(search) || 
    p.rm.includes(search)
  );

  const handleAddPatient = async () => {
    if (!newPatient.name || !newPatient.nik || !user) return;
    try {
      const patientId = await patientService.create({
        ...newPatient as PatientType,
        createdBy: user.uid
      });
      const createdPatient = { id: patientId, ...newPatient } as PatientType;
      setPatients([createdPatient, ...patients]);
      setSelectedPatient(createdPatient);
      setIsAddingPatient(false);
    } catch (e) {
      console.error(e);
      alert('Gagal menambah pasien.');
    }
  };

  const handleSave = async () => {
    if (!selectedPatient || !user) return;
    setIsSaving(true);
    try {
      await recordService.create({
        patientId: selectedPatient.id,
        operatorId: user.uid,
        operatorName: user.displayName,
        date: new Date().toISOString(),
        vitalSigns,
        healthHistory,
        dentalHistory,
        clinicalExam,
        odontogram: teethData,
        diagnosis: {
          needs: diagnosisState,
          goals,
          interventions,
          aiInterventionSuggestions,
          evaluation
        },
        signatures,
        status: 'final',
        createdAt: new Date().toISOString()
      });
      alert('Rekam medis berhasil disimpan!');
      setStep(1);
      setSelectedPatient(null);
    } catch (e) {
      console.error(e);
      alert('Gagal menyimpan rekam medis.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const analyzeAiDiagnosis = async (needKey: string, needTitle: string) => {
    if (!selectedPatient) return;
    setIsAiAnalyzing(prev => ({ ...prev, [needKey]: true }));
    try {
      const prompt = `Analisis diagnosis kesehatan gigi untuk kebutuhan: ${needTitle}. 
        Pasien: ${selectedPatient.name}, Umur: ${selectedPatient.age}. 
        Berdasarkan standar TGM (Terapis Gigi dan Mulut), berikan penjelasan singkat tentang kemungkinan 'Sebab' (Etiologi) dan 'Tanda/Gejala' (Signs/Symptoms).
        Format: Berikan jawaban dalam bahasa Indonesia, singkat dan padat.`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      const analysis = response.text || "Gagal menghasilkan analisis.";
      setDiagnosisState(prev => ({
        ...prev,
        [needKey]: {
          ...prev[needKey],
          unmet: true,
          aiAnalysis: analysis
        }
      }));
    } catch (e) {
      console.error(e);
      alert("Gagal memanggil AI.");
    } finally {
      setIsAiAnalyzing(prev => ({ ...prev, [needKey]: false }));
    }
  };

  const generateAiInterventions = async () => {
    if (!selectedPatient) return;
    setIsAiGeneratingInterventions(true);
    try {
      const activeNeeds = Object.entries(diagnosisState)
        .filter(([_, val]) => val.unmet)
        .map(([key, _]) => DENTAL_HYGIENE_DIAGNOSES.find(d => d.need === key)?.need)
        .join(", ");

      const prompt = `Berikan daftar rencana intervensi TGM (Terapis Gigi dan Mulut) untuk pasien bernama ${selectedPatient.name} dengan masalah: ${activeNeeds}.
        Gunakan format SOAPIE. Fokus pada tindakan promotif, preventif, dan kuratif sederhana yang boleh dilakukan oleh Terapis Gigi.
        Berikan dalam poin-poin singkat bahasa Indonesia.`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      setAiInterventionSuggestions(response.text || "Gagal menghasilkan saran.");
    } catch (e) {
      console.error(e);
      alert("Gagal memanggil AI.");
    } finally {
      setIsAiGeneratingInterventions(false);
    }
  };

  const clearSignature = (type: 'patient' | 'guardian' | 'officer') => {
    if (type === 'patient') sigPadPatient.current?.clear();
    else if (type === 'guardian') sigPadGuardian.current?.clear();
    else if (type === 'officer') sigPadOfficer.current?.clear();
    setSignatures(prev => ({ ...prev, [type]: '' }));
  };

  const saveSignature = (type: 'patient' | 'guardian' | 'officer') => {
    let pad = null;
    if (type === 'patient') pad = sigPadPatient.current;
    else if (type === 'guardian') pad = sigPadGuardian.current;
    else if (type === 'officer') pad = sigPadOfficer.current;

    if (pad) {
      setSignatures(prev => ({ ...prev, [type]: pad.getTrimmedCanvas().toDataURL('image/png') }));
    }
  };

  const steps = [
    { title: 'Pasien & Vital', icon: <Users size={18} /> },
    { title: 'Riwayat', icon: <History size={18} /> },
    { title: 'Klinis & OHI-S', icon: <Stethoscope size={18} /> },
    { title: 'Odontogram', icon: <Activity size={18} /> },
    { title: 'Diagnosis', icon: <HeartPulse size={18} /> },
    { title: 'Rencana', icon: <FileText size={18} /> },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Rekam Asuhan Dental Hygiene</h1>
          <p className="text-slate-500">Pencatatan rekam medis terpadu standar Kemenkes RI.</p>
        </div>
        <div className="flex items-center gap-2">
           <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
             Draft Tersimpan
           </button>
           <button className="flex items-center gap-2 px-4 py-2 bg-brand-600 rounded-xl text-sm font-semibold text-white hover:bg-brand-700 shadow-lg shadow-brand-200 transition-all">
             <Save size={18} />
             Selesaikan
           </button>
        </div>
      </div>

      {/* Stepper */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between gap-4 overflow-x-auto">
        {steps.map((s, idx) => (
          <React.Fragment key={idx}>
            <div className={`flex items-center gap-3 shrink-0 ${step === idx + 1 ? 'text-brand-600' : 'text-slate-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${step === idx + 1 ? 'bg-brand-100 text-brand-600' : 'bg-slate-100 text-slate-400'}`}>
                {idx + 1}
              </div>
              <span className="text-xs font-bold uppercase tracking-wider hidden md:block">{s.title}</span>
            </div>
            {idx < steps.length - 1 && <div className="h-px bg-slate-100 flex-1 min-w-[20px]" />}
          </React.Fragment>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm min-h-[400px]"
        >
          {step === 1 && (
            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Search className="text-brand-600" size={20} />
                  Pilih Pasien
                </h3>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    type="text" 
                    placeholder="Cari NIK, Nama, atau No. RM Pasien..."
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredPatients.map((p) => (
                    <div 
                      key={p.id}
                      onClick={() => setSelectedPatient(p)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        selectedPatient?.id === p.id 
                          ? 'border-brand-500 bg-brand-50' 
                          : 'border-slate-100 hover:border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-slate-800">{p.name}</p>
                          <p className="text-xs text-slate-500 mt-1">RM: {p.rm}</p>
                          <p className="text-xs text-slate-500">NIK: {p.nik}</p>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedPatient?.id === p.id ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-200'}`}>
                          {selectedPatient?.id === p.id && <ChevronRight size={14} />}
                        </div>
                      </div>
                    </div>
                  ))}
                  <button 
                    onClick={() => setIsAddingPatient(true)}
                    className="p-4 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center gap-2 text-slate-400 hover:text-brand-600 hover:border-brand-500 hover:bg-brand-50 transition-all group"
                  >
                    <Plus size={20} />
                    <span className="font-bold">Tambah Pasien Baru</span>
                  </button>
                </div>
              </div>

              {isAddingPatient && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-8 bg-brand-50 border-2 border-brand-200 rounded-3xl space-y-6 shadow-inner"
                >
                  <h4 className="font-bold text-brand-800 text-lg">Identitas Pasien Baru</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-brand-600">Nama Lengkap</label>
                      <input type="text" className="w-full p-2 rounded-lg border border-brand-200" value={newPatient.name} onChange={e => setNewPatient({...newPatient, name: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-brand-600">NIK (KTP)</label>
                      <input type="text" className="w-full p-2 rounded-lg border border-brand-200" value={newPatient.nik} onChange={e => setNewPatient({...newPatient, nik: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-brand-600">Jenis Kelamin</label>
                      <select className="w-full p-2 rounded-lg border border-brand-200" value={newPatient.gender} onChange={e => setNewPatient({...newPatient, gender: e.target.value as any})}>
                        <option value="L">Laki-laki</option>
                        <option value="P">Perempuan</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-brand-600">Tanggal Lahir</label>
                      <input type="date" className="w-full p-2 rounded-lg border border-brand-200" value={newPatient.birthDate} onChange={e => setNewPatient({...newPatient, birthDate: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-brand-600">No. HP</label>
                      <input type="text" className="w-full p-2 rounded-lg border border-brand-200" value={newPatient.phone} onChange={e => setNewPatient({...newPatient, phone: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-brand-600">Alamat</label>
                      <input type="text" className="w-full p-2 rounded-lg border border-brand-200" value={newPatient.address} onChange={e => setNewPatient({...newPatient, address: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-brand-600">Range Pendapatan</label>
                      <select className="w-full p-2 rounded-lg border border-brand-200" value={newPatient.incomeRange} onChange={e => setNewPatient({...newPatient, incomeRange: e.target.value})}>
                        <option value="">Pilih Range</option>
                        <option value="< 2 Juta">Kurang dari 2 Juta</option>
                        <option value="2 - 5 Juta">2 - 5 Juta</option>
                        <option value="5 - 10 Juta">5 - 10 Juta</option>
                        <option value="> 10 Juta">Lebih dari 10 Juta</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-brand-600">Hobi / Aktivitas Rekreasi</label>
                      <input type="text" placeholder="Contoh: Olahraga, Membaca" className="w-full p-2 rounded-lg border border-brand-200" value={newPatient.hobbies} onChange={e => setNewPatient({...newPatient, hobbies: e.target.value})} />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <button onClick={() => setIsAddingPatient(false)} className="px-4 py-2 text-slate-500 font-bold">Batal</button>
                    <button onClick={handleAddPatient} className="px-6 py-2 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-all">Daftarkan Pasien</button>
                  </div>
                </motion.div>
              )}

              {selectedPatient && (
                <div className="space-y-6 pt-6 border-t border-slate-100">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <HeartPulse className="text-brand-600" size={20} />
                    Tanda-tanda Vital (Vital Signs)
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        <Activity size={12} className="text-brand-500" /> Tekanan Darah
                      </div>
                      <input 
                        type="text" 
                        placeholder="120/80"
                        className="w-full bg-transparent font-bold text-lg outline-none"
                        value={vitalSigns.bloodPressure}
                        onChange={e => setVitalSigns({...vitalSigns, bloodPressure: e.target.value})}
                      />
                      <span className="text-[10px] text-slate-400">mmHg</span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        <HeartPulse size={12} className="text-red-500" /> Denyut Nadi
                      </div>
                      <input 
                        type="number" 
                        className="w-full bg-transparent font-bold text-lg outline-none"
                        value={vitalSigns.pulse}
                        onChange={e => setVitalSigns({...vitalSigns, pulse: parseInt(e.target.value) || 0})}
                      />
                      <span className="text-[10px] text-slate-400">BPM</span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        <Stethoscope size={12} className="text-blue-500" /> Pernafasan
                      </div>
                      <input 
                        type="number" 
                        className="w-full bg-transparent font-bold text-lg outline-none"
                        value={vitalSigns.respiration}
                        onChange={e => setVitalSigns({...vitalSigns, respiration: parseInt(e.target.value) || 0})}
                      />
                      <span className="text-[10px] text-slate-400">RPM</span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        <Thermometer size={12} className="text-orange-500" /> Suhu Tubuh
                      </div>
                      <input 
                        type="number" 
                        step="0.1"
                        className="w-full bg-transparent font-bold text-lg outline-none"
                        value={vitalSigns.temperature}
                        onChange={e => setVitalSigns({...vitalSigns, temperature: parseFloat(e.target.value) || 0})}
                      />
                      <span className="text-[10px] text-slate-400">°C</span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        <Weight size={12} className="text-emerald-500" /> Berat Badan
                      </div>
                      <input 
                        type="number" 
                        className="w-full bg-transparent font-bold text-lg outline-none"
                        value={selectedPatient.weight}
                        onChange={e => setSelectedPatient({...selectedPatient, weight: parseInt(e.target.value) || 0})}
                      />
                      <span className="text-[10px] text-slate-400">KG</span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        <TrendingUp size={12} className="text-brand-500" /> Tinggi Badan
                      </div>
                      <input 
                        type="number" 
                        className="w-full bg-transparent font-bold text-lg outline-none"
                        value={selectedPatient.height}
                        onChange={e => setSelectedPatient({...selectedPatient, height: parseInt(e.target.value) || 0})}
                      />
                      <span className="text-[10px] text-slate-400">CM</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-end pt-4">
                    <button onClick={handleNext} className="flex items-center gap-2 px-8 py-3 bg-brand-600 text-white rounded-2xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-100">
                      Selanjutnya
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* 2a. Riwayat Medis */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <HeartPulse className="text-brand-600" size={20} />
                    Riwayat Medis
                  </h3>
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
                    <label className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 cursor-pointer">
                      <span className="text-sm font-medium">Pasien dalam keadaan sehat</span>
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 text-brand-600 rounded" 
                        checked={healthHistory.medis.keadaanSehat}
                        onChange={e => setHealthHistory({...healthHistory, medis: {...healthHistory.medis, keadaanSehat: e.target.checked}})}
                      />
                    </label>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">Penyakit Serius / Operasi (5 Thn Terakhir)</label>
                      <textarea 
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500" 
                        rows={2}
                        value={healthHistory.medis.penyakitSerius}
                        onChange={e => setHealthHistory({...healthHistory, medis: {...healthHistory.medis, penyakitSerius: e.target.value}})}
                        placeholder="Misal: Hipertensi, Jantung, atau Kosongkan jika tidak ada"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">Kelainan Pembekuan Darah</label>
                      <input 
                        type="text" 
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500"
                        value={healthHistory.medis.pembekuanDarah}
                        onChange={e => setHealthHistory({...healthHistory, medis: {...healthHistory.medis, pembekuanDarah: e.target.value}})}
                        placeholder="Misal: Haemofili, atau Kosongkan"
                      />
                    </div>
                  </div>
                </div>

                {/* Riwayat Alergi & Farmakologi */}
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <Activity className="text-brand-600" size={20} />
                      Riwayat Alergi
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Makanan</label>
                        <input className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" value={healthHistory.medis.alergi.makanan} onChange={e => setHealthHistory({...healthHistory, medis: {...healthHistory.medis, alergi: {...healthHistory.medis.alergi, makanan: e.target.value}}})} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Obat-obatan</label>
                        <input className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" value={healthHistory.medis.alergi.obat} onChange={e => setHealthHistory({...healthHistory, medis: {...healthHistory.medis, alergi: {...healthHistory.medis.alergi, obat: e.target.value}}})} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Obat Bius</label>
                        <input className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" value={healthHistory.medis.alergi.anestesi} onChange={e => setHealthHistory({...healthHistory, medis: {...healthHistory.medis, alergi: {...healthHistory.medis.alergi, anestesi: e.target.value}}})} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Cuaca/Lainnya</label>
                        <input className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" value={healthHistory.medis.alergi.cuaca} onChange={e => setHealthHistory({...healthHistory, medis: {...healthHistory.medis, alergi: {...healthHistory.medis.alergi, cuaca: e.target.value}}})} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                       <FileText className="text-brand-600" size={18} />
                       Farmakologi
                    </h3>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                       <label className="flex items-center justify-between">
                          <span className="text-sm font-medium">Sedang mengkonsumsi obat?</span>
                          <input type="checkbox" className="w-5 h-5 text-brand-600 rounded" checked={healthHistory.pharma.consumingDrugs} onChange={e => setHealthHistory({...healthHistory, pharma: {...healthHistory.pharma, consumingDrugs: e.target.checked}})} />
                       </label>
                       {healthHistory.pharma.consumingDrugs && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2 overflow-hidden">
                             <input placeholder="Nama obat & kegunaan" className="w-full p-2 text-sm border border-slate-200 rounded-lg" value={healthHistory.pharma.drugNames} onChange={e => setHealthHistory({...healthHistory, pharma: {...healthHistory.pharma, drugNames: e.target.value}})} />
                             <input placeholder="Efek samping yang dirasakan" className="w-full p-2 text-sm border border-slate-200 rounded-lg" value={healthHistory.pharma.sideEffects} onChange={e => setHealthHistory({...healthHistory, pharma: {...healthHistory.pharma, sideEffects: e.target.value}})} />
                          </motion.div>
                       )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Dental History (Page 2) */}
              <div className="space-y-4 pt-6 border-t border-slate-100">
                 <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Activity className="text-brand-600" size={20} />
                    Riwayat Kesehatan Gigi & Kebiasaan
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase font-bold">Keluhan Utama (Dental)</label>
                      <textarea 
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none" 
                        rows={3}
                        placeholder="Apa alasan utama kunjungan Anda ke klinik gigi?"
                        value={dentalHistory.keluhanUtama}
                        onChange={e => setDentalHistory({...dentalHistory, keluhanUtama: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                       <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex justify-between items-center">
                          <span className="text-sm font-medium">Berapa kali menyikat gigi sehari?</span>
                          <div className="flex items-center gap-2">
                             <button onClick={() => setDentalHistory({...dentalHistory, bagianII: {...dentalHistory.bagianII, frekuensiSikat: Math.max(1, dentalHistory.bagianII.frekuensiSikat - 1)}})} className="w-8 h-8 rounded-lg bg-white border border-slate-200">-</button>
                             <span className="font-bold w-4 text-center">{dentalHistory.bagianII.frekuensiSikat}</span>
                             <button onClick={() => setDentalHistory({...dentalHistory, bagianII: {...dentalHistory.bagianII, frekuensiSikat: dentalHistory.bagianII.frekuensiSikat + 1}})} className="w-8 h-8 rounded-lg bg-white border border-slate-200">+</button>
                          </div>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <label className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between cursor-pointer">
                             <span className="text-sm font-medium">Merokok?</span>
                             <input type="checkbox" checked={dentalHistory.habits.merokok} onChange={e => setDentalHistory({...dentalHistory, habits: {...dentalHistory.habits, merokok: e.target.checked}})} className="w-5 h-5 text-brand-600 rounded" />
                          </label>
                          <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 flex items-center justify-between overflow-hidden">
                             <span className="text-sm font-medium">Rontgen Gigi(2 Thn)?</span>
                             <input type="checkbox" checked={dentalHistory.bagianI.rontgen2Tahun} onChange={e => setDentalHistory({...dentalHistory, bagianI: {...dentalHistory.bagianI, rontgen2Tahun: e.target.checked}})} className="w-5 h-5 text-brand-600 rounded" />
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="flex justify-between mt-8">
                 <button onClick={handleBack} className="flex items-center gap-2 px-6 py-3 border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all">
                    <ChevronLeft size={18} />
                    Kembali
                 </button>
                 <button onClick={handleNext} className="flex items-center gap-2 px-8 py-3 bg-brand-600 text-white rounded-2xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-100">
                    Selanjutnya
                    <ChevronRight size={18} />
                 </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Pemeriksaan Jaringan Lunak */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Activity className="text-brand-600" size={20} />
                    Extra & Intra Oral
                  </h3>
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-3">
                    {['Kelenjar Limfe', 'TMJ', 'Wajah', 'Bibir', 'Mukosa Pipi', 'Gingiva', 'Palatum', 'Lidah', 'Dasar Mulut'].map(area => (
                      <div key={area} className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-100">
                        <span className="text-sm font-medium text-slate-700">{area}</span>
                        <select 
                          className="text-xs font-bold p-1 bg-slate-50 rounded border-none outline-none text-brand-600"
                          value={clinicalExam.extraIntraOral[area] || 'Normal'}
                          onChange={e => setClinicalExam({...clinicalExam, extraIntraOral: {...clinicalExam.extraIntraOral, [area]: e.target.value}})}
                        >
                          <option value="Normal">Normal</option>
                          <option value="Ada Kelainan">Ada Kelainan</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>

                {/* OHI-S Index */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Stethoscope className="text-brand-600" size={20} />
                    Indeks OHI-S
                  </h3>
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Debris Index (DI)</label>
                        <input 
                          type="number" 
                          step="0.1" 
                          className="w-full text-2xl font-bold text-slate-800 outline-none"
                          value={clinicalExam.ohis.di}
                          onChange={e => {
                            const val = parseFloat(e.target.value) || 0;
                            setClinicalExam({...clinicalExam, ohis: {...clinicalExam.ohis, di: val}});
                          }}
                        />
                      </div>
                      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Calculus Index (CI)</label>
                        <input 
                          type="number" 
                          step="0.1" 
                          className="w-full text-2xl font-bold text-slate-800 outline-none"
                          value={clinicalExam.ohis.ci}
                          onChange={e => {
                            const val = parseFloat(e.target.value) || 0;
                            setClinicalExam({...clinicalExam, ohis: {...clinicalExam.ohis, ci: val}});
                          }}
                        />
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                       <div>
                          <p className="text-xs font-bold text-slate-400 uppercase">Total Skor OHI-S</p>
                          <p className="text-3xl font-black text-brand-600">{(clinicalExam.ohis.di + clinicalExam.ohis.ci).toFixed(1)}</p>
                       </div>
                       <div className="text-right">
                          <p className="text-xs font-bold text-slate-400 uppercase">Kategori</p>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mt-1 ${
                            (clinicalExam.ohis.di + clinicalExam.ohis.ci) <= 1.2 ? 'bg-emerald-100 text-emerald-700' :
                            (clinicalExam.ohis.di + clinicalExam.ohis.ci) <= 3.0 ? 'bg-amber-100 text-amber-700' :
                            'bg-rose-100 text-rose-700'
                          }`}>
                            {(clinicalExam.ohis.di + clinicalExam.ohis.ci) <= 1.2 ? 'Baik' :
                             (clinicalExam.ohis.di + clinicalExam.ohis.ci) <= 3.0 ? 'Sedang' :
                             'Buruk'}
                          </span>
                       </div>
                    </div>

                    <div className="space-y-1">
                       <label className="text-xs font-bold text-slate-500 uppercase">Plaque Control Score (%)</label>
                       <div className="flex items-center gap-4">
                          <input 
                            type="range" 
                            min="0" max="100" 
                            className="flex-1 accent-brand-600"
                            value={clinicalExam.plaqueControl}
                            onChange={e => setClinicalExam({...clinicalExam, plaqueControl: parseInt(e.target.value)})}
                          />
                          <span className="font-bold text-brand-600 w-12">{clinicalExam.plaqueControl}%</span>
                       </div>
                    </div>
                  </div>

                  {/* DMF-T Index */}
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                       <Activity size={16} className="text-brand-600" />
                       Indeks DMF-T
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                       <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Decay (D)</label>
                          <input 
                            type="number" 
                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-center font-bold" 
                            value={clinicalExam.dmft.d} 
                            onChange={e => setClinicalExam({...clinicalExam, dmft: {...clinicalExam.dmft, d: parseInt(e.target.value) || 0}})} 
                          />
                       </div>
                       <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Missing (M)</label>
                          <input 
                            type="number" 
                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-center font-bold" 
                            value={clinicalExam.dmft.m} 
                            onChange={e => setClinicalExam({...clinicalExam, dmft: {...clinicalExam.dmft, m: parseInt(e.target.value) || 0}})} 
                          />
                       </div>
                       <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Filled (F)</label>
                          <input 
                            type="number" 
                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-center font-bold" 
                            value={clinicalExam.dmft.f} 
                            onChange={e => setClinicalExam({...clinicalExam, dmft: {...clinicalExam.dmft, f: parseInt(e.target.value) || 0}})} 
                          />
                       </div>
                    </div>
                    <div className="pt-3 border-t border-slate-200 flex justify-between items-center font-bold">
                       <span className="text-xs text-slate-500 uppercase">Total DMF-T</span>
                       <span className="text-xl text-brand-700">{(clinicalExam.dmft.d + clinicalExam.dmft.m + clinicalExam.dmft.f).toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                 <button onClick={handleBack} className="flex items-center gap-2 px-6 py-3 border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all">
                    <ChevronLeft size={18} />
                    Kembali
                 </button>
                 <button onClick={handleNext} className="flex items-center gap-2 px-8 py-3 bg-brand-600 text-white rounded-2xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-100">
                    Selanjutnya
                    <ChevronRight size={18} />
                 </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-2">
                  <Activity className="text-brand-600" size={20} />
                  Odontogram Pasien
                </h3>
                <p className="text-sm text-slate-500 mb-6 font-medium">Klik pada gigi untuk mengubah status. Kode: Sehat, Karies, Tambalan, Hilang, Impaksi.</p>
                <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 flex justify-center">
                  <Odontogram 
                    data={teethData} 
                    onChange={(id, status) => setTeethData({...teethData, [id]: status})} 
                  />
                </div>
              </div>

              <div className="flex justify-between mt-8">
                 <button onClick={handleBack} className="flex items-center gap-2 px-6 py-3 border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all">
                    <ChevronLeft size={18} />
                    Kembali
                 </button>
                 <button onClick={handleNext} className="flex items-center gap-2 px-8 py-3 bg-brand-600 text-white rounded-2xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-100">
                    Selanjutnya
                    <ChevronRight size={18} />
                 </button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <HeartPulse className="text-brand-600" size={20} />
                  Diagnosis Dental Hygiene
                </h3>
                <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-bold">Standard Kurikulum (8 Human Needs)</span>
              </div>

              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                 {DENTAL_HYGIENE_DIAGNOSES.map((diag) => (
                   <div 
                     key={diag.need} 
                     className={`p-5 rounded-3xl border-2 transition-all ${
                       diagnosisState[diag.need]?.unmet 
                         ? 'border-brand-500 bg-brand-50/50' 
                         : 'border-slate-100 hover:border-slate-200 bg-white'
                     }`}
                   >
                      <div className="flex items-start gap-4">
                         <input 
                            type="checkbox" 
                            className="mt-1 w-6 h-6 rounded-lg border-slate-300 text-brand-600 focus:ring-brand-500 transition-all" 
                            checked={!!diagnosisState[diag.need]?.unmet}
                            onChange={e => setDiagnosisState({
                              ...diagnosisState,
                              [diag.need]: { ...diagnosisState[diag.need], unmet: e.target.checked }
                            })}
                         />
                         <div className="flex-1">
                            <p className="font-bold text-slate-800 text-sm">{diag.need}</p>
                            
                            {diagnosisState[diag.need]?.unmet && (
                              <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 pb-2"
                              >
                                <div className="space-y-2">
                                  <label className="text-[10px] uppercase font-black text-brand-600">Pilih Penyebab (Etiologi)</label>
                                  <select 
                                    className="w-full p-2 text-xs bg-white border border-brand-200 rounded-xl outline-none"
                                    value={diagnosisState[diag.need]?.cause || ''}
                                    onChange={e => setDiagnosisState({
                                      ...diagnosisState,
                                      [diag.need]: { ...diagnosisState[diag.need], cause: e.target.value }
                                    })}
                                  >
                                    <option value="">-- Pilih Penyebab --</option>
                                    {diag.causes.map(c => <option key={c} value={c}>{c}</option>)}
                                  </select>
                                </div>
                                <div className="space-y-2">
                                  <label className="text-[10px] uppercase font-black text-brand-600">Pilih Tanda & Gejala</label>
                                  <select 
                                    className="w-full p-2 text-xs bg-white border border-brand-200 rounded-xl outline-none"
                                    value={diagnosisState[diag.need]?.symptoms || ''}
                                    onChange={e => setDiagnosisState({
                                      ...diagnosisState,
                                      [diag.need]: { ...diagnosisState[diag.need], symptoms: e.target.value }
                                    })}
                                  >
                                    <option value="">-- Pilih Gejala --</option>
                                    {diag.signs.map(s => <option key={s} value={s}>{s}</option>)}
                                  </select>
                                </div>
                                <div className="mt-4 md:col-span-2 p-4 bg-brand-50 border border-brand-200 rounded-2xl space-y-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-brand-700 font-bold text-xs uppercase">
                                      <Sparkles size={14} /> Analisis AI (Etiologi & Gejala)
                                    </div>
                                    <button 
                                      onClick={() => analyzeAiDiagnosis(diag.need, diag.need)}
                                      disabled={isAiAnalyzing[diag.need]}
                                      className="text-xs px-3 py-1 bg-brand-600 text-white rounded-lg font-bold hover:bg-brand-700 disabled:opacity-50 flex items-center gap-1.5"
                                    >
                                      {isAiAnalyzing[diag.need] ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                                      Verifikasi AI
                                    </button>
                                  </div>
                                  <textarea 
                                    className="w-full h-24 p-3 bg-white border border-brand-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-500"
                                    placeholder="AI akan menganalisis sebab dan tanda gejala..."
                                    value={diagnosisState[diag.need]?.aiAnalysis || ''}
                                    onChange={e => setDiagnosisState({
                                      ...diagnosisState,
                                      [diag.need]: { ...diagnosisState[diag.need], aiAnalysis: e.target.value }
                                    })}
                                  />
                                  <p className="text-[10px] text-slate-500 italic font-medium">Berdasarkan hasil verifikasi, Anda dapat menyesuaikan sebab (etiologi) dan gejala di atas secara manual.</p>
                                </div>
                              </motion.div>
                            )}
                         </div>
                      </div>
                   </div>
                 ))}
              </div>

              <div className="flex justify-between mt-8">
                 <button onClick={handleBack} className="flex items-center gap-2 px-6 py-3 border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all">
                    <ChevronLeft size={18} />
                    Kembali
                 </button>
                 <button onClick={handleNext} className="flex items-center gap-2 px-8 py-3 bg-brand-600 text-white rounded-2xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-100">
                    Selanjutnya
                    <ChevronRight size={18} />
                 </button>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-6">
               <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <FileText className="text-brand-600" size={20} />
                Intervensi & Rencana Perawatan
              </h3>
              
              <div className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                       <p className="font-bold text-slate-800 mb-4">Tindakan Klinis</p>
                       <div className="space-y-3">
                          {['Pembersihan Karang Gigi (Scaling)', 'Pembersihan Plak', 'Aplikasi Fluor (Topikal)', 'Fissure Sealant', 'Pencabutan Gigi'].map(item => (
                             <label key={item} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 hover:border-brand-200 cursor-pointer transition-all">
                                <input 
                                  type="checkbox" 
                                  className="w-4 h-4 text-brand-600 rounded" 
                                  checked={interventions.includes(item)}
                                  onChange={e => {
                                    if (e.target.checked) setInterventions([...interventions, item]);
                                    else setInterventions(interventions.filter(i => i !== item));
                                  }}
                                />
                                <span className="text-sm font-medium text-slate-700">{item}</span>
                             </label>
                          ))}
                       </div>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                       <p className="font-bold text-slate-800 mb-4">Edukasi & Konseling</p>
                       <div className="space-y-3">
                          {['Instruksi Sikat Gigi Benar', 'Penyuluhan Diet Gula', 'Demo Penggunaan Dental Floss', 'Briefing Kesehatan Mulut', 'Instruksi Berkumur'].map(item => (
                             <label key={item} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 hover:border-brand-200 cursor-pointer transition-all">
                                <input 
                                  type="checkbox" 
                                  className="w-4 h-4 text-brand-600 rounded" 
                                  checked={interventions.includes(item)}
                                  onChange={e => {
                                    if (e.target.checked) setInterventions([...interventions, item]);
                                    else setInterventions(interventions.filter(i => i !== item));
                                  }}
                                />
                                <span className="text-sm font-medium text-slate-700">{item}</span>
                             </label>
                          ))}
                       </div>
                    </div>
                 </div>

                 {/* AI Intervention Section */}
                 <div className="p-6 bg-brand-50 border border-brand-200 rounded-3xl space-y-4">
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2 text-brand-800 font-bold">
                       <Sparkles className="text-brand-600" size={20} />
                       Rekomendasi Rencana Intervensi AI (Standard TGM)
                     </div>
                     <button 
                       onClick={generateAiInterventions}
                       disabled={isAiGeneratingInterventions}
                       className="px-4 py-2 bg-brand-600 text-white rounded-xl font-bold text-xs hover:bg-brand-700 disabled:opacity-50 flex items-center gap-2"
                     >
                       {isAiGeneratingInterventions ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                       Generate Rencana SOAPIE
                     </button>
                   </div>
                   <textarea 
                     rows={4}
                     className="w-full p-4 bg-white border border-brand-200 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                     value={aiInterventionSuggestions}
                     onChange={e => setAiInterventionSuggestions(e.target.value)}
                     placeholder="Gunakan tombol di atas untuk mendapatkan saran AI, lalu edit sesuai kebutuhan..."
                   />
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-600">Tujuan (Goals)</label>
                      <textarea 
                        rows={3}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none"
                        value={goals}
                        onChange={e => setGoals(e.target.value)}
                        placeholder="Tujuan yang diharapkan dari perawatan ini..."
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-600">Evaluasi</label>
                      <textarea 
                        rows={3}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none"
                        value={evaluation}
                        onChange={e => setEvaluation(e.target.value)}
                        placeholder="Hasil evaluasi setelah tindakan..."
                      />
                   </div>
                 </div>
              </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                 {/* Signature Pasien */}
                 <div className="space-y-4 p-5 bg-slate-50 rounded-3xl border border-slate-200">
                   <div className="flex items-center justify-between">
                     <label className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                       <User size={14} className="text-brand-600" />
                       Tanda Tangan Pasien
                     </label>
                     <button onClick={() => clearSignature('patient')} className="text-[10px] font-bold text-rose-500 hover:underline">Hapus</button>
                   </div>
                   <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 overflow-hidden">
                     <SignatureCanvas 
                       ref={sigPadPatient}
                       penColor="black"
                       canvasProps={{ className: "w-full h-32 cursor-crosshair" }}
                       onEnd={() => saveSignature('patient')}
                     />
                   </div>
                 </div>

                 {/* Signature Wali */}
                 <div className="space-y-4 p-5 bg-slate-50 rounded-3xl border border-slate-200">
                   <div className="flex items-center justify-between">
                     <label className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                       <Users size={14} className="text-brand-600" />
                       Tanda Tangan Wali
                     </label>
                     <button onClick={() => clearSignature('guardian')} className="text-[10px] font-bold text-rose-500 hover:underline">Hapus</button>
                   </div>
                   <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 overflow-hidden">
                     <SignatureCanvas 
                       ref={sigPadGuardian}
                       penColor="black"
                       canvasProps={{ className: "w-full h-32 cursor-crosshair" }}
                       onEnd={() => saveSignature('guardian')}
                     />
                   </div>
                 </div>

                 {/* Signature Petugas */}
                 <div className="space-y-4 p-5 bg-slate-50 rounded-3xl border border-slate-200">
                   <div className="flex items-center justify-between">
                     <label className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                       <PenTool size={14} className="text-brand-600" />
                       Petugas Kesehatan
                     </label>
                     <button onClick={() => clearSignature('officer')} className="text-[10px] font-bold text-rose-500 hover:underline">Hapus</button>
                   </div>
                   <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 overflow-hidden">
                     <SignatureCanvas 
                       ref={sigPadOfficer}
                       penColor="black"
                       canvasProps={{ className: "w-full h-32 cursor-crosshair" }}
                       onEnd={() => saveSignature('officer')}
                     />
                   </div>
                 </div>
               </div>

               <p className="text-[10px] text-slate-400 text-center mt-4 font-medium italic">
                 Verifikasi Digital: Dokumen ini memerlukan tanda tangan elektronik sebagai bukti persetujuan tindakan asuhan kesehatan gigi dan mulut.
               </p>

               <div className="flex justify-between mt-8">
                 <button onClick={handleBack} className="flex items-center gap-2 px-6 py-3 border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all">
                    <ChevronLeft size={18} />
                    Kembali
                 </button>
                 <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all disabled:opacity-50"
                 >
                    {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    Simpan Rekam Medis
                 </button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
