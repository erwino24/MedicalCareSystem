import { useState } from 'react';
import type { PractitionerUser } from '../types/patient';
import { X, Users, UserPlus, Trash2, ShieldCheck, KeyRound } from 'lucide-react';

interface ManageStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: PractitionerUser[];
  onAddUser: (newUser: PractitionerUser) => void;
  onDeleteUser: (userId: string) => void;
  currentUser: PractitionerUser;
}

export const ManageStaffModal: React.FC<ManageStaffModalProps> = ({
  isOpen,
  onClose,
  users,
  onAddUser,
  onDeleteUser,
  currentUser,
}) => {
  const [fullName, setFullName] = useState('');
  const [title, setTitle] = useState('RN');
  const [role, setRole] = useState<'DOCTOR' | 'NURSE'>('NURSE');
  const [pinCode, setPinCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Full Name is required');
      return;
    }
    if (!pinCode || pinCode.length < 4) {
      setErrorMsg('PIN Code must be at least 4 digits');
      return;
    }

    const initials = fullName
      .trim()
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    const newUser: PractitionerUser = {
      id: `usr-${Date.now()}`,
      fullName: fullName.trim(),
      title: title.trim() || (role === 'NURSE' ? 'RN' : 'MD'),
      role,
      pinCode: pinCode.trim(),
      avatar: initials || (role === 'NURSE' ? 'RN' : 'DR'),
    };

    onAddUser(newUser);
    setSuccessMsg(`Added ${newUser.fullName} (${newUser.role}) successfully!`);

    // Reset form
    setFullName('');
    setTitle('RN');
    setPinCode('');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto font-sans">
      <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-teal-600 text-white rounded-xl shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Manage Clinic Staff Accounts</h3>
              <p className="text-xs text-slate-500">Create new Nurse or Doctor accounts synced to Excel</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 text-xs max-h-[80vh] overflow-y-auto">
          {/* Current Staff List */}
          <div>
            <h4 className="font-bold text-slate-800 text-sm mb-2 flex items-center justify-between">
              <span>Active Practitioner Profiles ({users.length})</span>
              <span className="text-[11px] font-normal text-slate-500">Synced to `Practitioner Accounts` tab</span>
            </h4>

            <div className="space-y-2">
              {users.map((u) => {
                const isCurrent = u.id === currentUser.id;
                return (
                  <div
                    key={u.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-teal-100 border border-teal-300 text-teal-800 font-bold flex items-center justify-center text-xs">
                        {u.avatar}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-bold text-slate-900 text-xs">{u.fullName}</p>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                              u.role === 'DOCTOR'
                                ? 'bg-teal-50 text-teal-700 border-teal-200'
                                : 'bg-purple-50 text-purple-700 border-purple-200'
                            }`}
                          >
                            {u.role} • {u.title}
                          </span>
                          {isCurrent && (
                            <span className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 font-mono flex items-center space-x-1 mt-0.5">
                          <KeyRound className="w-3 h-3 text-slate-400" />
                          <span>PIN: {u.pinCode}</span>
                        </p>
                      </div>
                    </div>

                    {!isCurrent && users.length > 1 && (
                      <button
                        onClick={() => onDeleteUser(u.id)}
                        className="text-slate-400 hover:text-rose-600 p-1.5 rounded hover:bg-rose-50 transition"
                        title="Remove staff profile"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add New Staff Form */}
          <div className="bg-teal-50/60 border border-teal-200 rounded-2xl p-5 space-y-3">
            <h4 className="font-bold text-teal-950 text-sm flex items-center space-x-1.5">
              <UserPlus className="w-4 h-4 text-teal-700" />
              <span>Register New Nurse or Doctor</span>
            </h4>

            {errorMsg && (
              <div className="bg-rose-50 text-rose-700 border border-rose-200 p-2.5 rounded-xl font-medium">
                ⚠️ {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 p-2.5 rounded-xl font-bold flex items-center space-x-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Staff Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nurse Angela Ramos"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Role Type</label>
                  <select
                    value={role}
                    onChange={(e) => {
                      const r = e.target.value as 'DOCTOR' | 'NURSE';
                      setRole(r);
                      setTitle(r === 'NURSE' ? 'RN' : 'MD');
                    }}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-semibold focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="NURSE">Assistant Nurse (RN - Limited Access)</option>
                    <option value="DOCTOR">Lead Obstetrician (MD - Full Access)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Professional Title</label>
                  <input
                    type="text"
                    placeholder="e.g. RN, BSN or FPOGS, MD"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Initial Security PIN (4+ digits) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="e.g. 5678"
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-mono focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2 rounded-xl shadow-xs transition flex items-center space-x-1.5 active:scale-95 text-xs"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Create Staff Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
