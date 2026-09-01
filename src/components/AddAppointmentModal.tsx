import { useState, useEffect } from 'react';
import type { Patient, Appointment } from '../types/patient';
import { X, Calendar, UserCheck, UserPlus } from 'lucide-react';
import { format } from 'date-fns';

interface AddAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  onAddAppointment: (appointment: Appointment, newPatientData?: Patient) => void;
  defaultDate?: string;
  existingAppointments?: Appointment[];
}

const ALL_TIME_SLOTS = [
  '08:30 AM',
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '01:30 PM',
  '02:00 PM',
  '02:30 PM',
  '03:30 PM',
  '04:30 PM'
];

export const AddAppointmentModal: React.FC<AddAppointmentModalProps> = ({
  isOpen,
  onClose,
  patients,
  onAddAppointment,
  defaultDate,
  existingAppointments = [],
}) => {
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  // Mode: 'EXISTING' patient or 'NEW' patient
  const [patientMode, setPatientMode] = useState<'EXISTING' | 'NEW'>('EXISTING');

  // Form State for Existing Patient
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || '');

  // Form State for New Patient
  const [newFullName, setNewFullName] = useState<string>('');
  const [newAge, setNewAge] = useState<number>(26);
  const [newContactNumber, setNewContactNumber] = useState<string>('');
  const [newAddress, setNewAddress] = useState<string>('');
  const [newLmp, setNewLmp] = useState<string>(todayStr);

  // Common Appointment Details
  const [appointmentDate, setAppointmentDate] = useState<string>(defaultDate || todayStr);
  const [appointmentTime, setAppointmentTime] = useState<string>('09:30 AM');
  const [appointmentType, setAppointmentType] = useState<Appointment['type']>('Routine Prenatal');
  const [notes, setNotes] = useState<string>('');

  // Calculate taken time slots for the chosen date
  const takenTimeSlots = existingAppointments
    .filter((a) => a.date === appointmentDate && a.status !== 'Cancelled')
    .map((a) => a.time);

  const availableTimeSlots = ALL_TIME_SLOTS.filter((t) => !takenTimeSlots.includes(t));
  const isFullyBooked = availableTimeSlots.length === 0;

  useEffect(() => {
    if (isOpen) {
      const initialDate = defaultDate || format(new Date(), 'yyyy-MM-dd');
      setAppointmentDate(initialDate);

      // Auto-select first untaken slot
      const initialTaken = existingAppointments
        .filter((a) => a.date === initialDate && a.status !== 'Cancelled')
        .map((a) => a.time);
      const initialAvailable = ALL_TIME_SLOTS.filter((t) => !initialTaken.includes(t));
      if (initialAvailable.length > 0) {
        setAppointmentTime(initialAvailable[0]);
      }

      if (patients.length > 0 && !selectedPatientId) {
        setSelectedPatientId(patients[0].id);
      }
    }
  }, [isOpen, defaultDate, patients, selectedPatientId]);

  // When date changes, check if current appointmentTime is taken; if so, switch to first available
  useEffect(() => {
    if (takenTimeSlots.includes(appointmentTime) && availableTimeSlots.length > 0) {
      setAppointmentTime(availableTimeSlots[0]);
    }
  }, [appointmentDate, takenTimeSlots, availableTimeSlots, appointmentTime]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (patientMode === 'EXISTING') {
      const patient = patients.find((p) => p.id === selectedPatientId);
      if (!patient) return;

      const newApt: Appointment = {
        id: `apt-${Date.now()}`,
        patientId: patient.id,
        patientName: patient.fullName,
        date: appointmentDate,
        time: appointmentTime,
        type: appointmentType,
        notes: notes.trim() || undefined,
        status: 'Scheduled',
      };

      onAddAppointment(newApt);
    } else {
      if (!newFullName.trim()) return;

      // Register new patient & schedule appointment
      const newPatientId = `pat-${Date.now()}`;
      const newPatient: Patient = {
        id: newPatientId,
        fullName: newFullName.trim(),
        age: Number(newAge) || 25,
        contactNumber: newContactNumber.trim() || 'N/A',
        email: 'N/A',
        address: newAddress.trim() || 'N/A',
        emergencyContact: 'N/A',
        bloodType: 'O+',
        gravida: 1,
        para: 0,
        lmp: newLmp,
        illnessHistory: 'Initial consultation appointment booked.',
        checkups: [],
      };

      const newApt: Appointment = {
        id: `apt-${Date.now()}`,
        patientId: newPatientId,
        patientName: newPatient.fullName,
        date: appointmentDate,
        time: appointmentTime,
        type: appointmentType,
        notes: notes.trim() || undefined,
        status: 'Scheduled',
      };

      onAddAppointment(newApt, newPatient);
    }

    onClose();

    // Reset Form
    setNewFullName('');
    setNewContactNumber('');
    setNewAddress('');
    setNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-lg shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-teal-600 text-white rounded-xl shadow-xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Book Clinic Appointment</h3>
              <p className="text-xs text-slate-500">Schedule consultation for new or existing patient</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Patient Selection Mode Toggle */}
        <div className="p-4 bg-slate-100/70 border-b border-slate-200">
          <label className="text-xs font-bold text-slate-700 block mb-2">Select Patient Type:</label>
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setPatientMode('EXISTING')}
              className={`py-2 px-3 rounded-xl transition flex items-center justify-center space-x-1.5 ${
                patientMode === 'EXISTING'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Existing Patient</span>
            </button>

            <button
              type="button"
              onClick={() => setPatientMode('NEW')}
              className={`py-2 px-3 rounded-xl transition flex items-center justify-center space-x-1.5 ${
                patientMode === 'NEW'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>+ New Patient</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {patientMode === 'EXISTING' ? (
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Select Patient Directory Record</label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-semibold focus:ring-2 focus:ring-teal-500 focus:bg-white"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.fullName} (Age: {p.age}, G{p.gravida}P{p.para})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="space-y-3 bg-teal-50/60 p-3.5 rounded-xl border border-teal-200">
              <p className="font-bold text-teal-900 text-xs">Quick New Patient Registration</p>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ana Gomez"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  className="w-full bg-white border border-teal-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Age</label>
                  <input
                    type="number"
                    value={newAge}
                    onChange={(e) => setNewAge(Number(e.target.value))}
                    className="w-full bg-white border border-teal-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Contact Number</label>
                  <input
                    type="text"
                    placeholder="+63 9XX XXX XXXX"
                    value={newContactNumber}
                    onChange={(e) => setNewContactNumber(e.target.value)}
                    className="w-full bg-white border border-teal-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Home Address / Location</label>
                <input
                  type="text"
                  placeholder="e.g. 123 Quezon Ave, Barangay San Jose"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="w-full bg-white border border-teal-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">LMP (Last Menstrual Period)</label>
                <input
                  type="date"
                  value={newLmp}
                  onChange={(e) => setNewLmp(e.target.value)}
                  className="w-full bg-white border border-teal-300 rounded-lg p-2 text-xs font-medium focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          )}

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Appointment Date</label>
              <input
                type="date"
                required
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-semibold focus:ring-2 focus:ring-teal-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1 flex items-center justify-between">
                <span>Time Slot</span>
                <span className="text-[10px] text-teal-700 font-semibold">
                  {availableTimeSlots.length} / {ALL_TIME_SLOTS.length} Available
                </span>
              </label>
              <select
                value={appointmentTime}
                disabled={isFullyBooked}
                onChange={(e) => setAppointmentTime(e.target.value)}
                className={`w-full border rounded-xl p-2.5 text-xs font-semibold focus:ring-2 focus:ring-teal-500 ${
                  isFullyBooked
                    ? 'bg-rose-50 border-rose-300 text-rose-800 cursor-not-allowed'
                    : 'bg-slate-50 border-slate-300 focus:bg-white'
                }`}
              >
                {ALL_TIME_SLOTS.map((t) => {
                  const isTaken = takenTimeSlots.includes(t);
                  return (
                    <option
                      key={t}
                      value={t}
                      disabled={isTaken}
                      className={isTaken ? 'text-slate-400 bg-slate-100 italic' : 'text-slate-900 font-medium'}
                    >
                      {t} {isTaken ? '⛔ (Taken / Booked)' : '✓ (Available)'}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Fully booked warning notice */}
          {isFullyBooked && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-medium flex items-center space-x-2">
              <span className="text-base">⚠️</span>
              <span>All consultation time slots on <strong>{appointmentDate}</strong> are fully booked. Please select another date.</span>
            </div>
          )}

          {/* Appointment Type */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Consultation Purpose / Clinical Category</label>
            <select
              value={appointmentType}
              onChange={(e) => setAppointmentType(e.target.value as Appointment['type'])}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-semibold focus:ring-2 focus:ring-teal-500 focus:bg-white"
            >
              <optgroup label="Obstetrics & Prenatal">
                <option value="Routine Prenatal">🤰 Routine Prenatal Check-up</option>
                <option value="Ultrasound Scan">🔬 Ultrasound Scan (Pelvic / Anomaly / TVS)</option>
                <option value="High Risk Consult">⚠️ High Risk Obstetric Consult</option>
                <option value="First Prenatal Visit">📋 Initial First Prenatal Visit</option>
                <option value="Postpartum Check">🤱 Postpartum Follow-up</option>
              </optgroup>
              <optgroup label="Pediatric & Preventive Care">
                <option value="Pediatric / Baby Check">👶 Pediatric / Baby & Newborn Check</option>
                <option value="Anti-Rabies Vaccine Dose">🐕 Anti-Rabies Vaccine Dose / Prophylaxis</option>
                <option value="Vaccine Shot / Booster">💉 Routine Vaccine Shot / Booster Dose</option>
              </optgroup>
              <optgroup label="General Medicine & Acute Care">
                <option value="Dengue / Fever Check">🦟 Dengue / Acute Fever Triage</option>
                <option value="General Consultation">🤒 General Medical Sickness Consult</option>
                <option value="Chronic Care Follow-up">🩺 Chronic Disease Follow-up</option>
              </optgroup>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Consultation Notes / Instructions</label>
            <textarea
              rows={2}
              placeholder="e.g. Bring previous blood lab results or Ultrasound report..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-teal-500 focus:bg-white resize-none"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isFullyBooked || takenTimeSlots.includes(appointmentTime)}
              className={`px-5 py-2 text-white font-bold rounded-xl shadow-xs transition cursor-pointer ${
                isFullyBooked || takenTimeSlots.includes(appointmentTime)
                  ? 'bg-slate-300 cursor-not-allowed text-slate-500'
                  : 'bg-teal-600 hover:bg-teal-700 active:scale-95'
              }`}
            >
              Confirm & Schedule Appointment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
