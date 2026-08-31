import React, { useState } from 'react';
import type { PractitionerUser } from '../types/patient';
import { HeartPulse, ShieldCheck, UserCheck, Stethoscope, ArrowRight, KeyRound } from 'lucide-react';

interface LoginScreenProps {
  users: PractitionerUser[];
  onLoginSuccess: (user: PractitionerUser) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ users, onLoginSuccess }) => {
  const [selectedRole, setSelectedRole] = useState<'DOCTOR' | 'NURSE'>('DOCTOR');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [pin, setPin] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

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

  return (
    <div className="min-h-screen w-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Login Card */}
      <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-2xl p-6 sm:p-8 relative z-10 space-y-6">
        {/* Branding Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-gradient-to-tr from-teal-600 to-cyan-500 text-white rounded-2xl mx-auto shadow-lg flex items-center justify-center">
            <HeartPulse className="w-9 h-9 animate-pulse" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-3">MaternalCare OB-GYN</h1>
          <p className="text-xs text-slate-500 font-medium">Clinic Management System • Secured Portal</p>
        </div>

        {/* Role Toggle Tabs */}
        <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1.5 rounded-2xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => handleRoleChange('DOCTOR')}
            className={`py-2.5 rounded-xl transition flex items-center justify-center space-x-1.5 ${
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
            className={`py-2.5 rounded-xl transition flex items-center justify-center space-x-1.5 ${
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
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl text-sm shadow-md transition flex items-center justify-center space-x-2 active:scale-98"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Sign In to Clinic System</span>
            <ArrowRight className="w-4 h-4" />
          </button>
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
                className="text-[11px] bg-slate-100 hover:bg-teal-50 hover:text-teal-900 text-slate-700 font-medium px-2.5 py-1 rounded-lg border border-slate-200 transition"
              >
                {u.role === 'DOCTOR' ? '👩‍⚕️' : '🧑‍⚕️'} {u.fullName.split(' ')[0]} (PIN: {u.pinCode})
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
