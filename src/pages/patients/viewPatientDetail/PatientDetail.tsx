import React, { useState } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { formatDate } from '@/utils/formatDate';
import { ArrowLeft, Edit, Calendar, FileText, Bluetooth as Tooth, Trash2, Info, Eye, EyeOff } from 'lucide-react';
import { Odontogram } from './components/odontogram/Odontogram';
import { PatientInfo } from './components/PatientInfo';
import { TreatmentHistory } from './components/TreatmentHistory';
import { EditPatientModal } from './components/EditPatientModal';
import { usePatients } from '@/hooks/usePatients';
import { PatientAppointments } from './components/PatientAppointments';
import { ConfirmModal } from '@/components/ConfirmModal';
import { useDentists } from '@/hooks/useDentists';
import { Notifications } from '@/components/Notifications';
import { useDefaultDentist } from '@/hooks/useDefaultDentist';
import { FormSelect } from '@/components/FormSelect';


export const PatientDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { patients, loading, updatePatient, deletePatient } = usePatients();
  const [activeTab, setActiveTab] = useState<'odontogram' | 'history' | 'appointments'>('odontogram');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showInfo, setShowInfo] = useState(true);

  const { dentists } = useDentists();
  const patient = patients.find(p => p.id === id);

  // Use custom hook for Default Dentist Context
  const { activeDentistId, setActiveDentistId } = useDefaultDentist(id, location.state?.defaultDentistId);

  // Context-Aware Back Navigation
  const handleBack = () => {
    if (location.state?.from) {
      navigate(-1);
    } else {
      navigate('/patients');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Paciente no encontrado</p>
        <button onClick={() => navigate('/patients')} className="text-blue-600 hover:text-blue-800 mt-2 inline-block">
          Volver a pacientes
        </button>
      </div>
    );
  }

  const handleUpdatePatient = async (updates: any) => {
    if (!patient) return;
    try {
      await updatePatient(patient.id, updates);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating patient:', error);
      throw error;
    }
  };

  const deletePatientHandler = async () => {
    // renamed to avoid conflict if needed, though deletePatient is from hook
    if (!patient) return;
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!patient) return;
    try {
      setIsDeleting(true);
      await deletePatient(patient.id);
      Notifications.success('Paciente eliminado correctamente.');
      window.location.href = '/patients';
    } catch (error) {
      console.error('Error deleting patient:', error);
      Notifications.error('Error al eliminar el paciente. Inténtalo de nuevo.');
    } finally {
      setIsDeleting(false);
      setIsConfirmOpen(false);
    }
  };


  const tabs = [
    { id: 'odontogram', label: 'Odontograma', icon: Tooth },
    { id: 'history', label: 'Historial', icon: FileText },
    { id: 'appointments', label: 'Citas', icon: Calendar }
  ];

  const dentistOptions = dentists.map(d => ({ value: d.id, label: d.name }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowInfo(!showInfo)}
            className={`p-2 rounded-lg border transition-colors flex items-center justify-center ${showInfo ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            title={showInfo ? "Ocultar información" : "Ver información"}
          >
            {showInfo ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">{patient.name}</h1>
            <p className="text-gray-600">{patient.age} años • Registrado: {formatDate(patient.created_date)}</p>
          </div>

          {/* Global Dentist Selector */}
          <div className="ml-4 min-w-[250px]">
            <FormSelect
              label="Odontólogo:"
              options={dentistOptions}
              value={activeDentistId || ''}
              onChange={(e) => setActiveDentistId(e.target.value || undefined)}
              placeholder="-- Seleccionar Odontólogo --"
              showEmptyOption={true}
            // Custom styling to match previous look if needed, or rely on FormSelect defaults
            // FormSelect already has label support.
            />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </button>

          <button
            onClick={handleBack}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border border-transparent hover:border-gray-200"
            title="Volver"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {showInfo && (
          <div className="w-full lg:w-80 flex-shrink-0 transition-all duration-300">
            <PatientInfo patient={patient} />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
            <div className="border-b border-gray-200 flex-shrink-0">
              <nav className="flex space-x-8 px-6 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    <tab.icon className="h-4 w-4 mr-2" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              {activeTab === 'odontogram' && (
                <Odontogram
                  patientId={patient.id}
                  patientName={patient.name}
                  patientEmail={patient.email}
                  patientPhone={patient.phone}
                  defaultDentistId={activeDentistId}
                />
              )}
              {activeTab === 'history' && <TreatmentHistory patientId={patient.id} defaultDentistId={activeDentistId} />}
              {activeTab === 'appointments' && <PatientAppointments patientId={patient.id} />}
            </div>
          </div>
        </div>
      </div>

      <EditPatientModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        patient={patient}
        onSave={handleUpdatePatient}
      />

      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Eliminar paciente"
        message={`¿Estás seguro de que deseas eliminar al paciente ${patient.name}? 
        Esta acción no se puede deshacer y eliminará todos los datos asociados (citas, tratamientos, odontograma).`}
        confirmText="Eliminar paciente"
        cancelText="Cancelar"
        onConfirm={confirmDelete}
        onCancel={() => setIsConfirmOpen(false)}
        loading={isDeleting}
      />


    </div>
  );
};