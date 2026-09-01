import React, { useState, useEffect } from 'react';
import type { CheckupRecord, DiscountType, PaymentMethod } from '../types/patient';
import { format } from 'date-fns';
import { Save, Calendar, Stethoscope, Clock, CheckCircle2, Trash2, ShieldAlert, Printer, Pencil, X, Check, Edit3, Tag } from 'lucide-react';

interface CheckupTableProps {
  checkups: CheckupRecord[];
  onAddCheckup: (newCheckup: Omit<CheckupRecord, 'id'>) => void;
  onUpdateCheckup?: (updatedCheckup: CheckupRecord) => void;
  onDeleteCheckup?: (checkupId: string) => void;
  currentUserRole?: 'DOCTOR' | 'NURSE';
  onOpenPrescription?: (checkup?: CheckupRecord) => void;
  defaultDate?: string;
}

export const COMMON_HMOS = [
  'Maxicare',
  'Medicard',
  'Intellicare',
  'PhilCare',
  'Cocolife',
  'Pacific Cross',
  'Etiqa Philippines',
  'Carehealth Plus',
  'Insular Health Care',
  'Caritas Health Shield',
  'Other HMO',
];

export const CheckupTable: React.FC<CheckupTableProps> = ({
  checkups,
  onAddCheckup,
  onUpdateCheckup,
  onDeleteCheckup,
  currentUserRole = 'DOCTOR',
  onOpenPrescription,
  defaultDate,
}) => {
  const isNurse = currentUserRole === 'NURSE';
  const todayDate = format(new Date(), 'yyyy-MM-dd');

  // Input Row 1 State
  const [checkupDate, setCheckupDate] = useState<string>(defaultDate || todayDate);
  const [grossFee, setGrossFee] = useState<string>('');
  const [discountType, setDiscountType] = useState<DiscountType>('None');
  const [customDiscount, setCustomDiscount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [hmoProvider, setHmoProvider] = useState<string>('Maxicare');
  const [hmoApprovalCode, setHmoApprovalCode] = useState<string>('');
  const [seniorPwdId, setSeniorPwdId] = useState<string>('');
  const [philhealthClaimNo, setPhilhealthClaimNo] = useState<string>('');

  const [weightKg, setWeightKg] = useState<string>('');
  const [bp, setBp] = useState<string>('');
  const [fhrBpm, setFhrBpm] = useState<string>('');
  const [diagnosis, setDiagnosis] = useState<string>('');
  const [procedure, setProcedure] = useState<string>('');
  const [followUpDate, setFollowUpDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Compute discount amount and net fee
  const numericGross = parseFloat(grossFee) || 0;
  let computedDiscount = 0;
  if (discountType === 'Senior Citizen (20%)' || discountType === 'PWD (20%)') {
    computedDiscount = numericGross * 0.20;
  } else if (discountType === 'Doctor Courtesy' || paymentMethod === 'Free / Waived') {
    computedDiscount = numericGross;
  } else if (discountType === 'Custom') {
    computedDiscount = parseFloat(customDiscount) || 0;
  }
  const computedNetFee = paymentMethod === 'Free / Waived' ? 0 : Math.max(0, numericGross - computedDiscount);

  // Edit Modal State (Accessible by both Doctor and Nurse)
  const [editingCheckup, setEditingCheckup] = useState<CheckupRecord | null>(null);
  const [editDate, setEditDate] = useState<string>('');
  const [editGrossFee, setEditGrossFee] = useState<string>('');
  const [editDiscountType, setEditDiscountType] = useState<DiscountType>('None');
  const [editCustomDiscount, setEditCustomDiscount] = useState<string>('');
  const [editPaymentMethod, setEditPaymentMethod] = useState<PaymentMethod>('Cash');
  const [editHmoProvider, setEditHmoProvider] = useState<string>('Maxicare');
  const [editHmoApprovalCode, setEditHmoApprovalCode] = useState<string>('');
  const [editSeniorPwdId, setEditSeniorPwdId] = useState<string>('');
  const [editPhilhealthClaimNo, setEditPhilhealthClaimNo] = useState<string>('');
  const [editBp, setEditBp] = useState<string>('');
  const [editWeight, setEditWeight] = useState<string>('');
  const [editFhr, setEditFhr] = useState<string>('');
  const [editFundalHeight, setEditFundalHeight] = useState<string>('');
  const [editDiagnosis, setEditDiagnosis] = useState<string>('');
  const [editProcedure, setEditProcedure] = useState<string>('');
  const [editFollowUp, setEditFollowUp] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');

  const editNumericGross = parseFloat(editGrossFee) || 0;
  let editComputedDiscount = 0;
  if (editDiscountType === 'Senior Citizen (20%)' || editDiscountType === 'PWD (20%)') {
    editComputedDiscount = editNumericGross * 0.20;
  } else if (editDiscountType === 'Doctor Courtesy' || editPaymentMethod === 'Free / Waived') {
    editComputedDiscount = editNumericGross;
  } else if (editDiscountType === 'Custom') {
    editComputedDiscount = parseFloat(editCustomDiscount) || 0;
  }
  const editComputedNetFee = editPaymentMethod === 'Free / Waived' ? 0 : Math.max(0, editNumericGross - editComputedDiscount);

  const totalFees = checkups.reduce((sum, c) => sum + (c.fee || 0), 0);

  const handleStartEdit = (rec: CheckupRecord) => {
    setEditingCheckup(rec);
    setEditDate(rec.date || todayDate);
    setEditGrossFee(rec.grossFee !== undefined ? String(rec.grossFee) : (rec.fee !== undefined ? String(rec.fee) : ''));
    setEditDiscountType(rec.discountType || 'None');
    setEditCustomDiscount(rec.discountAmount !== undefined ? String(rec.discountAmount) : '');
    setEditPaymentMethod(rec.paymentMethod || 'Cash');
    setEditHmoProvider(rec.hmoProvider || 'Maxicare');
    setEditHmoApprovalCode(rec.hmoApprovalCode || '');
    setEditSeniorPwdId(rec.seniorPwdId || '');
    setEditPhilhealthClaimNo(rec.philhealthClaimNo || '');
    setEditBp(rec.bp || '');
    setEditWeight(rec.weightKg !== undefined ? String(rec.weightKg) : '');
    setEditFhr(rec.fhrBpm !== undefined ? String(rec.fhrBpm) : '');
    setEditFundalHeight(rec.fundalHeightCm !== undefined ? String(rec.fundalHeightCm) : '');
    setEditDiagnosis(rec.diagnosis || '');
    setEditProcedure(rec.procedure || '');
    setEditFollowUp(rec.followUpDate || '');
    setEditNotes(rec.notes || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCheckup || !onUpdateCheckup) return;

    const updated: CheckupRecord = {
      ...editingCheckup,
      date: editDate || editingCheckup.date,
      grossFee: editGrossFee ? parseFloat(editGrossFee) : undefined,
      discountType: editDiscountType,
      discountAmount: editComputedDiscount > 0 ? editComputedDiscount : undefined,
      fee: editGrossFee ? editComputedNetFee : (editingCheckup.fee),
      paymentMethod: editPaymentMethod,
      hmoProvider: editPaymentMethod === 'HMO / Health Card' ? editHmoProvider : undefined,
      hmoApprovalCode: editPaymentMethod === 'HMO / Health Card' ? editHmoApprovalCode.trim() || undefined : undefined,
      seniorPwdId: (editDiscountType === 'Senior Citizen (20%)' || editDiscountType === 'PWD (20%)') ? editSeniorPwdId.trim() || undefined : undefined,
      philhealthClaimNo: editPaymentMethod === 'PhilHealth' ? editPhilhealthClaimNo.trim() || undefined : undefined,
      bp: editBp || undefined,
      weightKg: editWeight ? parseFloat(editWeight) : undefined,
      fhrBpm: editFhr ? parseInt(editFhr, 10) : undefined,
      fundalHeightCm: editFundalHeight ? parseFloat(editFundalHeight) : undefined,
      diagnosis: editDiagnosis.trim() || editingCheckup.diagnosis,
      procedure: editProcedure.trim() || editingCheckup.procedure,
      followUpDate: editFollowUp || editingCheckup.followUpDate,
      notes: editNotes.trim() || undefined,
    };

    onUpdateCheckup(updated);
    setEditingCheckup(null);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  useEffect(() => {
    if (defaultDate) {
      setCheckupDate(defaultDate);
    }
  }, [defaultDate]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const finalDiagnosis = diagnosis.trim() || (isNurse ? 'Triage Vitals Check (Clinical Assistant)' : '');
    const finalProcedure = procedure.trim() || (isNurse ? 'Vital Signs & Prep' : '');

    if (!finalDiagnosis) {
      setErrorMsg('Clinical Diagnosis is required');
      return;
    }
    if (!finalProcedure) {
      setErrorMsg('Procedure / Treatment is required');
      return;
    }

    setErrorMsg('');
    onAddCheckup({
      date: checkupDate || todayDate,
      grossFee: grossFee ? numericGross : undefined,
      discountType: discountType,
      discountAmount: computedDiscount > 0 ? computedDiscount : undefined,
      fee: grossFee ? computedNetFee : undefined,
      paymentMethod: paymentMethod,
      hmoProvider: paymentMethod === 'HMO / Health Card' ? hmoProvider : undefined,
      hmoApprovalCode: paymentMethod === 'HMO / Health Card' ? hmoApprovalCode.trim() || undefined : undefined,
      seniorPwdId: (discountType === 'Senior Citizen (20%)' || discountType === 'PWD (20%)') ? seniorPwdId.trim() || undefined : undefined,
      philhealthClaimNo: paymentMethod === 'PhilHealth' ? philhealthClaimNo.trim() || undefined : undefined,
      weightKg: weightKg ? parseFloat(weightKg) : undefined,
      bp: bp || undefined,
      fhrBpm: fhrBpm ? parseInt(fhrBpm, 10) : undefined,
      diagnosis: finalDiagnosis,
      procedure: finalProcedure,
      followUpDate: followUpDate || 'As needed',
      notes: notes.trim() || undefined,
    });

    // Clear inputs except Date
    setGrossFee('');
    setDiscountType('None');
    setCustomDiscount('');
    setPaymentMethod('Cash');
    setHmoProvider('Maxicare');
    setHmoApprovalCode('');
    setSeniorPwdId('');
    setPhilhealthClaimNo('');
    setWeightKg('');
    setBp('');
    setFhrBpm('');
    setDiagnosis('');
    setProcedure('');
    setFollowUpDate('');
    setNotes('');

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Section Header */}
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-teal-100 text-teal-700 rounded-lg">
            <Stethoscope className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <h3 className="text-sm font-bold text-slate-800">Check-up & Clinical Records</h3>
              {isNurse ? (
                <span className="bg-amber-50 text-amber-800 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-amber-200 flex items-center space-x-1">
                  <ShieldAlert className="w-2.5 h-2.5" />
                  <span>Nurse Triage Entry</span>
                </span>
              ) : (
                <span className="bg-teal-50 text-teal-800 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-teal-200">
                  Doctor Clinical Mode
                </span>
              )}
              {totalFees > 0 && (
                <span className="bg-emerald-50 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-300 font-mono shadow-2xs">
                  Total Collected: ₱{totalFees.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              {isNurse
                ? 'Record patient vitals & triage (Prescription creation & record deletions are restricted to Doctor)'
                : 'Record consultation details, diagnosis, procedures, checkup fee (₱), and print prescriptions'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {!isNurse && onOpenPrescription && (
            <button
              onClick={() => onOpenPrescription()}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-xs transition flex items-center space-x-1.5 active:scale-95 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Issue Prescription (℞)</span>
            </button>
          )}

          {saveSuccess && (
            <span className="flex items-center space-x-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-3 py-1 rounded-full font-medium animate-bounce">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Record Saved Successfully!</span>
            </span>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="bg-rose-50 text-rose-700 border-b border-rose-200 px-5 py-2 text-xs font-medium">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* MOBILE ADAPTIVE VIEW (Shown on small screens < 768px) */}
      <div className="block md:hidden p-4 space-y-4">
        {/* Mobile New Entry Card */}
        <div className="bg-teal-50/70 border-2 border-teal-200 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center space-x-1.5 font-bold text-teal-900 text-xs">
              <Calendar className="w-4 h-4 text-teal-600 shrink-0" />
              <span>Consultation Date:</span>
            </div>
            <input
              type="date"
              value={checkupDate}
              onChange={(e) => setCheckupDate(e.target.value)}
              className="bg-white border border-teal-300 rounded-lg px-2 py-1 text-xs font-bold text-teal-900 focus:ring-2 focus:ring-teal-500 shadow-2xs"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">BP</label>
              <input
                type="text"
                placeholder="120/80"
                value={bp}
                onChange={(e) => setBp(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Weight (kg)</label>
              <input
                type="number"
                placeholder="65.0"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">FHR (bpm)</label>
              <input
                type="number"
                placeholder="145"
                value={fhrBpm}
                onChange={(e) => setFhrBpm(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-teal-500 font-semibold text-teal-800"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-slate-600 font-bold block mb-0.5">
              {isNurse ? "Nurse Triage & Initial Assessment" : "Clinical Diagnosis / Assessment"} <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              placeholder={isNurse ? "Document patient symptoms & triage assessment..." : "Document clinical diagnosis & gestational findings..."}
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-teal-500 resize-none"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-600 font-bold block mb-0.5">
              {isNurse ? "Triage Notes / Vital Prep" : "Procedure, Treatment & Prescriptions"}
            </label>
            <textarea
              rows={2}
              placeholder={isNurse ? "Vitals recorded / Prep actions..." : "Enter procedure & prescriptions..."}
              value={procedure}
              onChange={(e) => setProcedure(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-teal-500 resize-none"
            />
          </div>
          {/* BILLING, DISCOUNT & COVERAGE (Mobile Form) */}
          <div className="bg-white/90 p-3 rounded-xl border border-teal-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-800 flex items-center space-x-1">
                <Tag className="w-3.5 h-3.5 text-teal-600" />
                <span>Consultation Fee & Discount</span>
              </span>
              {computedNetFee > 0 ? (
                <span className="text-xs font-black text-emerald-950 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full font-mono">
                  Net: ₱{computedNetFee.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              ) : (
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  Free / Waived
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-600 font-semibold block mb-0.5">Standard Fee (₱)</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₱</span>
                  <input
                    type="number"
                    placeholder="500.00"
                    value={grossFee}
                    onChange={(e) => setGrossFee(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg pl-6 pr-2 py-1.5 text-xs font-bold text-emerald-900 focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-600 font-semibold block mb-0.5">Discount Type</label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as DiscountType)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-teal-500"
                >
                  <option value="None">None (0%)</option>
                  <option value="Senior Citizen (20%)">👴 Senior Citizen (20%)</option>
                  <option value="PWD (20%)">♿ PWD (20%)</option>
                  <option value="Doctor Courtesy">🤝 Doctor Courtesy (Free)</option>
                  <option value="Custom">Custom (₱)</option>
                </select>
              </div>
            </div>

            {discountType === 'Custom' && (
              <div>
                <label className="text-[10px] text-slate-600 font-semibold block mb-0.5">Custom Discount Amount (₱)</label>
                <input
                  type="number"
                  placeholder="e.g. 100"
                  value={customDiscount}
                  onChange={(e) => setCustomDiscount(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs focus:ring-2 focus:ring-teal-500"
                />
              </div>
            )}

            {(discountType === 'Senior Citizen (20%)' || discountType === 'PWD (20%)') && (
              <div>
                <label className="text-[10px] text-slate-600 font-semibold block mb-0.5">Senior / PWD ID # (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. OSCA-12345"
                  value={seniorPwdId}
                  onChange={(e) => setSeniorPwdId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs focus:ring-2 focus:ring-teal-500"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
              <div>
                <label className="text-[10px] text-slate-600 font-semibold block mb-0.5">Payment / Coverage</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Cash">💵 Cash (₱)</option>
                  <option value="HMO / Health Card">🏥 HMO / Health Card</option>
                  <option value="PhilHealth">🇵🇭 PhilHealth</option>
                  <option value="Free / Waived">🆓 Free / Waived</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Next Follow-up</label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {paymentMethod === 'HMO / Health Card' && (
              <div className="grid grid-cols-2 gap-2 bg-blue-50/70 p-2 rounded-lg border border-blue-200">
                <div>
                  <label className="text-[9px] text-blue-900 font-bold block mb-0.5">HMO Provider</label>
                  <select
                    value={hmoProvider}
                    onChange={(e) => setHmoProvider(e.target.value)}
                    className="w-full bg-white border border-blue-300 rounded p-1 text-xs font-medium"
                  >
                    {COMMON_HMOS.map((hmo) => (
                      <option key={hmo} value={hmo}>{hmo}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] text-blue-900 font-bold block mb-0.5">Approval / LOA Code</label>
                  <input
                    type="text"
                    placeholder="e.g. LOA-99214"
                    value={hmoApprovalCode}
                    onChange={(e) => setHmoApprovalCode(e.target.value)}
                    className="w-full bg-white border border-blue-300 rounded p-1 text-xs"
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'PhilHealth' && (
              <div className="bg-emerald-50/70 p-2 rounded-lg border border-emerald-200">
                <label className="text-[9px] text-emerald-900 font-bold block mb-0.5">PhilHealth Claim / Konsulta Ref #</label>
                <input
                  type="text"
                  placeholder="e.g. PH-2026-8812"
                  value={philhealthClaimNo}
                  onChange={(e) => setPhilhealthClaimNo(e.target.value)}
                  className="w-full bg-white border border-emerald-300 rounded p-1 text-xs"
                />
              </div>
            )}
          </div>

          <div className="pt-1">
            <button
              onClick={handleSave}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-xs transition flex items-center justify-center space-x-1.5 active:scale-95 text-xs cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isNurse ? 'Save Vitals' : 'Save Record & Fee'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Past Checkup Cards */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold text-slate-700 flex items-center justify-between">
            <span>Past Consultation History ({checkups.length})</span>
          </h4>

          {checkups.length === 0 ? (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center text-slate-400">
              <Clock className="w-6 h-6 mx-auto mb-1.5 text-slate-300" />
              <p className="text-xs font-medium text-slate-600">No past check-ups</p>
              <p className="text-[10px]">Record today's consultation above.</p>
            </div>
          ) : (
            checkups.map((rec) => (
              <div key={rec.id} className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs space-y-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                    <span className="font-bold text-slate-900 text-xs">{rec.date}</span>
                    {rec.fee !== undefined && rec.fee > 0 && (
                      <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200 font-mono">
                        ₱{Number(rec.fee).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </span>
                    )}
                  </div>
                    <div className="flex items-center space-x-1.5">
                      {/* Edit button for both Doctor and Nurse */}
                      <button
                        onClick={() => handleStartEdit(rec)}
                        className="text-teal-700 hover:text-teal-900 p-1 hover:bg-teal-50 rounded transition"
                        title="Edit checkup details"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      {!isNurse && onOpenPrescription && (
                        <button
                          onClick={() => onOpenPrescription(rec)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center space-x-1 transition cursor-pointer active:scale-95 ${
                            rec.prescriptions && rec.prescriptions.length > 0
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs'
                              : 'text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200'
                          }`}
                          title="Print / View Prescription for this visit"
                        >
                          <Printer className="w-3 h-3 text-teal-600" />
                          <span>{rec.prescriptions && rec.prescriptions.length > 0 ? `Rx (${rec.prescriptions.length})` : 'Rx'}</span>
                        </button>
                      )}
                      {!isNurse && onDeleteCheckup && (
                        <button
                          onClick={() => onDeleteCheckup(rec.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 hover:bg-rose-50 rounded transition"
                          title="Delete record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-[11px] text-slate-500">
                    {rec.bp && <span>BP: <strong>{rec.bp}</strong></span>}
                    {rec.weightKg && <span>Weight: <strong>{rec.weightKg} kg</strong></span>}
                    {rec.fhrBpm && (
                      <span className="bg-teal-50 text-teal-800 px-2 py-0.5 rounded border border-teal-200 font-medium">
                        FHR: <strong>{rec.fhrBpm} bpm</strong>
                      </span>
                    )}
                  </div>

                  <div className="text-xs space-y-1">
                    <p className="font-semibold text-slate-800">{rec.diagnosis}</p>
                    {rec.procedure && <p className="text-slate-600 text-[11px]">{rec.procedure}</p>}
                    {rec.prescriptions && rec.prescriptions.length > 0 && (
                      <div className="bg-teal-50/60 border border-teal-200 rounded p-1.5 text-[10px] text-teal-900">
                        <span className="font-bold">℞ Prescribed ({rec.prescriptions.length}): </span>
                        {rec.prescriptions.map((p) => p.genericName).join(', ')}
                      </div>
                    )}
                    {rec.notes && <p className="text-slate-400 text-[10px] italic">Notes: {rec.notes}</p>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* DESKTOP TABLE VIEW (Shown on screens >= 768px) */}
        <div className="hidden md:block overflow-x-auto w-full">
          <table className="w-full text-left text-xs text-slate-700 border-collapse min-w-[800px]">
            <thead className="bg-slate-100/80 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-[110px]">Date</th>
                <th className="py-3 px-3 w-[150px]">Vitals (Weight / BP / FHR)</th>
                <th className="py-3 px-3 min-w-[190px]">Diagnosis</th>
                <th className="py-3 px-3 min-w-[190px]">Procedure & Rx</th>
                <th className="py-3 px-3 w-[110px]">Fee (₱)</th>
                <th className="py-3 px-3 w-[110px]">Follow-up</th>
                <th className="py-3 px-4 w-[130px] text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {/* ROW 1: INPUT ROW FOR CHECK-UP ENTRY */}
              <tr className="bg-teal-50/50 border-b-2 border-teal-200/80">
                <td className="py-3 px-4 align-top">
                  <input
                    type="date"
                    value={checkupDate}
                    onChange={(e) => setCheckupDate(e.target.value)}
                    className="w-full bg-white border border-teal-300 rounded-lg px-2 py-1.5 text-xs font-bold text-teal-900 focus:ring-2 focus:ring-teal-500 shadow-2xs cursor-pointer"
                  />
                  <span className="text-[10px] text-teal-600 font-semibold block mt-1">
                    {checkupDate === todayDate ? '🟢 Today' : '📅 Consult Date'}
                  </span>
                </td>

                <td className="py-3 px-3 align-top space-y-1.5">
                  <div>
                    <input
                      type="text"
                      placeholder="BP (e.g. 120/80)"
                      value={bp}
                      onChange={(e) => setBp(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Weight (kg)"
                      value={weightKg}
                      onChange={(e) => setWeightKg(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="FHR (bpm)"
                      value={fhrBpm}
                      onChange={(e) => setFhrBpm(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs font-semibold text-teal-800 focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                </td>

                <td className="py-3 px-3 align-top">
                  <textarea
                    rows={3}
                    placeholder={isNurse ? "Nurse triage & initial assessment..." : "Enter clinical diagnosis / assessment findings..."}
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-teal-500 focus:border-teal-500 resize-none font-medium"
                  />
                </td>

                <td className="py-3 px-3 align-top">
                  <textarea
                    rows={3}
                    placeholder={isNurse ? "Vitals recorded / Prep actions..." : "Enter procedure & prescriptions..."}
                    value={procedure}
                    onChange={(e) => setProcedure(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-teal-500 focus:border-teal-500 resize-none"
                  />
                </td>

                {/* Fee & Discount (₱) Input */}
                <td className="py-3 px-3 align-top min-w-[150px] space-y-1.5">
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₱</span>
                    <input
                      type="number"
                      placeholder="Gross Fee"
                      value={grossFee}
                      onChange={(e) => setGrossFee(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded pl-5 pr-1 py-1 text-xs font-bold text-emerald-900 focus:ring-1 focus:ring-teal-500"
                      title="Standard Gross Consultation Fee (₱)"
                    />
                  </div>

                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as DiscountType)}
                    className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-[11px] font-medium text-slate-700 focus:ring-1 focus:ring-teal-500"
                    title="Discount Classification"
                  >
                    <option value="None">None (0%)</option>
                    <option value="Senior Citizen (20%)">👴 Senior (20%)</option>
                    <option value="PWD (20%)">♿ PWD (20%)</option>
                    <option value="Doctor Courtesy">🤝 Courtesy (Free)</option>
                    <option value="Custom">Custom (₱)</option>
                  </select>

                  {discountType === 'Custom' && (
                    <input
                      type="number"
                      placeholder="Discount ₱"
                      value={customDiscount}
                      onChange={(e) => setCustomDiscount(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-[10px]"
                    />
                  )}

                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-[11px] font-semibold text-slate-800 focus:ring-1 focus:ring-teal-500"
                    title="Payment Coverage / Provider"
                  >
                    <option value="Cash">💵 Cash</option>
                    <option value="HMO / Health Card">🏥 HMO Card</option>
                    <option value="PhilHealth">🇵🇭 PhilHealth</option>
                    <option value="Free / Waived">🆓 Free</option>
                  </select>

                  {paymentMethod === 'HMO / Health Card' && (
                    <div className="space-y-1">
                      <select
                        value={hmoProvider}
                        onChange={(e) => setHmoProvider(e.target.value)}
                        className="w-full bg-blue-50 border border-blue-200 rounded px-1 py-0.5 text-[10px] font-medium text-blue-900"
                      >
                        {COMMON_HMOS.map((h) => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="LOA / Appr #"
                        value={hmoApprovalCode}
                        onChange={(e) => setHmoApprovalCode(e.target.value)}
                        className="w-full bg-white border border-blue-200 rounded px-1.5 py-0.5 text-[10px]"
                      />
                    </div>
                  )}

                  {paymentMethod === 'PhilHealth' && (
                    <input
                      type="text"
                      placeholder="Claim / Ref #"
                      value={philhealthClaimNo}
                      onChange={(e) => setPhilhealthClaimNo(e.target.value)}
                      className="w-full bg-white border border-emerald-200 rounded px-1.5 py-0.5 text-[10px]"
                    />
                  )}

                  <div className="flex items-center justify-between text-[10px] pt-0.5 border-t border-slate-200">
                    <span className="text-slate-400">Net:</span>
                    <span className="font-mono font-bold text-emerald-950">
                      ₱{computedNetFee.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </td>

                <td className="py-3 px-3 align-top">
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                  />
                </td>

                <td className="py-3 px-4 align-top text-right space-y-1.5">
                  <button
                    onClick={handleSave}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium px-3 py-2 rounded-lg shadow-xs transition flex items-center justify-center space-x-1.5 active:scale-95 text-xs cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isNurse ? 'Save Vitals' : 'Save Record'}</span>
                  </button>
                </td>
              </tr>

              {/* ROW 2+: PAST READ-ONLY CHECKUP RECORDS */}
              {checkups.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-medium text-slate-500">No past check-up records yet.</p>
                    <p className="text-[11px] text-slate-400">Fill in Row 1 above and click "Save Record".</p>
                  </td>
                </tr>
              ) : (
                checkups.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-semibold text-slate-800 align-top">
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                        <span>{rec.date}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-slate-600 align-top">
                      <div className="space-y-0.5">
                        {rec.bp && <p className="font-medium text-slate-800">BP: {rec.bp}</p>}
                        {rec.weightKg && <p>Wt: {rec.weightKg} kg</p>}
                        {rec.fhrBpm && <p className="text-teal-700 font-medium">FHR: {rec.fhrBpm} bpm</p>}
                        {!rec.bp && !rec.weightKg && !rec.fhrBpm && <span className="text-slate-400">Standard</span>}
                      </div>
                    </td>

                    <td className="py-3.5 px-3 align-top font-medium text-slate-800">
                      <p className="leading-relaxed">{rec.diagnosis}</p>
                    </td>

                    <td className="py-3.5 px-3 align-top text-slate-600">
                      <p className="leading-relaxed">{rec.procedure}</p>
                      {rec.prescriptions && rec.prescriptions.length > 0 && (
                        <div className="bg-emerald-50/80 border border-emerald-200 rounded-lg p-2 text-[11px] text-emerald-950 mt-1.5 shadow-2xs space-y-0.5">
                          <span className="font-bold flex items-center space-x-1 text-emerald-800">
                            <span>💊 Prescribed Medications ({rec.prescriptions.length}):</span>
                          </span>
                          <p className="font-medium text-slate-700">
                            {rec.prescriptions.map((p) => `${p.genericName} (${p.dosage})`).join(' • ')}
                          </p>
                        </div>
                      )}
                      {rec.notes && <p className="text-[11px] text-slate-400 italic mt-1">Note: {rec.notes}</p>}
                    </td>

                    {/* Past Fee & Coverage Badges */}
                    <td className="py-3.5 px-3 align-top space-y-1">
                      {rec.fee !== undefined && rec.fee > 0 ? (
                        <div className="space-y-0.5">
                          <span className="bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-300 font-mono text-[11px] whitespace-nowrap block">
                            ₱{Number(rec.fee).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                          {rec.discountType && rec.discountType !== 'None' && (
                            <span className="bg-amber-50 text-amber-900 border border-amber-200 text-[9px] px-1.5 py-0.2 rounded block font-semibold">
                              🏷️ {rec.discountType === 'Senior Citizen (20%)' ? 'Senior (20% off)' : rec.discountType === 'PWD (20%)' ? 'PWD (20% off)' : rec.discountType}
                            </span>
                          )}
                          {rec.paymentMethod === 'HMO / Health Card' && (
                            <span className="bg-blue-50 text-blue-900 border border-blue-200 text-[9px] px-1.5 py-0.2 rounded block font-semibold">
                              🏥 {rec.hmoProvider || 'HMO'} {rec.hmoApprovalCode ? `(${rec.hmoApprovalCode})` : ''}
                            </span>
                          )}
                          {rec.paymentMethod === 'PhilHealth' && (
                            <span className="bg-emerald-50 text-emerald-900 border border-emerald-200 text-[9px] px-1.5 py-0.2 rounded block font-semibold">
                              🇵🇭 PhilHealth
                            </span>
                          )}
                        </div>
                      ) : rec.discountType === 'Doctor Courtesy' || rec.paymentMethod === 'Free / Waived' ? (
                        <span className="bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded border border-slate-200 text-[10px] block">
                          🆓 Free / Courtesy
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 align-top">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono text-[11px]">
                        {rec.followUpDate || 'None'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 align-top text-right">
                      <div className="flex items-center justify-end space-x-1">
                        {/* Edit Consultation Details (Both Doctor and Nurse) */}
                        <button
                          onClick={() => handleStartEdit(rec)}
                          className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition cursor-pointer"
                          title="Edit consultation details (Doctor & Nurse)"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        {!isNurse && onOpenPrescription && (
                          <button
                            onClick={() => onOpenPrescription(rec)}
                            className={`p-1.5 rounded-lg text-xs flex items-center space-x-1 transition cursor-pointer active:scale-95 ${
                              rec.prescriptions && rec.prescriptions.length > 0
                                ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 font-bold shadow-2xs'
                                : 'bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200'
                            }`}
                            title={rec.prescriptions && rec.prescriptions.length > 0 ? `View / Print Saved Prescription (${rec.prescriptions.length} meds)` : 'Create Prescription (Rx)'}
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span className="font-bold text-[10px]">
                              {rec.prescriptions && rec.prescriptions.length > 0 ? `Rx (${rec.prescriptions.length})` : 'Rx'}
                            </span>
                          </button>
                        )}
                        {!isNurse && onDeleteCheckup && (
                          <button
                            onClick={() => onDeleteCheckup(rec.id)}
                            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                            title="Delete record (Doctor only)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
        </table>
      </div>

      {/* EDIT CONSULTATION RECORD MODAL (Doctor & Nurse) */}
      {editingCheckup && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto font-sans">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-teal-100 text-teal-700 rounded-xl">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Edit Consultation Record & Billing</h3>
                  <p className="text-xs text-slate-500">
                    Update clinical notes, vitals, diagnosis, fee, discounts, or HMO coverage
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingCheckup(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-4 text-xs">
              {/* Row: Date, Gross Fee & Discount */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Consultation Date</label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Standard Fee (₱)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₱</span>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={editGrossFee}
                      onChange={(e) => setEditGrossFee(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-7 pr-3 py-2 text-xs font-bold text-emerald-900 focus:bg-white focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Discount Type</label>
                  <select
                    value={editDiscountType}
                    onChange={(e) => setEditDiscountType(e.target.value as DiscountType)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="None">None (0%)</option>
                    <option value="Senior Citizen (20%)">👴 Senior Citizen (20%)</option>
                    <option value="PWD (20%)">♿ PWD (20%)</option>
                    <option value="Doctor Courtesy">🤝 Courtesy (Free)</option>
                    <option value="Custom">Custom (₱)</option>
                  </select>
                </div>
              </div>

              {/* Row: Coverage & Net Fee Readout */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Payment Method</label>
                  <select
                    value={editPaymentMethod}
                    onChange={(e) => setEditPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Cash">💵 Cash (₱)</option>
                    <option value="HMO / Health Card">🏥 HMO / Health Card</option>
                    <option value="PhilHealth">🇵🇭 PhilHealth</option>
                    <option value="Free / Waived">🆓 Free / Waived</option>
                  </select>
                </div>

                {editPaymentMethod === 'HMO / Health Card' ? (
                  <>
                    <div>
                      <label className="text-[11px] font-semibold text-blue-900 block mb-1">HMO Provider</label>
                      <select
                        value={editHmoProvider}
                        onChange={(e) => setEditHmoProvider(e.target.value)}
                        className="w-full bg-white border border-blue-300 rounded-lg px-2 py-1.5 text-xs font-medium text-blue-900"
                      >
                        {COMMON_HMOS.map((h) => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-blue-900 block mb-1">Approval / LOA Code</label>
                      <input
                        type="text"
                        placeholder="LOA-12345"
                        value={editHmoApprovalCode}
                        onChange={(e) => setEditHmoApprovalCode(e.target.value)}
                        className="w-full bg-white border border-blue-300 rounded-lg px-2.5 py-1.5 text-xs"
                      />
                    </div>
                  </>
                ) : editPaymentMethod === 'PhilHealth' ? (
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-semibold text-emerald-900 block mb-1">PhilHealth Claim / Konsulta Ref #</label>
                    <input
                      type="text"
                      placeholder="e.g. PH-2026-8812"
                      value={editPhilhealthClaimNo}
                      onChange={(e) => setEditPhilhealthClaimNo(e.target.value)}
                      className="w-full bg-white border border-emerald-300 rounded-lg px-2.5 py-1.5 text-xs"
                    />
                  </div>
                ) : (
                  <div className="sm:col-span-2 flex items-center justify-between px-3 py-1.5 bg-emerald-50/70 border border-emerald-200 rounded-lg">
                    <div>
                      <span className="text-[10px] text-emerald-800 uppercase font-bold block">Net Amount Charged</span>
                      <span className="text-xs text-slate-500">
                        {editComputedDiscount > 0 ? `Gross ₱${editNumericGross.toFixed(2)} - Disc ₱${editComputedDiscount.toFixed(2)}` : 'Standard direct cash collection'}
                      </span>
                    </div>
                    <span className="text-lg font-black text-emerald-950 font-mono">
                      ₱{editComputedNetFee.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
              </div>

              {/* Row: Vitals (BP, Weight, FHR, Fundal) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">BP (e.g. 120/80)</label>
                  <input
                    type="text"
                    placeholder="120/80"
                    value={editBp}
                    onChange={(e) => setEditBp(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:bg-white focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="60.0"
                    value={editWeight}
                    onChange={(e) => setEditWeight(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:bg-white focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">FHR (bpm)</label>
                  <input
                    type="number"
                    placeholder="140"
                    value={editFhr}
                    onChange={(e) => setEditFhr(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-teal-800 focus:bg-white focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Fundal Ht (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="28"
                    value={editFundalHeight}
                    onChange={(e) => setEditFundalHeight(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:bg-white focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Diagnosis */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Diagnosis / Clinical Assessment <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={editDiagnosis}
                  onChange={(e) => setEditDiagnosis(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-teal-500 font-medium resize-none"
                  required
                />
              </div>

              {/* Procedure / Treatment */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Procedure, Treatment & Prescriptions <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={editProcedure}
                  onChange={(e) => setEditProcedure(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-teal-500 resize-none"
                  required
                />
              </div>

              {/* Row: Follow-up & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Next Follow-up Date</label>
                  <input
                    type="date"
                    value={editFollowUp}
                    onChange={(e) => setEditFollowUp(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Additional Notes</label>
                  <input
                    type="text"
                    placeholder="Patient instructions / reminders"
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingCheckup(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition flex items-center space-x-1.5 active:scale-95 cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
