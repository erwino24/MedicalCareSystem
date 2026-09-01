import React, { useState, useRef } from 'react';
import {
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
  Users,
  Menu,
  X,
  FileText
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
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
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
        {/* Left: Mobile Hamburger Toggle & Brand Logo */}
        <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
          {/* Mobile Sidebar Hamburger Button (md:hidden) */}
          <button
            onClick={() => setIsMobileDrawerOpen(true)}
            className="md:hidden p-1.5 text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer active:scale-95"
            title="Open Mobile Navigation Menu"
          >
            <Menu className="w-5 h-5 text-slate-700" />
          </button>

          {/* Brand & Logo - Click to go to Dashboard */}
          <button
            onClick={onSelectDashboard || onLogoClick}
            className="flex items-center space-x-2 sm:space-x-3 text-left focus:outline-none cursor-pointer group shrink min-w-0"
            title="Go to Clinic Dashboard"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-white border border-teal-200 shadow-2xs flex items-center justify-center shrink-0 group-hover:scale-105 transition p-0.5 overflow-hidden">
              <img
                src="/icon-svg.svg"
                alt="Medical Management System Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <h1 className="text-sm sm:text-base md:text-lg font-bold text-slate-800 tracking-tight whitespace-nowrap group-hover:text-teal-800 transition">
                  Medical <span className="text-teal-700 font-extrabold">Management System</span>
                </h1>
                <span className="bg-teal-50 text-teal-700 text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full border border-teal-200 hidden xl:inline-flex shrink-0">
                  {isNurse ? 'Clinical Assistant' : 'Medical Doctor'}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 hidden md:block truncate">
                Comprehensive Patient & Clinical Practice Management
              </p>
            </div>
          </button>
        </div>

        {/* Center / Right Nav Items */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          {/* Main Navigation Tabs - DESKTOP ONLY (hidden md:flex) */}
          <div className="hidden md:flex items-center space-x-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80 text-xs">
            {/* Dashboard Tab */}
            <button
              onClick={onSelectDashboard}
              className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-white text-teal-800 shadow-2xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
              title="Clinic Overview & Priority Dashboard"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-teal-600" />
              <span>Dashboard</span>
            </button>

            {/* Patients Directory Tab */}
            <button
              onClick={onSelectPatients}
              className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'patients'
                  ? 'bg-white text-teal-800 shadow-2xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
              title="View All Registered Patients"
            >
              <Users className="w-3.5 h-3.5 text-teal-600" />
              <span>Patients</span>
            </button>

            {/* Schedule Tab */}
            <button
              onClick={onSelectSchedule}
              className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'schedule'
                  ? 'bg-white text-teal-800 shadow-2xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
              title="Interactive Clinic Schedule & Calendar"
            >
              <CalendarIcon className="w-3.5 h-3.5 text-teal-600" />
              <span>Schedule</span>
            </button>
          </div>

          {/* EXCEL DATABASE STATUS BUTTON & DROPDOWN (ONLY VISIBLE FOR DOCTOR ON DESKTOP) */}
          {!isNurse && (
            <div className="relative hidden md:block">
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
                                setIsExcelOpen(false);
                              }}
                              className="text-rose-600 hover:text-rose-700 font-medium py-1 px-2 rounded text-[11px] transition cursor-pointer hover:bg-rose-50"
                            >
                              Disconnect Link
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Auto Download On Save Toggle (Fallback for Safari/Firefox/Mobile) */}
                  <div className="px-3.5 py-2.5 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-700 block">Auto-Download File</span>
                      <span className="text-[10px] text-slate-400">Download fresh .xlsx on patient saves</span>
                    </div>
                    <button
                      onClick={onToggleAutoDownload}
                      className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                        autoDownloadOnSave ? 'bg-emerald-600' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform ${
                          autoDownloadOnSave ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      onExportExcel();
                      setIsExcelOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center space-x-2 transition cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-800">Export / Download Master Excel</p>
                      <p className="text-[10px] text-slate-500">OBGYN_Clinic_Database.xlsx</p>
                    </div>
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center space-x-2 transition cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-teal-600 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-800">Import & Restore from Excel</p>
                      <p className="text-[10px] text-slate-500">Load patients from your .xlsx file</p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm('Reset clinic data to default sample database? Any unsaved local edits will be replaced.')) {
                        onRestoreDefaultExcel();
                        setIsExcelOpen(false);
                      }
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-amber-50 text-amber-800 flex items-center space-x-2 transition border-t border-slate-100 cursor-pointer"
                  >
                    <FolderSync className="w-4 h-4 text-amber-600 shrink-0" />
                    <div>
                      <p className="font-semibold">Reset to Default Sample Database</p>
                      <p className="text-[10px] text-amber-600/80">Reload default patient dataset</p>
                    </div>
                  </button>

                  <a
                    href="/MaternalCare_OBGYN_End_to_End_Features.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsExcelOpen(false)}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center space-x-2 transition border-t border-slate-100 cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-teal-600 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-800">Features Specification (PDF)</p>
                      <p className="text-[10px] text-slate-500">Download End-to-End System Manual</p>
                    </div>
                  </a>

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
            title="Register New Patient"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">New Patient</span>
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

      {/* MOBILE SLIDE-OUT SIDEBAR DRAWER (md:hidden) */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            onClick={() => setIsMobileDrawerOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
          />

          {/* Drawer Menu */}
          <div className="relative w-72 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-white border border-teal-200 shadow-2xs flex items-center justify-center shrink-0 p-0.5 overflow-hidden">
                  <img
                    src="/icon-svg.svg"
                    alt="Medical Management System"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-800 leading-tight">Medical Management</h2>
                  <span className="text-[10px] text-teal-700 font-bold uppercase tracking-wider">Clinical Practice</span>
                </div>
              </div>

              <button
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Info Card */}
            <div className="p-4 border-b border-slate-100 bg-teal-50/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                  {currentUser.avatar || currentUser.fullName.substring(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 text-sm truncate">{currentUser.fullName}</p>
                  <span className="text-[10px] bg-teal-100 text-teal-800 font-semibold px-2 py-0.5 rounded-full mt-0.5 inline-block">
                    {currentUser.role === 'DOCTOR' ? '👨‍⚕️ Lead Obstetrician' : '🩺 Clinical Assistant'}
                  </span>
                </div>
              </div>
            </div>

            {/* Main Navigation Links */}
            <div className="p-3 flex-1 overflow-y-auto space-y-1 text-sm font-medium">
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Menu Navigation
              </div>

              <button
                onClick={() => {
                  setIsMobileDrawerOpen(false);
                  onSelectDashboard();
                }}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition text-left cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-teal-50 text-teal-900 font-bold border border-teal-200 shadow-2xs'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Dashboard Overview</span>
              </button>

              <button
                onClick={() => {
                  setIsMobileDrawerOpen(false);
                  onSelectPatients();
                }}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition text-left cursor-pointer ${
                  activeTab === 'patients'
                    ? 'bg-teal-50 text-teal-900 font-bold border border-teal-200 shadow-2xs'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Users className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Patient Directory</span>
              </button>

              <button
                onClick={() => {
                  setIsMobileDrawerOpen(false);
                  onSelectSchedule();
                }}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition text-left cursor-pointer ${
                  activeTab === 'schedule'
                    ? 'bg-teal-50 text-teal-900 font-bold border border-teal-200 shadow-2xs'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <CalendarIcon className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Clinic Schedule & Calendar</span>
              </button>

              <button
                onClick={() => {
                  setIsMobileDrawerOpen(false);
                  onAddPatient();
                }}
                className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold transition text-left shadow-xs mt-2 cursor-pointer"
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span>+ Register New Patient</span>
              </button>

              {/* Doctor-Only Management Tools */}
              {!isNurse && (
                <div className="pt-3 border-t border-slate-100 mt-3 space-y-1">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Doctor Tools
                  </div>

                  <button
                    onClick={() => {
                      setIsMobileDrawerOpen(false);
                      onExportExcel();
                    }}
                    className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-slate-700 hover:bg-slate-50 text-left transition cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Export Excel Database</span>
                  </button>

                  <a
                    href="/MaternalCare_OBGYN_End_to_End_Features.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsMobileDrawerOpen(false)}
                    className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-slate-700 hover:bg-slate-50 text-left transition cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Features Specification (PDF)</span>
                  </a>
                </div>
              )}
            </div>

            {/* Drawer Footer / Account actions */}
            <div className="p-3 border-t border-slate-200 bg-slate-50 space-y-1 text-xs">
              <button
                onClick={() => {
                  setIsMobileDrawerOpen(false);
                  onChangePasswordClick();
                }}
                className="w-full flex items-center space-x-2.5 px-3 py-2 text-slate-700 hover:bg-slate-200 rounded-lg transition font-medium cursor-pointer"
              >
                <KeyRound className="w-4 h-4 text-slate-500 shrink-0" />
                <span>Change Security PIN</span>
              </button>

              <button
                onClick={() => {
                  setIsMobileDrawerOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center space-x-2.5 px-3 py-2 text-rose-600 hover:bg-rose-100 rounded-lg transition font-bold cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Logout of System</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

