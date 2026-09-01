import { useState } from 'react';
import type { Patient, Appointment, CheckupRecord, PrescriptionItem, PractitionerUser } from '../types/patient';
import { calculateObGynMetrics } from '../utils/obgynCalculator';
import { CheckupTable } from './CheckupTable';
import { PrescriptionModal } from './PrescriptionModal';
import {
  ArrowLeft,
  Edit2,
  Check,
  X,
  Calendar,
  Baby,
  Phone,
  MapPin,
  Heart,
  ShieldAlert,
  FileText,
  Printer,
  Trash2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff
} from 'lucide-react';

interface PatientDetailsProps {
  patient: Patient;
  appointments?: Appointment[];
  onBackToList: () => void;
  onUpdatePatient: (updatedPatient: Patient) => void;
  onDeletePatient?: (patientId: string) => void;
  currentUserRole?: 'DOCTOR' | 'NURSE';
  currentUser?: PractitionerUser | null;
  onUpdateAppointmentStatus?: (appointmentId: string, status: 'Scheduled' | 'Completed' | 'Cancelled') => void;
}

export const PatientDetails: React.FC<PatientDetailsProps> = ({
  patient,
  appointments = [],
  onBackToList,
  onUpdatePatient,
  onDeletePatient,
  currentUserRole = 'DOCTOR',
  currentUser,
  onUpdateAppointmentStatus,
}) => {
  const isNurse = currentUserRole === 'NURSE';
  const [isEditing, setIsEditing] = useState(false);
  const [isPrescriptionOpen, setIsPrescriptionOpen] = useState(false);
  const [activeCheckupForPrescription, setActiveCheckupForPrescription] = useState<CheckupRecord | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isOverviewExpanded, setIsOverviewExpanded] = useState(true);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(true);

  // Editable Form State
  const [fullName, setFullName] = useState(patient.fullName);
  const [age, setAge] = useState(patient.age);
  const [contactNumber, setContactNumber] = useState(patient.contactNumber);
  const [email, setEmail] = useState(patient.email);
  const [address, setAddress] = useState(patient.address);
  const [emergencyContactName, setEmergencyContactName] = useState(
    patient.emergencyContactName ||
    (patient.emergencyContact?.includes('-') ? patient.emergencyContact.split('-')[0].trim() : patient.emergencyContact || '')
  );
  const [emergencyContactNumber, setEmergencyContactNumber] = useState(
    patient.emergencyContactNumber ||
    (patient.emergencyContact?.includes('-') ? patient.emergencyContact.split('-')[1].trim() : '')
  );
  const [emergencyContactAddress, setEmergencyContactAddress] = useState(
    patient.emergencyContactAddress || ''
  );
  const [bloodType, setBloodType] = useState(patient.bloodType);
  const [gravida, setGravida] = useState(patient.gravida);
  const [para, setPara] = useState(patient.para);
  const [lmp, setLmp] = useState(patient.lmp);
  const [illnessHistory, setIllnessHistory] = useState(patient.illnessHistory);
  const [allergies, setAllergies] = useState(patient.allergies || '');
  const [status, setStatus] = useState<'Active' | 'Inactive'>(patient.status || 'Active');

  // Calculate live AOG & EDD from current LMP (either in edit state or patient prop)
  const activeLmp = isEditing ? lmp : patient.lmp;
  const obgynMetrics = calculateObGynMetrics(activeLmp);

  const handleStartEdit = () => {
    setFullName(patient.fullName);
    setAge(patient.age);
    setContactNumber(patient.contactNumber);
    setEmail(patient.email);
    setAddress(patient.address);
    setEmergencyContactName(
      patient.emergencyContactName ||
      (patient.emergencyContact?.includes('-') ? patient.emergencyContact.split('-')[0].trim() : patient.emergencyContact || '')
    );
    setEmergencyContactNumber(
      patient.emergencyContactNumber ||
      (patient.emergencyContact?.includes('-') ? patient.emergencyContact.split('-')[1].trim() : '')
    );
    setEmergencyContactAddress(patient.emergencyContactAddress || '');
    setBloodType(patient.bloodType);
    setGravida(patient.gravida);
    setPara(patient.para);
    setLmp(patient.lmp);
    setIllnessHistory(patient.illnessHistory);
    setAllergies(patient.allergies || '');
    setStatus(patient.status || 'Active');
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedEmergency = emergencyContactName.trim() && emergencyContactNumber.trim()
      ? `${emergencyContactName.trim()} - ${emergencyContactNumber.trim()}`
      : emergencyContactName.trim() || emergencyContactNumber.trim() || 'N/A';

    onUpdatePatient({
      ...patient,
      fullName,
      age: Number(age),
      contactNumber,
      email,
      address,
      emergencyContact: formattedEmergency,
      emergencyContactName: emergencyContactName.trim() || undefined,
      emergencyContactNumber: emergencyContactNumber.trim() || undefined,
      emergencyContactAddress: emergencyContactAddress.trim() || undefined,
      bloodType,
      gravida: Number(gravida),
      para: Number(para),
      lmp,
      illnessHistory,
      allergies,
      status,
    });
    setIsEditing(false);
  };

  const handleToggleStatus = () => {
    const newStatus = (patient.status || 'Active') === 'Active' ? 'Inactive' : 'Active';
    setStatus(newStatus);
    onUpdatePatient({
      ...patient,
      status: newStatus,
    });
  };

  const handleConfirmDeletePatient = () => {
    if (onDeletePatient) {
      onDeletePatient(patient.id);
      setIsDeleteModalOpen(false);
    }
  };

  const handleAddCheckup = (newCheckupData: Omit<CheckupRecord, 'id'>) => {
    const newRecord: CheckupRecord = {
      ...newCheckupData,
      id: `chk-${Date.now()}`,
    };
    onUpdatePatient({
      ...patient,
      checkups: [newRecord, ...patient.checkups],
    });

    // Automatically tag active scheduled consultation for this patient as Completed
    const activeAppt = appointments.find((a) => a.patientId === patient.id && a.status === 'Scheduled');
    if (activeAppt && onUpdateAppointmentStatus) {
      onUpdateAppointmentStatus(activeAppt.id, 'Completed');
    }
  };

  const handleDeleteCheckup = (checkupId: string) => {
    onUpdatePatient({
      ...patient,
      checkups: patient.checkups.filter((c) => c.id !== checkupId),
    });
  };

  const handleOpenPrescriptionModal = (checkup?: CheckupRecord) => {
    setActiveCheckupForPrescription(checkup || null);
    setIsPrescriptionOpen(true);
  };

  const handleSavePrescription = (checkupId: string, items: PrescriptionItem[]) => {
    const updatedCheckups = patient.checkups.map((c) =>
      c.id === checkupId ? { ...c, prescriptions: items } : c
    );
    onUpdatePatient({
      ...patient,
      checkups: updatedCheckups,
    });
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-y-auto">
      {/* MOBILE ONLY STICKY BACK BUTTON (md:hidden) */}
      <div className="sticky top-0 z-30 bg-slate-900 text-white p-3 md:hidden shadow-md flex items-center justify-between">
        <button
          onClick={onBackToList}
          className="flex items-center space-x-2 text-sm font-semibold hover:text-teal-300 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>⬅ Back to Patient List</span>
        </button>
        <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
          Mobile View
        </span>
      </div>

      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto w-full">
        {/* TOP PATIENT HEADER CARD */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 gap-4">
            <div className="flex items-start space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white flex items-center justify-center font-bold text-xl shadow-md shrink-0">
                {patient.fullName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center space-x-3 flex-wrap gap-y-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{patient.fullName}</h2>
                  <span className="bg-teal-100 text-teal-800 font-semibold text-xs px-2.5 py-1 rounded-full border border-teal-200">
                    {patient.age} Yrs Old
                  </span>
                  <span className="bg-slate-100 text-slate-700 font-mono font-bold text-xs px-2.5 py-1 rounded-full border border-slate-200">
                    Obstetric History: G{patient.gravida} P{patient.para}
                  </span>

                  {/* Active / Inactive Status Toggle Pill */}
                  <button
                    onClick={handleToggleStatus}
                    className={`font-semibold text-xs px-2.5 py-1 rounded-full border flex items-center space-x-1.5 transition cursor-pointer active:scale-95 ${
                      (patient.status || 'Active') === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                        : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                    }`}
                    title="Click to toggle Active / Inactive status"
                  >
                    <span className={`w-2 h-2 rounded-full shrink-0 ${ (patient.status || 'Active') === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400' }`} />
                    <span>{(patient.status || 'Active') === 'Active' ? '🟢 Active Prenatal' : '⚪ Inactive / Delivered'}</span>
                  </button>

                  {isNurse && (
                    <span className="bg-amber-50 text-amber-800 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-amber-200">
                      Nurse View (Triage Only)
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1 flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{patient.address}</span>
                </p>
              </div>
            </div>

            {/* Actions: Prescribe Rx & Inline Edit Toggle Button & Doctor-Only Delete & Hide/Show Toggle */}
            <div className="flex items-center space-x-2 self-start sm:self-center flex-wrap gap-y-2">
              {/* Hide / Show Overview Toggle Button */}
              {!isEditing && (
                <button
                  onClick={() => setIsOverviewExpanded(!isOverviewExpanded)}
                  className={`text-xs px-3 py-2 rounded-xl border flex items-center space-x-1.5 transition shadow-2xs cursor-pointer active:scale-95 ${
                    isOverviewExpanded
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                      : 'bg-teal-50 hover:bg-teal-100 text-teal-800 border-teal-200 font-semibold ring-1 ring-teal-400'
                  }`}
                  title={isOverviewExpanded ? 'Collapse Overview & Gestational Box' : 'Expand Overview & Gestational Box'}
                >
                  {isOverviewExpanded ? <EyeOff className="w-3.5 h-3.5 text-slate-500" /> : <Eye className="w-3.5 h-3.5 text-teal-600" />}
                  <span>{isOverviewExpanded ? 'Hide Info' : 'Show Info'}</span>
                  {isOverviewExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-teal-600" />}
                </button>
              )}

              {!isNurse && (
                <button
                  onClick={() => handleOpenPrescriptionModal()}
                  className="bg-teal-50 hover:bg-teal-100 text-teal-800 font-semibold text-xs px-3.5 py-2 rounded-xl border border-teal-200 flex items-center space-x-1.5 transition shadow-2xs cursor-pointer active:scale-95"
                  title="Generate & Print Official Doctor's Prescription (Rx)"
                >
                  <Printer className="w-3.5 h-3.5 text-teal-600" />
                  <span>Print Prescription (℞)</span>
                </button>
              )}

              {!isEditing ? (
                <>
                  <button
                    onClick={handleStartEdit}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs px-3.5 py-2 rounded-xl border border-slate-200 flex items-center space-x-1.5 transition shadow-2xs cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-teal-600" />
                    <span>Edit Info</span>
                  </button>

                  {/* Doctor-Only Full Patient Deletion */}
                  {!isNurse && onDeletePatient && (
                    <button
                      onClick={() => setIsDeleteModalOpen(true)}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs px-3 py-2 rounded-xl border border-rose-200 flex items-center space-x-1.5 transition shadow-2xs cursor-pointer active:scale-95"
                      title="Lead Doctor: Permanently Delete Patient Record"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      <span className="hidden sm:inline">Delete Record</span>
                    </button>
                  )}
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSaveEdit}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs px-3.5 py-2 rounded-xl flex items-center space-x-1 shadow-xs transition cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium text-xs px-3.5 py-2 rounded-xl flex items-center space-x-1 transition cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* EDIT FORM MODE */}
          {isEditing ? (
            <form onSubmit={handleSaveEdit} className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Age (Years)</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Contact Number</label>
                <input
                  type="text"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-semibold text-slate-700 block mb-1">Home Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Emergency Contact Form Group */}
              <div className="sm:col-span-2 lg:col-span-3 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200 space-y-3">
                <span className="font-bold text-slate-800 text-xs flex items-center space-x-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                  <span>Emergency Contact Details</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Contact Person Name & Relationship
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Juan Cruz (Husband)"
                      value={emergencyContactName}
                      onChange={(e) => setEmergencyContactName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Emergency Phone Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. +63 918 222 3456"
                      value={emergencyContactNumber}
                      onChange={(e) => setEmergencyContactNumber(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div className="sm:col-span-2 lg:col-span-1">
                    <label className="font-semibold text-slate-700 block mb-1">
                      Emergency Contact Address
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Same as patient or specific residence"
                      value={emergencyContactAddress}
                      onChange={(e) => setEmergencyContactAddress(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Blood Type</label>
                <select
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-teal-500"
                >
                  {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Patient Clinical Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'Active' | 'Inactive')}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-teal-500 font-medium"
                >
                  <option value="Active">🟢 Active (Current Prenatal Care)</option>
                  <option value="Inactive">⚪ Inactive (Delivered / Discharged / Transferred)</option>
                </select>
              </div>

              <div className="flex space-x-2">
                <div className="w-1/2">
                  <label className="font-semibold text-slate-700 block mb-1">
                    Gravida (G) {isNurse && <span className="text-[10px] text-amber-600 font-normal">(Doctor Only)</span>}
                  </label>
                  <input
                    type="number"
                    disabled={isNurse}
                    value={gravida}
                    onChange={(e) => setGravida(Number(e.target.value))}
                    className={`w-full border rounded-lg p-2 focus:ring-2 focus:ring-teal-500 ${
                      isNurse ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                </div>
                <div className="w-1/2">
                  <label className="font-semibold text-slate-700 block mb-1">
                    Para (P) {isNurse && <span className="text-[10px] text-amber-600 font-normal">(Doctor Only)</span>}
                  </label>
                  <input
                    type="number"
                    disabled={isNurse}
                    value={para}
                    onChange={(e) => setPara(Number(e.target.value))}
                    className={`w-full border rounded-lg p-2 focus:ring-2 focus:ring-teal-500 ${
                      isNurse ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                </div>
              </div>

              <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 sm:col-span-2 lg:col-span-3">
                <label className="font-bold text-teal-900 block mb-1 flex items-center space-x-1">
                  <Calendar className="w-4 h-4 text-teal-600" />
                  <span>Last Menstrual Period (LMP)</span>
                  {isNurse && <span className="text-xs text-amber-700 font-normal ml-2">(Lead Doctor Authorization Required to Alter)</span>}
                </label>
                <input
                  type="date"
                  disabled={isNurse}
                  value={lmp}
                  onChange={(e) => setLmp(e.target.value)}
                  className={`border rounded-lg p-2 text-sm font-semibold text-teal-900 focus:ring-2 focus:ring-teal-500 ${
                    isNurse ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-300' : 'bg-white border-teal-300'
                  }`}
                />
                <p className="text-[11px] text-teal-700 mt-1">
                  {isNurse
                    ? 'Clinical gestational dates and AOG/EDD can only be recalculated by the Doctor.'
                    : 'Changing LMP will automatically re-calculate AOG and EDD below.'}
                </p>
              </div>
            </form>
          ) : isOverviewExpanded ? (
            /* READ ONLY EXPANDED VIEW MODE */
            <div className="animate-in fade-in duration-150">
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[11px] mb-0.5 flex items-center space-x-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>Contact Info</span>
                  </span>
                  <p className="font-semibold text-slate-800">{patient.contactNumber}</p>
                  <p className="text-[11px] text-slate-500 truncate">{patient.email}</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[11px] mb-0.5 flex items-center space-x-1">
                    <ShieldAlert className="w-3 h-3 text-rose-500" />
                    <span>Emergency Contact</span>
                  </span>
                  <p className="font-semibold text-slate-800 truncate">
                    {patient.emergencyContactName || (patient.emergencyContact?.includes('-') ? patient.emergencyContact.split('-')[0].trim() : patient.emergencyContact || 'None')}
                  </p>
                  {(patient.emergencyContactNumber || (patient.emergencyContact?.includes('-') && patient.emergencyContact.split('-')[1]?.trim())) && (
                    <p className="text-[11px] text-teal-700 font-medium mt-0.5 flex items-center space-x-1 truncate">
                      <Phone className="w-3 h-3 shrink-0 text-teal-600" />
                      <span>{patient.emergencyContactNumber || patient.emergencyContact.split('-')[1]?.trim()}</span>
                    </p>
                  )}
                  {patient.emergencyContactAddress && (
                    <p className="text-[10px] text-slate-500 mt-0.5 flex items-start space-x-1 truncate" title={patient.emergencyContactAddress}>
                      <MapPin className="w-3 h-3 shrink-0 text-slate-400 mt-0.5" />
                      <span className="truncate">{patient.emergencyContactAddress}</span>
                    </p>
                  )}
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[11px] mb-0.5 flex items-center space-x-1">
                    <Heart className="w-3 h-3 text-rose-500" />
                    <span>Blood Type & Allergies</span>
                  </span>
                  <p className="font-bold text-slate-800">Type: {patient.bloodType}</p>
                  <p className="text-[11px] text-rose-600 font-medium">{patient.allergies || 'No known drug allergies'}</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[11px] mb-0.5 flex items-center space-x-1">
                    <Calendar className="w-3 h-3 text-teal-600" />
                    <span>LMP (Last Menstrual Period)</span>
                  </span>
                  <p className="font-bold text-teal-900 text-sm">{patient.lmp || 'Not Set'}</p>
                </div>
              </div>

              {/* AUTO-COMPUTE FEATURE METRICS BAR */}
              <div className="mt-5 bg-gradient-to-r from-teal-700 via-cyan-700 to-teal-800 text-white rounded-2xl p-4 sm:p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3 border-b border-teal-600/50 pb-2">
                  <div className="flex items-center space-x-2">
                    <Baby className="w-5 h-5 text-teal-200" />
                    <h3 className="font-bold text-sm text-teal-50 tracking-wide uppercase">
                      Gestational Auto-Calculations (LMP + 280 Days)
                    </h3>
                  </div>
                  <span className="text-[11px] bg-teal-600/60 text-teal-100 px-2.5 py-0.5 rounded-full border border-teal-500/50 font-mono">
                    Live Auto-Computed
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
                  <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10">
                    <span className="text-xs text-teal-200 font-medium block">AOG (Age of Gestation)</span>
                    <p className="text-xl sm:text-2xl font-extrabold text-white mt-0.5">
                      {obgynMetrics.aogFormatted}
                    </p>
                    <span className="text-[11px] text-teal-100 block mt-0.5 font-medium">
                      {obgynMetrics.aogWeeks} weeks + {obgynMetrics.aogDays} days
                    </span>
                  </div>

                  <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10">
                    <span className="text-xs text-teal-200 font-medium block">EDD (Estimated Due Date)</span>
                    <p className="text-xl sm:text-2xl font-extrabold text-white mt-0.5">
                      {obgynMetrics.edd}
                    </p>
                    <span className="text-[11px] text-teal-100 block mt-0.5 font-medium">
                      Naegele's Rule (+280 Days)
                    </span>
                  </div>

                  <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10">
                    <span className="text-xs text-teal-200 font-medium block">Trimester Stage</span>
                    <div className="flex items-center justify-center sm:justify-start space-x-2 mt-1">
                      <span className="bg-white text-teal-900 font-black text-sm px-3 py-1 rounded-lg shadow-2xs">
                        {obgynMetrics.trimester} Trimester
                      </span>
                      <span className="text-[11px] text-teal-100">
                        {obgynMetrics.daysRemaining} days remaining
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* COMPACT COLLAPSED SUMMARY STRIP */
            <div
              onClick={() => setIsOverviewExpanded(true)}
              className="mt-4 p-3 bg-slate-50 hover:bg-teal-50/50 border border-slate-200 hover:border-teal-300 rounded-xl transition flex items-center justify-between gap-3 text-xs cursor-pointer group"
              title="Click to expand full patient overview & gestational calculations"
            >
              <div className="flex items-center space-x-3 sm:space-x-4 flex-wrap gap-y-1">
                <span className="font-bold text-teal-900 flex items-center space-x-1">
                  <Baby className="w-3.5 h-3.5 text-teal-600 inline" />
                  <span>AOG: <strong>{obgynMetrics.aogFormatted}</strong></span>
                </span>
                <span className="text-slate-300 hidden sm:inline">•</span>
                <span className="text-slate-700">EDD: <strong>{obgynMetrics.edd}</strong></span>
                <span className="text-slate-300 hidden sm:inline">•</span>
                <span className="bg-teal-100 text-teal-800 font-semibold px-2 py-0.2 rounded">
                  {obgynMetrics.trimester} Trimester
                </span>
                <span className="text-slate-300 hidden md:inline">•</span>
                <span className="text-slate-500 hidden md:inline">Contact: {patient.contactNumber}</span>
              </div>
              <div className="flex items-center space-x-1 text-teal-700 font-semibold text-[11px] group-hover:underline shrink-0">
                <span>Show Full Cards</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>
          )}
        </div>

        {/* SUB-HEADER: ILLNESS HISTORY TEXTAREA (COLLAPSIBLE) */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs transition">
          <button
            type="button"
            onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
            className="w-full flex items-center justify-between text-left focus:outline-none cursor-pointer group"
          >
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-teal-600" />
              <h3 className="text-sm font-bold text-slate-800 group-hover:text-teal-700 transition">
                Illness & Medical History
              </h3>
              {isNurse && (
                <span className="text-[10px] bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200 font-medium">
                  Doctor Managed
                </span>
              )}
            </div>
            
            {/* Matching Styled Hide/Show Pill Button */}
            <div
              className={`text-xs px-3 py-1.5 rounded-xl border flex items-center space-x-1.5 transition shadow-2xs ${
                isHistoryExpanded
                  ? 'bg-slate-100 group-hover:bg-slate-200 text-slate-700 border-slate-200'
                  : 'bg-teal-50 group-hover:bg-teal-100 text-teal-800 border-teal-200 font-semibold ring-1 ring-teal-400'
              }`}
            >
              {isHistoryExpanded ? <EyeOff className="w-3.5 h-3.5 text-slate-500" /> : <Eye className="w-3.5 h-3.5 text-teal-600" />}
              <span>{isHistoryExpanded ? 'Hide Info' : 'Show Info'}</span>
              {isHistoryExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-teal-600" />}
            </div>
          </button>

          {(isHistoryExpanded || isEditing) && (
            <div className="mt-3 animate-in fade-in duration-150">
              <textarea
                rows={3}
                value={isEditing ? illnessHistory : patient.illnessHistory}
                disabled={!isEditing || isNurse}
                onChange={(e) => setIllnessHistory(e.target.value)}
                placeholder="Document past medical conditions, surgical history, or high-risk factors..."
                className={`w-full text-xs rounded-lg p-3 leading-relaxed transition ${
                  isEditing && !isNurse
                    ? 'bg-slate-50 border border-slate-300 focus:ring-2 focus:ring-teal-500'
                    : 'bg-slate-50/70 border border-slate-200 text-slate-700 cursor-not-allowed'
                }`}
              />
              {!isEditing && (
                <p className="text-[11px] text-slate-400 mt-1 italic">
                  {isNurse
                    ? 'Medical history is managed and updated by the Lead Obstetrician.'
                    : 'Click "Edit Info" above to modify illness history notes.'}
                </p>
              )}
            </div>
          )}
        </div>

        {/* ACTIVE SCHEDULED CONSULTATIONS BANNER WITH 1-CLICK TAG DONE */}
        {appointments.filter((a) => a.patientId === patient.id && a.status === 'Scheduled').map((apt) => (
          <div
            key={apt.id}
            className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-300/80 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs animate-in fade-in duration-200"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-xs shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-800 text-xs sm:text-sm">Active Booking in Schedule</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.2 rounded-full border border-emerald-300">
                    Scheduled
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  <strong>{apt.date}</strong> at <strong>{apt.time}</strong> • <span className="font-semibold text-teal-800">{apt.type}</span>
                  {apt.notes && <span className="italic text-slate-500"> — "{apt.notes}"</span>}
                </p>
              </div>
            </div>

            {onUpdateAppointmentStatus && (
              <button
                onClick={() => onUpdateAppointmentStatus(apt.id, 'Completed')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-2xs flex items-center space-x-1.5 shrink-0 self-start sm:self-auto cursor-pointer active:scale-95"
                title="Mark this consultation booking as Completed / Done"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>✓ Tag Consultation Done</span>
              </button>
            )}
          </div>
        ))}

        {/* CHECK-UP RECORDS TABLE */}
        <CheckupTable
          checkups={patient.checkups}
          onAddCheckup={handleAddCheckup}
          onDeleteCheckup={handleDeleteCheckup}
          currentUserRole={currentUserRole}
          onOpenPrescription={handleOpenPrescriptionModal}
        />
      </div>

      {/* DOCTOR OFFICIAL PRESCRIPTION MODAL (Rx Pad with Digital Sign & Print) */}
      <PrescriptionModal
        isOpen={isPrescriptionOpen}
        onClose={() => setIsPrescriptionOpen(false)}
        patient={patient}
        checkup={activeCheckupForPrescription}
        currentUser={
          currentUser || {
            id: 'usr-default',
            fullName: 'Dr. Sarah Jenkins',
            title: 'MD, FPOGS',
            role: currentUserRole,
            pinCode: '1234',
            avatar: 'SJ',
          }
        }
        onSavePrescription={handleSavePrescription}
      />

      {/* DOCTOR-ONLY PERMANENT RECORD DELETION CONFIRMATION MODAL */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3 text-rose-600 mb-4">
              <div className="p-3 bg-rose-100 rounded-xl shrink-0">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">Delete Full Patient Record?</h3>
                <span className="text-[11px] bg-rose-50 text-rose-700 font-semibold px-2 py-0.5 rounded border border-rose-200 mt-0.5 inline-block">
                  👨‍⚕️ Lead Doctor Authorization
                </span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 mb-6 text-xs text-slate-700">
              <p>You are about to permanently delete the entire medical profile for:</p>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <p className="text-sm font-bold text-slate-900">{patient.fullName}</p>
                <p className="text-xs text-slate-500">{patient.age} yrs • G{patient.gravida}P{patient.para} • {patient.contactNumber}</p>
              </div>
              <div className="text-[11px] text-rose-700 bg-rose-50 p-2.5 rounded-lg border border-rose-200 leading-relaxed">
                ⚠️ <strong>Permanent Action:</strong> This will erase all patient demographic information, <strong>{patient.checkups.length} consultation visit records</strong>, prescriptions, and medical notes from the clinic database.
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeletePatient}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer flex items-center space-x-1.5 active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Delete Record</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
