export const procedures = [
  'Consulta inicial',
  'Limpieza dental',
  'Empaste',
  'Endodoncia',
  'Extracción',
  'Corona',
  'Implante',
  'Ortodoncia - Consulta',
  'Ortodoncia - Revisión',
  'Blanqueamiento',
  'Cirugía oral',
  'Revisión general',
];

export const timeSlots = [
  '08:00',
  '08:30',
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '12:00',
  '12:30',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00',
  '17:30',
  '18:00',
  '18:30',
  '19:00',
  '19:30',
];

export const appointmentStatuses = [
  { value: 'scheduled', label: 'Programada' },
  { value: 'confirmed', label: 'Confirmada' },
  { value: 'completed', label: 'Completada' },
  { value: 'cancelled', label: 'Cancelada' },
];  

export const appointmentDurations = [
    { value: 30, label: '30' },
    { value: 45, label: '45' },
    { value: 60, label: '60' },
    { value: 90, label: '90' },
    { value: 120, label: '120' },
]

export const appointmentColors = {
  scheduled: 'bg-blue-100 text-blue-800',
  confirmed: 'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
};

export const colorsTextCalendar = {
  scheduled: 'text-blue-800',
  confirmed: 'text-green-800',
  completed: 'text-gray-800',
  cancelled: 'text-red-800 opacity-70 line-through',
};

export const colorsBorderCardCalendar = {
  scheduled: 'bg-blue-50 border-blue-300',
  confirmed: 'bg-green-50 border-green-300',
  completed: 'bg-gray-50 border-gray-300',
  cancelled: 'bg-red-50 border-red-300',
};

