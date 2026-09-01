import React, { useState, useRef } from 'react';
import {
  HeartPulse,
  Calendar as CalendarIcon,
  UserCheck,
  Plus,
  FileSpreadsheet,
  Download,
  Upload,
  LogOut,
  ChevronDown,
  KeyRound,
  HardDrive,
  CheckCircle,
  FolderSync,
  LayoutDashboard,
  Users
} from 'lucide-react';
import type { PractitionerUser } from '../types/patient';
import { isFileSystemAccessSupported } from '../utils/excelService';

interface NavbarProps {
  currentUser: PractitionerUser;
  activeTab: 'dashboard' | 'patients' | 'schedule';
  onLogout: () => void;
  onChangePasswordClick: () => void;
  onAddPatient: () => void;
  onSelectDashboard: () => void;
  onSelectPatients: () => void;
  onSelectSchedule: () => void;
  onExportExcel: () => void;
  onImportExcel: (file: File) => void;
  isScheduleActive?: boolean;
  totalPatientsCount?: number;
  totalAppointmentsCount?: number;
  isExcelLinked: boolean;
  linkedFileName: string | null;
  autoDownloadOnSave: boolean;
  onToggleAutoDownload: () => void;
  onConnectLocalFile: () => void;
  onDisconnectLocalFile: () => void;
  onRestoreDefaultExcel: () => void;
  onManageStaffClick: () => void;
  onLogoClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  onLogout,
  onChangePasswordClick,
  onAddPatient,
  onSelectDashboard,
  onSelectPatients,
  onSelectSchedule,
  onExportExcel,
  onImportExcel,
  isExcelLinked,
  linkedFileName,
  autoDownloadOnSave,
  onToggleAutoDownload,
  onConnectLocalFile,
  onDisconnectLocalFile,
  onRestoreDefaultExcel,
  onManageStaffClick,
  onLogoClick,
}) => {
  const isNurse = currentUser.role === 'NURSE';
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isExcelOpen, setIsExcelOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasFSAccess = isFileSystemAccessSupported();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportExcel(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setIsExcelOpen(false);
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 shrink-0 shadow-xs z-30 relative font-sans w-full max-w-full">
      <div className="px-2.5 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-1.5 sm:gap-4 max-w-full">
        {/* Brand & Logo - Click to go to Dashboard */}
        <button
          onClick={onSelectDashboard || onLogoClick}
          className="flex items-center space-x-2 sm:space-x-3 text-left focus:outline-none cursor-pointer group shrink min-w-0"
          title="Go to Clinic Dashboard"
        >
          <div className="bg-gradient-to-tr from-teal-600 to-cyan-500 text-white p-1.5 sm:p-2.5 rounded-xl shadow-sm flex items-center justify-center shrink-0 group-hover:scale-105 transition">
            <HeartPulse className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <h1 className="text-xs sm:text-base md:text-lg font-bold text-slate-800 tracking-tight whitespace-nowrap truncate group-hover:text-teal-800 transition">
                MaternalCare <span className="text-teal-700 font-extrabold">OB-GYN</span>
              </h1>
              <span className="bg-teal-50 text-teal-700 text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full border border-teal-200 hidden xl:inline-flex shrink-0">
                {isNurse ? 'Clinical Assistant' : 'Lead Doctor'}
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 hidden md:block truncate">
              Obstetrics & Gynecology Patient Management System
            </p>
          </div>
        </button>

        {/* Center / Right Nav Items */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* Main Navigation Tabs */}
          <div className="flex items-center space-x-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80 text-xs">
            {/* Dashboard Tab */}
            <button
              onClick={onSelectDashboard}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-semibold transition flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-white text-teal-800 shadow-2xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
              title="Clinic Overview & Priority Dashboard"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-teal-600" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>

            {/* Patients Directory Tab */}
            <button
              onClick={onSelectPatients}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-semibold transition flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'patients'
                  ? 'bg-white text-teal-800 shadow-2xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
              title="View All Registered Patients"
            >
              <Users className="w-3.5 h-3.5 text-teal-600" />
              <span className="hidden sm:inline">Patients</span>
            </button>

            {/* Schedule Tab */}
            <button
              onClick={onSelectSchedule}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-semibold transition flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'schedule'
                  ? 'bg-white text-teal-800 shadow-2xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
              title="Interactive Clinic Schedule & Calendar"
            >
              <CalendarIcon className="w-3.5 h-3.5 text-teal-600" />
              <span className="hidden sm:inline">Schedule</span>
            </button>
          </div>

          {/* EXCEL DATABASE STATUS BUTTON & DROPDOWN (ONLY VISIBLE FOR DOCTOR) */}
          {!isNurse && (
            <div className="relative">
              <button
                onClick={() => { setIsExcelOpen(!isExcelOpen); setIsProfileOpen(false); }}
                className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs font-medium transition flex items-center space-x-1.5 border shadow-2xs cursor-pointer ${
                  isExcelLinked
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-400'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                }`}
                title="Excel Database Settings and Live Sync"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                <span className="hidden lg:inline font-semibold">
                  {isExcelLinked ? 'Excel Linked 🟢' : 'Excel DB'}
                </span>
                <ChevronDown className="w-3 h-3 text-emerald-600" />
              </button>

              {/* Excel Dropdown Menu */}
              {isExcelOpen && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 block">Excel Database Hub</span>
                      <span className="text-[10px] text-slate-400">OBGYN_Clinic_Database.xlsx</span>
                    </div>
                    {isExcelLinked ? (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                        <span>Live Disk Sync</span>
                      </span>
                    ) : (
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Local Browser
                      </span>
                    )}
                  </div>

                  {/* Chrome File System Access */}
                  {hasFSAccess && (
                    <div className="p-3 bg-slate-50 border-b border-slate-100">
                      {!isExcelLinked ? (
                        <div className="space-y-1.5">
                          <p className="text-[11px] text-slate-600">
                            Connect your real local <strong>.xlsx file</strong> on your computer for instant auto-saving to disk:
                          </p>
                          <button
                            onClick={() => {
                              onConnectLocalFile();
                              setIsExcelOpen(false);
                            }}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-1.5 px-3 rounded-lg text-xs transition flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer"
                          >
                            <HardDrive className="w-3.5 h-3.5" />
                            <span>Link Local Excel File</span>
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-1.5 text-emerald-800 font-semibold text-[11px]">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="truncate">Saved directly to: {linkedFileName}</span>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                onConnectLocalFile();
                                setIsExcelOpen(false);
                              }}
                              className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-medium py-1 px-2 rounded text-[11px] transition cursor-pointer"
                            >
                              Change File
                            </button>
                            <button
                              onClick={() => {
                                onDisconnectLocalFile();
                              }}
                              className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium py-1 px-2 rounded text-[11px] transition cursor-pointer"
                            >
                              Disconnect
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Auto-download Toggle */}
                  <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between">
                    <label htmlFor="autoDownloadToggle" className="cursor-pointer select-none text-[11px] text-slate-700 flex items-center space-x-2">
                      <FolderSync className="w-3.5 h-3.5 text-teal-600" />
                      <span>Auto-download .xlsx on saves</span>
                    </label>
                    <input
                      id="autoDownloadToggle"
                      type="checkbox"
                      checked={autoDownloadOnSave}
                      onChange={onToggleAutoDownload}
                      className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500 cursor-pointer"
                    />
                  </div>

                  <button
                    onClick={() => { onExportExcel(); setIsExcelOpen(false); }}
                    className="w-full text-left px-3.5 py-2 hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 flex items-center space-x-2 transition cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-emerald-600" />
                    <div>
                      <p className="font-semibold text-slate-800">Export / Download Excel (.xlsx)</p>
                      <p className="text-[10px] text-slate-400">Save multi-sheet file with all current data</p>
                    </div>
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full text-left px-3.5 py-2 hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 flex items-center space-x-2 transition cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-teal-600" />
                    <div>
                      <p className="font-semibold text-slate-800">Import Custom Excel Database</p>
                      <p className="text-[10px] text-slate-400">Upload & restore from any .xlsx file</p>
                    </div>
                  </button>

                  <button
                    onClick={() => { onRestoreDefaultExcel(); setIsExcelOpen(false); }}
                    className="w-full text-left px-3.5 py-2 hover:bg-teal-50 text-teal-800 flex items-center space-x-2 transition border-t border-slate-100 cursor-pointer"
                  >
                    <FolderSync className="w-4 h-4 text-teal-600" />
                    <div>
                      <p className="font-semibold text-teal-900">Reload Default Excel Database</p>
                      <p className="text-[10px] text-teal-600">Restore records from OBGYN_Clinic_Database.xlsx</p>
                    </div>
                  </button>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".xlsx, .xls, .csv"
                    className="hidden"
                  />
                </div>
              )}
            </div>
          )}

          {/* Add Patient Button */}
          <button
            onClick={onAddPatient}
            className="bg-teal-600 hover:bg-teal-700 text-white px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg text-xs font-semibold shadow-xs transition flex items-center space-x-1.5 active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">New Patient</span>
            <span className="sm:hidden">+</span>
          </button>

          {/* USER PROFILE & CHANGE PASSWORD / LOGOUT DROPDOWN */}
          <div className="relative border-l border-slate-200 pl-1.5 sm:pl-3">
            <button
              onClick={() => { setIsProfileOpen(!isProfileOpen); setIsExcelOpen(false); }}
              className="flex items-center space-x-1 sm:space-x-2 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer active:scale-95 touch-manipulation"
              title="User Account & Logout"
              aria-label="User Account Menu"
            >
              <div className="w-8 h-8 rounded-full bg-teal-100 border border-teal-300 text-teal-800 flex items-center justify-center font-bold text-xs shadow-2xs shrink-0">
                {currentUser.avatar}
              </div>
              <div className="text-left leading-tight hidden md:block">
                <p className="text-xs font-semibold text-slate-800">{currentUser.fullName}</p>
                <p className="text-[10px] text-slate-500">{currentUser.title}</p>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-150 ${isProfileOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Backdrop Overlay to catch clicks outside dropdown */}
            {isProfileOpen && (
              <div
                className="fixed inset-0 z-40 bg-slate-900/10 sm:bg-transparent"
                onClick={() => setIsProfileOpen(false)}
              />
            )}

            {/* Profile Menu with CHANGE PASSWORD & LOGOUT */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-60 sm:w-56 bg-white rounded-xl shadow-2xl border border-slate-200 py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3.5 py-2.5 border-b border-slate-100 bg-slate-50">
                  <p className="font-bold text-slate-800 text-xs">{currentUser.fullName}</p>
                  <p className="text-[10px] text-teal-700 font-semibold mt-0.5">
                    {currentUser.role === 'DOCTOR' ? '👨‍⚕️ Lead Obstetrician' : '🩺 Clinic Assistant'}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    onChangePasswordClick();
                  }}
                  className="w-full text-left px-3.5 py-2.5 text-slate-700 hover:bg-teal-50 font-medium flex items-center space-x-2 transition cursor-pointer"
                >
                  <KeyRound className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Change Security PIN</span>
                </button>

                {!isNurse && (
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      onManageStaffClick();
                    }}
                    className="w-full text-left px-3.5 py-2.5 text-slate-700 hover:bg-teal-50 font-medium flex items-center space-x-2 transition border-t border-slate-100 cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Manage Staff Accounts</span>
                  </button>
                )}

                <div className="border-t border-slate-100 mt-1 pt-1">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left px-3.5 py-2.5 text-rose-600 hover:bg-rose-50 font-bold flex items-center space-x-2 transition cursor-pointer active:bg-rose-100"
                  >
                    <LogOut className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Logout of System</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

