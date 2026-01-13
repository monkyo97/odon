import React, { useMemo, useState } from 'react';
import { Plus, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { PatientCard } from './components/PatientCard';
import { PatientModal } from './components/PatientModal';
import { usePatients } from '../../../hooks/usePatients';

const PAGE_SIZE = 20;

export const Patients: React.FC = () => {
  const {
    patients,
    loading,
    page,
    totalPages,
    totalPatients,
    fetchPatients,   // <- only used in buttons
    createPatient,
  } = usePatients();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Derive data without setState (useMemo prevents recalculation on every render)
  const filteredPatients = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      (p.email || '').toLowerCase().includes(q) ||
      (p.phone || '').includes(q)
    );
  }, [patients, searchTerm]);

  const handlePrev = () => {
    if (page > 1) fetchPatients(page - 1);
  };
  const handleNext = () => {
    if (page < totalPages) fetchPatients(page + 1);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Pacientes</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Gestión de pacientes y historiales clínicos
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Nuevo Paciente</span>
          <span className="sm:hidden">Nuevo</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar pacientes por nombre, email o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </button>
          </div>
        </div>

        {/* List */}
        <div className="p-4 sm:p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : filteredPatients.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPatients.map((patient) => (
                  <PatientCard key={patient.id} patient={patient} />
                ))}
              </div>

              {/* Paginator (from backend) */}
              <div className="flex flex-col items-center justify-center mt-6 space-y-2">
                <div className="text-xs text-gray-500">
                  {`Total: ${totalPatients} • Página ${page} de ${totalPages} • ${PAGE_SIZE} por página`}
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handlePrev}
                    disabled={page === 1}
                    className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={page === totalPages}
                    className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm disabled:opacity-50"
                  >
                    Siguiente <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No se encontraron pacientes</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <PatientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={createPatient}
      />
    </div>
  );
};
