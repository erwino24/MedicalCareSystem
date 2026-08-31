import { useState, useEffect, useCallback, useRef } from 'react';
import type { Patient, Appointment, PractitionerUser } from './types/patient';
import { Navbar } from './components/Navbar';
import { PatientList } from './components/PatientList';
import { PatientDetails } from './components/PatientDetails';
import { ScheduleView } from './components/ScheduleView';
import { AddPatientModal } from './components/AddPatientModal';
import { AddAppointmentModal } from './components/AddAppointmentModal';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { ManageStaffModal } from './components/ManageStaffModal';
import { LoginScreen } from './components/LoginScreen';
import {
  exportClinicDatabaseToExcel,
  importClinicDatabaseFromExcel,
  fetchDefaultExcelDatabase,
  saveDatabaseToServerExcel,
  writeDatabaseToFileHandle,
  pickExcelDatabaseFileHandle,
  DEFAULT_PRACTITIONERS
} from './utils/excelService';

const STORAGE_KEY_PATIENTS = 'obgyn_patients_db';
const STORAGE_KEY_APPOINTMENTS = 'obgyn_appointments_db';
const STORAGE_KEY_USERS = 'obgyn_users_db';
const STORAGE_KEY_AUTO_DOWNLOAD = 'obgyn_auto_download_excel';

export function App() {
  // Practitioners & User Accounts State
  const [users, setUsers] = useState<PractitionerUser[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USERS);
      return saved ? JSON.parse(saved) : DEFAULT_PRACTITIONERS;
    } catch {
      return DEFAULT_PRACTITIONERS;
    }
  });

  // Authentication State (Always requires login authentication upon entry)
  const [currentUser, setCurrentUser] = useState<PractitionerUser | null>(null);

  // Patients & Appointments State - Loaded strictly from Excel Database
  const [patients, setPatients] = useState<Patient[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PATIENTS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_APPOINTMENTS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [isScheduleViewActive, setIsScheduleViewActive] = useState<boolean>(false);

  // Modals
  const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState<boolean>(false);
  const [isAddAppointmentModalOpen, setIsAddAppointmentModalOpen] = useState<boolean>(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState<boolean>(false);
  const [isManageStaffModalOpen, setIsManageStaffModalOpen] = useState<boolean>(false);
  const [selectedAppointmentDate, setSelectedAppointmentDate] = useState<string | undefined>(undefined);

  const [notification, setNotification] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<'list' | 'details'>('list');

  // Excel Live File Handle & Auto-Download State
  const [excelFileHandle, setExcelFileHandle] = useState<FileSystemFileHandle | null>(null);
  const [linkedFileName, setLinkedFileName] = useState<string | null>(null);
  const [autoDownloadOnSave, setAutoDownloadOnSave] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY_AUTO_DOWNLOAD) === 'true';
  });

  // Keep ref to latest data for async file write
  const stateRef = useRef({ patients, appointments, users, excelFileHandle, autoDownloadOnSave });
  useEffect(() => {
    stateRef.current = { patients, appointments, users, excelFileHandle, autoDownloadOnSave };
  }, [patients, appointments, users, excelFileHandle, autoDownloadOnSave]);

  const showToast = useCallback((msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  }, []);

  // Inactivity / Idle Auto-Logout Timer (5 Minutes)
  const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

  useEffect(() => {
    if (!currentUser) return;

    let timeoutId: number | undefined;

    const resetTimer = () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        setCurrentUser(null);
        showToast('⏱️ Session timed out due to inactivity. Please log in again.');
      }, INACTIVITY_TIMEOUT_MS);
    };

    const events = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll', 'click'];
    events.forEach((evt) => window.addEventListener(evt, resetTimer, { passive: true }));

    resetTimer();

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      events.forEach((evt) => window.removeEventListener(evt, resetTimer));
    };
  }, [currentUser, showToast]);

  // Write directly into Excel file or trigger auto-download
  const syncToExcelStorage = useCallback(async (
    updatedPatients: Patient[],
    updatedAppointments: Appointment[],
    updatedUsers: PractitionerUser[],
    actionLabel: string
  ) => {
    const { excelFileHandle: handle, autoDownloadOnSave: autoDL } = stateRef.current;

    // 1. Direct Server Disk Write to public/OBGYN_Clinic_Database.xlsx
    const serverResult = await saveDatabaseToServerExcel(updatedPatients, updatedAppointments, updatedUsers);

    // 2. Direct File System API Handle Write if linked
    if (handle) {
      try {
        await writeDatabaseToFileHandle(handle, updatedPatients, updatedAppointments, updatedUsers);
        showToast(`💾 Saved directly to ${handle.name} (${actionLabel})`);
        return;
      } catch (err) {
        console.error('Failed writing to linked Excel file handle:', err);
      }
    }

    if (serverResult.success) {
      showToast(`💾 Saved to OBGYN_Clinic_Database.xlsx on disk (${actionLabel})`);
    } else if (serverResult.isLocked) {
      showToast(`⚠️ Please close OBGYN_Clinic_Database.xlsx in WPS Office / Excel to update file on disk!`);
    } else if (autoDL) {
      exportClinicDatabaseToExcel(updatedPatients, updatedAppointments, updatedUsers);
      showToast(`📥 Excel file downloaded (${actionLabel})`);
    } else {
      showToast(`✨ Record saved to Excel Database (${actionLabel})`);
    }
  }, [showToast]);

  // Automatically fetch & load OBGYN_Clinic_Database.xlsx dynamically if patients list is empty!
  useEffect(() => {
    if (patients.length === 0) {
      fetchDefaultExcelDatabase()
        .then((excelData) => {
          if (excelData.patients.length > 0) {
            setPatients(excelData.patients);
            setSelectedPatientId(excelData.patients[0].id);
            if (excelData.appointments && excelData.appointments.length > 0) {
              setAppointments(excelData.appointments);
            }
            if (excelData.users.length > 0) {
              setUsers(excelData.users);
            }
            showToast('Loaded database & user PINs from OBGYN_Clinic_Database.xlsx');
          }
        })
        .catch((err) => {
          console.warn('Could not auto-load default Excel file:', err);
        });
    } else if (!selectedPatientId && patients.length > 0) {
      setSelectedPatientId(patients[0].id);
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    try {
      if (patients.length > 0) {
        localStorage.setItem(STORAGE_KEY_PATIENTS, JSON.stringify(patients));
      }
    } catch (e) {
      console.error('Failed to save patients', e);
    }
  }, [patients]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_APPOINTMENTS, JSON.stringify(appointments));
    } catch (e) {
      console.error('Failed to save appointments', e);
    }
  }, [appointments]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    } catch (e) {
      console.error('Failed to save users', e);
    }
  }, [users]);

  // Connect local file handle for real-time disk auto-save
  const handleConnectLocalFile = async () => {
    const handle = await pickExcelDatabaseFileHandle('OBGYN_Clinic_Database.xlsx');
    if (handle) {
      setExcelFileHandle(handle);
      setLinkedFileName(handle.name);
      // Immediately write current state to file
      try {
        await writeDatabaseToFileHandle(handle, patients, appointments, users);
        showToast(`🟢 Linked to "${handle.name}". All changes will auto-save to disk.`);
      } catch (err) {
        console.error(err);
        showToast(`Connected to ${handle.name}`);
      }
    }
  };

  const handleDisconnectLocalFile = () => {
    setExcelFileHandle(null);
    setLinkedFileName(null);
    showToast('Disconnected local file handle. Data remains safely in browser.');
  };

  const handleToggleAutoDownload = () => {
    const newVal = !autoDownloadOnSave;
    setAutoDownloadOnSave(newVal);
    localStorage.setItem(STORAGE_KEY_AUTO_DOWNLOAD, String(newVal));
    showToast(newVal ? 'Auto-download .xlsx on every save ENABLED' : 'Auto-download .xlsx DISABLED');
  };

  // Handle PIN / Password Change
  const handleChangePin = (newPin: string) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, pinCode: newPin };
    const updatedUsers = users.map((u) => (u.id === currentUser.id ? updatedUser : u));

    setCurrentUser(updatedUser);
    setUsers(updatedUsers);
    syncToExcelStorage(patients, appointments, updatedUsers, 'PIN Updated');
  };

  // Handle Add & Delete Staff
  const handleAddUser = (newUser: PractitionerUser) => {
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    syncToExcelStorage(patients, appointments, updatedUsers, `Added Staff ${newUser.fullName}`);
  };

  const handleDeleteUser = (userId: string) => {
    const updatedUsers = users.filter((u) => u.id !== userId);
    setUsers(updatedUsers);
    syncToExcelStorage(patients, appointments, updatedUsers, 'Removed Staff Account');
  };

  if (!currentUser) {
    return (
      <LoginScreen
        users={users}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          showToast(`Welcome back, ${user.fullName}!`);
        }}
      />
    );
  }

  const selectedPatient = patients.find((p) => p.id === selectedPatientId) || null;

  const handleSelectPatient = (patientId: string) => {
    setSelectedPatientId(patientId);
    setIsScheduleViewActive(false);
    setMobileView('details');
  };

  const handleBackToList = () => {
    setMobileView('list');
  };

  const handleSelectSchedule = () => {
    setIsScheduleViewActive(true);
    setMobileView('details');
  };

  const handleAddPatient = (newPatient: Patient) => {
    const updatedPatients = [newPatient, ...patients];
    setPatients(updatedPatients);
    setSelectedPatientId(newPatient.id);
    setIsScheduleViewActive(false);
    setMobileView('details');
    syncToExcelStorage(updatedPatients, appointments, users, `Registered ${newPatient.fullName}`);
  };

  const handleUpdatePatient = (updatedPatient: Patient) => {
    const updatedPatients = patients.map((p) => (p.id === updatedPatient.id ? updatedPatient : p));
    setPatients(updatedPatients);
    syncToExcelStorage(updatedPatients, appointments, users, `Updated ${updatedPatient.fullName}`);
  };

  const handleOpenAddAppointment = (date?: string) => {
    setSelectedAppointmentDate(date);
    setIsAddAppointmentModalOpen(true);
  };

  const handleAddAppointment = (newApt: Appointment, newPatientData?: Patient) => {
    let updatedPatients = patients;
    if (newPatientData) {
      updatedPatients = [newPatientData, ...patients];
      setPatients(updatedPatients);
    }
    const updatedAppointments = [newApt, ...appointments];
    setAppointments(updatedAppointments);
    syncToExcelStorage(
      updatedPatients,
      updatedAppointments,
      users,
      `Scheduled Visit for ${newApt.patientName}`
    );
  };

  const handleRestoreDefaultExcel = async () => {
    try {
      const excelData = await fetchDefaultExcelDatabase();
      if (excelData.patients.length > 0) {
        setPatients(excelData.patients);
        setSelectedPatientId(excelData.patients[0].id);
        if (excelData.appointments) {
          setAppointments(excelData.appointments);
        }
        if (excelData.users.length > 0) {
          setUsers(excelData.users);
          setCurrentUser(excelData.users[0]);
        }
        localStorage.removeItem(STORAGE_KEY_PATIENTS);
        localStorage.removeItem(STORAGE_KEY_APPOINTMENTS);
        localStorage.removeItem(STORAGE_KEY_USERS);
        showToast('Restored all clinic records from OBGYN_Clinic_Database.xlsx!');
      }
    } catch (err) {
      console.error(err);
      showToast('Error restoring default Excel database.');
    }
  };

  const handleExportExcel = () => {
    exportClinicDatabaseToExcel(patients, appointments, users);
    showToast('Excel Clinic Database (Patients, Checkups, Schedule & Users) exported.');
  };

  const handleImportExcel = async (file: File) => {
    try {
      const imported = await importClinicDatabaseFromExcel(file);
      if (imported.patients.length > 0) {
        setPatients(imported.patients);
        setSelectedPatientId(imported.patients[0].id);
        if (imported.appointments && imported.appointments.length > 0) {
          setAppointments(imported.appointments);
        }
        if (imported.users.length > 0) {
          setUsers(imported.users);
        }
        showToast(`Loaded ${imported.patients.length} patients, ${imported.appointments.length} appointments, and ${imported.users.length} accounts from Excel.`);
      } else {
        showToast('No patient records found in uploaded file.');
      }
    } catch (err) {
      console.error(err);
      showToast('Error parsing Excel file. Please ensure valid format.');
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-slate-100 font-sans relative">
      {/* Toast Notification Banner */}
      {notification && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 animate-in fade-in slide-in-from-top-2 duration-200 flex items-center space-x-2">
          <span>✨</span>
          <span className="font-medium">{notification}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        onLogout={() => {
          setCurrentUser(null);
          showToast('You have logged out of the system.');
        }}
        onChangePasswordClick={() => setIsChangePasswordModalOpen(true)}
        onManageStaffClick={() => setIsManageStaffModalOpen(true)}
        onAddPatient={() => setIsAddPatientModalOpen(true)}
        onSelectSchedule={handleSelectSchedule}
        onExportExcel={handleExportExcel}
        onImportExcel={handleImportExcel}
        isScheduleActive={isScheduleViewActive}
        totalPatientsCount={patients.length}
        totalAppointmentsCount={appointments.length}
        isExcelLinked={Boolean(excelFileHandle)}
        linkedFileName={linkedFileName}
        autoDownloadOnSave={autoDownloadOnSave}
        onToggleAutoDownload={handleToggleAutoDownload}
        onConnectLocalFile={handleConnectLocalFile}
        onDisconnectLocalFile={handleDisconnectLocalFile}
        onRestoreDefaultExcel={handleRestoreDefaultExcel}
      />

      {/* MAIN CONTAINER: Responsive Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* LEFT PANEL: Patient Directory */}
        <div
          className={`h-full w-full md:w-80 lg:w-96 shrink-0 border-r border-slate-200 transition-all ${
            mobileView === 'list' ? 'block' : 'hidden md:block'
          }`}
        >
          <PatientList
            patients={patients}
            selectedPatientId={selectedPatientId}
            onSelectPatient={handleSelectPatient}
            onAddPatientClick={() => setIsAddPatientModalOpen(true)}
          />
        </div>

        {/* RIGHT PANEL: Schedule View or Patient Details */}
        <div
          className={`h-full flex-1 overflow-hidden transition-all ${
            mobileView === 'details' ? 'block' : 'hidden md:block'
          }`}
        >
          {isScheduleViewActive ? (
            <ScheduleView
              patients={patients}
              appointments={appointments}
              onSelectPatient={handleSelectPatient}
              onOpenAddAppointment={handleOpenAddAppointment}
              currentUser={currentUser}
            />
          ) : selectedPatient ? (
            <PatientDetails
              patient={selectedPatient}
              onBackToList={handleBackToList}
              onUpdatePatient={handleUpdatePatient}
              currentUserRole={currentUser.role}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-slate-50 p-8 text-center space-y-3">
              <p className="text-slate-600 font-bold text-sm">No patient selected.</p>
              <p className="text-xs text-slate-400">Select a patient from the left directory.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddPatientModal
        isOpen={isAddPatientModalOpen}
        onClose={() => setIsAddPatientModalOpen(false)}
        onAddPatient={handleAddPatient}
      />

      <AddAppointmentModal
        isOpen={isAddAppointmentModalOpen}
        onClose={() => setIsAddAppointmentModalOpen(false)}
        patients={patients}
        onAddAppointment={handleAddAppointment}
        defaultDate={selectedAppointmentDate}
      />

      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
        currentUser={currentUser}
        onChangePin={handleChangePin}
      />

      <ManageStaffModal
        isOpen={isManageStaffModalOpen}
        onClose={() => setIsManageStaffModalOpen(false)}
        users={users}
        currentUser={currentUser}
        onAddUser={handleAddUser}
        onDeleteUser={handleDeleteUser}
      />
    </div>
  );
}

export default App;

