export const PATIENT_TABS = {
  ODONTOGRAM: 'odontogram',
  HISTORY: 'history',
  APPOINTMENTS: 'appointments',
} as const;

export type PatientTab = (typeof PATIENT_TABS)[keyof typeof PATIENT_TABS];
