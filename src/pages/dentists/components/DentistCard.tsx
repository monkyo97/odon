import React, { useState } from 'react';
import { ClipboardPlus, Edit, Mail, Phone } from 'lucide-react';
import { Dentist, useDentists } from '@hooks/useDentists';
import { EditDentistModal } from './EditDentistModal';
import { Notifications } from '@/components/Notifications';

interface DentistCardProps {
  dentist: Dentist;
}

export const DentistCard: React.FC<DentistCardProps> = ({ dentist }) => {
  // ✅ No es necesario pasar props al hook, React Query maneja el estado global
  const { updateDentist } = useDentists();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // 🧩 Actualizar odontólogo
  const handleUpdate = async (data: Partial<Dentist>) => {
    try {
      await updateDentist.mutateAsync({ id: dentist.id, updates: data });
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error actualizando odontólogo:', error);
    }
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-full mr-3 group-hover:bg-blue-200 transition-colors">
              <ClipboardPlus className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{dentist.name}</h3>
              <p className="text-sm text-gray-600">{dentist.specialty || 'General'}</p>
            </div>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${dentist.status === '1'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
            }`}>
            {dentist.status === '1' ? 'Activo' : 'Inactivo'}
            
          </span>
        </div>
        <div className="space-y-2 mb-2">
          <div className="flex items-center text-sm text-gray-600">
            <Mail className="h-3 w-3 mr-2" />
            {dentist.email}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Phone className="h-3 w-3 mr-2" />
            {dentist.phone}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <ClipboardPlus className="h-3 w-3 mr-2" />
            {dentist.license_number || 'N/A'}
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center px-3 py-1.5 text-sm bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
          >
            <Edit className="h-4 w-4 mr-1" /> Editar
          </button>
        </div>
      </div>

      {/* Modal de edición */}
      {isEditModalOpen && (
        <EditDentistModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          dentist={dentist}
          onSave={handleUpdate}
          isLoading={updateDentist.isPending}
        />
      )}
    </>
  );
};
