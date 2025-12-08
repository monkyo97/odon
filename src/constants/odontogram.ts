// src/constants/odontogram.ts
export const UPPER_FDI = [18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28];
export const LOWER_FDI = [48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38];

export type Surface =
  | 'oclusal' | 'vestibular' | 'lingual'
  | 'mesial'  | 'distal'     | 'incisal'
  | 'cervical'| 'completa';

export const SURFACES: Surface[] = [
  'oclusal','vestibular','lingual','mesial','distal','incisal','cervical','completa'
];

export const STATUS_FLOW = [
  { value: 'planificado',  label: 'Planificado',  dot: '#3B82F6' },
  { value: 'en_proceso',   label: 'En proceso',  dot: '#EAB308' },
  { value: 'completado',   label: 'Completado',  dot: '#10B981' },
];

export const COLORS_BY_CONDITION: Record<string, string> = {
  'Caries'        : '#EF4444',
  'Restauración'  : '#3B82F6',
  'Corona'        : '#F59E0B',
  'Endodoncia'    : '#8B5CF6',
  'Implante'      : '#10B981',
  'Extracción'    : '#111827',
};

export type TreatmentCategory = 'todos' | 'individuales' | 'generales' | 'pediatrico';

export const TREATMENTS: { id: string; name: string; category: TreatmentCategory }[] = [
  { id: 'caries-simple',     name:'Obturación simple', category:'individuales' },
  { id: 'caries-compuesta',  name:'Obturación compuesta', category:'individuales' },
  { id: 'endodoncia',        name:'Endodoncia', category:'individuales' },
  { id: 'corona',            name:'Corona', category:'individuales' },
  { id: 'profi-general',     name:'Profilaxis general', category:'generales' },
  { id: 'sellantes',         name:'Sellantes', category:'pediatrico' },
  { id: 'fluor',             name:'Aplicación de flúor', category:'pediatrico' },
];
