import { parseISO, addDays, differenceInDays, isValid, format } from 'date-fns';

export interface CalculationResult {
  edd: string;       // Formatted date string e.g., "Nov 15, 2026"
  eddRaw: string;    // YYYY-MM-DD
  aogWeeks: number;  // Full weeks
  aogDays: number;   // Remaining days
  aogFormatted: string; // e.g. "24 weeks 3 days"
  trimester: '1st' | '2nd' | '3rd' | 'Post-term' | 'Pre-conception' | 'Invalid';
  daysRemaining: number;
}

/**
 * Calculates EDD (LMP + 280 days) and AOG from Last Menstrual Period date string YYYY-MM-DD.
 */
export function calculateObGynMetrics(lmpString: string, targetDate: Date = new Date()): CalculationResult {
  if (!lmpString) {
    return {
      edd: 'N/A',
      eddRaw: '',
      aogWeeks: 0,
      aogDays: 0,
      aogFormatted: 'LMP not set',
      trimester: 'Invalid',
      daysRemaining: 0,
    };
  }

  const lmpDate = parseISO(lmpString);

  if (!isValid(lmpDate)) {
    return {
      edd: 'Invalid Date',
      eddRaw: '',
      aogWeeks: 0,
      aogDays: 0,
      aogFormatted: 'Invalid LMP',
      trimester: 'Invalid',
      daysRemaining: 0,
    };
  }

  // EDD = LMP + 280 days (40 weeks)
  const eddDate = addDays(lmpDate, 280);
  const eddFormatted = format(eddDate, 'MMM d, yyyy');
  const eddRaw = format(eddDate, 'yyyy-MM-dd');

  // AOG = difference in days from LMP to targetDate (today)
  const totalDays = differenceInDays(targetDate, lmpDate);

  if (totalDays < 0) {
    return {
      edd: eddFormatted,
      eddRaw,
      aogWeeks: 0,
      aogDays: 0,
      aogFormatted: 'Future LMP',
      trimester: 'Pre-conception',
      daysRemaining: 280,
    };
  }

  const aogWeeks = Math.floor(totalDays / 7);
  const aogDays = totalDays % 7;

  let trimester: CalculationResult['trimester'] = '1st';
  if (aogWeeks >= 42) {
    trimester = 'Post-term';
  } else if (aogWeeks >= 28) {
    trimester = '3rd';
  } else if (aogWeeks >= 14) {
    trimester = '2nd';
  } else {
    trimester = '1st';
  }

  const daysRemaining = Math.max(0, differenceInDays(eddDate, targetDate));

  const aogFormatted = `${aogWeeks}w ${aogDays}d`;

  return {
    edd: eddFormatted,
    eddRaw,
    aogWeeks,
    aogDays,
    aogFormatted,
    trimester,
    daysRemaining,
  };
}
