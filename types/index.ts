export type TeamName = 'Security' | 'Support' | 'CustomerService' | '';
export type PositionName = string;
export type DayOffReason = 'Weekday' | 'Weekend' | 'Swap' | 'Holiday' | 'Certificate' | '';

// --- Novos Tipos para Filtros ---
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
// ---------------------------------

export type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  userType: 'master' | 'collaborator';
  team: TeamName;
  position: PositionName;
  shift: string;
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
};

export type Swap = {
  id: number;
  requester: User;
  involvedCollaborator?: User;
  originalDate: string;
  newDate: string;
  originalShift: string;
  newShift: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
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