import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useOdontogram } from '@hooks/useOdontogram';
import { ToothSVG } from '@components/odontogram/ToothSVG';
import { OdontogramSidebar } from './OdontogramSidebar';
import { UPPER_FDI, LOWER_FDI } from '@constants/odontogram';
import { ToothConditionType, Surface } from '@/types/odontogram';
import { Loader2, Save, History, Plus, Menu, X, ArrowLeft } from 'lucide-react';
import { Notifications } from '@/components/Notifications';
import { OdontogramHistoryPanel } from './OdontogramHistoryPanel';

interface OdontogramProps {
  patientId: string;
}

export const Odontogram: React.FC<OdontogramProps> = ({ patientId }) => {
  /* State */
  const [selectedTool, setSelectedTool] = useState<ToothConditionType | null>(null);
  const [saving, setSaving] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Controls Tools Sidebar
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | undefined>(undefined);

  /* Data Hook */
  const {
    latestOdontogram,
    currentOdontogram,
    odontograms,
    conditions,
    loading,
    saveCondition,
    createOdontogram
  } = useOdontogram(patientId, selectedHistoryId);

  // Derived state to check if we are viewing history (not the latest one)
  const isHistoryMode = selectedHistoryId !== undefined && selectedHistoryId !== latestOdontogram?.id;

  const handleSurfaceClick = async (toothNumber: number, surface: Surface) => {
    if (!selectedTool) {
      Notifications.info('Selecciona una herramienta primero');
      return;
    }

    if (isHistoryMode) {
      Notifications.info('Estás en modo historial. Vuelve a la versión actual para editar.');
      return;
    }

    if (!latestOdontogram) {
      Notifications.error('No hay un odontograma activo. Crea uno nuevo.');
      return;
    }

    try {
      await saveCondition.mutateAsync({
        odontogramId: latestOdontogram.id,
        toothNumber,
        surface,
        condition: selectedTool,
      });
    } catch (error) {
      console.error(error);
      Notifications.error('Error al guardar el diagnóstico');
    }
  };

  const handleCreateVersion = async () => {
    try {
      setSaving(true);
      await createOdontogram.mutateAsync(`Evolución ${new Date().toLocaleDateString()}`);
      Notifications.success('Nueva versión del odontograma creada');
    } catch (error) {
      Notifications.error('Error al crear versión');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-[calc(100vh-200px)]">
      {/* Header with Hamburger */}
      <div className="flex justify-between items-center mb-4 bg-white p-4 rounded-xl border shadow-sm">
        <div className="flex items-center gap-4">

          {!isHistoryPanelOpen && (
            <button
              onClick={() => {
                if (isHistoryPanelOpen) setIsHistoryPanelOpen(false); // Close history if opening tools
                setIsSidebarOpen(!isSidebarOpen);
              }}
              className={`p-2 rounded-lg transition-colors ${isSidebarOpen ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 text-gray-600'}`}
              title={isSidebarOpen ? "Cerrar herramientas" : "Abrir herramientas"}
            >
              {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          )}
          {isHistoryPanelOpen && <div className="w-10"></div>}
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              Odontogram
              {isHistoryMode && <span className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full border border-orange-200">Modo Historial</span>}
            </h2>
            <p className="text-sm text-gray-500">
              {currentOdontogram
                ? `${currentOdontogram.name} - ${new Date(currentOdontogram.date).toLocaleDateString()}`
                : 'Sin odontograma registrado'}
            </p>
          </div>
        </div>

        <div className="flex gap-2">

          {/* Volver button (only in history mode) */}
          {isHistoryMode && (
            <button
              onClick={() => {
                setSelectedHistoryId(undefined);
                // Also maybe open tools automatically?
              }}
              className="flex items-center px-4 py-2 bg-white border border-orange-300 text-orange-700 rounded-lg hover:bg-orange-50 transition"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Actual
            </button>
          )}

          {/* Historial Toggle Button */}
          {latestOdontogram && (
            <button
              onClick={() => {
                if (isSidebarOpen) setIsSidebarOpen(false); // Close tools
                setIsHistoryPanelOpen(!isHistoryPanelOpen);
              }}
              className={`flex items-center px-4 py-2 border rounded-lg transition ${isHistoryPanelOpen ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
            >
              <History className="h-4 w-4 mr-2" />
              Historial
            </button>
          )}

          {!latestOdontogram && (
            <button
              onClick={handleCreateVersion}
              disabled={saving}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Crear Inicial
            </button>
          )}

          {/* Create New Version (Only if not in history mode AND history panel is closed) */}
          {latestOdontogram && !isHistoryMode && !isHistoryPanelOpen && (
            <button
              onClick={handleCreateVersion}
              disabled={saving}
              className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Versión
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1 relative overflow-hidden gap-6">
        {/* Main Odontogram Area */}
        <div className="flex-1 bg-white border rounded-xl p-6 overflow-y-auto shadow-sm flex flex-col">
          {/* Teeth Grid */}
          <div className="flex-1 flex flex-col justify-center items-center space-y-8 min-w-[800px] overflow-x-auto">
            {/* Upper Arch */}
            <div className="flex gap-1 justify-center">
              {UPPER_FDI.map((number) => (
                <ToothSVG
                  key={number}
                  number={number}
                  conditions={conditions.filter(c => c.tooth_number === number)}
                  onSurfaceClick={(surface) => handleSurfaceClick(number, surface)}
                />
              ))}
            </div>

            <div className="w-full border-t border-dashed border-gray-300"></div>

            {/* Lower Arch */}
            <div className="flex gap-1 justify-center">
              {LOWER_FDI.map((number) => (
                <ToothSVG
                  key={number}
                  number={number}
                  conditions={conditions.filter(c => c.tooth_number === number)}
                  onSurfaceClick={(surface) => handleSurfaceClick(number, surface)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Collapsible Sidebar / Toolbox */}
        {/* Collapsible Sidebar / Toolbox OR History Panel */}
        <div
          className={`
            absolute top-0 right-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-20
            ${(isSidebarOpen || isHistoryPanelOpen) ? 'translate-x-0' : 'translate-x-full'}
            lg:relative lg:transform-none lg:w-80 lg:shadow-none lg:bg-transparent
            ${(isSidebarOpen || isHistoryPanelOpen) ? 'lg:block' : 'lg:hidden'}
          `}
        >
          {isSidebarOpen && (
            <OdontogramSidebar
              selectedTool={selectedTool}
              onSelectTool={setSelectedTool}
            />
          )}
          {isHistoryPanelOpen && (
            <OdontogramHistoryPanel
              odontograms={odontograms || []}
              activeId={currentOdontogram?.id}
              onSelectVersion={(id) => {
                setSelectedHistoryId(id);
                // Optional: Close panel on select? Maybe keep open for browsing.
              }}
              onClose={() => setIsHistoryPanelOpen(false)}
            />
          )}
        </div>

        {/* Overlay for mobile when sidebar is open */}
        {(isSidebarOpen || isHistoryPanelOpen) && (
          <div
            className="absolute inset-0 bg-black/20 z-10 lg:hidden"
            onClick={() => {
              setIsSidebarOpen(false);
              setIsHistoryPanelOpen(false);
            }}
          />
        )}
      </div>
    </div>
  );
};
