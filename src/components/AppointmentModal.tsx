import React, { useState } from 'react';
import { X, Calendar, Clock, User, FileText, Save, Phone } from 'lucide-react';
import { usePatients } from '../hooks/usePatients';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointmentData: any) => Promise<void>;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    patientPhone: '',
    date: '',
    time: '',
    duration: '60',
    procedure: '',
    notes: '',
    status: 'scheduled'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNewPatient, setIsNewPatient] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPatients, setFilteredPatients] = useState<any[]>([]);

  const { patients } = usePatients();
  
  // Filter patients based on search term
  React.useEffect(() => {
    if (searchTerm) {
      const filtered = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone.includes(searchTerm)
      );
      setFilteredPatients(filtered);
    } else {
      setFilteredPatients(patients);
    }
  }, [searchTerm, patients]);
  
  if (!isOpen) return null;

  const handlePatientSelect = (patient: any) => {
    setFormData({
      ...formData,
      patientId: patient.id,
      patientName: patient.name,
      patientPhone: patient.phone
    });
    setSearchTerm(patient.name);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSave({
        ...formData,
        duration: parseInt(formData.duration)
      });
      onClose();
      setFormData({
        patientId: '',
        patientName: '',
        patientPhone: '',
        date: '',
        time: '',
        duration: '60',
        procedure: '',
        notes: '',
        status: 'scheduled'
      });
      setSearchTerm('');
      setIsNewPatient(true);
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert('Error al crear la cita. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const procedures = [
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
    'Revisión general'
  ];

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Nueva Cita</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ¿Es paciente nuevo?
              </label>
              <div className="flex space-x-4 mb-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="isNewPatient"
                    checked={isNewPatient}
                    onChange={() => setIsNewPatient(true)}
                  />
                  <span>Sí</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="isNewPatient"
                    checked={!isNewPatient}
                    onChange={() => setIsNewPatient(false)}
                  />
                  <span>No</span>
                </label>
              </div>

              {isNewPatient ? (
                // Input para paciente nuevo
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del paciente *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      value={formData.patientName}
                      onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nombre del paciente"
                      required
                    />
                  </div>
                </div>
              ) : (
                // Search input para paciente existente
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buscar paciente *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Buscar por nombre o teléfono..."
                      required
                    />
                  </div>
                  
                  {/* Dropdown de resultados */}
                  {searchTerm && !formData.patientId && filteredPatients.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredPatients.map((patient) => (
                        <button
                          key={patient.id}
                          type="button"
                          onClick={() => handlePatientSelect(patient)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-gray-900">{patient.name}</div>
                          <div className="text-sm text-gray-600">{patient.phone} • {patient.email}</div>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {searchTerm && !formData.patientId && filteredPatients.length === 0 && (
                    <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        No se encontraron pacientes. ¿Deseas crear uno nuevo?
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setIsNewPatient(true);
                          setFormData({ ...formData, patientName: searchTerm });
                          setSearchTerm('');
                        }}
                        className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Crear paciente nuevo
                      </button>
                    </div>
                  )}
                  
                  {formData.patientId && (
                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        ✓ Paciente seleccionado: {formData.patientName}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, patientId: '', patientName: '', patientPhone: '' });
                          setSearchTerm('');
                        }}
                        className="mt-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Cambiar paciente
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="tel"
                  value={formData.patientPhone}
                  onChange={(e) => setFormData({ ...formData, patientPhone: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+34 666 123 456"
                  disabled={!isNewPatient && formData.patientId}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hora *
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <select
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Seleccionar hora</option>
                  {timeSlots.map((time) => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duración (minutos) *
              </label>
              <select
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="30">30 minutos</option>
                <option value="45">45 minutos</option>
                <option value="60">1 hora</option>
                <option value="90">1 hora 30 min</option>
                <option value="120">2 horas</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="scheduled">Programada</option>
                <option value="confirmed">Confirmada</option>
                <option value="completed">Completada</option>
                <option value="cancelled">Cancelada</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Procedimiento *
            </label>
            <select
              value={formData.procedure}
              onChange={(e) => setFormData({ ...formData, procedure: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Seleccionar procedimiento</option>
              {procedures.map((procedure) => (
                <option key={procedure} value={procedure}>{procedure}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas adicionales
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Observaciones, preparación especial, etc..."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Programando...' : 'Programar Cita'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};