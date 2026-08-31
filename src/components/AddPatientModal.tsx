import { useState } from 'react';
import type { Patient } from '../types/patient';
import { X, UserPlus, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPatient: (newPatient: Patient) => void;
}

export const AddPatientModal: React.FC<AddPatientModalProps> = ({
  isOpen,
  onClose,
  onAddPatient,
}) => {
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState<number | ''>(26);
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [bloodType, setBloodType] = useState('O+');
  const [gravida, setGravida] = useState<number>(1);
  const [para, setPara] = useState<number>(0);
  const [lmp, setLmp] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [illnessHistory, setIllnessHistory] = useState('');
  const [allergies, setAllergies] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    const newPatient: Patient = {
      id: `pat-${Date.now()}`,
      fullName: fullName.trim(),
      age: Number(age) || 25,
      contactNumber: contactNumber.trim() || 'N/A',
      email: email.trim() || 'N/A',
      address: address.trim() || 'N/A',
      emergencyContact: emergencyContact.trim() || 'N/A',
      bloodType,
      gravida: Number(gravida),
      para: Number(para),
      lmp,
      illnessHistory: illnessHistory.trim() || 'No relevant medical history reported.',
      allergies: allergies.trim() || undefined,
      checkups: [],
    };

    onAddPatient(newPatient);
    onClose();

    // Reset form
    setFullName('');
    setAge(26);
    setContactNumber('');
    setEmail('');
    setAddress('');
    setEmergencyContact('');
    setBloodType('O+');
    setGravida(1);
    setPara(0);
    setLmp(format(new Date(), 'yyyy-MM-dd'));
    setIllnessHistory('');
    setAllergies('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-teal-600 text-white rounded-xl shadow-xs">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Register New OB-GYN Patient</h3>
              <p className="text-xs text-slate-500">Add patient demographics and initial LMP for AOG tracking</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Maria Santos"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-teal-500 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Age (Years)</label>
                <input
                  type="number"
                  required
                  value={age}
                  onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-teal-500 focus:bg-white"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Blood Type</label>
                <select
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-teal-500 focus:bg-white"
                >
                  {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Contact Number</label>
              <input
                type="text"
                placeholder="+63 9XX XXX XXXX"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-teal-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Email Address</label>
              <input
                type="email"
                placeholder="patient@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-teal-500 focus:bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-700 block mb-1">Complete Address</label>
              <input
                type="text"
                placeholder="House No., Street, Barangay, City"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-teal-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Emergency Contact & Phone</label>
              <input
                type="text"
                placeholder="Name & Relationship (Phone)"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-teal-500 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Gravida (G)</label>
                <input
                  type="number"
                  min="1"
                  value={gravida}
                  onChange={(e) => setGravida(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-teal-500 focus:bg-white"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Para (P)</label>
                <input
                  type="number"
                  min="0"
                  value={para}
                  onChange={(e) => setPara(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-teal-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="sm:col-span-2 bg-teal-50 p-3.5 rounded-xl border border-teal-200">
              <label className="font-bold text-teal-900 block mb-1 flex items-center space-x-1.5">
                <Calendar className="w-4 h-4 text-teal-600" />
                <span>Last Menstrual Period (LMP)</span>
              </label>
              <input
                type="date"
                required
                value={lmp}
                onChange={(e) => setLmp(e.target.value)}
                className="bg-white border border-teal-300 rounded-lg p-2 text-xs font-semibold text-teal-900 focus:ring-2 focus:ring-teal-500"
              />
              <p className="text-[11px] text-teal-700 mt-1">
                Used to automatically compute Age of Gestation (AOG) & Estimated Due Date (EDD).
              </p>
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-700 block mb-1">Illness & Medical History</label>
              <textarea
                rows={2}
                placeholder="Pre-existing conditions, past surgeries, obstetric risk factors..."
                value={illnessHistory}
                onChange={(e) => setIllnessHistory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-teal-500 focus:bg-white resize-none"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl shadow-xs transition"
            >
              Save & Register Patient
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
