import React, { useState } from 'react';
import type { Patient, Appointment, PractitionerUser } from '../types/patient';
import { calculateObGynMetrics } from '../utils/obgynCalculator';
import { format, addMonths, subMonths } from 'date-fns';
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  Baby,
  HeartPulse,
  Plus,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  CalendarCheck,
  Stethoscope,
  Filter
} from 'lucide-react';

interface ScheduleViewProps {
  patients: Patient[];
  appointments: Appointment[];
  onSelectPatient: (patientId: string) => void;
  onOpenAddAppointment: (date?: string) => void;
  onBackToList?: () => void;
  currentUser?: PractitionerUser;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  patients,
  appointments,
  onSelectPatient,
  onOpenAddAppointment,
  onBackToList,
  currentUser,
}) => {
  const today = format(new Date(), 'EEEE, MMMM d, yyyy');
  const todayIso = format(new Date(), 'yyyy-MM-dd');
  const isNurse = currentUser?.role === 'NURSE';

  // Dynamic Month State
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(new Date());
  const [selectedDateFilter, setSelectedDateFilter] = useState<string | null>(null);

  // Month navigation handlers
  const handlePrevMonth = () => setCurrentMonthDate((prev) => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentMonthDate((prev) => addMonths(prev, 1));
  const handleToday = () => {
    const now = new Date();
    setCurrentMonthDate(now);
    setSelectedDateFilter(todayIso);
  };

  // Calendar Math
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth(); // 0-indexed
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 (Sun) to 6 (Sat)
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const monthYearLabel = format(currentMonthDate, 'MMMM yyyy');

  // Compute 3rd trimester patients
  const thirdTrimesterPatients = patients.filter((p) => {
    const m = calculateObGynMetrics(p.lmp);
    return m.trimester === '3rd' || m.trimester === 'Post-term';
  });

  // Filter appointments for display
  const displayedAppointments = selectedDateFilter
    ? appointments.filter((a) => a.date === selectedDateFilter)
    : appointments;

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-y-auto font-sans">
      {/* MOBILE ONLY STICKY BACK BUTTON (md:hidden) */}
      {onBackToList && (
        <div className="sticky top-0 z-30 bg-slate-900 text-white p-3 md:hidden shadow-md flex items-center justify-between shrink-0">
          <button
            onClick={onBackToList}
            className="flex items-center space-x-2 text-xs sm:text-sm font-semibold hover:text-teal-300 transition active:scale-95 text-teal-400"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-white">← Back to Patient Directory</span>
          </button>
          <span className="text-[10px] bg-slate-800 text-teal-300 px-2 py-0.5 rounded border border-slate-700 font-medium">
            Schedule View
          </span>
        </div>
      )}

      <div className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 max-w-7xl mx-auto w-full">
        {/* Welcome Banner with Action Button */}
        <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 space-y-2">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span className="bg-teal-500/20 text-teal-300 text-xs px-2.5 py-0.5 rounded-full font-medium border border-teal-500/30">
                {isNurse ? 'Clinical Assistant Portal' : 'Lead Obstetrician Portal'}
              </span>
              <span className="text-xs text-slate-400 font-mono">{today}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Good day, {currentUser ? currentUser.fullName : 'Dr. Jenkins'} 👋
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              {isNurse
                ? 'Schedule prenatal consultations, monitor patient queue, and review upcoming gestational milestones.'
                : 'Book new consultations for existing or new patients, view upcoming due dates, and track scheduled visits.'}
            </p>
          </div>

          {/* Action Button: Add Appointment */}
          <button
            onClick={() => onOpenAddAppointment(selectedDateFilter || todayIso)}
            className="relative z-10 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl shadow-lg transition flex items-center space-x-2 shrink-0 active:scale-95 text-xs sm:text-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Book New Appointment</span>
          </button>
        </div>

        {/* Overview Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center space-x-4">
            <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
              <Users className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Active Patients</p>
              <p className="text-xl sm:text-2xl font-bold text-slate-900">{patients.length}</p>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center space-x-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Baby className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">3rd Trimester / Near EDD</p>
              <p className="text-xl sm:text-2xl font-bold text-slate-900">{thirdTrimesterPatients.length}</p>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center space-x-4">
            <div className="p-3 bg-cyan-50 text-cyan-600 rounded-xl">
              <HeartPulse className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Scheduled Appointments</p>
              <p className="text-xl sm:text-2xl font-bold text-slate-900">{appointments.length} Total</p>
            </div>
          </div>
        </div>

        {/* Main Content Grid: Interactive Live Calendar & Scheduled Consultations */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Virtual Calendar Grid (xl:col-span-7) */}
          <div className="xl:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            {/* Calendar Header with Live Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-800 text-sm">Interactive Clinic Calendar</h3>
              </div>

              {/* Month Navigation Buttons */}
              <div className="flex items-center space-x-2 self-start sm:self-auto">
                <button
                  onClick={handlePrevMonth}
                  className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200 transition cursor-pointer"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="text-xs bg-teal-50 text-teal-900 px-3 py-1.5 rounded-lg font-bold border border-teal-200 shadow-2xs min-w-[120px] text-center">
                  {monthYearLabel}
                </span>

                <button
                  onClick={handleNextMonth}
                  className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200 transition cursor-pointer"
                  title="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={handleToday}
                  className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 transition cursor-pointer"
                  title="Jump to Current Month & Today"
                >
                  Today
                </button>

                <button
                  onClick={() => onOpenAddAppointment(selectedDateFilter || todayIso)}
                  className="text-xs bg-teal-600 hover:bg-teal-700 text-white font-semibold px-3 py-1.5 rounded-lg shadow-2xs transition flex items-center space-x-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Book Slot</span>
                </button>
              </div>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-400 pb-1">
              <span className="text-rose-500">Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span className="text-teal-600">Sat</span>
            </div>

            {/* Calendar Grid Cells */}
            <div className="grid grid-cols-7 gap-1.5 text-xs font-medium">
              {/* Empty leading padding slots */}
              {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
                <div key={`blank-${idx}`} className="h-18 sm:h-20 bg-slate-50/30 rounded-xl border border-dashed border-slate-100" />
              ))}

              {/* Real dynamic month days */}
              {Array.from({ length: totalDaysInMonth }, (_, i) => i + 1).map((day) => {
                const dayPadded = day < 10 ? `0${day}` : `${day}`;
                const monthPadded = month + 1 < 10 ? `0${month + 1}` : `${month + 1}`;
                const dayStr = `${year}-${monthPadded}-${dayPadded}`;
                const dayAppointments = appointments.filter((a) => a.date === dayStr);
                const isToday = dayStr === todayIso;
                const isSelected = selectedDateFilter === dayStr;

                return (
                  <div
                    key={dayStr}
                    onClick={() => {
                      setSelectedDateFilter(isSelected ? null : dayStr);
                    }}
                    className={`h-18 sm:h-20 p-1.5 rounded-xl border flex flex-col justify-between transition cursor-pointer group relative ${
                      isSelected
                        ? 'bg-teal-50 border-teal-500 ring-2 ring-teal-500 shadow-sm'
                        : isToday
                        ? 'bg-teal-600 text-white border-teal-700 font-bold shadow-xs'
                        : dayAppointments.length > 0
                        ? 'bg-cyan-50/70 border-cyan-200 text-slate-800 hover:bg-cyan-100/70'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                    title={`Click to view consultations for ${dayStr}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] font-bold ${isToday ? 'text-white' : isSelected ? 'text-teal-900 font-extrabold' : 'text-slate-700'}`}>
                        {day}
                      </span>
                      {dayAppointments.length > 0 && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold shadow-2xs ${
                            isToday
                              ? 'bg-white text-teal-900'
                              : 'bg-teal-600 text-white'
                          }`}
                        >
                          {dayAppointments.length}
                        </span>
                      )}
                    </div>

                    <div className="space-y-0.5 overflow-hidden">
                      {dayAppointments.slice(0, 2).map((apt) => (
                        <span
                          key={apt.id}
                          className={`text-[9px] px-1 py-0.5 rounded block truncate font-medium ${
                            isToday
                              ? 'bg-teal-800 text-teal-100'
                              : 'bg-teal-100 text-teal-900'
                          }`}
                          title={`${apt.patientName} (${apt.time})`}
                        >
                          {apt.patientName.split(' ')[0]} ({apt.time})
                        </span>
                      ))}
                      {dayAppointments.length > 2 && (
                        <span className={`text-[9px] block font-semibold ${isToday ? 'text-teal-200' : 'text-slate-500'}`}>
                          + {dayAppointments.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick helper legend */}
            <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 flex-wrap gap-2">
              <div className="flex items-center space-x-3">
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded bg-teal-600" />
                  <span>Today</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded bg-cyan-100 border border-cyan-300" />
                  <span>Has Bookings</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded border-2 border-teal-500 bg-teal-50" />
                  <span>Selected</span>
                </span>
              </div>
              <span className="text-slate-400 italic">Click any date to filter appointments list</span>
            </div>
          </div>

          {/* Scheduled Consultations List Panel (xl:col-span-5) */}
          <div className="xl:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            {/* Panel Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-800 text-sm">Scheduled Consultations</h3>
              </div>

              <div className="flex items-center space-x-2">
                {selectedDateFilter && (
                  <button
                    onClick={() => setSelectedDateFilter(null)}
                    className="text-[11px] text-slate-500 hover:text-teal-700 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-md transition flex items-center space-x-1 cursor-pointer"
                  >
                    <span>Clear Filter</span>
                  </button>
                )}
                <span className="bg-teal-100 text-teal-800 font-bold text-xs px-2.5 py-0.5 rounded-full">
                  {displayedAppointments.length} {selectedDateFilter ? 'on date' : 'total'}
                </span>
              </div>
            </div>

            {/* Active Date Filter Banner */}
            {selectedDateFilter && (
              <div className="bg-teal-50 border border-teal-200 p-2.5 rounded-xl flex items-center justify-between text-xs text-teal-900">
                <div className="flex items-center space-x-1.5">
                  <Filter className="w-3.5 h-3.5 text-teal-600" />
                  <span>Showing appointments for <strong>{selectedDateFilter}</strong></span>
                </div>
                <button
                  onClick={() => onOpenAddAppointment(selectedDateFilter)}
                  className="bg-teal-600 text-white font-semibold text-[10px] px-2 py-1 rounded-md hover:bg-teal-700 transition cursor-pointer"
                >
                  + Add to this date
                </button>
              </div>
            )}

            {/* Consultations List */}
            <div className="space-y-3.5 max-h-[520px] overflow-y-auto pr-1">
              {displayedAppointments.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <CalendarCheck className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="text-xs font-semibold text-slate-600">No consultations scheduled</p>
                  <p className="text-[11px] text-slate-400">
                    {selectedDateFilter
                      ? `No bookings found for ${selectedDateFilter}. Click "+ Add to this date" above.`
                      : 'No upcoming appointments booked in the system.'}
                  </p>
                </div>
              ) : (
                displayedAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="p-4 bg-slate-50/90 hover:bg-teal-50/40 border border-slate-200/90 hover:border-teal-300 rounded-xl transition shadow-2xs space-y-2.5"
                  >
                    {/* Row 1: Patient Name & Time Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                        {apt.patientName}
                      </h4>
                      <span className="text-[11px] bg-teal-100 text-teal-900 font-bold px-2.5 py-0.5 rounded-full border border-teal-200 shrink-0 flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-teal-700" />
                        <span>{apt.time}</span>
                      </span>
                    </div>

                    {/* Row 2: Visit Type Tag & Date */}
                    <div className="flex items-center space-x-2 text-xs text-slate-600 flex-wrap gap-y-1">
                      <span className="bg-white border border-slate-200 text-teal-800 font-semibold px-2 py-0.5 rounded-md flex items-center space-x-1">
                        <Stethoscope className="w-3 h-3 text-teal-600" />
                        <span>{apt.type}</span>
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-600 font-medium">{apt.date}</span>
                    </div>

                    {/* Row 3: Optional Notes */}
                    {apt.notes && (
                      <p className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200/70 italic leading-relaxed">
                        "{apt.notes}"
                      </p>
                    )}

                    {/* Row 4: Action Button & Status */}
                    <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between gap-2">
                      <button
                        onClick={() => onSelectPatient(apt.patientId)}
                        className="text-xs text-teal-700 hover:text-teal-900 font-bold flex items-center space-x-1 hover:underline cursor-pointer group"
                      >
                        <span>Open Patient Record</span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </button>

                      <span className="text-[11px] text-emerald-700 font-semibold flex items-center space-x-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
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
    </div>
  );
};
