import { Holiday, PositionName, TeamName } from "@/types";

const translations: Record<string, string> = {
    // Teams
    'Security': 'Segurança',
    'Support': 'Suporte',
    'CustomerService': 'Atendimento',

    // Positions
    'RiskAnalyst': 'Analista de Risco',
    'SupervisorI': 'Supervisor I',
    'SupervisorII': 'Supervisor II',
    'BackendDeveloper': 'Dev. Backend',
    'FrontendDeveloper': 'Dev. Frontend',
    'Attendant': 'Atendente',
    'Master': 'Master',

    // Weekdays
    'monday': 'Segunda-feira',
    'tuesday': 'Terça-feira',
    'wednesday': 'Quarta-feira',
    'thursday': 'Quinta-feira',
    'friday': 'Sexta-feira',
    'saturday': 'Sábado',
    'sunday': 'Domingo',

    // Holiday Types
    'national': 'Nacional',
    'state': 'Estadual',
    'city': 'Municipal',
};

export const translate = (value: TeamName | PositionName | Holiday['type'] | string | undefined): string => {
    if (!value) return 'N/A';
    return translations[value] || value;
};