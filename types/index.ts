export type TeamName = 'Security' | 'Support' | 'CustomerService' | '';
export type PositionName = string;
export type ShiftName = '06:00-14:00' | '14:00-22:00' | '22:00-06:00';
export type DayOffReason = 'Weekday' | 'Weekend' | 'Swap' | 'Holiday' | 'Certificate' | '';


export type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  userType: 'master' | 'collaborator';
  team: TeamName;
  position: PositionName;
  shift: ShiftName;
  weekdayOff: string;
  initialWeekendOff: string;
  createdAt: string;
  superiorId?: number;
  birthday?: string;
};

export type Holiday = {
  id: number;
  name: string;
  date: string;
  type: 'national' | 'state' | 'city';
  repeatsAnnually: boolean;
};

export type Swap = {
  id: number;
  requester: User;
  involvedCollaborator?: User;
  originalDate: string;
  newDate: string;
  originalShift: ShiftName | 'Folga';
  newShift: ShiftName;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'pending_confirmation';
  approvedBy?: User;
  createdAt: string;
  approvedAt?: string;
};

export type Certificate = {
  id: number;
  collaborator: User;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: User;
  createdAt: string;
  approvedAt?: string;
};

export type Comment = {
    id: number;
    collaborator: User;
    author: User;
    text: string;
    date: string;
    createdAt: string;
    updatedAt: string;
};

export type FilterOption = {
  label: string;
  value: string;
};

export type FilterConfig = {
  name: string;
  label: string;
  type: 'text' | 'date' | 'select';
  placeholder?: string;
  options?: FilterOption[];
  disabled?: boolean;
};

export type Notification = {
  id: number;
  message: string;
  link: string;
  createdAt: string;
};

export interface DayIndicator {
  type: 'day_off' | 'swap_day_off' | 'swap_shift' | 'holiday' | 'certificate' | 'comment';
  label: string;
}

export interface DaySchedule {
  date: string;
  isDayOff: boolean;
  shift?: ShiftName;
  indicators: DayIndicator[];
}

export interface Schedule {
  days: DaySchedule[];
  workedDaysCount: number;
  holidaysWorkedCount: number;
}