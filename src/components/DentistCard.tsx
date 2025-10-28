import React, { useState } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Dentist, useDentists } from '../hooks/useDentists';
import { EditDentistModal } from './EditDentistModal';

interface DentistCardProps {
  dentist: Dentist;
}

export const DentistCard: React.FC<DentistCardProps> = ({ dentist }) => {
  // ✅ No es necesario pasar props al hook, React Query maneja el estado global
  const { updateDentist, deleteDentist } = useDentists();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // 🧩 Eliminar odontólogo
  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      `¿Deseas eliminar al odontólogo ${dentist.name}? Esta acción no se puede deshacer.`
    );
    if (!confirmDelete) return;

    try {
      await deleteDentist.mutateAsync(dentist.id);
      alert('🗑️ Odontólogo eliminado correctamente.');
    } catch (error) {
      console.error('Error eliminando odontólogo:', error);
      alert('❌ Error al eliminar el odontólogo. Inténtalo de nuevo.');
    }
  };

  // 🧩 Actualizar odontólogo
  const handleUpdate = async (data: Partial<Dentist>) => {
    try {
      await updateDentist.mutateAsync({ id: dentist.id, updates: data });
      setIsEditModalOpen(false);
      alert('✅ Odontólogo actualizado correctamente.');
    } catch (error) {
      console.error('Error actualizando odontólogo:', error);
      alert('❌ Error al actualizar el odontólogo. Inténtalo de nuevo.');
    }
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition">
        <h3 className="text-lg font-semibold text-gray-800">{dentist.name}</h3>
        <p className="text-sm text-gray-600">{dentist.specialty || 'General'}</p>
        <p className="text-sm text-gray-500">{dentist.email}</p>
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
            disabled={deleteDentist.isPending}
            className={`flex items-center px-3 py-1.5 text-sm rounded-lg transition-colors ${
              deleteDentist.isPending
                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                : 'bg-red-100 text-red-700 hover:bg-red-200'
            }`}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            {deleteDentist.isPending ? 'Eliminando...' : 'Eliminar'}
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
