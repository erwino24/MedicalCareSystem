import React, { useState } from 'react';
import type { PractitionerUser } from '../types/patient';
import { ShieldCheck, UserCheck, Stethoscope, ArrowRight, KeyRound, UserPlus, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface LoginScreenProps {
  users: PractitionerUser[];
  onLoginSuccess: (user: PractitionerUser) => void;
  onRegisterUser?: (newUser: PractitionerUser) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ users, onLoginSuccess, onRegisterUser }) => {
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<'DOCTOR' | 'NURSE'>('DOCTOR');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [pin, setPin] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Register Form State
  const [regFullName, setRegFullName] = useState<string>('');
  const [regRole, setRegRole] = useState<'DOCTOR' | 'NURSE'>('NURSE');
  const [regTitle, setRegTitle] = useState<string>('RN');
  const [regPin, setRegPin] = useState<string>('');
  const [regConfirmPin, setRegConfirmPin] = useState<string>('');
  const [regError, setRegError] = useState<string>('');

  const roleUsers = users.filter((u) => u.role === selectedRole);
  const activePractitioner = roleUsers.find((u) => u.id === selectedUserId) || roleUsers[0] || users[0];

  const handleRoleChange = (role: 'DOCTOR' | 'NURSE') => {
    setSelectedRole(role);
    setErrorMessage('');
    const matching = users.filter((u) => u.role === role);
    if (matching.length > 0) {
      setSelectedUserId(matching[0].id);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!pin.trim()) {
      setErrorMessage(`Please enter your Security PIN for ${activePractitioner.fullName}.`);
      return;
    }

    if (pin.trim() === String(activePractitioner.pinCode).trim()) {
      onLoginSuccess(activePractitioner);
    } else {
      setErrorMessage(`Incorrect Security PIN for ${activePractitioner.fullName}. Please try again.`);
    }
  };

  const handleQuickFillPin = (user: PractitionerUser) => {
    setPin(user.pinCode);
    setErrorMessage('');
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regFullName.trim()) {
      setRegError('Please enter the practitioner’s full name.');
      return;
    }

    if (!regPin || regPin.length < 4) {
      setRegError('Security PIN must be at least 4 digits.');
      return;
    }

    if (regPin !== regConfirmPin) {
      setRegError('PIN and Confirmation PIN do not match.');
      return;
    }

    const initials = regFullName
      .trim()
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    const newUser: PractitionerUser = {
      id: `usr-${Date.now()}`,
      fullName: regFullName.trim(),
      title: regTitle.trim() || (regRole === 'NURSE' ? 'RN' : 'MD'),
      role: regRole,
      pinCode: regPin.trim(),
      avatar: initials || (regRole === 'NURSE' ? 'RN' : 'DR'),
    };

    if (onRegisterUser) {
      onRegisterUser(newUser);
    } else {
      onLoginSuccess(newUser);
    }
  };

  return (
    <div
      className="min-h-screen w-screen flex items-center justify-center p-4 relative overflow-hidden font-sans bg-slate-900 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/bg.jpg'), url('/bg.jfif')" }}
    >
      {/* Soft gradient & frosted backdrop overlay for readability */}
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Card with elegant glassmorphism shadow */}
      <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl border border-white/80 shadow-[0_25px_60px_rgba(15,23,42,0.35)] p-6 sm:p-8 relative z-10 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Branding Header */}
        <div className="text-center space-y-2">
          <div className="w-18 h-18 mx-auto shadow-md rounded-full flex items-center justify-center p-1 bg-white border border-teal-200">
            <img
              src="/icon-svg.svg"
              alt="Medical Management System Logo"
              className="w-full h-full object-contain drop-shadow-xs"
            />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-3">Medical Management System</h1>
          <p className="text-xs text-slate-500 font-medium">
            {isRegisterMode ? 'Staff Registration • Practitioner Portal' : 'Patient & Clinical Practice Portal • Secured'}
          </p>
        </div>

        {isRegisterMode ? (
          /* ================= REGISTER NEW DOCTOR / NURSE VIEW ================= */
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <UserPlus className="w-4 h-4 text-teal-600" />
                <h2 className="font-bold text-slate-800 text-sm">Register New Practitioner</h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(false);
                  setRegError('');
                }}
                className="text-xs text-teal-700 hover:text-teal-900 font-bold flex items-center space-x-1 cursor-pointer hover:underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Login</span>
              </button>
            </div>

            {regError && (
              <div className="bg-rose-50 text-rose-700 border border-rose-200 p-2.5 rounded-xl text-xs font-medium text-center">
                ⚠️ {regError}
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
              {/* Role Selection */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Account Role</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRegRole('NURSE');
                      setRegTitle('RN');
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                      regRole === 'NURSE'
                        ? 'bg-purple-600 text-white border-purple-700 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Nurse / Assistant</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRegRole('DOCTOR');
                      setRegTitle('MD, FPOGS');
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                      regRole === 'DOCTOR'
                        ? 'bg-teal-600 text-white border-teal-700 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Stethoscope className="w-4 h-4" />
                    <span>Lead Doctor</span>
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={regRole === 'DOCTOR' ? 'e.g. Dr. Amanda Lopez' : 'e.g. Nurse Grace Santos'}
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-semibold focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
                />
              </div>

              {/* Professional Title */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Professional Title / Suffix
                </label>
                <input
                  type="text"
                  placeholder={regRole === 'DOCTOR' ? 'MD, FPOGS' : 'RN, BSN'}
                  value={regTitle}
                  onChange={(e) => setRegTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-semibold focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
                />
              </div>

              {/* Security PIN & Confirm PIN */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Security PIN (4+ digits) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="e.g. 5678"
                    value={regPin}
                    onChange={(e) => setRegPin(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-mono focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Confirm PIN <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Re-enter PIN"
                    value={regConfirmPin}
                    onChange={(e) => setRegConfirmPin(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-mono focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl text-xs shadow-md transition flex items-center justify-center space-x-2 active:scale-98 cursor-pointer mt-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Register & Sign In Immediately</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(false);
                  setRegError('');
                }}
                className="w-full py-2 text-slate-500 hover:text-slate-700 text-xs font-medium transition cursor-pointer"
              >
                Cancel and return to Sign In
              </button>
            </form>
          </div>
        ) : (
          /* ================= SIGN IN VIEW ================= */
          <>
            {/* Role Toggle Tabs */}
            <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1.5 rounded-2xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => handleRoleChange('DOCTOR')}
                className={`py-2.5 rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                  selectedRole === 'DOCTOR'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Stethoscope className="w-4 h-4" />
                <span>Doctor Login</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('NURSE')}
                className={`py-2.5 rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                  selectedRole === 'NURSE'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Assistant / Nurse</span>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              {errorMessage && (
                <div className="bg-rose-50 text-rose-700 border border-rose-200 p-3 rounded-xl font-medium text-center">
                  ⚠️ {errorMessage}
                </div>
              )}

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Select Practitioner Profile
                </label>
                {roleUsers.length > 1 ? (
                  <select
                    value={activePractitioner.id}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-semibold focus:ring-2 focus:ring-teal-500"
                  >
                    {roleUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.fullName} ({u.title})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-sm">
                      {activePractitioner.avatar}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">
                        {activePractitioner.fullName}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {activePractitioner.role === 'DOCTOR' ? `Lead Obstetrician (${activePractitioner.title})` : `Clinical Assistant (${activePractitioner.title})`}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Security PIN / Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder={`PIN (Default: ${activePractitioner.pinCode})`}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1 italic">
                  Credential synced from Excel Database (`Practitioner Accounts` tab).
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl text-sm shadow-md transition flex items-center justify-center space-x-2 active:scale-98 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Sign In to Clinic System</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Register a Nurse or New Doctor Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisterMode(true);
                    setRegRole(selectedRole);
                    setRegTitle(selectedRole === 'DOCTOR' ? 'MD, FPOGS' : 'RN');
                  }}
                  className="w-full bg-slate-50 hover:bg-teal-50 text-teal-800 border border-teal-200 font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center space-x-1.5 cursor-pointer active:scale-98 shadow-2xs"
                >
                  <UserPlus className="w-3.5 h-3.5 text-teal-600" />
                  <span>+ Register a Nurse or New Doctor</span>
                </button>
              </div>
            </form>

            {/* Quick Demo PIN Helper */}
            <div className="pt-4 border-t border-slate-100 text-center space-y-2">
              <p className="text-[11px] text-slate-400 font-medium">Default Accounts (Saved in Excel Database):</p>
              <div className="flex flex-wrap justify-center gap-1.5">
                {users.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      setSelectedRole(u.role);
                      setSelectedUserId(u.id);
                      handleQuickFillPin(u);
                    }}
                    className="text-[11px] bg-slate-100 hover:bg-teal-50 hover:text-teal-900 text-slate-700 font-medium px-2.5 py-1 rounded-lg border border-slate-200 transition cursor-pointer"
                  >
                    {u.role === 'DOCTOR' ? '👩‍⚕️' : '🧑‍⚕️'} {u.fullName.split(' ')[0]} (PIN: {u.pinCode})
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
