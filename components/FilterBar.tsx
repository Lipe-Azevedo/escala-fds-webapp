'use client';

import { FilterConfig } from "@/types";

interface FilterBarProps {
  configs: FilterConfig[];
  filters: Record<string, string>;
  onFilterChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export default function FilterBar({ configs, filters, onFilterChange }: FilterBarProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', alignItems: 'flex-end', marginBottom: '20px', padding: '20px', background: '#f9fafb', borderRadius: '8px' }}>
      {configs.map((config) => (
        <div key={config.name}>
          <label htmlFor={config.name} style={{fontSize: '14px', fontWeight: 500, display: 'block', marginBottom: '5px'}}>{config.label}</label>
          {config.type === 'select' ? (
            <select
              id={config.name}
              name={config.name}
              value={filters[config.name] || ''}
              onChange={onFilterChange}
              disabled={config.disabled}
              style={{ margin: 0 }}
            >
              {config.options?.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          ) : (
            <input
              id={config.name}
              name={config.name}
              type={config.type}
              value={filters[config.name] || ''}
              onChange={onFilterChange}
              placeholder={config.placeholder}
              disabled={config.disabled}
              style={{ margin: 0 }}
            />
          )}
        </div>
      ))}
    </div>
  );
}