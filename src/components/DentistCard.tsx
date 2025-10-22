import React, { useState } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Dentist, useDentists } from '../hooks/useDentists';
import { EditDentistModal } from './EditDentistModal';

interface DentistCardProps {
  dentist: Dentist;
}

export const DentistCard: React.FC<DentistCardProps> = ({ dentist }) => {
  const { updateDentist, deleteDentist } = useDentists();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      `¿Deseas eliminar al odontólogo ${dentist.name}? Esta acción no se puede deshacer.`
    );
    if (!confirmDelete) return;

    try {
      await deleteDentist(dentist.id);
      alert('Odontólogo eliminado correctamente.');
    } catch (error) {
      console.error('Error eliminando odontólogo:', error);
      alert('Error al eliminar el odontólogo. Inténtalo de nuevo.');
    }
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition">
        <h3 className="text-lg font-semibold text-gray-800">{dentist.name}</h3>
        <p className="text-sm text-gray-600">{dentist.specialty || 'General'}</p>
        <p className="text-sm text-gray-500 mt-1">{dentist.email}</p>
        <p className="text-sm text-gray-500 mb-3">{dentist.phone || '—'}</p>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center px-3 py-1.5 text-sm bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
          >
            <Edit className="h-4 w-4 mr-1" /> Editar
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
          >
            <Trash2 className="h-4 w-4 mr-1" /> Eliminar
          </button>
        </div>
      </div>

      {/* Modal de edición */}
      {isEditModalOpen && (
        <EditDentistModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          dentist={dentist}
          onSave={(data) => updateDentist(dentist.id, data)}
        />
      )}
    </>
  );
};
