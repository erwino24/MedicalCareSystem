export interface PrescriptionItem {
  id: string;
  genericName: string;
  brandName?: string;
  dosage: string; // e.g. "500mg" or "60mg / 400mcg"
  form: string; // "Tablet" | "Capsule" | "Syrup" | "Softgel" | "Injection"
  frequency: string; // "Once daily" | "Twice daily" | "Three times daily" | "Every 8 hours"
  instructions: string; // "Take after meals with a full glass of water"
  quantity: string; // "#30 tablets"
  duration: string; // "30 days"
}

export interface CheckupRecord {
  id: string;
  date: string; // YYYY-MM-DD
  fee?: number; // Consultation / Service Fee in Philippine Peso (₱)
  weightKg?: number;
  bp?: string; // e.g. "120/80"
  fhrBpm?: number; // Fetal Heart Rate
  fundalHeightCm?: number;
  diagnosis: string;
  procedure: string;
  followUpDate: string;
  notes?: string;
  prescriptions?: PrescriptionItem[];
}

export type PatientCareType =
  | 'Pregnant'
  | 'Pediatric / Baby Care'
  | 'Anti-Rabies / Animal Bite'
  | 'Vaccination / Immunization'
  | 'Dengue / Fever'
  | 'General Illness'
  | 'Chronic Care'
  | 'Routine Checkup';

export interface Patient {
  id: string;
  fullName: string;
  age: number;
  dateOfBirth?: string;
  contactNumber: string;
  email: string;
  address: string;
  emergencyContact: string; // Combined fallback
  emergencyContactName?: string;
  emergencyContactNumber?: string;
  emergencyContactAddress?: string;
  bloodType: string;
  careType?: PatientCareType; // 'Pregnant' | 'General Illness' | 'Dengue / Fever' | 'Chronic Care' | 'Routine Checkup'
  gravida: number; // G - Number of pregnancies
  para: number;    // P - Number of births
  lmp: string;     // YYYY-MM-DD (Last Menstrual Period - optional/fallback for non-pregnant)
  illnessHistory: string;
  allergies?: string;
  status?: 'Active' | 'Inactive';
  checkups: CheckupRecord[];
}

export type AppointmentType =
  | 'Routine Prenatal'
  | 'Ultrasound Scan'
  | 'High Risk Consult'
  | 'Postpartum Check'
  | 'First Prenatal Visit'
  | 'Anti-Rabies Vaccine Dose'
  | 'Pediatric / Baby Check'
  | 'Vaccine Shot / Booster'
  | 'Dengue / Fever Check'
  | 'General Consultation'
  | 'Chronic Care Follow-up';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "09:30 AM"
  type: AppointmentType;
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
