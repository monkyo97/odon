import { TREATMENT_STATUSES } from './odontogram';

export const TREATMENT_STATUS_COLORS = {
  [TREATMENT_STATUSES.COMPLETED]: 'bg-green-100 text-green-800 border-green-200',
  [TREATMENT_STATUSES.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  [TREATMENT_STATUSES.PLANNED]: 'bg-blue-100 text-blue-800 border-blue-200',
};

export const DEFAULT_STATUS_COLOR = 'bg-gray-100 text-gray-800 border-gray-200';
