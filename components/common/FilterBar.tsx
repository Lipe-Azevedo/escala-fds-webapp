'use client';

import { useState } from "react";
import { FilterConfig } from "@/types";

interface FilterBarProps {
  configs: FilterConfig[];
  filters: Record<string, string>;
  onFilterChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export default function FilterBar({ configs, filters, onFilterChange }: FilterBarProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div style={{ marginBottom: '20px' }}>
      <button onClick={() => setIsVisible(!isVisible)} style={{ backgroundColor: '#4a5568', marginBottom: isVisible ? '15px' : '0' }}>
        {isVisible ? 'Ocultar Filtros' : 'Mostrar Filtros'}
      </button>

      {isVisible && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', padding: '20px', background: `rgb(var(--card-background-rgb))`, border: `1px solid rgb(var(--card-border-rgb))`, borderRadius: '8px' }}>
          {configs.map((config) => (
            <div key={config.name}>
              <label htmlFor={config.name}>{config.label}</label>
              {config.type === 'select' ? (
                <select
                  id={config.name}
                  name={config.name}
                  value={filters[config.name] || ''}
                  onChange={onFilterChange}
                  disabled={config.disabled}
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
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}