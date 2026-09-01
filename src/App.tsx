import { useState, useEffect, useCallback, useRef } from 'react';
import type { Patient, Appointment, PractitionerUser } from './types/patient';
import { Navbar } from './components/Navbar';
import { PatientList } from './components/PatientList';
import { PatientDetails } from './components/PatientDetails';
import { ScheduleView } from './components/ScheduleView';
import { DashboardView } from './components/DashboardView';
import { AddPatientModal } from './components/AddPatientModal';
import { AddAppointmentModal } from './components/AddAppointmentModal';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { ManageStaffModal } from './components/ManageStaffModal';
import { LoginScreen } from './components/LoginScreen';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'patients' | 'schedule'>('dashboard');

  // Modals
  const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState<boolean>(false);
  const [isAddAppointmentModalOpen, setIsAddAppointmentModalOpen] = useState<boolean>(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState<boolean>(false);
  const [isManageStaffModalOpen, setIsManageStaffModalOpen] = useState<boolean>(false);
  const [selectedAppointmentDate, setSelectedAppointmentDate] = useState<string | undefined>(undefined);

  const [notification, setNotification] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<'list' | 'details'>('list');
  const [isSidebarListVisible, setIsSidebarListVisible] = useState<boolean>(true);

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

    const isNurseUser = currentUser?.role === 'NURSE';

    if (isNurseUser) {
      showToast(`✨ ${actionLabel} successfully!`);
      return;
    }

    if (serverResult.success) {
      showToast(`💾 Saved to OBGYN_Clinic_Database.xlsx (${actionLabel})`);
    } else if (serverResult.isLocked) {
      showToast(`⚠️ Please close OBGYN_Clinic_Database.xlsx in Excel/WPS to update file on disk!`);
    } else if (autoDL) {
      exportClinicDatabaseToExcel(updatedPatients, updatedAppointments, updatedUsers);
      showToast(`📥 Excel file downloaded (${actionLabel})`);
    } else {
      showToast(`✨ Record saved to Database (${actionLabel})`);
    }
  }, [currentUser, showToast]);

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
          setActiveTab('dashboard');
          showToast(`Welcome back, ${user.fullName}!`);
        }}
      />
    );
  }

  const selectedPatient = patients.find((p) => p.id === selectedPatientId) || null;

  const handleSelectDashboard = () => {
    setActiveTab('dashboard');
  };

  const handleSelectPatients = () => {
    setActiveTab('patients');
    setMobileView('list');
  };

  const handleSelectSchedule = () => {
    setActiveTab('schedule');
  };

  const handleSelectPatient = (patientId: string) => {
    setSelectedPatientId(patientId);
    setActiveTab('patients');
    setMobileView('details');
  };

  const handleBackToList = () => {
    setMobileView('list');
  };

  const handleAddPatient = (newPatient: Patient) => {
    const updatedPatients = [newPatient, ...patients];
    setPatients(updatedPatients);
    setSelectedPatientId(newPatient.id);
    setActiveTab('patients');
    setMobileView('details');
    syncToExcelStorage(updatedPatients, appointments, users, `Registered ${newPatient.fullName}`);
  };

  const handleUpdatePatient = (updatedPatient: Patient) => {
    const updatedPatients = patients.map((p) => (p.id === updatedPatient.id ? updatedPatient : p));
    setPatients(updatedPatients);
    syncToExcelStorage(updatedPatients, appointments, users, `Updated ${updatedPatient.fullName}`);
  };

  const handleDeletePatient = (patientIdToDelete: string) => {
    const patientToDelete = patients.find((p) => p.id === patientIdToDelete);
    const updatedPatients = patients.filter((p) => p.id !== patientIdToDelete);
    const updatedAppointments = appointments.filter((a) => a.patientId !== patientIdToDelete);

    setPatients(updatedPatients);
    setAppointments(updatedAppointments);

    // If active patient was deleted, pick the next available or clear
    if (selectedPatientId === patientIdToDelete) {
      if (updatedPatients.length > 0) {
        setSelectedPatientId(updatedPatients[0].id);
      } else {
        setSelectedPatientId(null);
      }
    }
    setMobileView('list');

    syncToExcelStorage(
      updatedPatients,
      updatedAppointments,
      users,
      `Permanently deleted ${patientToDelete?.fullName || 'patient record'}`
    );
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

  const handleUpdateAppointmentStatus = (appointmentId: string, newStatus: Appointment['status']) => {
    const updatedAppointments = appointments.map((a) =>
      a.id === appointmentId ? { ...a, status: newStatus } : a
    );
    setAppointments(updatedAppointments);
    const targetApt = appointments.find((a) => a.id === appointmentId);
    syncToExcelStorage(
      patients,
      updatedAppointments,
      users,
      `Tagged consultation for ${targetApt?.patientName || 'patient'} as ${newStatus}`
    );
    showToast(`Tagged consultation as "${newStatus}"!`);
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
    <div className="h-screen w-full max-w-full overflow-hidden flex flex-col bg-slate-100 font-sans relative">
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
        activeTab={activeTab}
        onLogout={() => {
          setCurrentUser(null);
          showToast('You have logged out of the system.');
        }}
        onChangePasswordClick={() => setIsChangePasswordModalOpen(true)}
        onManageStaffClick={() => setIsManageStaffModalOpen(true)}
        onAddPatient={() => setIsAddPatientModalOpen(true)}
        onSelectDashboard={handleSelectDashboard}
        onSelectPatients={handleSelectPatients}
        onSelectSchedule={handleSelectSchedule}
        onExportExcel={handleExportExcel}
        onImportExcel={handleImportExcel}
        isExcelLinked={Boolean(excelFileHandle)}
        linkedFileName={linkedFileName}
        autoDownloadOnSave={autoDownloadOnSave}
        onToggleAutoDownload={handleToggleAutoDownload}
        onConnectLocalFile={handleConnectLocalFile}
        onDisconnectLocalFile={handleDisconnectLocalFile}
        onRestoreDefaultExcel={handleRestoreDefaultExcel}
        onLogoClick={handleSelectDashboard}
      />

      {/* MAIN CONTAINER: Dynamic View Switcher */}
      <div className="flex-1 flex overflow-hidden relative w-full max-w-full">
        {activeTab === 'dashboard' ? (
          <DashboardView
            currentUser={currentUser}
            patients={patients}
            appointments={appointments}
            onSelectPatient={handleSelectPatient}
            onOpenAddPatient={() => setIsAddPatientModalOpen(true)}
            onOpenAddAppointment={() => handleOpenAddAppointment()}
            onNavigateToPatients={handleSelectPatients}
            onNavigateToSchedule={handleSelectSchedule}
            onManageStaffClick={() => setIsManageStaffModalOpen(true)}
            onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
          />
        ) : activeTab === 'schedule' ? (
          <ScheduleView
            patients={patients}
            appointments={appointments}
            onSelectPatient={handleSelectPatient}
            onOpenAddAppointment={handleOpenAddAppointment}
            onBackToList={handleSelectDashboard}
            currentUser={currentUser}
            onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
          />
        ) : (
          /* Patients Directory Two-Column Layout (Desktop Collapsible & Mobile Adaptive) */
          <div className="flex-1 flex overflow-hidden relative w-full max-w-full">
            {/* LEFT PANEL: Patient Directory */}
            <div
              className={`h-full shrink-0 border-r border-slate-200 transition-all duration-300 relative ${
                mobileView === 'list'
                  ? 'w-full block md:w-80 lg:w-96'
                  : isSidebarListVisible
                  ? 'hidden md:block md:w-80 lg:w-96'
                  : 'hidden'
              }`}
            >
              <PatientList
                patients={patients}
                selectedPatientId={selectedPatientId}
                onSelectPatient={handleSelectPatient}
                onAddPatientClick={() => setIsAddPatientModalOpen(true)}
              />
            </div>

            {/* RIGHT PANEL: Patient Details */}
            <div
              className={`h-full flex-1 overflow-hidden transition-all relative ${
                mobileView === 'details' ? 'block' : 'hidden md:block'
              }`}
            >
              {/* Desktop Floating Toggle Button to Hide / Show Directory List */}
              <div className="hidden md:block absolute top-3.5 left-4 z-30">
                <button
                  onClick={() => setIsSidebarListVisible(!isSidebarListVisible)}
                  className="bg-white/95 hover:bg-slate-50 text-slate-700 hover:text-teal-800 border border-slate-200 shadow-sm px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition active:scale-95 cursor-pointer backdrop-blur-xs"
                  title={isSidebarListVisible ? 'Hide Patient Directory for Full-Width View' : 'Show Patient Directory List'}
                >
                  {isSidebarListVisible ? (
                    <>
                      <span className="text-teal-600 font-bold">◀</span>
                      <span className="text-[11px]">Hide List</span>
                    </>
                  ) : (
                    <>
                      <span className="text-teal-600 font-bold">▶</span>
                      <span className="text-[11px] font-bold text-teal-900">Show Patients ({patients.length})</span>
                    </>
                  )}
                </button>
              </div>

              {selectedPatient ? (
                <PatientDetails
                  patient={selectedPatient}
                  appointments={appointments}
                  onBackToList={handleBackToList}
                  onUpdatePatient={handleUpdatePatient}
                  onDeletePatient={handleDeletePatient}
                  currentUserRole={currentUser.role}
                  currentUser={currentUser}
                  onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center bg-slate-50 p-8 text-center space-y-3">
                  <p className="text-slate-600 font-bold text-sm">No patient selected.</p>
                  <p className="text-xs text-slate-400">Select a patient from the left directory.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* CLINICAL STATUS FOOTER BAR */}
      <footer className="bg-white border-t border-slate-200 px-3 sm:px-6 py-1.5 shrink-0 z-20 flex items-center justify-between text-[11px] text-slate-500 font-sans select-none">
        {/* Left: Date Display */}
        <div className="flex items-center space-x-2">
          <CalendarIcon className="w-3.5 h-3.5 text-teal-600 shrink-0" />
          <span className="font-semibold text-slate-700">{format(new Date(), 'EEEE, MMMM d, yyyy')}</span>
        </div>

        {/* Center: Live Clinic Statistics & Background Sync */}
        <div className="hidden sm:flex items-center space-x-3">
          <span className="flex items-center space-x-1 text-slate-600">
            <strong className="text-slate-900">{patients.length}</strong>
            <span>Active Patients</span>
          </span>
          <span className="text-slate-300">•</span>
          <span className="flex items-center space-x-1 text-slate-600">
            <strong className="text-slate-900">{appointments.length}</strong>
            <span>Visits Scheduled</span>
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-emerald-700 font-medium flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Excel Auto-Sync Active</span>
          </span>
        </div>

        {/* Right: Active Role & System Version */}
        <div className="flex items-center space-x-2 text-slate-400">
          <span className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded border border-slate-200">
            {currentUser.role === 'DOCTOR' ? '👨‍⚕️ Lead Doctor' : '🩺 Clinic Assistant'}
          </span>
          <span className="hidden md:inline text-slate-400">MaternalCare OB-GYN v1.2</span>
        </div>
      </footer>

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
        existingAppointments={appointments}
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

