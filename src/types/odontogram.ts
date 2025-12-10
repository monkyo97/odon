export type Surface = 'occlusal' | 'incisal' | 'mesial' | 'distal' | 'vestibular' | 'lingual' | 'palatal' | 'cervical' | 'whole';

export type ToothConditionType = 
  | 'caries' 
  | 'restoration' 
  | 'crown' 
  | 'endodontics' 
  | 'missing' 
  | 'extraction_planned' 
  | 'implant' 
  | 'fracture' 
  | 'sealant' 
  | 'prosthesis'
  | 'orthodontics'
  | 'bridge'
  | 'healthy';

export type ConditionStatus = 'planned' | 'in_progress' | 'completed' | 'existing';

export interface ToothCondition {
  id?: string;
  odontogram_id: string;
  tooth_number: number;
  range_end_tooth?: number; // For ranges (Ortho, Bridge, Prosthesis)
  surface: Surface;
  condition_type: ToothConditionType;
  status: ConditionStatus;
  notes?: string;
  cost?: number; // Cost for list view
  created_by_user?: string;
  created_date?: string;
  created_by_ip?: string;
  updated_by_user?: string;
  updated_date?: string;
  updated_by_ip?: string;
}

export interface Odontogram {
  id: string;
  patient_id: string;
  name: string;
  type: 'initial' | 'evolution' | 'treatment_plan';
  date: string;
  notes?: string;
  created_by_user?: string;
  created_date: string;
  created_by_ip?: string;
  updated_by_user?: string;
  updated_date?: string;
  updated_by_ip?: string;
}

export interface ToothState {
  toothNumber: number;
  conditions: ToothCondition[];
}
