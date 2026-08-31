export interface CheckupRecord {
  id: string;
  date: string; // YYYY-MM-DD
  weightKg?: number;
  bp?: string; // e.g. "120/80"
  fhrBpm?: number; // Fetal Heart Rate
  fundalHeightCm?: number;
  diagnosis: string;
  procedure: string;
  followUpDate: string;
  notes?: string;
}

export interface Patient {
  id: string;
  fullName: string;
  age: number;
  dateOfBirth?: string;
  contactNumber: string;
  email: string;
  address: string;
  emergencyContact: string;
  bloodType: string;
  gravida: number; // G - Number of pregnancies
  para: number;    // P - Number of births
  lmp: string;     // YYYY-MM-DD (Last Menstrual Period)
  illnessHistory: string;
  allergies?: string;
  checkups: CheckupRecord[];
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "09:30 AM"
  type: 'Routine Prenatal' | 'Ultrasound Scan' | 'High Risk Consult' | 'Postpartum Check' | 'First Prenatal Visit';
  notes?: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
}

export interface PractitionerUser {
  id: string;
  fullName: string;
  title: string;
  role: 'DOCTOR' | 'NURSE';
  pinCode: string;
  avatar: string;
}

export const TYPE_MARKER = 'PATIENT_TYPES';
