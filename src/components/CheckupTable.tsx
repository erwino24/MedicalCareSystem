import React, { useState } from 'react';
import type { CheckupRecord } from '../types/patient';
import { format } from 'date-fns';
import { Save, Calendar, Stethoscope, Clock, CheckCircle2, Trash2, ShieldAlert, Printer } from 'lucide-react';

interface CheckupTableProps {
  checkups: CheckupRecord[];
  onAddCheckup: (newCheckup: Omit<CheckupRecord, 'id'>) => void;
  onDeleteCheckup?: (checkupId: string) => void;
  currentUserRole?: 'DOCTOR' | 'NURSE';
  onOpenPrescription?: (checkup?: CheckupRecord) => void;
  defaultDate?: string;
}

export const CheckupTable: React.FC<CheckupTableProps> = ({
  checkups,
  onAddCheckup,
  onDeleteCheckup,
  currentUserRole = 'DOCTOR',
  onOpenPrescription,
  defaultDate,
}) => {
  const isNurse = currentUserRole === 'NURSE';
  const todayDate = format(new Date(), 'yyyy-MM-dd');

  // Input Row 1 State
  const [checkupDate, setCheckupDate] = useState<string>(defaultDate || todayDate);
  const [weightKg, setWeightKg] = useState<string>('');
  const [bp, setBp] = useState<string>('');
  const [fhrBpm, setFhrBpm] = useState<string>('');
  const [diagnosis, setDiagnosis] = useState<string>('');
  const [procedure, setProcedure] = useState<string>('');
  const [followUpDate, setFollowUpDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  React.useEffect(() => {
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
      weightKg: weightKg ? parseFloat(weightKg) : undefined,
      bp: bp || undefined,
      fhrBpm: fhrBpm ? parseInt(fhrBpm, 10) : undefined,
      diagnosis: finalDiagnosis,
      procedure: finalProcedure,
      followUpDate: followUpDate || 'As needed',
      notes: notes.trim() || undefined,
    });

    // Clear inputs except Date (which remains todayDate)
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
            <div className="flex items-center space-x-2">
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
            </div>
            <p className="text-xs text-slate-500">
              {isNurse
                ? 'Record patient vitals & triage (Prescription creation & record deletions are restricted to Doctor)'
                : 'Record consultation details, diagnosis, procedures, and print prescriptions'}
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

          <div className="flex items-center space-x-2">
            <div className="flex-1">
              <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Next Follow-up</label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="pt-4">
              <button
                onClick={handleSave}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-xs transition flex items-center space-x-1.5 active:scale-95 text-xs shrink-0"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isNurse ? 'Save Vitals' : 'Save Record'}</span>
              </button>
            </div>
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
                  </div>
                    <div className="flex items-center space-x-1.5">
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
                      {rec.followUpDate && (
                        <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">
                          Follow-up: {rec.followUpDate}
                        </span>
                      )}
                      {!isNurse && onDeleteCheckup && (
                        <button
                          onClick={() => onDeleteCheckup(rec.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 text-[11px]">
                    {rec.bp && (
                      <span className="bg-slate-50 text-slate-700 px-2 py-0.5 rounded border border-slate-200 font-medium">
                        BP: <strong>{rec.bp}</strong>
                      </span>
                    )}
                    {rec.weightKg && (
                      <span className="bg-slate-50 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                        Wt: <strong>{rec.weightKg} kg</strong>
                      </span>
                    )}
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
          <table className="w-full text-left text-xs text-slate-700 border-collapse min-w-[760px]">
            <thead className="bg-slate-100/80 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-[110px]">Date</th>
                <th className="py-3 px-3 w-[150px]">Vitals (Weight / BP / FHR)</th>
                <th className="py-3 px-3 min-w-[200px]">Diagnosis</th>
                <th className="py-3 px-3 min-w-[200px]">Procedure / Treatment & Rx</th>
                <th className="py-3 px-3 w-[120px]">Follow-up</th>
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
                  <td colSpan={6} className="py-8 text-center text-slate-400">
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

                    <td className="py-3.5 px-3 align-top">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono text-[11px]">
                        {rec.followUpDate || 'None'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 align-top text-right">
                      <div className="flex items-center justify-end space-x-1">
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
                        {!isNurse && onDeleteCheckup ? (
                          <button
                            onClick={() => onDeleteCheckup(rec.id)}
                            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                            title="Delete record (Doctor only)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          isNurse && (
                            <span className="text-[10px] text-slate-400 italic bg-slate-50 px-2 py-1 rounded">
                              Triage Logged
                            </span>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
        </table>
      </div>
    </div>
  );
};
