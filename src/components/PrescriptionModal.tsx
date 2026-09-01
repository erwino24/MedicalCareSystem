import React, { useState } from 'react';
import type { Patient, CheckupRecord, PrescriptionItem, PractitionerUser } from '../types/patient';
import { calculateObGynMetrics } from '../utils/obgynCalculator';
import {
  Printer,
  X,
  Plus,
  Trash2,
  Stethoscope,
  Pill,
  Sparkles,
  ShieldCheck,
  FileCheck,
  Calendar,
  Phone,
  MapPin,
  Check
} from 'lucide-react';
import { format } from 'date-fns';

interface PrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  checkup?: CheckupRecord | null;
  currentUser: PractitionerUser;
  onSavePrescription?: (checkupId: string, items: PrescriptionItem[]) => void;
}

// Preset common OB-GYN prescriptions for instant 1-click clinical selection
const PRESET_OBGYN_MEDICATIONS: Omit<PrescriptionItem, 'id'>[] = [
  {
    genericName: 'Ferrous Sulfate + Folic Acid',
    brandName: 'Hemarate FA / Iberet Folic',
    dosage: '60mg Elemental Iron / 400mcg',
    form: 'Film-Coated Tablet',
    frequency: 'Once daily',
    instructions: 'Take 1 tablet once daily with meals or with vitamin C/citrus juice for optimal iron absorption.',
    quantity: '#30 tablets',
    duration: '30 days',
  },
  {
    genericName: 'Calcium Carbonate + Vitamin D3',
    brandName: 'Caltrate Plus / Osteocare',
    dosage: '500mg Elemental Calcium / 200 IU',
    form: 'Tablet',
    frequency: 'Twice daily',
    instructions: 'Take 1 tablet twice daily after morning and evening meals. Do not take simultaneously with iron supplement.',
    quantity: '#60 tablets',
    duration: '30 days',
  },
  {
    genericName: 'Prenatal Multivitamins + DHA / EPA',
    brandName: 'Obimin Plus / Natalac',
    dosage: 'Standard Prenatal Formula',
    form: 'Softgel Capsule',
    frequency: 'Once daily',
    instructions: 'Take 1 softgel daily after breakfast for fetal neurological and structural development.',
    quantity: '#30 softgels',
    duration: '30 days',
  },
  {
    genericName: 'Dydrogesterone (Progestogen)',
    brandName: 'Duphaston',
    dosage: '10mg',
    form: 'Tablet',
    frequency: 'Twice daily',
    instructions: 'Take 1 tablet every 12 hours for luteal support / threatened miscarriage prevention until advised.',
    quantity: '#28 tablets',
    duration: '14 days',
  },
  {
    genericName: 'Isoxsuprine Hydrochloride',
    brandName: 'Duvadilan',
    dosage: '10mg',
    form: 'Tablet',
    frequency: 'Three times daily',
    instructions: 'Take 1 tablet every 8 hours as uterine relaxant to prevent premature uterine contractions.',
    quantity: '#21 tablets',
    duration: '7 days',
  },
  {
    genericName: 'Paracetamol',
    brandName: 'Biogesic / Calpol',
    dosage: '500mg',
    form: 'Tablet',
    frequency: 'Every 6 hours as needed',
    instructions: 'Take 1 tablet every 6 hours only for mild pain or fever > 37.8°C. Maximum 4 grams per 24 hours.',
    quantity: '#10 tablets',
    duration: 'As needed',
  },
  {
    genericName: 'Cefalexin Monohydrate',
    brandName: 'Keflex',
    dosage: '500mg',
    form: 'Capsule',
    frequency: 'Every 8 hours',
    instructions: 'Take 1 capsule every 8 hours for 7 full days to resolve UTI. Complete the full antibiotic course.',
    quantity: '#21 capsules',
    duration: '7 days',
  },
  {
    genericName: 'Metoclopramide HCl',
    brandName: 'Plasil',
    dosage: '10mg',
    form: 'Tablet',
    frequency: '30 mins before meals',
    instructions: 'Take 1 tablet 30 minutes before breakfast for morning sickness / hyperemesis gravidarum as needed.',
    quantity: '#15 tablets',
    duration: '5 days',
  },
];

export const PrescriptionModal: React.FC<PrescriptionModalProps> = ({
  isOpen,
  onClose,
  patient,
  checkup,
  currentUser,
  onSavePrescription,
}) => {
  if (!isOpen) return null;

  const obgynMetrics = calculateObGynMetrics(patient.lmp);
  const todayStr = format(new Date(), 'MMMM d, yyyy');

  // Doctor Details
  const isDoctor = currentUser.role === 'DOCTOR';
  const [doctorName, setDoctorName] = useState(
    currentUser.fullName.startsWith('Dr.') ? currentUser.fullName : `Dr. ${currentUser.fullName}, MD`
  );
  const [doctorTitle, setDoctorTitle] = useState('Obstetrics & Gynecology - Maternal & Fetal Medicine');
  const [prcNumber, setPrcNumber] = useState('0098765');
  const [ptrNumber, setPtrNumber] = useState('1234567');
  const [s2Number, setS2Number] = useState('9876-54321-ABCD');
  const [clinicName, setClinicName] = useState('MaternalCare OB-GYN Specialist Clinic');
  const [clinicAddress, setClinicAddress] = useState('Suite 402, St. Luke\'s Medical Tower, Medical Drive, Metro Manila');
  const [clinicContact, setClinicContact] = useState('Tel: (02) 8888-1234 • Mobile: +63 917 123 4567');

  // Prescription Items State
  const initialItems: PrescriptionItem[] = checkup?.prescriptions && checkup.prescriptions.length > 0
    ? checkup.prescriptions
    : [
        {
          id: 'item-1',
          genericName: 'Ferrous Sulfate + Folic Acid',
          brandName: 'Hemarate FA',
          dosage: '60mg / 400mcg',
          form: 'Film-Coated Tablet',
          frequency: 'Once daily',
          instructions: 'Take 1 tablet once daily with meals or orange juice for iron deficiency anemia prevention.',
          quantity: '#30 tablets',
          duration: '30 days',
        },
        {
          id: 'item-2',
          genericName: 'Calcium Carbonate + Vitamin D3',
          brandName: 'Caltrate Plus',
          dosage: '500mg / 200 IU',
          form: 'Tablet',
          frequency: 'Twice daily',
          instructions: 'Take 1 tablet twice daily after meals. Separate from iron supplement by at least 2 hours.',
          quantity: '#60 tablets',
          duration: '30 days',
        },
      ];

  const [prescriptionList, setPrescriptionList] = useState<PrescriptionItem[]>(initialItems);
  const [specialInstructions, setSpecialInstructions] = useState<string>(
    '• Maintain adequate hydration (minimum 8-10 glasses of clean water daily).\n• Avoid heavy lifting and prolonged standing.\n• Report immediately if experiencing vaginal bleeding, leaking fluid, severe headache, or decreased fetal movement.'
  );

  // New Item Builder Form State
  const [genericName, setGenericName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [dosage, setDosage] = useState('');
  const [form, setForm] = useState('Tablet');
  const [frequency, setFrequency] = useState('Once daily');
  const [instructions, setInstructions] = useState('');
  const [quantity, setQuantity] = useState('#30 tablets');
  const [duration, setDuration] = useState('30 days');

  const [activeTab, setActiveTab] = useState<'preview' | 'edit'>('preview');
  const [includeDigitalSignature, setIncludeDigitalSignature] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSelectPreset = (preset: Omit<PrescriptionItem, 'id'>) => {
    setGenericName(preset.genericName);
    setBrandName(preset.brandName || '');
    setDosage(preset.dosage);
    setForm(preset.form);
    setFrequency(preset.frequency);
    setInstructions(preset.instructions);
    setQuantity(preset.quantity);
    setDuration(preset.duration);
  };

  const handleAddMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!genericName.trim() || !dosage.trim()) {
      alert('Generic medicine name and dosage are required.');
      return;
    }

    const newItem: PrescriptionItem = {
      id: `rx-${Date.now()}`,
      genericName: genericName.trim(),
      brandName: brandName.trim() || undefined,
      dosage: dosage.trim(),
      form: form.trim() || 'Tablet',
      frequency: frequency.trim(),
      instructions: instructions.trim() || `Take as directed for ${duration}.`,
      quantity: quantity.trim() || '#30',
      duration: duration.trim() || '30 days',
    };

    setPrescriptionList([...prescriptionList, newItem]);

    // Clear medicine builder
    setGenericName('');
    setBrandName('');
    setDosage('');
    setInstructions('');
  };

  const handleRemoveMedicine = (id: string) => {
    setPrescriptionList(prescriptionList.filter((m) => m.id !== id));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveToRecord = () => {
    if (checkup && onSavePrescription) {
      onSavePrescription(checkup.id, prescriptionList);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto font-sans">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[96vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* MODAL HEADER (No-Print) */}
        <div className="no-print bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="bg-gradient-to-tr from-teal-500 to-cyan-500 p-2 rounded-xl text-white shadow-xs">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-base text-white">Doctor's Medical Prescription (℞)</h3>
                <span className="bg-teal-500/20 text-teal-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-teal-500/30">
                  OB-GYN Rx Pad
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Patient: <strong className="text-white">{patient.fullName}</strong> • Age: {patient.age} • AOG: {obgynMetrics.aogFormatted}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* View switcher */}
            <div className="hidden sm:flex bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  activeTab === 'preview' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Print Preview (Rx)
              </button>
              <button
                onClick={() => setActiveTab('edit')}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  activeTab === 'edit' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Add / Customize Meds ({prescriptionList.length})
              </button>
            </div>

            {/* Print button */}
            <button
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-md hover:shadow-lg transition active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Prescription</span>
            </button>

            {/* Close modal */}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white hover:bg-slate-800 p-2 rounded-xl transition cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MOBILE VIEW SWITCHER (No-Print) */}
        <div className="no-print sm:hidden flex bg-slate-100 p-1 border-b border-slate-200 text-xs">
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex-1 py-2 text-center rounded-lg font-bold transition ${
              activeTab === 'preview' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600'
            }`}
          >
            Rx Print Preview
          </button>
          <button
            onClick={() => setActiveTab('edit')}
            className={`flex-1 py-2 text-center rounded-lg font-bold transition ${
              activeTab === 'edit' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600'
            }`}
          >
            Customize Meds ({prescriptionList.length})
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto bg-slate-100 p-4 sm:p-6 flex flex-col items-center">
          
          {/* TAB 1: MEDICINE BUILDER / CUSTOMIZER (No-Print) */}
          {activeTab === 'edit' && (
            <div className="no-print w-full max-w-4xl space-y-6 pb-6 animate-in fade-in duration-150">
              
              {/* Quick Presets Picker */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    <h4 className="font-bold text-sm text-slate-800">Quick OB-GYN Presets (1-Click Fill)</h4>
                  </div>
                  <span className="text-[11px] text-slate-400">Click any medication to populate form</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PRESET_OBGYN_MEDICATIONS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className="text-left p-2.5 bg-slate-50 hover:bg-teal-50 hover:border-teal-300 border border-slate-200 rounded-xl transition text-xs group cursor-pointer"
                    >
                      <p className="font-bold text-slate-800 group-hover:text-teal-900 truncate">
                        {preset.brandName || preset.genericName}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">{preset.genericName}</p>
                      <span className="inline-block mt-1 bg-white group-hover:bg-teal-100 text-slate-600 group-hover:text-teal-800 text-[9px] px-1.5 py-0.5 rounded border border-slate-200 group-hover:border-teal-200 font-medium">
                        {preset.dosage}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Add Custom Medicine Form */}
              <form onSubmit={handleAddMedicine} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="font-bold text-sm text-slate-800 flex items-center space-x-2">
                    <Pill className="w-4 h-4 text-teal-600" />
                    <span>Prescribe New Medication</span>
                  </h4>
                  <span className="text-slate-400 text-[11px]">Fields marked with * are required</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="font-semibold text-slate-700 block mb-1">
                      Generic Medicine Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ferrous Sulfate + Folic Acid"
                      value={genericName}
                      onChange={(e) => setGenericName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-teal-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Brand Name (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Hemarate FA"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Dosage & Strength <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 60mg / 400mcg"
                      value={dosage}
                      onChange={(e) => setDosage(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-teal-500 font-semibold text-teal-900"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Dosage Form</label>
                    <select
                      value={form}
                      onChange={(e) => setForm(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="Film-Coated Tablet">Film-Coated Tablet</option>
                      <option value="Tablet">Tablet</option>
                      <option value="Capsule">Capsule</option>
                      <option value="Softgel Capsule">Softgel Capsule</option>
                      <option value="Syrup / Suspension">Syrup / Suspension</option>
                      <option value="Vaginal Suppository">Vaginal Suppository</option>
                      <option value="Intramuscular Injection">Intramuscular Injection</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Frequency / Timing</label>
                    <select
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="Once daily">Once daily (OD)</option>
                      <option value="Twice daily">Twice daily (BID - every 12 hrs)</option>
                      <option value="Three times daily">Three times daily (TID - every 8 hrs)</option>
                      <option value="Four times daily">Four times daily (QID - every 6 hrs)</option>
                      <option value="Every 6 hours as needed">Every 6 hours as needed (PRN)</option>
                      <option value="At bedtime">At bedtime (HS)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Total Quantity (#)</label>
                    <input
                      type="text"
                      placeholder="e.g. #30 tablets"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Duration of Treatment</label>
                    <input
                      type="text"
                      placeholder="e.g. 30 days"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="font-semibold text-slate-700 block mb-1">
                      Patient Instructions / Sig (Directions for Use)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Take 1 tablet once daily with meals or orange juice."
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-5 py-2 rounded-xl flex items-center space-x-1.5 shadow-xs transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Add to Prescription List</span>
                  </button>
                </div>
              </form>

              {/* Current Meds List */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
                <h4 className="font-bold text-sm text-slate-800 flex items-center justify-between">
                  <span>Current Prescribed Medications ({prescriptionList.length})</span>
                  <button
                    onClick={() => setActiveTab('preview')}
                    className="text-teal-700 hover:text-teal-900 text-xs font-semibold hover:underline cursor-pointer"
                  >
                    View Rx Pad Preview ➔
                  </button>
                </h4>

                {prescriptionList.length === 0 ? (
                  <p className="text-slate-400 text-xs py-4 text-center">No medications added yet.</p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {prescriptionList.map((item, index) => (
                      <div key={item.id} className="py-3 flex items-start justify-between gap-4">
                        <div className="flex items-start space-x-3">
                          <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center shrink-0">
                            {index + 1}
                          </span>
                          <div>
                            <p className="font-bold text-slate-900 text-xs">
                              {item.genericName} {item.brandName ? `(${item.brandName})` : ''} — <span className="text-teal-700 font-bold">{item.dosage}</span>
                            </p>
                            <p className="text-slate-600 text-[11px] mt-0.5">
                              <strong>Sig:</strong> {item.instructions}
                            </p>
                            <div className="flex items-center space-x-3 text-[10px] text-slate-400 mt-1">
                              <span>Form: {item.form}</span>
                              <span>•</span>
                              <span>Qty: <strong>{item.quantity}</strong></span>
                              <span>•</span>
                              <span>Duration: {item.duration}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveMedicine(item.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Doctor Details & Credentials Customizer */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4 text-xs">
                <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  <h4 className="font-bold text-sm text-slate-800">Doctor Credentials & Clinic Information</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Doctor Name</label>
                    <input
                      type="text"
                      value={doctorName}
                      onChange={(e) => setDoctorName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-teal-500 font-bold text-slate-800"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-semibold text-slate-700 block mb-1">Specialization / Title</label>
                    <input
                      type="text"
                      value={doctorTitle}
                      onChange={(e) => setDoctorTitle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">PRC License No.</label>
                    <input
                      type="text"
                      value={prcNumber}
                      onChange={(e) => setPrcNumber(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-teal-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">PTR No.</label>
                    <input
                      type="text"
                      value={ptrNumber}
                      onChange={(e) => setPtrNumber(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-teal-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">S2 Drug License No.</label>
                    <input
                      type="text"
                      value={s2Number}
                      onChange={(e) => setS2Number(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-teal-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Special Advice & Warning Signs</label>
                  <textarea
                    rows={3}
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: OFFICIAL PRINTABLE PRESCRIPTION PAD (The Document that gets printed) */}
          <div className="w-full flex flex-col items-center">
            
            {/* Quick Actions Bar above the paper (No-Print) */}
            <div className="no-print w-full max-w-[800px] flex items-center justify-between mb-3 text-xs">
              <div className="flex items-center space-x-3 text-slate-600">
                <label className="flex items-center space-x-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeDigitalSignature}
                    onChange={(e) => setIncludeDigitalSignature(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded cursor-pointer"
                  />
                  <span>Include Digital Signature Stamp</span>
                </label>
              </div>

              <div className="flex items-center space-x-2">
                {checkup && onSavePrescription && (
                  <button
                    onClick={handleSaveToRecord}
                    className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold px-3 py-1.5 rounded-lg shadow-2xs flex items-center space-x-1 transition cursor-pointer"
                  >
                    {savedSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Prescription Saved!</span>
                      </>
                    ) : (
                      <>
                        <FileCheck className="w-3.5 h-3.5 text-teal-600" />
                        <span>Save to Checkup Record</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  onClick={handlePrint}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-1.5 rounded-lg shadow-xs flex items-center space-x-1 transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Rx</span>
                </button>
              </div>
            </div>

            {/* REAL PRESCRIPTION PAPER CONTAINER */}
            <div
              id="printable-prescription"
              className="w-full max-w-[800px] bg-white rounded-xl shadow-xl border border-slate-300 p-8 sm:p-10 font-sans text-slate-900 relative min-h-[900px] flex flex-col justify-between"
              style={{ minHeight: '880px' }}
            >
              
              {/* TOP CLINIC & DOCTOR HEADER */}
              <div>
                <div className="border-b-2 border-teal-800 pb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black text-teal-900 tracking-tight">
                      {doctorName}
                    </h1>
                    <p className="text-xs font-bold text-teal-700 tracking-wide uppercase mt-0.5">
                      {doctorTitle}
                    </p>
                    <p className="text-[11px] text-slate-600 mt-1 font-medium">
                      {clinicName}
                    </p>
                    <p className="text-[10px] text-slate-500 flex items-center space-x-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400 inline shrink-0" />
                      <span>{clinicAddress}</span>
                    </p>
                    <p className="text-[10px] text-slate-500 flex items-center space-x-1 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-400 inline shrink-0" />
                      <span>{clinicContact}</span>
                    </p>
                  </div>

                  <div className="text-left sm:text-right shrink-0 bg-teal-50/70 border border-teal-200 rounded-xl p-3 sm:min-w-[180px]">
                    <span className="text-[10px] uppercase font-bold text-teal-800 block tracking-wider">
                      Official Medical Rx
                    </span>
                    <p className="text-xs font-bold text-slate-800 mt-1">
                      Date: <span className="font-mono text-teal-950">{todayStr}</span>
                    </p>
                    <p className="text-[10px] text-slate-600 mt-0.5">
                      PRC No: <span className="font-mono font-bold">{prcNumber}</span>
                    </p>
                    <p className="text-[10px] text-slate-600">
                      PTR No: <span className="font-mono font-bold">{ptrNumber}</span>
                    </p>
                  </div>
                </div>

                {/* PATIENT DEMOGRAPHIC & GESTATIONAL BANNER */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 my-4 text-xs grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Patient Name</span>
                    <p className="font-bold text-slate-900 text-sm">{patient.fullName}</p>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Age / Sex</span>
                    <p className="font-bold text-slate-800">{patient.age} Yrs Old / Female</p>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">AOG / Trimester</span>
                    <p className="font-bold text-teal-800 font-mono">{obgynMetrics.aogFormatted} ({obgynMetrics.trimester})</p>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">EDD (Due Date)</span>
                    <p className="font-bold text-teal-800 font-mono">{obgynMetrics.edd}</p>
                  </div>

                  <div className="col-span-2 sm:col-span-3">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Address</span>
                    <p className="text-slate-700 truncate">{patient.address}</p>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Drug Allergies</span>
                    <p className="font-bold text-rose-600">{patient.allergies || 'None Reported'}</p>
                  </div>
                </div>

                {/* BIG RX SYMBOL & MEDICATION LIST */}
                <div className="relative pt-2 pb-6 min-h-[360px]">
                  {/* Subtle Rx Watermark in background */}
                  <div className="absolute right-6 top-10 select-none pointer-events-none text-slate-100 font-serif font-black text-9xl -z-0 opacity-60">
                    ℞
                  </div>

                  <div className="flex items-center space-x-2 text-2xl font-serif font-black text-teal-900 mb-4 z-10 relative">
                    <span className="text-3xl text-teal-800">℞</span>
                    <span className="text-sm font-sans font-bold uppercase tracking-wider text-slate-600">
                      Prescription / Orders:
                    </span>
                  </div>

                  {/* List of Medicines */}
                  <div className="space-y-5 z-10 relative pl-2 sm:pl-4">
                    {prescriptionList.length === 0 ? (
                      <div className="text-center py-12 text-slate-400 italic text-sm">
                        No medications prescribed. Click "Customize Meds" tab to add items.
                      </div>
                    ) : (
                      prescriptionList.map((item, index) => (
                        <div key={item.id} className="text-xs space-y-1">
                          <div className="flex items-baseline justify-between">
                            <p className="font-extrabold text-sm text-slate-900">
                              {index + 1}. {item.genericName.toUpperCase()}{' '}
                              {item.brandName ? `(${item.brandName})` : ''}{' '}
                              <span className="text-teal-800 font-black">{item.dosage}</span>{' '}
                              <span className="text-slate-600 font-normal">({item.form})</span>
                            </p>
                            <span className="font-bold font-mono text-slate-800 text-xs shrink-0 ml-2">
                              {item.quantity}
                            </span>
                          </div>

                          <p className="text-slate-800 pl-4 font-medium leading-relaxed">
                            <strong className="font-serif italic text-teal-900 text-sm">Sig: </strong>
                            {item.instructions}
                          </p>

                          <p className="text-[11px] text-slate-500 pl-4">
                            Duration: <strong>{item.duration}</strong> • Frequency: {item.frequency}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Special Clinical Instructions */}
                  {specialInstructions && (
                    <div className="mt-8 pt-4 border-t border-dashed border-slate-300 pl-2 sm:pl-4 z-10 relative">
                      <p className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-1">
                        Doctor's Instructions & Care Advice:
                      </p>
                      <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed italic bg-slate-50/60 p-2.5 rounded-lg border border-slate-200">
                        {specialInstructions}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* BOTTOM DOCTOR SIGNATURE & FOOTER */}
              <div className="pt-6 border-t-2 border-teal-800 mt-6">
                <div className="flex flex-col sm:flex-row items-end justify-between gap-4">
                  {/* Clinic Notice */}
                  <div className="text-[10px] text-slate-500 max-w-xs leading-tight">
                    <p className="font-bold text-slate-700">Valid only with Physician's Signature & PRC License.</p>
                    <p className="mt-0.5">Please bring this prescription and your OB-GYN booklet on your next appointment.</p>
                    {checkup?.followUpDate && (
                      <p className="text-teal-800 font-bold mt-1">
                        📅 Next Follow-Up: {checkup.followUpDate}
                      </p>
                    )}
                  </div>

                  {/* SIGNATURE BLOCK */}
                  <div className="text-center sm:text-right min-w-[240px] flex flex-col items-center sm:items-end">
                    {includeDigitalSignature && (
                      <div className="mb-1 text-center font-serif italic text-teal-900 font-bold select-none text-lg tracking-wider opacity-90 -rotate-2">
                        {doctorName}
                      </div>
                    )}
                    
                    <div className="w-56 border-b border-slate-900 mb-1"></div>
                    
                    <p className="font-bold text-xs text-slate-900 uppercase tracking-wide">
                      {doctorName}
                    </p>
                    <p className="text-[10px] text-teal-800 font-medium">{doctorTitle}</p>
                    <div className="text-[10px] text-slate-600 font-mono space-y-0.5 mt-1">
                      <p>PRC Lic. No.: <strong className="text-slate-900">{prcNumber}</strong></p>
                      <p>PTR No.: <strong className="text-slate-900">{ptrNumber}</strong></p>
                      <p>S2 License: <strong className="text-slate-900">{s2Number}</strong></p>
                    </div>
                  </div>
                </div>

                <div className="text-center text-[9px] text-slate-400 mt-4 font-mono">
                  MaternalCare OB-GYN Electronic Medical System • Document ID: RX-{patient.id}-{Date.now().toString().slice(-6)}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* MODAL FOOTER (No-Print) */}
        <div className="no-print bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-between shrink-0 text-xs">
          <span className="text-slate-500">
            Standard Paper Size: A4 / US Letter Portrait • Ready for Direct Printing or PDF Export
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold px-4 py-2 rounded-xl transition cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2 rounded-xl flex items-center space-x-1.5 shadow-md transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Prescription</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
