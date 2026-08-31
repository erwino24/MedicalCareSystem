import * as XLSX from 'xlsx';
import type { Patient, CheckupRecord, Appointment, PractitionerUser } from '../types/patient';
import { calculateObGynMetrics } from './obgynCalculator';
import { format } from 'date-fns';

export interface ExcelImportResult {
  patients: Patient[];
  appointments: Appointment[];
  users: PractitionerUser[];
}

export const DEFAULT_PRACTITIONERS: PractitionerUser[] = [
  {
    id: 'usr-1',
    fullName: 'Dr. Sarah Jenkins',
    title: 'FPOGS, MD',
    role: 'DOCTOR',
    pinCode: '1234',
    avatar: 'SJ',
  },
  {
    id: 'usr-2',
    fullName: 'Nurse Maria Santos',
    title: 'RN',
    role: 'NURSE',
    pinCode: '0000',
    avatar: 'MS',
  },
];

/**
 * Builds the complete multi-sheet Excel workbook representing the entire clinic database as is.
 */
export function buildClinicWorkbook(
  patients: Patient[],
  appointments: Appointment[] = [],
  users: PractitionerUser[] = DEFAULT_PRACTITIONERS
): XLSX.WorkBook {
  // Sheet 1: Patients Directory
  const patientsRows = patients.map((p) => {
    const metrics = calculateObGynMetrics(p.lmp);
    return {
      'Patient ID': p.id,
      'Full Name': p.fullName,
      'Age (Years)': p.age,
      'Contact Number': p.contactNumber,
      'Email': p.email,
      'Address': p.address,
      'Emergency Contact': p.emergencyContact,
      'Blood Type': p.bloodType,
      'Gravida (G)': p.gravida,
      'Para (P)': p.para,
      'LMP (YYYY-MM-DD)': p.lmp,
      'EDD (Estimated Due Date)': metrics.edd,
      'AOG (Age of Gestation)': metrics.aogFormatted,
      'Trimester Stage': metrics.trimester,
      'Allergies': p.allergies || 'None',
      'Illness & Medical History': p.illnessHistory,
      'Total Consultations': p.checkups.length,
    };
  });

  // Sheet 2: All Checkup Records
  const checkupRows: Record<string, unknown>[] = [];
  patients.forEach((p) => {
    p.checkups.forEach((c) => {
      checkupRows.push({
        'Patient ID': p.id,
        'Patient Name': p.fullName,
        'Checkup ID': c.id,
        'Consultation Date': c.date,
        'Blood Pressure': c.bp || 'N/A',
        'Weight (kg)': c.weightKg ?? 'N/A',
        'Fetal Heart Rate (bpm)': c.fhrBpm ?? 'N/A',
        'Fundal Height (cm)': c.fundalHeightCm ?? 'N/A',
        'Diagnosis': c.diagnosis,
        'Procedure / Treatment': c.procedure,
        'Follow-Up Date': c.followUpDate,
        'Notes': c.notes || '',
      });
    });
  });

  // Sheet 3: Appointments & Schedule
  const appointmentRows = appointments.map((a) => ({
    'Appointment ID': a.id,
    'Patient ID': a.patientId,
    'Patient Name': a.patientName,
    'Date': a.date,
    'Time Slot': a.time,
    'Visit Type': a.type,
    'Status': a.status,
    'Notes': a.notes || '',
  }));

  // Sheet 4: Practitioner Accounts & Login Credentials
  const userRows = users.map((u) => ({
    'User ID': u.id,
    'Full Name': u.fullName,
    'Title': u.title,
    'Role': u.role,
    'PIN Code': String(u.pinCode),
  }));

  // Create Workbook and Worksheets
  const wb = XLSX.utils.book_new();

  const wsPatients = XLSX.utils.json_to_sheet(
    patientsRows.length > 0
      ? patientsRows
      : [{ 'Patient ID': '', 'Full Name': '', 'Diagnosis': 'No patients in database yet' }]
  );

  const wsCheckups = XLSX.utils.json_to_sheet(
    checkupRows.length > 0
      ? checkupRows
      : [{ 'Patient ID': '', 'Patient Name': '', 'Diagnosis': 'No checkup records yet' }]
  );

  const wsAppointments = XLSX.utils.json_to_sheet(
    appointmentRows.length > 0
      ? appointmentRows
      : [{ 'Appointment ID': '', 'Patient Name': '', 'Visit Type': 'No scheduled appointments yet' }]
  );

  const wsUsers = XLSX.utils.json_to_sheet(userRows);

  // Set column widths
  wsPatients['!cols'] = [
    { wch: 14 }, { wch: 24 }, { wch: 12 }, { wch: 18 }, { wch: 24 },
    { wch: 35 }, { wch: 30 }, { wch: 10 }, { wch: 12 }, { wch: 10 },
    { wch: 16 }, { wch: 16 }, { wch: 14 }, { wch: 14 }, { wch: 20 }, { wch: 40 }, { wch: 18 }
  ];

  wsCheckups['!cols'] = [
    { wch: 14 }, { wch: 24 }, { wch: 14 }, { wch: 16 }, { wch: 14 },
    { wch: 12 }, { wch: 20 }, { wch: 16 }, { wch: 35 }, { wch: 35 }, { wch: 14 }, { wch: 25 }
  ];

  wsAppointments['!cols'] = [
    { wch: 14 }, { wch: 14 }, { wch: 24 }, { wch: 14 }, { wch: 14 },
    { wch: 22 }, { wch: 14 }, { wch: 30 }
  ];

  wsUsers['!cols'] = [
    { wch: 12 }, { wch: 24 }, { wch: 16 }, { wch: 12 }, { wch: 14 }
  ];

  XLSX.utils.book_append_sheet(wb, wsPatients, 'Patients Directory');
  XLSX.utils.book_append_sheet(wb, wsCheckups, 'Checkup Records');
  XLSX.utils.book_append_sheet(wb, wsAppointments, 'Appointments & Schedule');
  XLSX.utils.book_append_sheet(wb, wsUsers, 'Practitioner Accounts');

  return wb;
}

/**
 * Exports all patients, checkup records, appointments, and practitioner accounts to an Excel (.xlsx) file.
 */
export function exportClinicDatabaseToExcel(
  patients: Patient[],
  appointments: Appointment[] = [],
  users: PractitionerUser[] = DEFAULT_PRACTITIONERS,
  customFilename?: string
): void {
  const wb = buildClinicWorkbook(patients, appointments, users);
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const filename = customFilename || `OBGYN_Clinic_Database_${todayStr}.xlsx`;
  XLSX.writeFile(wb, filename);
}

/**
 * Checks if the browser supports the File System Access API for live file auto-saving.
 */
export function isFileSystemAccessSupported(): boolean {
  return typeof window !== 'undefined' && 'showOpenFilePicker' in window && 'showSaveFilePicker' in window;
}

export interface ServerSaveResult {
  success: boolean;
  isLocked?: boolean;
  message?: string;
  error?: string;
}

/**
 * Saves the multi-sheet Excel database directly to the server file (public/OBGYN_Clinic_Database.xlsx) on disk.
 */
export async function saveDatabaseToServerExcel(
  patients: Patient[],
  appointments: Appointment[] = [],
  users: PractitionerUser[] = DEFAULT_PRACTITIONERS
): Promise<ServerSaveResult> {
  try {
    const wb = buildClinicWorkbook(patients, appointments, users);
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const response = await fetch('/api/save-excel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/octet-stream' },
      body: excelBuffer,
    });
    const result = await response.json();
    return result;
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Error saving to server Excel file:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Writes the entire Excel database directly into a connected FileSystemFileHandle on disk.
 */
export async function writeDatabaseToFileHandle(
  fileHandle: FileSystemFileHandle,
  patients: Patient[],
  appointments: Appointment[] = [],
  users: PractitionerUser[] = DEFAULT_PRACTITIONERS
): Promise<void> {
  const wb = buildClinicWorkbook(patients, appointments, users);
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const writable = await fileHandle.createWritable();
  await writable.write(excelBuffer);
  await writable.close();
}

/**
 * Requests the user to pick/create a local .xlsx file handle for automatic disk sync.
 */
export async function pickExcelDatabaseFileHandle(
  suggestedName = 'OBGYN_Clinic_Database.xlsx'
): Promise<FileSystemFileHandle | null> {
  if (!isFileSystemAccessSupported()) return null;
  try {
    const handle = await (window as unknown as { showSaveFilePicker: (options: unknown) => Promise<FileSystemFileHandle> }).showSaveFilePicker({
      suggestedName,
      types: [
        {
          description: 'Excel Spreadsheet (*.xlsx)',
          accept: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
          },
        },
      ],
    });
    return handle;
  } catch (err) {
    if ((err as Error).name !== 'AbortError') {
      console.error('Failed to pick file handle:', err);
    }
    return null;
  }
}

/**
 * Imports patients, checkup records, appointments, and practitioner accounts from an uploaded Excel file.
 */
export function importClinicDatabaseFromExcel(file: File): Promise<ExcelImportResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        const patientsSheetName =
          workbook.SheetNames.find((s) => s.toLowerCase().includes('patient')) || workbook.SheetNames[0];
        const checkupsSheetName =
          workbook.SheetNames.find((s) => s.toLowerCase().includes('checkup')) || workbook.SheetNames[1];
        const appointmentsSheetName =
          workbook.SheetNames.find((s) => s.toLowerCase().includes('appointment') || s.toLowerCase().includes('schedule'));
        const usersSheetName =
          workbook.SheetNames.find((s) => s.toLowerCase().includes('account') || s.toLowerCase().includes('user') || s.toLowerCase().includes('practitioner'));

        const rawPatients: Record<string, unknown>[] = XLSX.utils.sheet_to_json(workbook.Sheets[patientsSheetName]);
        const rawCheckups: Record<string, unknown>[] = checkupsSheetName && workbook.Sheets[checkupsSheetName]
          ? XLSX.utils.sheet_to_json(workbook.Sheets[checkupsSheetName])
          : [];
        const rawAppointments: Record<string, unknown>[] = appointmentsSheetName && workbook.Sheets[appointmentsSheetName]
          ? XLSX.utils.sheet_to_json(workbook.Sheets[appointmentsSheetName])
          : [];
        const rawUsers: Record<string, unknown>[] = usersSheetName && workbook.Sheets[usersSheetName]
          ? XLSX.utils.sheet_to_json(workbook.Sheets[usersSheetName])
          : [];

        // Parse Checkups Map by Patient ID
        const checkupsByPatientId: Record<string, CheckupRecord[]> = {};
        rawCheckups.forEach((row) => {
          const patId = String(row['Patient ID'] || row['patientId'] || '');
          if (!patId) return;

          const record: CheckupRecord = {
            id: String(row['Checkup ID'] || row['id'] || `chk-imp-${Math.random().toString(36).substring(2, 7)}`),
            date: String(row['Consultation Date'] || row['Date'] || row['date'] || format(new Date(), 'yyyy-MM-dd')),
            weightKg: row['Weight (kg)'] && row['Weight (kg)'] !== 'N/A' ? Number(row['Weight (kg)']) : undefined,
            bp: row['Blood Pressure'] && row['Blood Pressure'] !== 'N/A' ? String(row['Blood Pressure']) : undefined,
            fhrBpm: row['Fetal Heart Rate (bpm)'] && row['Fetal Heart Rate (bpm)'] !== 'N/A' ? Number(row['Fetal Heart Rate (bpm)']) : undefined,
            fundalHeightCm: row['Fundal Height (cm)'] && row['Fundal Height (cm)'] !== 'N/A' ? Number(row['Fundal Height (cm)']) : undefined,
            diagnosis: String(row['Diagnosis'] || 'Imported Checkup'),
            procedure: String(row['Procedure / Treatment'] || row['Procedure'] || 'Routine Care'),
            followUpDate: String(row['Follow-Up Date'] || row['FollowUp'] || 'As needed'),
            notes: row['Notes'] ? String(row['Notes']) : undefined,
          };

          if (!checkupsByPatientId[patId]) {
            checkupsByPatientId[patId] = [];
          }
          checkupsByPatientId[patId].push(record);
        });

        // Parse Patients
        const parsedPatients: Patient[] = rawPatients.map((row, index) => {
          const patId = String(row['Patient ID'] || row['id'] || `pat-imp-${index + 100}`);
          return {
            id: patId,
            fullName: String(row['Full Name'] || row['fullName'] || row['Name'] || 'Unnamed Patient'),
            age: Number(row['Age (Years)'] || row['age']) || 25,
            contactNumber: String(row['Contact Number'] || row['contactNumber'] || 'N/A'),
            email: String(row['Email'] || row['email'] || 'N/A'),
            address: String(row['Address'] || row['address'] || 'N/A'),
            emergencyContact: String(row['Emergency Contact'] || row['emergencyContact'] || 'N/A'),
            bloodType: String(row['Blood Type'] || row['bloodType'] || 'O+'),
            gravida: Number(row['Gravida (G)'] || row['gravida']) || 1,
            para: Number(row['Para (P)'] || row['para']) || 0,
            lmp: String(row['LMP (YYYY-MM-DD)'] || row['lmp'] || format(new Date(), 'yyyy-MM-dd')),
            illnessHistory: String(row['Illness & Medical History'] || row['illnessHistory'] || 'No history reported.'),
            allergies: row['Allergies'] && row['Allergies'] !== 'None' ? String(row['Allergies']) : undefined,
            checkups: checkupsByPatientId[patId] || [],
          };
        });

        // Parse Appointments
        const parsedAppointments: Appointment[] = rawAppointments.map((row, idx) => {
          return {
            id: String(row['Appointment ID'] || row['id'] || `apt-imp-${idx + 1}`),
            patientId: String(row['Patient ID'] || row['patientId'] || ''),
            patientName: String(row['Patient Name'] || row['patientName'] || 'Scheduled Patient'),
            date: String(row['Date'] || row['date'] || format(new Date(), 'yyyy-MM-dd')),
            time: String(row['Time Slot'] || row['time'] || '09:30 AM'),
            type: (row['Visit Type'] || row['type'] || 'Routine Prenatal') as Appointment['type'],
            status: (row['Status'] || row['status'] || 'Scheduled') as Appointment['status'],
            notes: row['Notes'] ? String(row['Notes']) : undefined,
          };
        });

        // Parse Users
        const parsedUsers: PractitionerUser[] = rawUsers.length > 0
          ? rawUsers.map((row, idx) => {
              const name = String(row['Full Name'] || row['fullName'] || 'Practitioner');
              const initials = name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .substring(0, 2)
                .toUpperCase();
              return {
                id: String(row['User ID'] || row['id'] || `usr-${idx + 1}`),
                fullName: name,
                title: String(row['Title'] || row['title'] || 'MD'),
                role: String(row['Role'] || row['role']).toUpperCase().includes('NURSE') ? 'NURSE' : 'DOCTOR',
                pinCode: String(row['PIN Code'] || row['pinCode'] || row['PIN'] || '1234'),
                avatar: initials || 'SJ',
              };
            })
          : DEFAULT_PRACTITIONERS;

        resolve({ patients: parsedPatients, appointments: parsedAppointments, users: parsedUsers });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Fetches default Excel file (/OBGYN_Clinic_Database.xlsx) dynamically.
 */
export async function fetchDefaultExcelDatabase(): Promise<ExcelImportResult> {
  const response = await fetch('/OBGYN_Clinic_Database.xlsx');
  if (!response.ok) {
    throw new Error('Default Excel database file not found');
  }
  const blob = await response.blob();
  const file = new File([blob], 'OBGYN_Clinic_Database.xlsx', { type: blob.type });
  return importClinicDatabaseFromExcel(file);
}

