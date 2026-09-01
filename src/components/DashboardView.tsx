import React, { useState } from 'react';
import type { Patient, Appointment, PractitionerUser } from '../types/patient';
import { calculateObGynMetrics } from '../utils/obgynCalculator';
import { format, addMonths, subMonths, getDaysInMonth, startOfMonth, getDay } from 'date-fns';
import {
  Users,
  Baby,
  HeartPulse,
  Calendar,
  Clock,
  Stethoscope,
  Plus,
  ChevronRight,
  ChevronLeft,
  Search,
  Sparkles,
  Check,
  CheckCircle2,
  MessageSquare,
  Eye,
  EyeOff
} from 'lucide-react';

interface DashboardViewProps {
  currentUser: PractitionerUser;
  patients: Patient[];
  appointments: Appointment[];
  onSelectPatient: (patientId: string) => void;
  onOpenAddPatient: () => void;
  onOpenAddAppointment: (date?: string) => void;
  onNavigateToPatients: () => void;
  onNavigateToSchedule: () => void;
  onManageStaffClick?: () => void;
  onUpdateAppointmentStatus?: (appointmentId: string, status: 'Scheduled' | 'Completed' | 'Cancelled') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  patients,
  appointments,
  onSelectPatient,
  onOpenAddPatient,
  onOpenAddAppointment,
  onNavigateToPatients,
  onNavigateToSchedule,
  onManageStaffClick,
  onUpdateAppointmentStatus,
}) => {
  const isNurse = currentUser.role === 'NURSE';
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayFormatted = format(new Date(), 'EEEE, MMMM d, yyyy');

  // Interactive Month & Collapsible States
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(new Date());
  const [selectedDateFilter, setSelectedDateFilter] = useState<string | null>(null);
  const [isUpcomingListVisible, setIsUpcomingListVisible] = useState<boolean>(true);

  // Month navigation
  const handlePrevMonth = () => setCurrentMonthDate((prev) => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentMonthDate((prev) => addMonths(prev, 1));
  const handleTodayMonth = () => {
    setCurrentMonthDate(new Date());
    setSelectedDateFilter(todayStr);
  };

  // Calendar calculations
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const daysInMonth = getDaysInMonth(currentMonthDate);
  const firstDayOfWeek = getDay(startOfMonth(currentMonthDate));
  const monthName = format(currentMonthDate, 'MMMM yyyy');

  // Trimester & gestational breakdowns
  const patientsWithMetrics = patients.map((p) => ({
    patient: p,
    metrics: calculateObGynMetrics(p.lmp),
  }));

  const firstTrimester = patientsWithMetrics.filter((item) => item.metrics.trimester === '1st');
  const secondTrimester = patientsWithMetrics.filter((item) => item.metrics.trimester === '2nd');
  const thirdTrimester = patientsWithMetrics.filter(
    (item) => item.metrics.trimester === '3rd' || item.metrics.trimester === 'Post-term'
  );

  // Near EDD (within 30 days or >= 36 weeks AOG)
  const highPriorityMothers = patientsWithMetrics
    .filter((item) => item.metrics.aogWeeks >= 32 || (item.metrics.daysRemaining <= 45 && item.metrics.daysRemaining >= -14))
    .slice(0, 5);

  // Today's and upcoming appointments
  const todayAppointments = appointments.filter((a) => a.date === todayStr);
  
  // Filtered upcoming appointments based on date selection
  const filteredAppointments = selectedDateFilter
    ? appointments.filter((a) => a.date === selectedDateFilter)
    : appointments
        .filter((a) => a.date >= todayStr)
        .sort((a, b) => a.date.localeCompare(b.date));

  const displayedAppointments = filteredAppointments.slice(0, 10);

  // Active checkup count
  const totalConsultationsRecorded = patients.reduce((acc, p) => acc + p.checkups.length, 0);

  return (
    <div className="h-full w-full flex-1 flex flex-col bg-slate-50 overflow-y-auto font-sans">
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 w-full max-w-[1600px] mx-auto">
        {/* HERO WELCOME BANNER */}
        <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-md relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-56 h-56 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span className="bg-teal-500/20 text-teal-300 text-xs px-3 py-1 rounded-full font-semibold border border-teal-500/30 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-300" />
                <span>{isNurse ? 'Clinical Assistant Portal' : 'Lead Obstetrician Clinical Dashboard'}</span>
              </span>
              <span className="text-xs text-slate-400 font-mono">{todayFormatted}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {currentUser.fullName} 👋
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {isNurse
                ? 'Manage patient intake, schedule prenatal visits, and monitor high-gestational-age triage queues.'
                : 'Review active obstetric patients, monitor near-term deliveries, check today’s consultation schedule, and issue prescriptions.'}
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="relative z-10 flex flex-wrap gap-2.5 shrink-0 self-stretch sm:self-auto">
            <button
              onClick={onOpenAddPatient}
              className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl shadow-lg transition flex items-center space-x-2 text-xs sm:text-sm active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{isNurse ? '+ Register Intake' : '+ New Patient'}</span>
            </button>

            <button
              onClick={() => onOpenAddAppointment()}
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-2.5 rounded-xl border border-white/20 transition flex items-center space-x-2 text-xs sm:text-sm active:scale-95 cursor-pointer backdrop-blur-xs"
            >
              <Calendar className="w-4 h-4 text-teal-300" />
              <span>+ Book Visit</span>
            </button>
          </div>
        </div>

        {/* STATS OVERVIEW CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Active Patients */}
          <div
            onClick={onNavigateToPatients}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-teal-400 transition cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 bg-teal-50 text-teal-600 rounded-xl group-hover:bg-teal-600 group-hover:text-white transition">
                <Users className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
                Directory →
              </span>
            </div>
            <div className="mt-3">
              <p className="text-xs text-slate-500 font-medium">Total Active Patients</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">{patients.length}</p>
              <p className="text-[11px] text-slate-400 mt-1">
                {thirdTrimester.length} in 3rd Trimester
              </p>
            </div>
          </div>

          {/* Card 2: High-Risk / Near EDD */}
          <div
            onClick={onNavigateToPatients}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-purple-400 transition cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition">
                <Baby className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                Near Term
              </span>
            </div>
            <div className="mt-3">
              <p className="text-xs text-slate-500 font-medium">3rd Trimester Mothers</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-purple-900 mt-0.5">{thirdTrimester.length}</p>
              <p className="text-[11px] text-purple-600 font-medium mt-1">
                {highPriorityMothers.length} within 30-day window
              </p>
            </div>
          </div>

          {/* Card 3: Today's / Upcoming Visits */}
          <div
            onClick={onNavigateToSchedule}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-cyan-400 transition cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 bg-cyan-50 text-cyan-600 rounded-xl group-hover:bg-cyan-600 group-hover:text-white transition">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span className="text-[11px] font-semibold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full">
                Schedule →
              </span>
            </div>
            <div className="mt-3">
              <p className="text-xs text-slate-500 font-medium">Today's Visits</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
                {todayAppointments.length}
              </p>
              <p className="text-[11px] text-cyan-700 font-medium mt-1">
                {appointments.length} Total Booked
              </p>
            </div>
          </div>

          {/* Card 4: Consultations / Records */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <HeartPulse className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                Live Data
              </span>
            </div>
            <div className="mt-3">
              <p className="text-xs text-slate-500 font-medium">Consultations Logged</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
                {totalConsultationsRecorded}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                {isNurse ? 'Clinical Records Ready' : 'Prescriptions & Notes Synced'}
              </p>
            </div>
          </div>
        </div>

        {/* MAIN DASHBOARD CONTENT (DOCTOR VS NURSE TAILORED) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* MAIN / LEFT COLUMN */}
          <div className={isNurse ? (isUpcomingListVisible ? 'lg:col-span-7 xl:col-span-8 space-y-6' : 'lg:col-span-12 space-y-6') : (isUpcomingListVisible ? 'lg:col-span-8 space-y-6' : 'lg:col-span-12 space-y-6')}>
            {isNurse ? (
              /* NURSE DEDICATED VIEW: INTERACTIVE CALENDAR & SCHEDULE */
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                {/* Calendar Header & Month Navigation */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 bg-teal-100 text-teal-700 rounded-xl">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
                        <span>{monthName}</span>
                        {selectedDateFilter && (
                          <span className="text-xs bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded-full font-medium">
                            Filtered: {selectedDateFilter}
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Interactive consultation calendar • Click any date to view appointments
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 self-start sm:self-auto">
                    <button
                      onClick={handlePrevMonth}
                      className="p-2 hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200 transition cursor-pointer"
                      title="Previous Month"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleTodayMonth}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-700 font-bold text-xs rounded-lg transition border border-slate-200 cursor-pointer"
                    >
                      Today
                    </button>
                    <button
                      onClick={handleNextMonth}
                      className="p-2 hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200 transition cursor-pointer"
                      title="Next Month"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onOpenAddAppointment(selectedDateFilter || todayStr)}
                      className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition shadow-xs flex items-center space-x-1 cursor-pointer active:scale-95 ml-1"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Book Slot</span>
                    </button>
                  </div>
                </div>

                {/* Day-of-week headers */}
                <div className="grid grid-cols-7 gap-1.5 text-center">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                    <div key={d} className="text-xs font-bold text-slate-400 py-1 uppercase tracking-wider">
                      {d}
                    </div>
                  ))}
                </div>

                {/* Monthly Days Grid */}
                <div className="grid grid-cols-7 gap-1.5">
                  {/* Empty leading days */}
                  {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-16 sm:h-20 bg-slate-50/50 rounded-xl border border-slate-100/60" />
                  ))}

                  {/* Month days */}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dayPadded = day < 10 ? `0${day}` : `${day}`;
                    const monthPadded = month + 1 < 10 ? `0${month + 1}` : `${month + 1}`;
                    const dayStr = `${year}-${monthPadded}-${dayPadded}`;
                    const dayAppointments = appointments.filter((a) => a.date === dayStr);
                    const isToday = dayStr === todayStr;
                    const isSelected = selectedDateFilter === dayStr;

                    const scheduledCount = dayAppointments.filter((a) => a.status === 'Scheduled').length;
                    const completedCount = dayAppointments.filter((a) => a.status === 'Completed').length;
                    const hasPendingScheduled = scheduledCount > 0;
                    const isAllCompleted = dayAppointments.length > 0 && scheduledCount === 0;

                    return (
                      <div
                        key={dayStr}
                        onClick={() => {
                          setSelectedDateFilter(isSelected ? null : dayStr);
                        }}
                        className={`h-16 sm:h-20 p-1.5 rounded-xl border flex flex-col justify-between transition cursor-pointer group relative ${
                          isSelected
                            ? 'bg-teal-50 border-teal-500 ring-2 ring-teal-500 shadow-xs'
                            : isToday
                            ? 'bg-teal-600 text-white border-teal-700 font-bold shadow-xs'
                            : hasPendingScheduled
                            ? 'bg-amber-50/70 border-amber-300 text-slate-800 hover:bg-amber-100/80'
                            : isAllCompleted
                            ? 'bg-emerald-50/70 border-emerald-300 text-slate-800 hover:bg-emerald-100/80'
                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                        title={`Click to view bookings for ${dayStr}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-[11px] font-bold ${isToday ? 'text-white' : isSelected ? 'text-teal-900 font-extrabold' : 'text-slate-700'}`}>
                            {day}
                          </span>
                          {dayAppointments.length > 0 && (
                            <div className="flex items-center space-x-0.5">
                              {scheduledCount > 0 && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-amber-500 text-white shadow-2xs">
                                  {scheduledCount}
                                </span>
                              )}
                              {completedCount > 0 && (
                                <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold shadow-2xs ${isToday ? 'bg-emerald-400 text-teal-950' : 'bg-emerald-600 text-white'}`}>
                                  ✓{completedCount}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="space-y-0.5 overflow-hidden">
                          {dayAppointments.slice(0, 2).map((apt) => {
                            const isDone = apt.status === 'Completed';
                            const isCancelled = apt.status === 'Cancelled';

                            return (
                              <span
                                key={apt.id}
                                className={`text-[9px] px-1 py-0.2 rounded block truncate font-medium border ${
                                  isToday
                                    ? isDone
                                      ? 'bg-emerald-800 text-emerald-100 border-emerald-600'
                                      : 'bg-amber-500 text-white border-amber-600 font-bold'
                                    : isDone
                                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold'
                                    : isCancelled
                                    ? 'bg-slate-100 text-slate-500 line-through'
                                    : 'bg-amber-100 text-amber-950 border-amber-300 font-bold'
                                }`}
                              >
                                {isDone ? '✓ ' : isCancelled ? '✕ ' : '⏳ '}
                                {apt.patientName.split(' ')[0]} ({apt.time})
                              </span>
                            );
                          })}
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

                {/* Calendar quick legend */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 flex-wrap gap-2">
                  <div className="flex items-center space-x-3 flex-wrap gap-y-1">
                    <span className="flex items-center space-x-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span className="font-semibold text-emerald-800">Done / Completed</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span className="font-semibold text-amber-800">Pending / Scheduled</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <span className="w-2.5 h-2.5 rounded bg-teal-600" />
                      <span>Today</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <span className="w-2.5 h-2.5 rounded border-2 border-teal-500 bg-teal-50" />
                      <span>Selected Date</span>
                    </span>
                  </div>

                  {!isUpcomingListVisible && (
                    <button
                      onClick={() => setIsUpcomingListVisible(true)}
                      className="text-teal-700 hover:text-teal-900 font-bold text-xs flex items-center space-x-1 underline cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Show Consultations List ({displayedAppointments.length})</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* DOCTOR VIEW: OBSTETRIC TRIAGE & GESTATIONAL DISTRIBUTION */
              <>
                {/* SECTION 1: 3rd Trimester & Delivery Watchlist */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 bg-purple-100 text-purple-700 rounded-lg">
                        <Baby className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-sm">
                          Obstetric Near-Term & Delivery Watchlist
                        </h3>
                        <p className="text-[11px] text-slate-400">Patients in 3rd Trimester (AOG ≥ 32w) or approaching EDD</p>
                      </div>
                    </div>

                    <button
                      onClick={onNavigateToPatients}
                      className="text-xs text-teal-700 hover:text-teal-900 font-semibold flex items-center space-x-1 hover:underline cursor-pointer"
                    >
                      <span>View All ({patients.length})</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {highPriorityMothers.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 space-y-1">
                      <Baby className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      <p className="text-xs font-semibold text-slate-600">No near-term patients currently</p>
                      <p className="text-[11px] text-slate-400">All registered patients are in earlier gestational stages.</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {highPriorityMothers.map(({ patient, metrics }) => (
                        <div
                          key={patient.id}
                          onClick={() => onSelectPatient(patient.id)}
                          className="p-3.5 bg-slate-50 hover:bg-teal-50/50 border border-slate-200 hover:border-teal-300 rounded-xl transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer group"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-sm text-slate-900 group-hover:text-teal-800 transition">
                                {patient.fullName}
                              </span>
                              <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-semibold">
                                G{patient.gravida}P{patient.para}
                              </span>
                              <span className="text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded font-bold">
                                {patient.bloodType}
                              </span>
                            </div>

                            <div className="flex items-center space-x-2 text-xs text-slate-500 flex-wrap">
                              <span className="font-semibold text-purple-800 bg-purple-50 px-2 py-0.2 rounded">
                                AOG: {metrics.aogFormatted}
                              </span>
                              <span className="text-slate-300">•</span>
                              <span className="text-slate-700 font-medium">EDD: {metrics.edd}</span>
                              <span className="text-slate-300">•</span>
                              <span className="text-slate-500">{metrics.daysRemaining} days left</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 self-start sm:self-auto shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectPatient(patient.id);
                              }}
                              className="bg-white hover:bg-teal-600 text-teal-800 hover:text-white font-semibold text-xs px-3 py-1.5 rounded-lg border border-teal-200 hover:border-teal-600 transition shadow-2xs flex items-center space-x-1"
                            >
                              <span>Open Chart</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* SECTION 2: Trimester Patient Distribution Breakdown */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 bg-teal-100 text-teal-700 rounded-lg">
                        <Stethoscope className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-sm">Gestational Trimester Distribution</h3>
                        <p className="text-[11px] text-slate-400">Breakdown of patient cohort across pregnancy stages</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-600">1st Trimester</span>
                        <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono">
                          Weeks 1–12
                        </span>
                      </div>
                      <p className="text-xl font-bold text-slate-800 mt-2">{firstTrimester.length} Patients</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Early prenatal & ultrasound</p>
                    </div>

                    <div className="bg-cyan-50/60 p-3.5 rounded-xl border border-cyan-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-cyan-900">2nd Trimester</span>
                        <span className="text-[10px] bg-cyan-200/80 text-cyan-900 px-1.5 py-0.5 rounded font-mono">
                          Weeks 13–27
                        </span>
                      </div>
                      <p className="text-xl font-bold text-cyan-950 mt-2">{secondTrimester.length} Patients</p>
                      <p className="text-[11px] text-cyan-700 mt-0.5">Anomaly scans & screening</p>
                    </div>

                    <div className="bg-purple-50/60 p-3.5 rounded-xl border border-purple-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-purple-900">3rd Trimester</span>
                        <span className="text-[10px] bg-purple-200/80 text-purple-900 px-1.5 py-0.5 rounded font-mono">
                          Weeks 28–40+
                        </span>
                      </div>
                      <p className="text-xl font-bold text-purple-950 mt-2">{thirdTrimester.length} Patients</p>
                      <p className="text-[11px] text-purple-700 mt-0.5">Birth planning & monitoring</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* RIGHT COLUMN: UPCOMING CONSULTATIONS QUEUE (WITH HIDE / SHOW TOGGLE) */}
          {isUpcomingListVisible && (
            <div className={isNurse ? 'lg:col-span-5 xl:col-span-4 space-y-6' : 'lg:col-span-4 space-y-6'}>
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-teal-600" />
                    <h3 className="font-bold text-slate-800 text-sm">
                      {selectedDateFilter ? `Bookings for ${selectedDateFilter}` : 'Upcoming Consultations'}
                    </h3>
                  </div>

                  <div className="flex items-center space-x-2">
                    {selectedDateFilter && (
                      <button
                        onClick={() => setSelectedDateFilter(null)}
                        className="text-[10px] text-slate-500 hover:text-teal-700 bg-slate-100 px-1.5 py-0.5 rounded cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                    {/* Hide / Show List Toggle Button */}
                    <button
                      onClick={() => setIsUpcomingListVisible(false)}
                      className="text-xs text-slate-500 hover:text-teal-700 bg-slate-100 hover:bg-slate-200 font-semibold px-2 py-1 rounded-lg transition flex items-center space-x-1 cursor-pointer"
                      title="Hide Consultations List"
                    >
                      <EyeOff className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Hide List</span>
                    </button>
                  </div>
                </div>

                {displayedAppointments.length === 0 ? (
                  <div className="py-8 text-center text-slate-400">
                    <Calendar className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="text-xs font-medium">
                      {selectedDateFilter ? `No bookings on ${selectedDateFilter}` : 'No upcoming appointments booked.'}
                    </p>
                    <button
                      onClick={() => onOpenAddAppointment(selectedDateFilter || todayStr)}
                      className="mt-3 text-xs bg-teal-50 text-teal-800 font-semibold px-3 py-1.5 rounded-lg border border-teal-200 hover:bg-teal-100 transition cursor-pointer"
                    >
                      + Book for this Date
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                    {displayedAppointments.map((apt) => {
                      const isDone = apt.status === 'Completed';
                      const isCancelled = apt.status === 'Cancelled';
                      const patient = patients.find((p) => p.id === apt.patientId);

                      return (
                        <div
                          key={apt.id}
                          onClick={() => onSelectPatient(apt.patientId)}
                          className={`p-3 rounded-xl transition space-y-2 cursor-pointer group shadow-2xs border ${
                            isDone
                              ? 'bg-emerald-50/40 hover:bg-emerald-50/80 border-emerald-200'
                              : isCancelled
                              ? 'bg-slate-50 border-slate-200 opacity-70'
                              : 'bg-amber-50/40 hover:bg-amber-50/80 border-amber-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900 group-hover:text-teal-800 transition truncate">
                              {apt.patientName}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 border ${
                                isDone
                                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                  : isCancelled
                                  ? 'bg-slate-100 text-slate-600 border-slate-300'
                                  : 'bg-amber-100 text-amber-950 border-amber-300'
                              }`}
                            >
                              {apt.time}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-500 gap-1 flex-wrap">
                            <div className="flex items-center space-x-1.5 truncate">
                              <span className="font-semibold text-teal-700">{apt.type}</span>
                              <span>•</span>
                              <span>{apt.date}</span>
                            </div>

                            <div className="flex items-center space-x-1.5 shrink-0">
                              {/* 1-Click Reminder */}
                              {apt.status === 'Scheduled' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const phone = patient?.contactNumber || '';
                                    const msg = `Hello ${apt.patientName}, this is a friendly reminder from MaternalCare OB-GYN for your scheduled ${apt.type} on ${apt.date} at ${apt.time}. Please bring previous ultrasound and lab results. See you soon!`;
                                    const cleanPhone = phone.replace(/[^0-9]/g, '');
                                    if (cleanPhone) {
                                      const waNumber = cleanPhone.startsWith('0') ? '63' + cleanPhone.substring(1) : cleanPhone;
                                      window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`, '_blank');
                                    } else {
                                      navigator.clipboard.writeText(msg);
                                      alert(`Copied reminder to clipboard:\n\n${msg}`);
                                    }
                                  }}
                                  className="bg-white hover:bg-teal-50 text-teal-800 border border-teal-200 font-semibold text-[10px] px-1.5 py-0.5 rounded transition flex items-center space-x-0.5 cursor-pointer active:scale-95"
                                  title="Send 1-Click Reminder"
                                >
                                  <MessageSquare className="w-2.5 h-2.5 text-teal-600" />
                                  <span>Remind</span>
                                </button>
                              )}

                              {apt.status === 'Scheduled' ? (
                                onUpdateAppointmentStatus && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onUpdateAppointmentStatus(apt.id, 'Completed');
                                    }}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-2 py-0.5 rounded-md transition shadow-2xs flex items-center space-x-0.5 shrink-0 active:scale-95 cursor-pointer"
                                    title="Tag Consultation as Done"
                                  >
                                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                                    <span>Done</span>
                                  </button>
                                )
                              ) : apt.status === 'Completed' ? (
                                <span className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded border border-emerald-300 flex items-center space-x-1 shrink-0">
                                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                                  <span>Done ✓</span>
                                </span>
                              ) : (
                                <span className="text-[10px] text-rose-700 font-semibold bg-rose-50 px-1.5 py-0.5 rounded shrink-0">
                                  Cancelled
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Quick Action Shortcuts Box */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-xs space-y-3">
                <h4 className="text-xs font-bold tracking-wide uppercase text-teal-300">
                  {isNurse ? 'Clinical Assistant Shortcuts' : 'Lead Doctor Clinical Tools'}
                </h4>

                <div className="space-y-2 text-xs">
                  <button
                    onClick={onNavigateToPatients}
                    className="w-full bg-white/10 hover:bg-white/20 p-2.5 rounded-xl text-left transition flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center space-x-2">
                      <Search className="w-4 h-4 text-teal-400" />
                      <span>Search Patient Database</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <button
                    onClick={onNavigateToSchedule}
                    className="w-full bg-white/10 hover:bg-white/20 p-2.5 rounded-xl text-left transition flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-teal-400" />
                      <span>Open Interactive Calendar</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {!isNurse && onManageStaffClick && (
                    <button
                      onClick={onManageStaffClick}
                      className="w-full bg-white/10 hover:bg-white/20 p-2.5 rounded-xl text-left transition flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-teal-400" />
                        <span>Manage Staff & Access PINs</span>
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
