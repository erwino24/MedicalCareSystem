import { useState } from 'react';
import type { Patient, PatientCareType } from '../types/patient';
import { X, UserPlus, Calendar, Stethoscope, Activity } from 'lucide-react';
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
  const [careType, setCareType] = useState<PatientCareType>('Pregnant');
  const [age, setAge] = useState<number | ''>(26);
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactNumber, setEmergencyContactNumber] = useState('');
  const [emergencyContactAddress, setEmergencyContactAddress] = useState('');
  const [bloodType, setBloodType] = useState('O+');
  const [gravida, setGravida] = useState<number>(1);
  const [para, setPara] = useState<number>(0);
  const [lmp, setLmp] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [illnessHistory, setIllnessHistory] = useState('');
  const [allergies, setAllergies] = useState('');

  if (!isOpen) return null;

  const isPregnant = careType === 'Pregnant';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    const formattedEmergency = emergencyContactName.trim() && emergencyContactNumber.trim()
      ? `${emergencyContactName.trim()} - ${emergencyContactNumber.trim()}`
      : emergencyContactName.trim() || emergencyContactNumber.trim() || 'N/A';

    const newPatient: Patient = {
      id: `pat-${Date.now()}`,
      fullName: fullName.trim(),
      careType,
      age: Number(age) || 25,
      contactNumber: contactNumber.trim() || 'N/A',
      email: email.trim() || 'N/A',
      address: address.trim() || 'N/A',
      emergencyContact: formattedEmergency,
      emergencyContactName: emergencyContactName.trim() || undefined,
      emergencyContactNumber: emergencyContactNumber.trim() || undefined,
      emergencyContactAddress: emergencyContactAddress.trim() || undefined,
      bloodType,
      gravida: isPregnant ? Number(gravida) : 0,
      para: isPregnant ? Number(para) : 0,
      lmp: isPregnant ? lmp : format(new Date(), 'yyyy-MM-dd'),
      illnessHistory: illnessHistory.trim() || (isPregnant ? 'No obstetric risk factors reported.' : 'Consultation for general medical assessment.'),
      allergies: allergies.trim() || undefined,
      status: 'Active',
      checkups: [],
    };

    onAddPatient(newPatient);
    onClose();

    // Reset form
    setFullName('');
    setCareType('Pregnant');
    setAge(26);
    setContactNumber('');
    setEmail('');
    setAddress('');
    setEmergencyContactName('');
    setEmergencyContactNumber('');
    setEmergencyContactAddress('');
    setBloodType('O+');
    setGravida(1);
    setPara(0);
    setLmp(format(new Date(), 'yyyy-MM-dd'));
    setIllnessHistory('');
    setAllergies('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto font-sans">
      <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-4xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-teal-600 text-white rounded-xl shadow-xs">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                {isPregnant ? 'Register New Pregnant / OB-GYN Patient' : `Register ${careType} Patient`}
              </h3>
              <p className="text-xs text-slate-500">
                {isPregnant
                  ? 'Add patient demographics and initial LMP for AOG & EDD tracking'
                  : 'Add patient profile, contact details, and clinical intake notes'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs">
          {/* Patient Care Category / Type Selector (Full Width) */}
          <div className="bg-gradient-to-r from-teal-50/90 to-cyan-50/90 border border-teal-200 p-3 rounded-2xl space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-1.5 text-teal-950 font-bold text-xs">
                <Activity className="w-3.5 h-3.5 text-teal-700" />
                <span>Clinical Care Category / Patient Type</span>
              </span>
              <span className="text-[10px] text-teal-700 bg-teal-100/80 px-2 py-0.5 rounded-full font-semibold">
                Multi-Specialty & OB-GYN
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {[
                { id: 'Pregnant', label: '🤰 Pregnant (OB-GYN)', desc: 'LMP & EDD' },
                { id: 'Pediatric / Baby Care', label: '👶 Pediatric / Baby', desc: 'Child Growth' },
                { id: 'Anti-Rabies / Animal Bite', label: '🐕 Anti-Rabies', desc: 'Vaccine Series' },
                { id: 'Vaccination / Immunization', label: '💉 Vaccine / Booster', desc: 'Immunization' },
                { id: 'Dengue / Fever', label: '🦟 Dengue / Fever', desc: 'Hydration & Vitals' },
                { id: 'General Illness', label: '🤒 General Illness', desc: 'Fever, Flu, OPD' },
                { id: 'Chronic Care', label: '🩺 Chronic Care', desc: 'BP & Diabetes' },
                { id: 'Routine Checkup', label: '🏥 Routine Checkup', desc: 'General Wellness' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCareType(cat.id as PatientCareType)}
                  className={`p-1.5 sm:p-2 rounded-xl text-left border transition cursor-pointer flex flex-col justify-between ${
                    careType === cat.id
                      ? 'bg-teal-600 text-white border-teal-700 shadow-xs ring-2 ring-teal-500/20'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="font-bold text-[11px] leading-tight">{cat.label}</span>
                  <span className={`text-[9px] line-clamp-1 ${careType === cat.id ? 'text-teal-100' : 'text-slate-400'}`}>
                    {cat.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* TWO-COLUMN FORM LAYOUT */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* LEFT COLUMN: Patient Personal & Contact Info */}
            <div className="space-y-3">
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
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-teal-500 focus:bg-white font-medium text-slate-900"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Age (Years)</label>
                  <input
                    type="number"
                    required
                    value={age}
                    onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-teal-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Blood Type</label>
                  <select
                    value={bloodType}
                    onChange={(e) => setBloodType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-teal-500 focus:bg-white"
                  >
                    {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Contact</label>
                  <input
                    type="text"
                    placeholder="+63 9XX"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-teal-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="patient@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-teal-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Home Address</label>
                <input
                  type="text"
                  placeholder="Block/Lot, Barangay, Municipality/City"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-teal-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  {isPregnant ? 'Illness & Medical History' : 'Chief Complaint / Medical History'}
                </label>
                <textarea
                  rows={2}
                  placeholder={
                    isPregnant
                      ? "Pre-existing conditions, past surgeries, obstetric risk factors..."
                      : "e.g. High fever for 3 days, body weakness, joint pains, cough..."
                  }
                  value={illnessHistory}
                  onChange={(e) => setIllnessHistory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-teal-500 focus:bg-white resize-none"
                />
              </div>
            </div>

            {/* RIGHT COLUMN: Emergency Contact & Clinical / OB-GYN Info */}
            <div className="space-y-3">
              {/* Emergency Contact Group */}
              <div className="bg-slate-50/90 p-3 rounded-xl border border-slate-200 space-y-2.5">
                <span className="font-bold text-slate-800 text-[11px] flex items-center space-x-1">
                  <span>🛡️ Emergency Contact Person & Details</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1 text-[11px]">
                      Contact Person & Relationship
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Juan Cruz (Husband / Parent)"
                      value={emergencyContactName}
                      onChange={(e) => setEmergencyContactName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1 text-[11px]">
                      Emergency Phone Number
                    </label>
                    <input
                      type="text"
                      placeholder="+63 918 222 3456"
                      value={emergencyContactNumber}
                      onChange={(e) => setEmergencyContactNumber(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-semibold text-slate-700 block mb-1 text-[11px]">
                      Emergency Contact Address
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Same as patient or specific residence"
                      value={emergencyContactAddress}
                      onChange={(e) => setEmergencyContactAddress(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* OBSTETRIC FIELDS: Displayed when Pregnant is selected */}
              {isPregnant ? (
                <div className="space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Gravida (G)</label>
                      <input
                        type="number"
                        min="1"
                        value={gravida}
                        onChange={(e) => setGravida(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-teal-500 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Para (P)</label>
                      <input
                        type="number"
                        min="0"
                        value={para}
                        onChange={(e) => setPara(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-teal-500 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="bg-teal-50 p-3 rounded-xl border border-teal-200">
                    <label className="font-bold text-teal-900 block mb-1 flex items-center space-x-1.5 text-xs">
                      <Calendar className="w-4 h-4 text-teal-600" />
                      <span>Last Menstrual Period (LMP)</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={lmp}
                      onChange={(e) => setLmp(e.target.value)}
                      className="bg-white border border-teal-300 rounded-lg p-2 text-xs font-semibold text-teal-900 focus:ring-2 focus:ring-teal-500 w-full"
                    />
                    <p className="text-[10px] text-teal-700 mt-1">
                      Computes Age of Gestation (AOG) & Estimated Due Date (EDD).
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-start space-x-2 text-slate-600">
                  <Stethoscope className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span className="text-[11px] leading-relaxed">
                    <strong>{careType} Intake:</strong> Standard clinical intake profile. Obstetric gestational calculations (LMP & Parity) are disabled for this category.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition cursor-pointer text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs transition cursor-pointer text-xs active:scale-95"
            >
              Save & Register Patient
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
