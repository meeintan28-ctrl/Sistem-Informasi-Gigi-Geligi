/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db, handleFirestoreError } from './firebase';

export interface Patient {
  id?: string;
  name: string;
  nik: string;
  rm: string;
  gender: 'L' | 'P';
  birthDate: string;
  birthPlace: string;
  age?: number;
  religion: string;
  occupation: string;
  education: string;
  maritalStatus: string;
  address: string;
  phone: string;
  bloodType: string;
  ethnicity: string;
  insurance: string;
  incomeRange?: string;
  hobbies?: string;
  weight: number;
  height: number;
  createdBy: string;
}

export interface MedicalRecord {
  id?: string;
  patientId: string;
  operatorId: string;
  date: string;
  // Vital Signs
  vitalSigns: {
    bloodPressure: string;
    pulse: number;
    respiration: number;
  };
  // Health History (Page 1-2)
  healthHistory: {
    medis: {
      keadaanSehat: boolean;
      penyakitSerius: string;
      pembekuanDarah: string;
      alergi: {
        makanan: string;
        obat: string;
        anestesi: string;
        cuaca: string;
      };
    };
    social: string;
    pharma: {
      consumingDrugs: boolean;
      drugNames: string;
      sideEffects: string;
      regularity: boolean;
    };
  };
  // Dental History (Page 2)
  dentalHistory: {
    keluhanUtama: string;
    bagianI: any; // Experience
    bagianII: any; // Self-care
    bagianIII: any; // Snacks
    bagianIV: any; // Beliefs
  };
  // Clinical Exam (Page 3-4)
  clinicalExam: {
    extraIntraOral: Record<string, string>; // Checklist results
    ohis: {
      debrisIndex: number;
      calculusIndex: number;
      total: number;
      kategori: string;
    };
    plaqueControl: number;
  };
  // Odontogram (Page 4)
  odontogram: Record<string, string>;
  // Diagnosis (Page 5)
  diagnosis: {
    needs: Record<string, {
      unmet: boolean;
      cause: string;
      symptoms: string;
      aiAnalysis?: string;
    }>;
    goals: string;
    interventions: string[];
    aiInterventionSuggestions?: string;
    evaluation: string;
  };
  signatures: {
    patient?: string;
    guardian?: string;
    officer?: string;
  };
  status: 'draft' | 'final';
}

export const patientService = {
  async getAll() {
    try {
      const q = query(collection(db, 'patients'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      handleFirestoreError(e, 'list', 'patients');
    }
  },

  async create(patientData: any) {
    try {
      const docRef = await addDoc(collection(db, 'patients'), {
        ...patientData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (e) {
      handleFirestoreError(e, 'create', 'patients');
    }
  }
};

export const recordService = {
  async create(recordData: any) {
    try {
      const docRef = await addDoc(collection(db, 'records'), {
        ...recordData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (e) {
      handleFirestoreError(e, 'create', 'records');
    }
  },

  async getByPatient(patientId: string) {
    try {
      const q = query(collection(db, 'records'), where('patientId', '==', patientId), orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      handleFirestoreError(e, 'list', 'records');
    }
  }
};

export const appointmentService = {
    async getToday() {
        try {
            const today = new Date();
            today.setHours(0,0,0,0);
            const q = query(collection(db, 'appointments'), where('date', '==', today.toISOString().split('T')[0]));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (e) {
            handleFirestoreError(e, 'list', 'appointments');
        }
    }
}
