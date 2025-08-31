import React from 'react';
import { Calendar } from 'lucide-react';

const CalendarIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <Calendar size={20} {...props} />
);

export default CalendarIcon;