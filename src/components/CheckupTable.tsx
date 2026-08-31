import React, { useState } from 'react';
import type { CheckupRecord } from '../types/patient';
import { format } from 'date-fns';
import { Save, Calendar, Stethoscope, Clock, CheckCircle2, Trash2, ShieldAlert } from 'lucide-react';

interface CheckupTableProps {
  checkups: CheckupRecord[];
  onAddCheckup: (newCheckup: Omit<CheckupRecord, 'id'>) => void;
  onDeleteCheckup?: (checkupId: string) => void;
  currentUserRole?: 'DOCTOR' | 'NURSE';
}

export const CheckupTable: React.FC<CheckupTableProps> = ({
  checkups,
  onAddCheckup,
  onDeleteCheckup,
  currentUserRole = 'DOCTOR',
}) => {
  const isNurse = currentUserRole === 'NURSE';
  const todayDate = format(new Date(), 'yyyy-MM-dd');

  // Input Row 1 State
  const [weightKg, setWeightKg] = useState<string>('');
  const [bp, setBp] = useState<string>('');
  const [fhrBpm, setFhrBpm] = useState<string>('');
  const [diagnosis, setDiagnosis] = useState<string>('');
  const [procedure, setProcedure] = useState<string>('');
  const [followUpDate, setFollowUpDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

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
      date: todayDate,
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
                ? 'Record patient vitals and triage prep (Prescriptions & Deletions restricted to Doctor)'
                : 'Record consultation details, diagnosis, procedures, and review history'}
            </p>
          </div>
        </div>

        {saveSuccess && (
          <span className="flex items-center space-x-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-3 py-1 rounded-full font-medium animate-bounce">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Record Saved Successfully!</span>
          </span>
        )}
      </div>

      {errorMsg && (
        <div className="bg-rose-50 text-rose-700 border-b border-rose-200 px-5 py-2 text-xs font-medium">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* CRITICAL RESPONSIVE REQUIREMENT: overflow-x-auto container */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left text-xs text-slate-700 border-collapse min-w-[760px]">
          <thead className="bg-slate-100/80 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4 w-[110px]">Date</th>
              <th className="py-3 px-3 w-[150px]">Vitals (Weight / BP / FHR)</th>
              <th className="py-3 px-3 min-w-[200px]">Diagnosis</th>
              <th className="py-3 px-3 min-w-[200px]">Procedure / Treatment</th>
              <th className="py-3 px-3 w-[120px]">Follow-up</th>
              <th className="py-3 px-4 w-[110px] text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {/* ROW 1: LOCKED INPUT ROW FOR TODAY'S CHECK-UP */}
            <tr className="bg-teal-50/50 border-b-2 border-teal-200/80">
              <td className="py-3 px-4 align-top">
                <div className="flex items-center space-x-1.5 font-bold text-teal-800 bg-white border border-teal-300 rounded px-2.5 py-1.5 shadow-2xs">
                  <Calendar className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>{todayDate}</span>
                </div>
                <span className="text-[10px] text-teal-600 font-semibold block mt-1">Today (Locked)</span>
              </td>

              <td className="py-3 px-3 align-top space-y-1.5">
                <div className="grid grid-cols-2 gap-1">
                  <input
                    type="text"
                    placeholder="BP (e.g. 120/80)"
                    value={bp}
                    onChange={(e) => setBp(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                  />
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Wt (kg)"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
                <input
                  type="number"
                  placeholder="FHR (bpm e.g. 145)"
                  value={fhrBpm}
                  onChange={(e) => setFhrBpm(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                />
              </td>

              <td className="py-3 px-3 align-top space-y-1">
                <textarea
                  rows={2}
                  placeholder={isNurse ? "Triage observations / Chief complaints..." : "Enter diagnosis details..."}
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-teal-500 focus:border-teal-500 resize-none"
                />
              </td>

              <td className="py-3 px-3 align-top space-y-1">
                <textarea
                  rows={2}
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

              <td className="py-3 px-4 align-top text-right">
                <button
                  onClick={handleSave}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium px-3 py-2 rounded-lg shadow-xs transition flex items-center justify-center space-x-1.5 active:scale-95 text-xs"
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
                    {rec.notes && <p className="text-[11px] text-slate-400 italic mt-1">Note: {rec.notes}</p>}
                  </td>

                  <td className="py-3.5 px-3 align-top">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono text-[11px]">
                      {rec.followUpDate || 'None'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 align-top text-right">
                    {!isNurse && onDeleteCheckup ? (
                      <button
                        onClick={() => onDeleteCheckup(rec.id)}
                        className="text-slate-400 hover:text-rose-600 p-1.5 rounded hover:bg-rose-50 transition"
                        title="Delete record (Doctor only)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-300 select-none">Locked</span>
                    )}
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
