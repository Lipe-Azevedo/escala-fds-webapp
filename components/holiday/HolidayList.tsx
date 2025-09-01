'use client';

import { Holiday } from '@/types';
import { translate } from '@/lib/translations';
import tableStyles from '@/components/common/Table.module.css';
import EditIcon from '../icons/EditIcon';

interface HolidayListProps {
  holidays: Holiday[];
  onEdit: (holiday: Holiday) => void;
}

export default function HolidayList({ holidays, onEdit }: HolidayListProps) {
  return (
    <div className={tableStyles.tableWrapper}>
      <table className={tableStyles.table}>
        <thead>
          <tr>
            <th className={tableStyles.header}>Nome</th>
            <th className={tableStyles.header}>Data</th>
            <th className={tableStyles.header}>Tipo</th>
            <th className={`${tableStyles.header} ${tableStyles.actionsCell}`}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {holidays.map((holiday) => (
            <tr key={holiday.id}>
              <td className={tableStyles.cell}>{holiday.name}</td>
              <td className={tableStyles.cell}>{new Date(holiday.date.replace(/-/g, '/')).toLocaleDateString('pt-BR')}</td>
              <td className={tableStyles.cell}>{translate(holiday.type)}</td>
              <td className={`${tableStyles.cell} ${tableStyles.actionsCell}`}>
                <button onClick={() => onEdit(holiday)} className={tableStyles.actionButton} title="Editar">
                  <EditIcon size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}