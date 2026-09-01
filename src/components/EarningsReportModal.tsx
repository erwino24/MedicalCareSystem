import React, { useState, useMemo } from 'react';
import type { Patient, PractitionerUser, PatientCareType } from '../types/patient';
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subWeeks,
  subMonths,
  eachDayOfInterval,
  parseISO,
} from 'date-fns';
import {
  X,
  Printer,
  Wallet,
  TrendingUp,
  Stethoscope,
  FileSpreadsheet,
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface EarningsReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  currentUser: PractitionerUser;
}

type ReportPeriod = 'this_week' | 'last_week' | 'this_month' | 'last_month' | 'past_6_months' | 'year_to_date' | 'custom';

export const EarningsReportModal: React.FC<EarningsReportModalProps> = ({
  isOpen,
  onClose,
  patients = [],
  currentUser,
}) => {
  const [period, setPeriod] = useState<ReportPeriod>('this_month');
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'));
  const [customStart, setCustomStart] = useState<string>(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [customEnd, setCustomEnd] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<string>('ALL');

  const now = new Date();

  // Determine interval based on selected period
  const dateInterval = useMemo(() => {
    try {
      switch (period) {
        case 'this_week':
          return {
            start: startOfWeek(now, { weekStartsOn: 1 }), // Monday
            end: endOfWeek(now, { weekStartsOn: 1 }),
            label: `This Week (${format(startOfWeek(now, { weekStartsOn: 1 }), 'MMM d')} – ${format(endOfWeek(now, { weekStartsOn: 1 }), 'MMM d, yyyy')})`,
          };
        case 'last_week': {
          const lastWeekDate = subWeeks(now, 1);
          return {
            start: startOfWeek(lastWeekDate, { weekStartsOn: 1 }),
            end: endOfWeek(lastWeekDate, { weekStartsOn: 1 }),
            label: `Last Week (${format(startOfWeek(lastWeekDate, { weekStartsOn: 1 }), 'MMM d')} – ${format(endOfWeek(lastWeekDate, { weekStartsOn: 1 }), 'MMM d, yyyy')})`,
          };
        }
        case 'this_month': {
          const parts = (selectedMonth || format(now, 'yyyy-MM')).split('-');
          const y = parseInt(parts[0], 10) || now.getFullYear();
          const m = parseInt(parts[1], 10) || (now.getMonth() + 1);
          const targetDate = new Date(y, m - 1, 1);
          return {
            start: startOfMonth(targetDate),
            end: endOfMonth(targetDate),
            label: `Month of ${format(targetDate, 'MMMM yyyy')}`,
          };
        }
        case 'last_month': {
          const lastMonthDate = subMonths(now, 1);
          return {
            start: startOfMonth(lastMonthDate),
            end: endOfMonth(lastMonthDate),
            label: `Last Month (${format(lastMonthDate, 'MMMM yyyy')})`,
          };
        }
        case 'past_6_months': {
          const start6m = startOfMonth(subMonths(now, 5));
          return {
            start: start6m,
            end: endOfMonth(now),
            label: `Past 6 Months (${format(start6m, 'MMM yyyy')} – ${format(now, 'MMM yyyy')})`,
          };
        }
        case 'year_to_date': {
          const startYear = new Date(now.getFullYear(), 0, 1);
          return {
            start: startYear,
            end: endOfMonth(now),
            label: `Year-to-Date (${now.getFullYear()})`,
          };
        }
        case 'custom': {
          const start = customStart ? parseISO(customStart) : startOfMonth(now);
          const end = customEnd ? parseISO(customEnd) : now;
          return {
            start,
            end,
            label: `Custom Range (${format(start, 'MMM d, yyyy')} – ${format(end, 'MMM d, yyyy')})`,
          };
        }
        default:
          return {
            start: startOfMonth(now),
            end: endOfMonth(now),
            label: format(now, 'MMMM yyyy'),
          };
      }
    } catch {
      return {
        start: startOfMonth(now),
        end: endOfMonth(now),
        label: format(now, 'MMMM yyyy'),
      };
    }
  }, [period, selectedMonth, customStart, customEnd]);

  // Extract and filter all consultations in interval
  interface ConsultationEntry {
    checkupId: string;
    date: string;
    patientId: string;
    patientName: string;
    patientAge: number;
    careType: PatientCareType;
    diagnosis: string;
    procedure: string;
    grossFee: number;
    discountType: string;
    discountAmount: number;
    paymentMethod: string;
    hmoProvider?: string;
    hmoApprovalCode?: string;
    seniorPwdId?: string;
    philhealthClaimNo?: string;
    fee: number;
  }

  const filteredEntries: ConsultationEntry[] = useMemo(() => {
    const list: ConsultationEntry[] = [];
    const startDateStr = format(dateInterval.start, 'yyyy-MM-dd');
    const endDateStr = format(dateInterval.end, 'yyyy-MM-dd');

    patients.forEach((p) => {
      const care = p.careType || 'Pregnant';
      if (categoryFilter !== 'ALL' && care !== categoryFilter) {
        return;
      }

      p.checkups.forEach((c) => {
        if (c.date >= startDateStr && c.date <= endDateStr) {
          const payMethod = c.paymentMethod || 'Cash';
          const discType = c.discountType || 'None';

          if (paymentFilter === 'CASH' && payMethod !== 'Cash') return;
          if (paymentFilter === 'HMO' && payMethod !== 'HMO / Health Card') return;
          if (paymentFilter === 'PHILHEALTH' && payMethod !== 'PhilHealth') return;
          if (paymentFilter === 'SENIOR_PWD' && discType !== 'Senior Citizen (20%)' && discType !== 'PWD (20%)') return;

          const net = c.fee !== undefined ? c.fee : 0;
          const gross = c.grossFee !== undefined ? c.grossFee : (c.discountAmount ? net + c.discountAmount : net);

          list.push({
            checkupId: c.id,
            date: c.date,
            patientId: p.id,
            patientName: p.fullName,
            patientAge: p.age,
            careType: care,
            diagnosis: c.diagnosis,
            procedure: c.procedure,
            grossFee: gross,
            discountType: discType,
            discountAmount: c.discountAmount || (gross > net ? gross - net : 0),
            paymentMethod: payMethod,
            hmoProvider: c.hmoProvider,
            hmoApprovalCode: c.hmoApprovalCode,
            seniorPwdId: c.seniorPwdId,
            philhealthClaimNo: c.philhealthClaimNo,
            fee: net,
          });
        }
      });
    });

    // Sort newest consultation first
    return list.sort((a, b) => b.date.localeCompare(a.date));
  }, [patients, dateInterval, categoryFilter, paymentFilter]);

  // Summary Metrics
  const totalEarnings = filteredEntries.reduce((sum, item) => sum + item.fee, 0);
  const totalGrossBillings = filteredEntries.reduce((sum, item) => sum + item.grossFee, 0);
  const totalDiscountsGiven = filteredEntries.reduce((sum, item) => sum + item.discountAmount, 0);
  const seniorPwdDiscountTotal = filteredEntries
    .filter((item) => item.discountType === 'Senior Citizen (20%)' || item.discountType === 'PWD (20%)')
    .reduce((sum, item) => sum + item.discountAmount, 0);

  const cashCollections = filteredEntries
    .filter((item) => item.paymentMethod === 'Cash')
    .reduce((sum, item) => sum + item.fee, 0);

  const hmoReceivables = filteredEntries
    .filter((item) => item.paymentMethod === 'HMO / Health Card')
    .reduce((sum, item) => sum + item.fee, 0);

  const philhealthTotal = filteredEntries
    .filter((item) => item.paymentMethod === 'PhilHealth')
    .reduce((sum, item) => sum + item.fee, 0);

  const totalConsultations = filteredEntries.length;
  const consultationsWithFee = filteredEntries.filter((item) => item.fee > 0).length;
  const uniquePatientsCount = new Set(filteredEntries.map((item) => item.patientId)).size;
  const avgFeePerConsultation = consultationsWithFee > 0 ? totalEarnings / consultationsWithFee : 0;

  // Breakdown by Specialty / Category
  const specialtyBreakdown = useMemo(() => {
    const map: Record<string, { total: number; count: number }> = {};
    filteredEntries.forEach((item) => {
      if (!map[item.careType]) {
        map[item.careType] = { total: 0, count: 0 };
      }
      map[item.careType].total += item.fee;
      map[item.careType].count += 1;
    });

    return Object.entries(map).map(([type, data]) => ({
      type,
      total: data.total,
      count: data.count,
      percentage: totalEarnings > 0 ? (data.total / totalEarnings) * 100 : 0,
    })).sort((a, b) => b.total - a.total);
  }, [filteredEntries, totalEarnings]);

  // Time Series Breakdown (Daily if week, Weekly if month, Monthly if 6m/ytd)
  const timeBreakdown = useMemo(() => {
    if (period === 'this_week' || period === 'last_week') {
      // Days Mon - Sun
      const days = eachDayOfInterval({ start: dateInterval.start, end: dateInterval.end });
      return days.map((day) => {
        const dayStr = format(day, 'yyyy-MM-dd');
        const dayEntries = filteredEntries.filter((e) => e.date === dayStr);
        const dayTotal = dayEntries.reduce((s, e) => s + e.fee, 0);
        return {
          label: format(day, 'EEE (MMM d)'),
          total: dayTotal,
          count: dayEntries.length,
        };
      });
    }

    if (period === 'this_month' || period === 'last_month') {
      // 4-5 Weeks in Month
      const weeks: { label: string; total: number; count: number }[] = [
        { label: 'Week 1 (Days 1–7)', total: 0, count: 0 },
        { label: 'Week 2 (Days 8–14)', total: 0, count: 0 },
        { label: 'Week 3 (Days 15–21)', total: 0, count: 0 },
        { label: 'Week 4 (Days 22–28)', total: 0, count: 0 },
        { label: 'Week 5 (Days 29–End)', total: 0, count: 0 },
      ];

      filteredEntries.forEach((e) => {
        const parts = (e.date || '').split('-');
        const dayNum = parts.length === 3 ? parseInt(parts[2], 10) : 1;
        let index = 0;
        if (dayNum <= 7) index = 0;
        else if (dayNum <= 14) index = 1;
        else if (dayNum <= 21) index = 2;
        else if (dayNum <= 28) index = 3;
        else index = 4;

        weeks[index].total += (e.fee || 0);
        weeks[index].count += 1;
      });

      return weeks;
    }

    // Default: Group by month for longer periods
    const monthMap: Record<string, { total: number; count: number }> = {};
    filteredEntries.forEach((e) => {
      const monthKey = (e.date || format(now, 'yyyy-MM')).substring(0, 7); // YYYY-MM
      if (!monthMap[monthKey]) monthMap[monthKey] = { total: 0, count: 0 };
      monthMap[monthKey].total += (e.fee || 0);
      monthMap[monthKey].count += 1;
    });

    return Object.entries(monthMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([m, data]) => {
        const parts = m.split('-');
        const y = parseInt(parts[0], 10) || now.getFullYear();
        const mon = parseInt(parts[1], 10) || (now.getMonth() + 1);
        const dateObj = new Date(y, mon - 1, 1);
        return {
          label: format(dateObj, 'MMM yyyy'),
          total: data.total,
          count: data.count,
        };
      });
  }, [period, dateInterval, filteredEntries]);

  const maxTimeAmount = Math.max(...timeBreakdown.map((t) => t.total), 1);

  // Export Filtered Report to Excel
  const handleExportExcel = () => {
    const sheetData = filteredEntries.map((item, idx) => ({
      'No.': idx + 1,
      'Consultation Date': item.date,
      'Patient Name': item.patientName,
      'Age': item.patientAge,
      'Clinical Care Category': item.careType,
      'Diagnosis / Assessment': item.diagnosis,
      'Procedure / Treatment': item.procedure,
      'Gross Fee (PHP ₱)': item.grossFee,
      'Discount Type': item.discountType,
      'Discount (PHP ₱)': item.discountAmount,
      'Payment / Coverage': item.paymentMethod,
      'HMO / LOA Ref': item.paymentMethod === 'HMO / Health Card' ? `${item.hmoProvider || 'HMO'} (${item.hmoApprovalCode || 'No LOA'})` : 'N/A',
      'Net Amount Charged (PHP ₱)': item.fee,
    }));

    // Add summary rows at bottom
    sheetData.push({
      'No.': '',
      'Consultation Date': 'TOTAL NET EARNINGS',
      'Patient Name': `${totalConsultations} Consultations (${uniquePatientsCount} Patients)`,
      'Age': '',
      'Clinical Care Category': '',
      'Diagnosis / Assessment': '',
      'Procedure / Treatment': '',
      'Gross Fee (PHP ₱)': totalGrossBillings,
      'Discount Type': `Discounts Given: ₱${totalDiscountsGiven.toFixed(2)}`,
      'Discount (PHP ₱)': totalDiscountsGiven,
      'Payment / Coverage': `Cash: ₱${cashCollections.toFixed(2)} | HMO: ₱${hmoReceivables.toFixed(2)}`,
      'HMO / LOA Ref': '',
      'Net Amount Charged (PHP ₱)': totalEarnings,
    } as any);

    const worksheet = XLSX.utils.json_to_sheet(sheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Earnings Report');
    XLSX.writeFile(workbook, `Clinic_Earnings_Report_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto font-sans print:p-0 print:bg-white print:static print:inset-auto">
      <div
        id="printable-earnings-report"
        className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 print:max-h-none print:overflow-visible print:shadow-none print:border-none print:w-full print:max-w-none print:my-0"
      >
        
        {/* PRINT-ONLY OFFICIAL CLINIC STATEMENT HEADER */}
        <div className="hidden print:block mb-6 border-b-2 border-slate-900 pb-4 pt-2">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">MEDICAL MANAGEMENT SYSTEM</h1>
              <p className="text-sm font-bold text-teal-800">Official Clinical Practice Financial & Consultation Earnings Report</p>
              <p className="text-xs text-slate-600 mt-1">
                Practitioner: <strong>{currentUser.fullName}</strong> ({currentUser.title || (currentUser.role === 'DOCTOR' ? 'Physician / OB-GYN' : 'Clinical Staff')})
              </p>
            </div>
            <div className="text-right">
              <div className="inline-block bg-teal-50 border border-teal-300 px-3 py-1.5 rounded-lg text-right">
                <p className="text-[10px] uppercase font-bold text-slate-500">Report Scope</p>
                <p className="text-sm font-extrabold text-teal-900">{dateInterval.label}</p>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Date Printed: {format(new Date(), 'MMMM d, yyyy, h:mm a')}</p>
            </div>
          </div>
        </div>

        {/* SCREEN HEADER (Hidden on Print) */}
        <div className="px-5 sm:px-6 py-4 bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white flex items-center justify-between shrink-0 no-print">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-xl shadow-xs">
              <Wallet className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold">Clinic Financials & Earnings Report</h2>
                <span className="bg-emerald-500 text-slate-950 font-extrabold text-[10px] px-2 py-0.5 rounded-full uppercase">
                  ₱ Peso Only
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Period: <span className="font-semibold text-teal-300">{dateInterval.label}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="hidden sm:flex items-center space-x-1.5 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/20 transition cursor-pointer"
              title="Print Financial Statement"
            >
              <Printer className="w-3.5 h-3.5 text-teal-300" />
              <span>Print</span>
            </button>

            <button
              onClick={handleExportExcel}
              className="hidden sm:flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
              title="Export Report to Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export Excel</span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CONTROLS BAR (Hidden on Print) */}
        <div className="px-5 sm:px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0 no-print">
          {/* Quick Period Buttons */}
          <div className="flex items-center flex-wrap gap-1.5 text-xs font-medium">
            <button
              onClick={() => setPeriod('this_week')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                period === 'this_week'
                  ? 'bg-teal-600 text-white font-bold shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setPeriod('last_week')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                period === 'last_week'
                  ? 'bg-teal-600 text-white font-bold shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Last Week
            </button>
            <button
              onClick={() => setPeriod('this_month')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                period === 'this_month'
                  ? 'bg-teal-600 text-white font-bold shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setPeriod('last_month')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                period === 'last_month'
                  ? 'bg-teal-600 text-white font-bold shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Last Month
            </button>
            <button
              onClick={() => setPeriod('past_6_months')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                period === 'past_6_months'
                  ? 'bg-teal-600 text-white font-bold shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              6 Months
            </button>
            <button
              onClick={() => setPeriod('custom')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                period === 'custom'
                  ? 'bg-teal-600 text-white font-bold shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Custom Range
            </button>
          </div>

          {/* Month / Custom Range Pickers & Category Filter */}
          <div className="flex items-center space-x-2 text-xs w-full sm:w-auto">
            {period === 'this_month' && (
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-teal-500"
              />
            )}

            {period === 'custom' && (
              <div className="flex items-center space-x-1.5">
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs focus:ring-2 focus:ring-teal-500"
                />
                <span className="text-slate-400">to</span>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs focus:ring-2 focus:ring-teal-500"
                />
              </div>
            )}

            {/* Specialty Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-teal-500 cursor-pointer"
            >
              <option value="ALL">All Specialties</option>
              <option value="Pregnant">🤰 Pregnant / OB-GYN</option>
              <option value="Pediatric / Baby Care">👶 Pediatric / Baby</option>
              <option value="Anti-Rabies / Animal Bite">🐕 Anti-Rabies</option>
              <option value="Vaccination / Immunization">💉 Vaccines</option>
              <option value="Dengue / Fever">🦟 Dengue / Fever</option>
              <option value="General Illness">🤒 General OPD</option>
              <option value="Chronic Care">🩺 Chronic Care</option>
            </select>

            {/* Payment & Discount Filter */}
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-teal-500 cursor-pointer"
            >
              <option value="ALL">All Payment Types</option>
              <option value="CASH">💵 Cash Only</option>
              <option value="HMO">🏥 HMO Cards Only</option>
              <option value="PHILHEALTH">🇵🇭 PhilHealth Only</option>
              <option value="SENIOR_PWD">🏷️ Senior & PWD (20% Off)</option>
            </select>
          </div>
        </div>

        {/* SCROLLABLE REPORT BODY */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-white print:overflow-visible print:p-0 print:space-y-4">
          
          {/* STATS TILES (FINANCIAL SUMMARY) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 print:grid-cols-4 print:gap-2">
            {/* Total Net Revenue */}
            <div className="bg-gradient-to-br from-emerald-500/10 via-teal-50 to-white p-4 rounded-xl border border-emerald-300 shadow-2xs print:border-slate-400 print:bg-slate-50">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                Total Net Collections
              </span>
              <p className="text-2xl sm:text-3xl font-black text-emerald-950 font-mono mt-1">
                ₱{totalEarnings.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                Gross Billed: ₱{totalGrossBillings.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Discounts Given (Senior / PWD / Courtesy) */}
            <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200 print:border-slate-400">
              <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">
                Total Discounts Given
              </span>
              <p className="text-2xl sm:text-3xl font-black text-amber-950 font-mono mt-1">
                ₱{totalDiscountsGiven.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <span className="text-[10px] text-amber-800 font-medium mt-0.5 block">
                Senior / PWD Savings: ₱{seniorPwdDiscountTotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Cash vs HMO vs PhilHealth Breakdown */}
            <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200 print:border-slate-400">
              <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider block">
                Coverage Breakdown
              </span>
              <div className="mt-1 space-y-0.5 text-[11px]">
                <p className="font-bold text-slate-800 flex justify-between">
                  <span>💵 Cash:</span>
                  <span className="font-mono text-emerald-900">₱{cashCollections.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                </p>
                <p className="font-bold text-slate-800 flex justify-between">
                  <span>🏥 HMO:</span>
                  <span className="font-mono text-blue-900">₱{hmoReceivables.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                </p>
                {philhealthTotal > 0 && (
                  <p className="font-bold text-slate-800 flex justify-between">
                    <span>🇵🇭 PhilHealth:</span>
                    <span className="font-mono text-emerald-900">₱{philhealthTotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Consultations Logged & Average */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 print:border-slate-400">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Consultations Logged
              </span>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                {totalConsultations}
              </p>
              <div className="text-[10px] text-slate-500 mt-0.5 flex justify-between">
                <span className="text-teal-700 font-semibold">{uniquePatientsCount} Patients</span>
                <span className="font-mono font-medium">Avg: ₱{avgFeePerConsultation.toFixed(0)}</span>
              </div>
            </div>
          </div>

          {/* VISUAL BREAKDOWN SECTION (TIME TREND & SPECIALTY BREAKDOWN) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 print:grid-cols-12 print:gap-4">
            
            {/* LEFT: TIME PERIOD BAR GRAPH (Weekly / Daily) */}
            <div className="lg:col-span-7 bg-slate-50 rounded-xl border border-slate-200 p-4.5 space-y-3 print:col-span-7 print:border-slate-300">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-teal-600" />
                  <h3 className="text-xs font-bold text-slate-800">
                    {period === 'this_week' || period === 'last_week' ? 'Daily Earnings Breakdown' : 'Weekly / Monthly Distribution'}
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {dateInterval.label}
                </span>
              </div>

              {timeBreakdown.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No consultation fee data in this period.</p>
              ) : (
                <div className="space-y-2.5 pt-1">
                  {timeBreakdown.map((item, idx) => {
                    const barWidthPercent = Math.max((item.total / maxTimeAmount) * 100, item.total > 0 ? 5 : 0);
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-700">{item.label}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-slate-400 text-[10px]">({item.count} consults)</span>
                            <span className="font-bold font-mono text-emerald-900">
                              ₱{item.total.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-slate-200/80 rounded-full h-2.5 overflow-hidden print:border print:border-slate-300">
                          <div
                            className="bg-gradient-to-r from-teal-500 to-emerald-500 h-2.5 rounded-full transition-all duration-300"
                            style={{ width: `${barWidthPercent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* RIGHT: EARNINGS BY SPECIALTY */}
            <div className="lg:col-span-5 bg-slate-50 rounded-xl border border-slate-200 p-4.5 space-y-3 print:col-span-5 print:border-slate-300">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center space-x-2">
                  <Stethoscope className="w-4 h-4 text-teal-600" />
                  <h3 className="text-xs font-bold text-slate-800">Earnings by Specialty</h3>
                </div>
                <span className="text-[10px] text-teal-700 font-bold bg-teal-100 px-2 py-0.5 rounded-full">
                  {specialtyBreakdown.length} Categories
                </span>
              </div>

              {specialtyBreakdown.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No patient records found.</p>
              ) : (
                <div className="space-y-3 pt-1">
                  {specialtyBreakdown.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800 truncate max-w-[150px]">
                          {item.type}
                        </span>
                        <div className="flex items-center space-x-1.5 font-mono">
                          <span className="text-slate-400 text-[10px]">({item.percentage.toFixed(0)}%)</span>
                          <span className="font-bold text-emerald-950">
                            ₱{item.total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden print:border print:border-slate-300">
                        <div
                          className="bg-teal-600 h-2 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* DETAILED CONSULTATION TRANSACTION LOG */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 flex items-center space-x-2">
                <span>Detailed Consultation Records ({filteredEntries.length})</span>
              </h3>
              <span className="text-[11px] text-slate-400">
                Sorted by most recent consultation date
              </span>
            </div>

            {filteredEntries.length === 0 ? (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center text-slate-400">
                <Wallet className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-semibold text-slate-600">No consultations logged in this date range</p>
                <p className="text-xs text-slate-400 mt-0.5">Try selecting a different week, month, or custom date range above.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200 print:border-slate-300">
                <table className="w-full text-left text-xs text-slate-700 min-w-[750px]">
                  <thead className="bg-slate-100/90 text-slate-600 font-semibold border-b border-slate-200 print:bg-slate-100">
                    <tr>
                      <th className="py-2.5 px-3 w-[90px]">Date</th>
                      <th className="py-2.5 px-3 w-[150px]">Patient Name</th>
                      <th className="py-2.5 px-3 w-[110px]">Specialty</th>
                      <th className="py-2.5 px-3 min-w-[170px]">Diagnosis & Procedure</th>
                      <th className="py-2.5 px-3 w-[130px]">Discounts / Coverage</th>
                      <th className="py-2.5 px-3 w-[100px] text-right">Net Fee (₱)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredEntries.map((rec) => (
                      <tr key={rec.checkupId} className="hover:bg-slate-50/80 transition">
                        <td className="py-2.5 px-3 font-semibold text-slate-800 align-top">
                          {rec.date}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900 align-top">
                          {rec.patientName}
                          <span className="text-[10px] text-slate-400 block font-normal">{rec.patientAge} yrs</span>
                        </td>
                        <td className="py-2.5 px-3 align-top">
                          <span className="bg-teal-50 text-teal-800 text-[10px] font-semibold px-2 py-0.5 rounded border border-teal-200 whitespace-nowrap">
                            {rec.careType}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 align-top">
                          <p className="font-semibold text-slate-800 text-[11px]">{rec.diagnosis}</p>
                          <p className="text-slate-500 text-[10px] truncate max-w-md">{rec.procedure}</p>
                        </td>
                        <td className="py-2.5 px-3 align-top space-y-0.5">
                          <span className="text-[10px] font-bold text-slate-700 block">
                            {rec.paymentMethod === 'HMO / Health Card' ? `🏥 ${rec.hmoProvider || 'HMO'}` : rec.paymentMethod === 'PhilHealth' ? '🇵🇭 PhilHealth' : '💵 Cash'}
                          </span>
                          {rec.discountType && rec.discountType !== 'None' && (
                            <span className="bg-amber-50 text-amber-900 border border-amber-200 text-[9px] px-1.5 py-0.2 rounded block font-semibold">
                              🏷️ {rec.discountType} (-₱{rec.discountAmount.toFixed(2)})
                            </span>
                          )}
                          {rec.hmoApprovalCode && (
                            <span className="text-[9px] text-slate-400 block font-mono">LOA: {rec.hmoApprovalCode}</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 align-top text-right font-mono font-bold">
                          {rec.fee > 0 ? (
                            <span className="text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 print:bg-transparent print:border-none">
                              ₱{rec.fee.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-normal italic">Free</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-300 text-slate-900">
                    <tr>
                      <td colSpan={5} className="py-3 px-3 text-right">
                        Total Net Collections:
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-emerald-950 text-sm">
                        ₱{totalEarnings.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* PRINT-ONLY SIGNATURE FOOTER */}
          <div className="hidden print:block mt-8 pt-6 border-t-2 border-slate-300">
            <div className="flex justify-between items-end">
              <div className="text-xs text-slate-500 space-y-1">
                <p className="font-semibold text-slate-700">Medical Management System • Clinical Records</p>
                <p>This is a system-generated official clinical practice financial statement.</p>
                <p className="text-[10px]">Confidential Medical Administration Record</p>
              </div>
              <div className="text-center w-72">
                <div className="border-b-2 border-slate-800 mb-2 pb-6"></div>
                <p className="text-sm font-black text-slate-900">{currentUser.fullName}</p>
                <p className="text-xs font-semibold text-slate-600">{currentUser.title || 'Attending Physician / Clinical Practitioner'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-5 sm:px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 text-xs text-slate-500 no-print">
          <div>
            Prepared by: <strong className="text-slate-800">{currentUser.fullName}</strong> ({currentUser.title}) • {format(new Date(), 'MMMM d, yyyy')}
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleExportExcel}
              className="sm:hidden flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded-xl transition flex items-center justify-center space-x-1"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Excel</span>
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold transition cursor-pointer"
            >
              Close Report
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
