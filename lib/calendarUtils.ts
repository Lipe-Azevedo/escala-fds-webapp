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
import { User, Holiday, Swap, Certificate, DayOffReason, Comment } from '@/types';

export interface DayInfo {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isDayOff: boolean;
  dayOffReason: DayOffReason;
  isHoliday: boolean;
  holidayName: string;
  hasComment: boolean;
  shift: string;
}

const weekdayMap: { [key: number]: string } = { 1: 'monday', 2: 'tuesday', 3: 'wednesday', 4: 'thursday', 5: 'friday' };

type CalendarUser = Pick<User, 'id' | 'shift' | 'weekdayOff' | 'initialWeekendOff' | 'createdAt' | 'superiorId'>;

export function isRegularDayOff(date: Date, user: Pick<User, 'weekdayOff' | 'initialWeekendOff' | 'createdAt'>): boolean {
    const dayOfWeek = getDay(date);
    if (weekdayMap[dayOfWeek] === user.weekdayOff) {
        return true;
    }
    if ((dayOfWeek === 0 || dayOfWeek === 6) && user.initialWeekendOff && user.createdAt) {
        const userCreatedAt = new Date(user.createdAt);
        const firstWeekendOffDay = user.initialWeekendOff === 'saturday' ? 6 : 0;
        let firstOccurrence = new Date(userCreatedAt);
        while (getDay(firstOccurrence) !== firstWeekendOffDay) {
            firstOccurrence.setDate(firstOccurrence.getDate() + 1);
        }
        const weeksDiff = differenceInCalendarWeeks(date, firstOccurrence, { weekStartsOn: 1 });
        const currentWeekendOffDay = (weeksDiff % 2 === 0) ? firstWeekendOffDay : (firstWeekendOffDay === 6 ? 0 : 6);
        if (dayOfWeek === currentWeekendOffDay) {
            return true;
        }
    }
    return false;
}

export function getDayStatus(
  day: Date,
  user: CalendarUser,
  holidays: Holiday[],
  swaps: Swap[],
  certificates: Certificate[]
): Omit<DayInfo, 'isCurrentMonth' | 'isToday' | 'hasComment'> {
  const dateString = format(day, 'yyyy-MM-dd');
  const holidaysMap = new Map(holidays.map(h => [h.date, h.name]));
  const approvedSwapsMap = new Map();
  swaps.forEach(s => {
    approvedSwapsMap.set(s.originalDate, s);
    approvedSwapsMap.set(s.newDate, s);
  });
  const certificateDaysMap = new Map();
  certificates.forEach(cert => {
    const start = new Date(cert.startDate.replace(/-/g, '/'));
    const end = new Date(cert.endDate.replace(/-/g, '/'));
    for (let d = start; d <= end; d = addDays(d, 1)) {
        certificateDaysMap.set(format(d, 'yyyy-MM-dd'), true);
    }
  });

  let isOff = false;
  let reason: DayOffReason = '';
  let shift = user.shift;
  const holidayName = holidaysMap.get(dateString) || '';
  
  if (isRegularDayOff(day, user)) {
    isOff = true;
    reason = getDay(day) === 0 || getDay(day) === 6 ? 'Weekend' : 'Weekday';
  }
  
  const swap = approvedSwapsMap.get(dateString);
  if (swap) {
    const isShiftChangeOnly = swap.originalDate === swap.newDate;
    if (isShiftChangeOnly) { isOff = false; shift = swap.newShift; reason = ''; } 
    else {
        const isNewDayOff = dateString === swap.newDate;
        if (isNewDayOff) { isOff = true; reason = 'Swap'; } 
        else { isOff = false; shift = swap.newShift; reason = ''; }
    }
  }

  if (certificateDaysMap.has(dateString)) {
    isOff = true; reason = 'Certificate';
  }
  
  return {
    date: day,
    isDayOff: isOff,
    dayOffReason: reason,
    isHoliday: !!holidayName,
    holidayName: holidayName,
    shift: isOff ? '' : shift,
  };
}

export const generateCalendarGrid = (
    month: Date, user: CalendarUser, holidays: Holiday[], swaps: Swap[], comments: Comment[], certificates: Certificate[]
  ) => {
    const monthStart = startOfMonth(month);
    const days = eachDayOfInterval({ start: startOfWeek(monthStart, { weekStartsOn: 0 }), end: endOfWeek(endOfMonth(month), { weekStartsOn: 0 }) });
    const commentsMap = new Map(comments.map(c => [c.date, true]));
    
    let workedCounter = 0;
    let holidaysWorkedCounter = 0;

    const calendarGrid = days.map((day): DayInfo => {
      const dayStatus = getDayStatus(day, user, holidays, swaps, certificates);
      
      if(isSameMonth(day, month) && !dayStatus.isDayOff) {
          workedCounter++;
          if (dayStatus.isHoliday) holidaysWorkedCounter++;
      }
      
      return {
        ...dayStatus,
        isCurrentMonth: isSameMonth(day, month),
        isToday: isToday(day),
        hasComment: commentsMap.has(format(day, 'yyyy-MM-dd')),
      };
    });
    
    return { calendarGrid, workedCounter, holidaysWorkedCounter };
};