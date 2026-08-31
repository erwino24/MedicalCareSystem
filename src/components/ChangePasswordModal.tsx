import { useState } from 'react';
import type { PractitionerUser } from '../types/patient';
import { X, KeyRound, CheckCircle2, ShieldCheck } from 'lucide-react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: PractitionerUser;
  onChangePin: (newPin: string) => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onChangePin,
}) => {
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Validate Current PIN
    if (currentPinInput !== currentUser.pinCode) {
      setErrorMsg('Current Security PIN is incorrect.');
      return;
    }

    if (!newPinInput || newPinInput.length < 4) {
      setErrorMsg('New PIN must be at least 4 digits/characters.');
      return;
    }

    if (newPinInput !== confirmPinInput) {
      setErrorMsg('New PIN and Confirmation PIN do not match.');
      return;
    }

    onChangePin(newPinInput);
    setSuccessMsg('Security PIN updated successfully!');

    setTimeout(() => {
      onClose();
      setCurrentPinInput('');
      setNewPinInput('');
      setConfirmPinInput('');
      setSuccessMsg('');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto font-sans">
      <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-md shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-teal-600 text-white rounded-xl shadow-xs">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Change Security PIN</h3>
              <p className="text-xs text-slate-500">Update password for {currentUser.fullName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="bg-rose-50 text-rose-700 border border-rose-200 p-3 rounded-xl font-medium text-center">
              ⚠️ {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 p-3 rounded-xl font-bold text-center flex items-center justify-center space-x-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Current PIN / Password</label>
            <input
              type="password"
              required
              placeholder="Enter current PIN"
              value={currentPinInput}
              onChange={(e) => setCurrentPinInput(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-teal-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">New PIN / Password</label>
            <input
              type="password"
              required
              placeholder="Enter new 4+ digit PIN"
              value={newPinInput}
              onChange={(e) => setNewPinInput(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-teal-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Confirm New PIN / Password</label>
            <input
              type="password"
              required
              placeholder="Re-enter new PIN"
              value={confirmPinInput}
              onChange={(e) => setConfirmPinInput(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-teal-500 focus:bg-white"
            />
          </div>

          <p className="text-[11px] text-slate-400 italic">
            Note: Changing your PIN here will also save to your local browser database and export into your Excel database backup file (`Practitioner Accounts` tab).
          </p>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs transition flex items-center space-x-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Update PIN</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
