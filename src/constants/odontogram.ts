import { Surface, ToothConditionType } from '../types/odontogram';

export const UPPER_FDI = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
export const LOWER_FDI = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

// Dientes Temporales (Niños)
export const UPPER_DECIDUOUS = [55, 54, 53, 52, 51, 61, 62, 63, 64, 65];
export const LOWER_DECIDUOUS = [85, 84, 83, 82, 81, 71, 72, 73, 74, 75];

export const SURFACES: { id: Surface; label: string }[] = [
  { id: 'occlusal', label: 'Oclusal' },
  { id: 'incisal', label: 'Incisal' },
  { id: 'mesial', label: 'Mesial' },
  { id: 'distal', label: 'Distal' },
  { id: 'vestibular', label: 'Vestibular' },
  { id: 'lingual', label: 'Lingual' },
  { id: 'palatal', label: 'Palatino' },
  { id: 'cervical', label: 'Cervical' },
  { id: 'whole', label: 'Completa' },
];

export const CONDITION_COLORS: Record<ToothConditionType, string> = {
  caries: '#EF4444', // Rojo Universal
  restoration: '#3B82F6', // Azul Estándar
  crown: '#F59E0B', // Dorado
  endodontics: '#8B5CF6', // Morado
  missing: '#000000', // Negro
  extraction_planned: '#EF4444', // Rojo
  implant: '#10B981', // Verde
  fracture: '#B91C1C', // Rojo Oscuro
  sealant: '#10B981', // Verde
  prosthesis: '#F59E0B', // Dorado/Amarillo
  orthodontics: '#10B981', // Verde (Brackets/Alambre)
  bridge: '#3B82F6', // Azul (Conexión)
  healthy: 'transparent',
};

export const TOOLBAR_TOOLS: { id: ToothConditionType; label: string; icon?: string; color: string }[] = [
  { id: 'healthy', label: 'Sano (Borrar)', color: '#9CA3AF' },
  { id: 'caries', label: 'Caries', color: CONDITION_COLORS.caries },
  { id: 'restoration', label: 'Restauración', color: CONDITION_COLORS.restoration },
  { id: 'crown', label: 'Corona', color: CONDITION_COLORS.crown },
  { id: 'endodontics', label: 'Endodoncia', color: CONDITION_COLORS.endodontics },
  { id: 'missing', label: 'Ausente', color: CONDITION_COLORS.missing },
  { id: 'extraction_planned', label: 'A Extraer', color: CONDITION_COLORS.extraction_planned },
  { id: 'implant', label: 'Implante', color: CONDITION_COLORS.implant },
  { id: 'sealant', label: 'Sellante', color: CONDITION_COLORS.sealant },
  { id: 'fracture', label: 'Fractura', color: CONDITION_COLORS.fracture },
  { id: 'prosthesis', label: 'Prótesis', color: CONDITION_COLORS.prosthesis },
  { id: 'orthodontics', label: 'Ortodoncia', color: CONDITION_COLORS.orthodontics },
  { id: 'bridge', label: 'Puente', color: CONDITION_COLORS.bridge },
];

// ... existing code ...

// Centralized Constants
export const CONDITIONS = {
  CARIES: 'caries',
  RESTORATION: 'restoration',
  CROWN: 'crown',
  ENDODONTICS: 'endodontics',
  MISSING: 'missing',
  EXTRACTION_PLANNED: 'extraction_planned',
  IMPLANT: 'implant',
  FRACTURE: 'fracture',
  SEALANT: 'sealant',
  PROSTHESIS: 'prosthesis',
  ORTHODONTICS: 'orthodontics',
  BRIDGE: 'bridge',
  HEALTHY: 'healthy',
} as const;

export const SURFACE_IDS = {
  OCCLUSAL: 'occlusal',
  INCISAL: 'incisal',
  MESIAL: 'mesial',
  DISTAL: 'distal',
  VESTIBULAR: 'vestibular',
  LINGUAL: 'lingual',
  PALATAL: 'palatal',
  CERVICAL: 'cervical',
  WHOLE: 'whole',
} as const;

// Codes for table display
export const SURFACE_CODES: Record<string, string> = {
  [SURFACE_IDS.OCCLUSAL]: 'O',
  [SURFACE_IDS.INCISAL]: 'I',
  [SURFACE_IDS.MESIAL]: 'M',
  [SURFACE_IDS.DISTAL]: 'D',
  [SURFACE_IDS.VESTIBULAR]: 'V',
  [SURFACE_IDS.LINGUAL]: 'L',
  [SURFACE_IDS.PALATAL]: 'P',
  [SURFACE_IDS.CERVICAL]: 'C',
  [SURFACE_IDS.WHOLE]: '-',
};

export const TREATMENT_STATUSES = {
  PLANNED: 'planned',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  EXISTING: 'existing',
} as const;

export const STATUS_LABELS: Record<string, string> = {
  [TREATMENT_STATUSES.PLANNED]: 'Planificado',
  [TREATMENT_STATUSES.IN_PROGRESS]: 'En Proceso',
  [TREATMENT_STATUSES.COMPLETED]: 'Completado',
  [TREATMENT_STATUSES.EXISTING]: 'Preexistente',
};
