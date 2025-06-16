export type TeamName = 'Security' | 'Support' | 'CustomerService' | '';
export type PositionName = string;

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
};