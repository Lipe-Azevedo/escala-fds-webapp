import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  getDay,
  differenceInCalendarWeeks,
  addDays,
} from 'date-fns';
import { User, Holiday, Swap, Certificate, DayOffReason, Comment, DaySchedule, DayIndicator, ShiftName } from '@/types';

export const indicatorColors: Record<DayIndicator['type'], string> = {
    day_off: '#10b981',
    swap_day_off: '#6ee7b0',
    swap_shift: '#3b82f6',
    holiday: '#f59e0b',
    certificate: '#ef4444',
    comment: '#6b7280',
};

type CalendarUser = Pick<User, 'id' | 'shift' | 'weekdayOff' | 'initialWeekendOff' | 'createdAt' | 'superiorId'>;

export function isRegularDayOff(date: Date, user: Pick<User, 'weekdayOff' | 'initialWeekendOff' | 'createdAt'>): boolean {
    const dayOfWeek = getDay(date);
    const weekdayMap: { [key: number]: string } = { 1: 'monday', 2: 'tuesday', 3: 'wednesday', 4: 'thursday', 5: 'friday' };
    if (weekdayMap[dayOfWeek] === user.weekdayOff) { return true; }
    if ((dayOfWeek === 0 || dayOfWeek === 6) && user.initialWeekendOff && user.createdAt) {
        const userCreatedAt = new Date(user.createdAt);
        const firstWeekendOffDay = user.initialWeekendOff === 'saturday' ? 6 : 0;
        let firstOccurrence = new Date(userCreatedAt);
        while (getDay(firstOccurrence) !== firstWeekendOffDay) { firstOccurrence.setDate(firstOccurrence.getDate() + 1); }
        const weeksDiff = differenceInCalendarWeeks(date, firstOccurrence, { weekStartsOn: 1 });
        const currentWeekendOffDay = (weeksDiff % 2 === 0) ? firstWeekendOffDay : (firstWeekendOffDay === 6 ? 0 : 6);
        if (dayOfWeek === currentWeekendOffDay) { return true; }
    }
    return false;
}

export function getDayStatus(
  day: Date,
  user: CalendarUser,
  holidays: Holiday[],
  swaps: Swap[],
  certificates: Certificate[]
): { isDayOff: boolean, reason: DayOffReason, shift: ShiftName } {
  const dateString = format(day, 'yyyy-MM-dd');
  
  let isOff = isRegularDayOff(day, user);
  let reason: DayOffReason = isOff ? (getDay(day) === 0 || getDay(day) === 6 ? 'Weekend' : 'Weekday') : '';
  let shift = user.shift;

  const swapOnThisDate = swaps.find(s => s.originalDate === dateString || s.newDate === dateString);

  if (swapOnThisDate) {
    if (swapOnThisDate.originalDate === swapOnThisDate.newDate) { // Troca de turno
      isOff = false;
      shift = swapOnThisDate.newShift;
      reason = '';
    } else if (dateString === swapOnThisDate.newDate) { // Novo dia de folga
      isOff = true;
      reason = 'Swap';
    } else if (dateString === swapOnThisDate.originalDate) { // Folga cedida
      isOff = false;
      shift = swapOnThisDate.newShift;
      reason = '';
    }
  }

  const certificateOnThisDay = certificates.find(c => {
    const start = new Date(c.startDate.replace(/-/g, '/'));
    const end = new Date(c.endDate.replace(/-/g, '/'));
    return day >= start && day <= end;
  });

  if (certificateOnThisDay) {
    isOff = true; 
    reason = 'Certificate';
  }
  
  return { isDayOff: isOff, reason, shift };
}

export const generateCalendarGrid = (
    month: Date, user: CalendarUser, holidays: Holiday[], swaps: Swap[], comments: Comment[], certificates: Certificate[]
  ) => {
    const monthStart = startOfMonth(month);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDate = addDays(startDate, 41); // Garante sempre 6 semanas (42 dias)
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    
    const holidaysMap = new Map(holidays.map(h => [h.date, h.name]));
    const commentsMap = new Map(comments.map(c => [c.date, true]));
    const approvedSwapsMap = new Map();
    swaps.filter(s => s.status === 'approved').forEach(s => {
        approvedSwapsMap.set(s.originalDate, s);
        approvedSwapsMap.set(s.newDate, s);
    });
    const certificateDaysMap = new Map();
    certificates.filter(c => c.status === 'approved').forEach(cert => {
        const start = new Date(cert.startDate.replace(/-/g, '/'));
        const end = new Date(cert.endDate.replace(/-/g, '/'));
        for (let d = start; d <= end; d = addDays(d, 1)) {
            certificateDaysMap.set(format(d, 'yyyy-MM-dd'), true);
        }
    });

    let workedCounter = 0;
    let holidaysWorkedCounter = 0;

    const calendarGrid: DaySchedule[] = days.map((day): DaySchedule => {
      const dateString = format(day, 'yyyy-MM-dd');
      let isOff: boolean = isRegularDayOff(day, user);
      let shift: ShiftName = user.shift;
      const indicators: DayIndicator[] = [];

      const swapOnThisDate = approvedSwapsMap.get(dateString);

      if (swapOnThisDate) {
        if (swapOnThisDate.originalDate === swapOnThisDate.newDate) {
          isOff = false;
          shift = swapOnThisDate.newShift;
        } else if (dateString === swapOnThisDate.newDate) {
          isOff = true;
        } else if (dateString === swapOnThisDate.originalDate) {
          isOff = false;
          shift = swapOnThisDate.newShift;
        }
      }
      
      if (certificateDaysMap.has(dateString)) {
        isOff = true; 
        indicators.push({ type: 'certificate', label: 'Atestado' });
      }

      if (isOff) {
        if (swapOnThisDate && dateString === swapOnThisDate.newDate) {
          indicators.push({ type: 'swap_day_off', label: 'Folga (Troca)' });
        } else if (!certificateDaysMap.has(dateString)) {
          indicators.push({ type: 'day_off', label: 'Folga Programada' });
        }
      } else if (swapOnThisDate && swapOnThisDate.originalDate === swapOnThisDate.newDate) {
        indicators.push({ type: 'swap_shift', label: `Troca de turno para ${shift}` });
      }

      const holidayName = holidaysMap.get(dateString);
      if (holidayName) {
        indicators.push({ type: 'holiday', label: `Feriado: ${holidayName}` });
      }

      if (commentsMap.has(dateString)) {
        indicators.push({ type: 'comment', label: 'Comentário' });
      }
      
      if(isSameMonth(day, month) && !isOff) {
          workedCounter++;
          if (holidayName) holidaysWorkedCounter++;
      }
      
      return {
        date: dateString,
        isDayOff: isOff,
        shift: isOff ? undefined : shift,
        indicators: indicators,
      };
    });
    
    return { calendarGrid, workedCounter, holidaysWorkedCounter };
};

export function chunk<T>(array: T[], size: number): T[][] {
    if (!array || array.length === 0) {
        return [];
    }
    const chunked_arr: T[][] = [];
    let index = 0;
    while (index < array.length) {
        chunked_arr.push(array.slice(index, size + index));
        index += size;
    }
    return chunked_arr;
}