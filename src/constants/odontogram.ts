import { Surface, ToothConditionType } from '../types/odontogram';

export const UPPER_FDI = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
export const LOWER_FDI = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

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
  caries: '#EF4444', // Red
  restoration: '#3B82F6', // Blue
  crown: '#F59E0B', // Gold/Yellow
  endodontics: '#8B5CF6', // Purple
  missing: '#000000', // Black
  extraction_planned: '#EF4444', // Red
  implant: '#10B981', // Green
  fracture: '#EF4444', // Red
  sealant: '#10B981', // Green
  prosthesis: '#F59E0B', // Gold
  healthy: 'transparent',
};

export const TOOLBAR_TOOLS: { id: ToothConditionType; label: string; icon?: string; color: string }[] = [
  { id: 'healthy', label: 'Sano (Borrar)', color: '#9CA3AF' }, // Gray for neutral/clear
  { id: 'caries', label: 'Caries', color: CONDITION_COLORS.caries },
  { id: 'restoration', label: 'Restauración', color: CONDITION_COLORS.restoration },
  { id: 'crown', label: 'Corona', color: CONDITION_COLORS.crown },
  { id: 'endodontics', label: 'Endodoncia', color: CONDITION_COLORS.endodontics },
  { id: 'missing', label: 'Ausente', color: CONDITION_COLORS.missing },
  { id: 'extraction_planned', label: 'A Extraer', color: CONDITION_COLORS.extraction_planned },
  { id: 'implant', label: 'Implante', color: CONDITION_COLORS.implant },
  { id: 'sealant', label: 'Sellante', color: CONDITION_COLORS.sealant },
  { id: 'fracture', label: 'Fractura', color: CONDITION_COLORS.fracture },
];

export const STATUS_LABELS: Record<string, string> = {
  planned: 'Planificado',
  in_progress: 'En Proceso',
  completed: 'Completado',
  existing: 'Preexistente',
};
