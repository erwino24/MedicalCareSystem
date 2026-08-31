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
  FolderSync
} from 'lucide-react';
import { format } from 'date-fns';
import type { PractitionerUser } from '../types/patient';
import { isFileSystemAccessSupported } from '../utils/excelService';

interface NavbarProps {
  currentUser: PractitionerUser;
  onLogout: () => void;
  onChangePasswordClick: () => void;
  onAddPatient: () => void;
  onSelectSchedule: () => void;
  onExportExcel: () => void;
  onImportExcel: (file: File) => void;
  isScheduleActive: boolean;
  totalPatientsCount: number;
  totalAppointmentsCount: number;
  isExcelLinked: boolean;
  linkedFileName: string | null;
  autoDownloadOnSave: boolean;
  onToggleAutoDownload: () => void;
  onConnectLocalFile: () => void;
  onDisconnectLocalFile: () => void;
  onRestoreDefaultExcel: () => void;
  onManageStaffClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onLogout,
  onChangePasswordClick,
  onAddPatient,
  onSelectSchedule,
  onExportExcel,
  onImportExcel,
  isScheduleActive,
  totalPatientsCount,
  totalAppointmentsCount,
  isExcelLinked,
  linkedFileName,
  autoDownloadOnSave,
  onToggleAutoDownload,
  onConnectLocalFile,
  onDisconnectLocalFile,
  onRestoreDefaultExcel,
  onManageStaffClick,
}) => {
  const todayFormatted = format(new Date(), 'EEEE, MMMM d, yyyy');
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
    <header className="bg-white border-b border-slate-200 shrink-0 shadow-xs z-30 relative font-sans">
      <div className="px-4 py-2.5 sm:px-6 flex items-center justify-between">
        {/* Brand & Logo */}
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-tr from-teal-600 to-cyan-500 text-white p-2.5 rounded-xl shadow-sm flex items-center justify-center">
            <HeartPulse className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-slate-800 tracking-tight">MaternalCare OB-GYN</h1>
              <span className="bg-teal-50 text-teal-700 text-xs font-semibold px-2 py-0.5 rounded-full border border-teal-200">
                Excel Database Ready
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Obstetrics & Gynecology Patient Management System
            </p>
          </div>
        </div>

        {/* Center Stats */}
        <div className="hidden lg:flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/80 text-xs">
            <CalendarIcon className="w-3.5 h-3.5 text-teal-600" />
            <span className="font-medium text-slate-700">{todayFormatted}</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/80 text-xs">
            <UserCheck className="w-3.5 h-3.5 text-teal-600" />
            <span><strong className="text-slate-900">{totalPatientsCount}</strong> Patients</span>
            <span className="text-slate-300">•</span>
            <span><strong className="text-slate-900">{totalAppointmentsCount}</strong> Visits</span>
          </div>
        </div>

        {/* Right Actions, Excel Menu & User Profile */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* EXCEL DATABASE STATUS BUTTON & DROPDOWN */}
          <div className="relative">
            <button
              onClick={() => { setIsExcelOpen(!isExcelOpen); setIsProfileOpen(false); }}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition flex items-center space-x-1.5 border shadow-2xs ${
                isExcelLinked
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-400'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
              }`}
              title="Excel Database Settings and Live Sync"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">
                {isExcelLinked ? `🟢 Auto-Saving: ${linkedFileName || 'Excel'}` : 'Excel Database'}
              </span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {isExcelOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 text-xs animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3.5 py-2.5 border-b border-slate-100 bg-slate-50/80">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-slate-800 flex items-center space-x-1.5">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                      <span>Excel Database Sync</span>
                    </p>
                    {isExcelLinked ? (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-emerald-300 flex items-center space-x-0.5">
                        <CheckCircle className="w-2.5 h-2.5" />
                        <span>Connected</span>
                      </span>
                    ) : (
                      <span className="bg-slate-200 text-slate-700 text-[10px] font-medium px-1.5 py-0.5 rounded">
                        Browser Memory
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    All patient details, checkups, schedules, and practitioner PINs are saved in multi-sheet Excel format.
                  </p>
                </div>

                {/* Direct Disk Link Option (File System Access API) */}
                {hasFSAccess && (
                  <div className="px-3 py-2 border-b border-slate-100 bg-emerald-50/40">
                    {!isExcelLinked ? (
                      <button
                        onClick={() => {
                          onConnectLocalFile();
                          setIsExcelOpen(false);
                        }}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-3 rounded-lg flex items-center justify-center space-x-1.5 shadow-xs transition text-xs"
                      >
                        <HardDrive className="w-3.5 h-3.5" />
                        <span>Link Local Excel File (Live Disk Save)</span>
                      </button>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] text-emerald-900 font-medium">
                          <span className="truncate">File: <strong>{linkedFileName}</strong></span>
                        </div>
                        <div className="flex space-x-1.5">
                          <button
                            onClick={() => {
                              onExportExcel();
                              setIsExcelOpen(false);
                            }}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-1 px-2 rounded text-[11px] transition"
                          >
                            Save Now
                          </button>
                          <button
                            onClick={() => {
                              onDisconnectLocalFile();
                            }}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium py-1 px-2 rounded text-[11px] transition"
                          >
                            Disconnect
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Auto-download Toggle */}
                <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
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
                  className="w-full text-left px-3.5 py-2 hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 flex items-center space-x-2 transition"
                >
                  <Download className="w-4 h-4 text-emerald-600" />
                  <div>
                    <p className="font-semibold text-slate-800">Export / Download Excel (.xlsx)</p>
                    <p className="text-[10px] text-slate-400">Save multi-sheet file with all current data</p>
                  </div>
                </button>

                {!isNurse ? (
                  <>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full text-left px-3.5 py-2 hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 flex items-center space-x-2 transition"
                    >
                      <Upload className="w-4 h-4 text-teal-600" />
                      <div>
                        <p className="font-semibold text-slate-800">Import Custom Excel Database</p>
                        <p className="text-[10px] text-slate-400">Upload & restore from any .xlsx file</p>
                      </div>
                    </button>

                    <button
                      onClick={() => { onRestoreDefaultExcel(); setIsExcelOpen(false); }}
                      className="w-full text-left px-3.5 py-2 hover:bg-teal-50 text-teal-800 flex items-center space-x-2 transition border-t border-slate-100"
                    >
                      <FolderSync className="w-4 h-4 text-teal-600" />
                      <div>
                        <p className="font-semibold text-teal-900">Reload Default Excel Database</p>
                        <p className="text-[10px] text-teal-600">Restore records from OBGYN_Clinic_Database.xlsx</p>
                      </div>
                    </button>
                  </>
                ) : (
                  <div className="px-3.5 py-2 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 italic">
                    🔒 Full Database Import / Reset is restricted to Lead Doctor.
                  </div>
                )}

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

          {/* Schedule Button */}
          <button
            onClick={onSelectSchedule}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition flex items-center space-x-1.5 border ${
              isScheduleActive
                ? 'bg-teal-50 text-teal-700 border-teal-200 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5 text-teal-600" />
            <span className="hidden md:inline">Schedule</span>
          </button>

          {/* Add Patient Button */}
          <button
            onClick={onAddPatient}
            className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-2 rounded-lg text-xs font-medium shadow-xs transition flex items-center space-x-1.5 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">New Patient</span>
            <span className="sm:hidden">Add</span>
          </button>

          {/* USER PROFILE & CHANGE PASSWORD / LOGOUT DROPDOWN */}
          <div className="relative border-l border-slate-200 pl-2 sm:pl-3">
            <button
              onClick={() => { setIsProfileOpen(!isProfileOpen); setIsExcelOpen(false); }}
              className="flex items-center space-x-2 p-1 rounded-xl hover:bg-slate-100 transition"
            >
              <div className="w-7 h-7 rounded-full bg-teal-100 border border-teal-300 text-teal-800 flex items-center justify-center font-bold text-xs shadow-2xs">
                {currentUser.avatar}
              </div>
              <div className="text-left leading-tight hidden md:block">
                <p className="text-xs font-semibold text-slate-800">{currentUser.fullName}</p>
                <p className="text-[10px] text-slate-500">{currentUser.title}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Profile Menu with CHANGE PASSWORD & LOGOUT */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 text-xs animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-slate-100 bg-slate-50">
                  <p className="font-bold text-slate-800">{currentUser.fullName}</p>
                  <p className="text-[10px] text-teal-700 font-medium">{currentUser.role === 'DOCTOR' ? 'Lead Obstetrician' : 'Clinic Assistant'}</p>
                </div>

                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    onChangePasswordClick();
                  }}
                  className="w-full text-left px-3 py-2 text-slate-700 hover:bg-teal-50 font-medium flex items-center space-x-2 transition"
                >
                  <KeyRound className="w-4 h-4 text-teal-600" />
                  <span>Change Security PIN / Password</span>
                </button>

                {!isNurse && (
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      onManageStaffClick();
                    }}
                    className="w-full text-left px-3 py-2 text-slate-700 hover:bg-teal-50 font-medium flex items-center space-x-2 transition border-t border-slate-100"
                  >
                    <UserCheck className="w-4 h-4 text-teal-600" />
                    <span>Manage Staff & Nurse Accounts</span>
                  </button>
                )}

                <div className="border-t border-slate-100 mt-1 pt-1">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 font-semibold flex items-center space-x-2 transition"
                  >
                    <LogOut className="w-4 h-4 text-rose-600" />
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

