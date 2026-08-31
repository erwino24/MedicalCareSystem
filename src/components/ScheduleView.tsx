import type { Patient, Appointment, PractitionerUser } from '../types/patient';
import { calculateObGynMetrics } from '../utils/obgynCalculator';
import { format } from 'date-fns';
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  Baby,
  HeartPulse,
  Plus,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

interface ScheduleViewProps {
  patients: Patient[];
  appointments: Appointment[];
  onSelectPatient: (patientId: string) => void;
  onOpenAddAppointment: (date?: string) => void;
  currentUser?: PractitionerUser;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  patients,
  appointments,
  onSelectPatient,
  onOpenAddAppointment,
  currentUser,
}) => {
  const today = format(new Date(), 'EEEE, MMMM d, yyyy');
  const isNurse = currentUser?.role === 'NURSE';

  // Compute 3rd trimester patients
  const thirdTrimesterPatients = patients.filter((p) => {
    const m = calculateObGynMetrics(p.lmp);
    return m.trimester === '3rd' || m.trimester === 'Post-term';
  });

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 font-sans">
      {/* Welcome Banner with Action Button */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="flex items-center space-x-2">
            <span className="bg-teal-500/20 text-teal-300 text-xs px-2.5 py-0.5 rounded-full font-medium border border-teal-500/30">
              {isNurse ? 'Clinical Assistant Portal' : 'Lead Obstetrician Portal'}
            </span>
            <span className="text-xs text-slate-400 font-mono">{today}</span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">
            Good day, {currentUser ? currentUser.fullName : 'Dr. Jenkins'} 👋
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            {isNurse
              ? 'Schedule prenatal consultations, monitor patient queue, and review upcoming gestational milestones.'
              : 'Book new consultations for existing or new patients, view upcoming due dates, and track scheduled visits.'}
          </p>
        </div>

        {/* Action Button: Add Appointment */}
        <button
          onClick={() => onOpenAddAppointment()}
          className="relative z-10 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl shadow-lg transition flex items-center space-x-2 shrink-0 active:scale-95 text-xs sm:text-sm"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ Book New Appointment</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center space-x-4">
          <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Active Patients</p>
            <p className="text-2xl font-bold text-slate-900">{patients.length}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center space-x-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Baby className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">3rd Trimester / Near EDD</p>
            <p className="text-2xl font-bold text-slate-900">{thirdTrimesterPatients.length}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center space-x-4">
          <div className="p-3 bg-cyan-50 text-cyan-600 rounded-xl">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Scheduled Appointments</p>
            <p className="text-2xl font-bold text-slate-900">{appointments.length} Total</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Interactive Virtual Calendar & Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Virtual Calendar Grid Placeholder (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="w-5 h-5 text-teal-600" />
              <h3 className="font-bold text-slate-800 text-sm">Interactive Clinic Calendar</h3>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg font-medium border border-slate-200">
                August 2026
              </span>
              <button
                onClick={() => onOpenAddAppointment()}
                className="text-xs bg-teal-50 text-teal-700 hover:bg-teal-100 font-semibold px-2.5 py-1 rounded-lg border border-teal-200 transition"
              >
                + Book Slot
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-400 pb-1 border-b border-slate-100">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Calendar Grid Cells */}
          <div className="grid grid-cols-7 gap-1.5 text-xs font-medium">
            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
              const dayStr = `2026-08-${day < 10 ? '0' + day : day}`;
              const dayAppointments = appointments.filter((a) => a.date === dayStr);
              const isToday = day === 27; // Aug 27, 2026

              return (
                <div
                  key={day}
                  onClick={() => onOpenAddAppointment(dayStr)}
                  className={`h-20 p-1.5 rounded-xl border flex flex-col justify-between transition cursor-pointer group ${
                    isToday
                      ? 'bg-teal-600 text-white border-teal-700 font-bold shadow-xs'
                      : dayAppointments.length > 0
                      ? 'bg-teal-50/80 border-teal-200 text-slate-800 hover:bg-teal-100'
                      : 'bg-slate-50/40 border-slate-100 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] ${isToday ? 'text-white' : 'text-slate-500'}`}>{day}</span>
                    {dayAppointments.length > 0 && !isToday && (
                      <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
                    )}
                  </div>

                  <div className="space-y-0.5 overflow-hidden">
                    {dayAppointments.slice(0, 2).map((apt) => (
                      <span
                        key={apt.id}
                        className={`text-[9px] px-1 py-0.5 rounded block truncate font-medium ${
                          isToday
                            ? 'bg-teal-800 text-teal-100'
                            : 'bg-teal-200 text-teal-900'
                        }`}
                        title={`${apt.patientName} (${apt.time})`}
                      >
                        {apt.patientName.split(' ')[0]} ({apt.time})
                      </span>
                    ))}
                    {dayAppointments.length > 2 && (
                      <span className="text-[9px] text-slate-400 block font-semibold">+ {dayAppointments.length - 2} more</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scheduled Appointments List Panel */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-teal-600" />
              <h3 className="font-bold text-slate-800 text-sm">Scheduled Consultations</h3>
            </div>
            <span className="bg-teal-100 text-teal-800 font-bold text-xs px-2 py-0.5 rounded-full">
              {appointments.length}
            </span>
          </div>

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {appointments.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-xs font-medium">No appointments scheduled.</p>
              </div>
            ) : (
              appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="p-3 bg-slate-50 hover:bg-teal-50/50 border border-slate-200 rounded-xl transition space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{apt.patientName}</span>
                    <span className="text-[10px] bg-teal-100 text-teal-800 font-semibold px-2 py-0.5 rounded-full">
                      {apt.time}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-[11px] text-slate-600">
                    <span className="font-semibold text-teal-700">{apt.type}</span>
                    <span>•</span>
                    <span>{apt.date}</span>
                  </div>

                  {apt.notes && (
                    <p className="text-[11px] text-slate-500 italic bg-white p-1.5 rounded border border-slate-100">
                      "{apt.notes}"
                    </p>
                  )}

                  <div className="pt-1 flex items-center justify-between">
                    <button
                      onClick={() => onSelectPatient(apt.patientId)}
                      className="text-[11px] text-teal-600 hover:text-teal-800 font-semibold flex items-center space-x-1"
                    >
                      <span>Open Patient Record</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                    <span className="text-[10px] text-emerald-600 font-medium flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>{apt.status}</span>
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
