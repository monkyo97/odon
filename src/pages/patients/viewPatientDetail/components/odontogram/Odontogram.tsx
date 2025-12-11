import React, { useState } from 'react';
import { useOdontogram } from '@/hooks/useOdontogram';
import { formatDate } from '@/utils/formatDate';
import { ToothSVG } from '@/components/odontogram/ToothSVG';
import { OdontogramSidebar } from './OdontogramSidebar';
import { UPPER_FDI, LOWER_FDI, UPPER_DECIDUOUS, LOWER_DECIDUOUS, TOOLBAR_TOOLS, CONDITIONS, SURFACE_CODES } from '@/constants/odontogram';
import { ToothConditionType, Surface } from '@/types/odontogram';
import { Loader2, History, Plus, Menu, X, ArrowLeft, CheckCircle, FileText } from 'lucide-react';
import { Notifications } from '@/components/Notifications';
import { OdontogramHistoryPanel } from './OdontogramHistoryPanel';
import { generateOdontogramPDF } from '@/utils/pdfGenerator';
import { OdontogramPrintPreview } from './OdontogramPrintPreview';
import { useTreatments } from '@/hooks/useTreatments';
import { useAuth } from '@/contexts/AuthContext';

interface OdontogramProps {
  patientId: string;
  patientName: string;
  patientEmail?: string;
  patientPhone?: string;
}

export const Odontogram: React.FC<OdontogramProps> = ({ patientId, patientName, patientEmail, patientPhone }) => {
  /* State */
  const [selectedTool, setSelectedTool] = useState<ToothConditionType | null>(null);
  const [saving, setSaving] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | undefined>(undefined);

  // Range Selection State
  const [selectionStart, setSelectionStart] = useState<number | null>(null);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);

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

  const { createTreatment } = useTreatments(patientId);
  const { user } = useAuth();

  // Derived state to check if we are viewing history (not the latest one)
  const isHistoryMode = selectedHistoryId !== undefined && selectedHistoryId !== latestOdontogram?.id;

  const handleConvertToTreatment = async (condition: any) => {
    if (!user) return;
    try {
      await createTreatment({
        patientId,
        toothNumber: condition.range_end_tooth
          ? `${condition.tooth_number}-${condition.range_end_tooth}`
          : condition.tooth_number.toString(),
        procedure: condition.condition_type,
        surface: condition.surface,
        dentist: user.user_metadata?.name || 'Dr. Usuario',
        notes: `Generado desde Odontograma. ${condition.notes || ''}`,
        cost: condition.cost || 0,
        date: new Date().toISOString(),
        status: 'completed'
      });

      // Update condition status to completed?
      await saveCondition.mutateAsync({
        odontogramId: currentOdontogram!.id,
        toothNumber: condition.tooth_number,
        surface: condition.surface,
        condition: condition.condition_type,
        rangeEndTooth: condition.range_end_tooth,
        notes: condition.notes,
        cost: condition.cost,
        // status: 'completed' // If supported by backend/hook
      });

      Notifications.success('Tratamiento realizado y registrado en historial');
    } catch (error) {
      console.error(error);
      Notifications.error('Error al convertir a tratamiento');
    }
  };

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

    // Check if tooth is blocked (Missing/Extraction)
    const toothConditions = conditions.filter(c => c.tooth_number === toothNumber);
    const isBlocked = toothConditions.some(c => c.condition_type === CONDITIONS.MISSING || c.condition_type === CONDITIONS.EXTRACTION_PLANNED);

    // Allow if tool is 'healthy' (to fix) or 'missing'/'extraction' (to toggle/update)
    const isControlTool = selectedTool === CONDITIONS.HEALTHY || selectedTool === CONDITIONS.MISSING || selectedTool === CONDITIONS.EXTRACTION_PLANNED;

    if (isBlocked && !isControlTool) {
      Notifications.warning('El diente está ausente o planificado para extracción. No se pueden agregar condiciones superficiales.');
      return;
    }

    // Handle Range Tools
    const isRangeTool = ([CONDITIONS.ORTHODONTICS, CONDITIONS.BRIDGE, CONDITIONS.PROSTHESIS] as string[]).includes(selectedTool || '');

    // Range Deletion Logic: Only check if NOT currently selecting a range
    if (selectionStart === null) {
      // Find if this tooth is part of an existing range
      const existingRange = conditions.find(c => {
        const isRangeType = ([CONDITIONS.ORTHODONTICS, CONDITIONS.BRIDGE, CONDITIONS.PROSTHESIS] as string[]).includes(c.condition_type);
        if (!isRangeType || !c.range_end_tooth) return false;
        const start = Math.min(c.tooth_number, c.range_end_tooth);
        const end = Math.max(c.tooth_number, c.range_end_tooth);
        return toothNumber >= start && toothNumber <= end;
      });

      if (existingRange) {
        if (window.confirm(`¿Eliminar ${existingRange.condition_type} del diente ${existingRange.tooth_number} al ${existingRange.range_end_tooth}?`)) {
          try {
            // We use saveCondition to basically "overwrite" or if we had a delete function.
            // We will assume passing 'healthy' condition to the START tooth of the range
            await saveCondition.mutateAsync({
              odontogramId: latestOdontogram.id,
              toothNumber: existingRange.tooth_number,
              // Usually ranges are stored on 'whole' or specific surface?
              surface: SURFACE_IDS.WHOLE,
              condition: CONDITIONS.HEALTHY,
              cost: 0
            });
            Notifications.success('Rango eliminado');
          } catch (error) {
            console.error(error);
            Notifications.error('Error al eliminar rango');
          }
        }
        return; // Intercept click so we don't add a new condition on top
      }
    }

    if (isRangeTool) {
      if (selectionStart === null) {
        if (isBlocked) {
          Notifications.warning('No se puede iniciar un rango en un diente ausente.');
          return;
        }
        setSelectionStart(toothNumber);

        // Helper to get labels
        const label = TOOLBAR_TOOLS.find(t => t.id === selectedTool)?.label || selectedTool;
        Notifications.info(`Selecciona el diente final para ${label}`);
        return;
      } else {
        // Complete Range
        if (isBlocked) {
          Notifications.warning('No se puede finalizar un rango en un diente ausente.');
          return;
        }
        const start = Math.min(selectionStart, toothNumber);
        const end = Math.max(selectionStart, toothNumber);

        try {
          await saveCondition.mutateAsync({
            odontogramId: latestOdontogram.id,
            toothNumber: start,
            surface: 'whole', // Ranges apply to whole range usually
            condition: selectedTool,
            rangeEndTooth: end,
            cost: 0 // Default cost, editable in list
          });
          setSelectionStart(null);
          Notifications.success('Rango registrado');
        } catch (error) {
          console.error(error);
          Notifications.error('Error al guardar rango');
          setSelectionStart(null);
        }
        return;
      }
    }

    // Normal Single Tooth Condition
    try {
      // If setting a WHOLE condition (Missing, Crown, Extraction), we might want to clear previous SURFACES?
      // User requested: "Borra cualquier superficie previa (opcional)"
      // Let's effectively just Add. 
      // But if user sets 'missing', existing surface paintings remain in DB but are visually hidden by the X.
      // This is non-destructive and safer.

      await saveCondition.mutateAsync({
        odontogramId: latestOdontogram.id,
        toothNumber,
        surface,
        condition: selectedTool,
        cost: 0
      });
    } catch (error) {
      console.error(error);
      Notifications.error('Error al guardar el diagnóstico');
    }
  };

  const handleCreateVersion = async () => {
    try {
      setSaving(true);
      await createOdontogram.mutateAsync(`Evolución ${formatDate(new Date())}`);
      Notifications.success('Nueva versión del odontograma creada');
    } catch (error) {
      Notifications.error('Error al crear versión');
    } finally {
      setSaving(false);
    }
  };

  // Helper to determine range properties for a tooth
  const getRangeInfo = (toothNumber: number) => {
    // Find any condition that covers this tooth in a range
    const rangeCondition = conditions.find(c => {
      const isRange = ([CONDITIONS.ORTHODONTICS, CONDITIONS.BRIDGE, CONDITIONS.PROSTHESIS] as string[]).includes(c.condition_type);
      if (!isRange || !c.range_end_tooth) return false;
      const start = Math.min(c.tooth_number, c.range_end_tooth);
      const end = Math.max(c.tooth_number, c.range_end_tooth);
      return toothNumber >= start && toothNumber <= end;
    });

    if (!rangeCondition || !rangeCondition.range_end_tooth) return null;

    const start = Math.min(rangeCondition.tooth_number, rangeCondition.range_end_tooth);
    const end = Math.max(rangeCondition.tooth_number, rangeCondition.range_end_tooth);

    let position: 'start' | 'middle' | 'end' | 'single' = 'middle';
    if (start === end) position = 'single';
    else if (toothNumber === start) position = 'start';
    else if (toothNumber === end) position = 'end';

    return {
      type: rangeCondition.condition_type as 'orthodontics' | 'bridge' | 'prosthesis',
      position
    };
  };

  const handleExportPDF = async () => {
    if (!currentOdontogram) return;
    setShowPrintPreview(true);
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
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                Odontogram
                {isHistoryMode && <span className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full border border-orange-200">Modo Historial</span>}
              </h2>
              {/* Review Mode Toggle */}
              <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                <button
                  className={`text-xs font-medium px-2 py-1 rounded cursor-pointer transition ${!isReviewMode ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setIsReviewMode(false)}
                >
                  Visualizar
                </button>
                <button
                  className={`text-xs font-medium px-2 py-1 rounded cursor-pointer transition ${isReviewMode ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setIsReviewMode(true)}
                >
                  Revisar
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              {(() => {
                const sortedOdontograms = [...(odontograms || [])].sort((a, b) =>
                  new Date(a.date).getTime() - new Date(b.date).getTime()
                );

                const firstDate = sortedOdontograms.length > 0 ? formatDate(sortedOdontograms[0].date) : '-';
                const lastEvolution = currentOdontogram?.name ? currentOdontogram.name : '-';

                const displayString = currentOdontogram
                  ? `Inicial: ${firstDate} - ${lastEvolution}`
                  : 'Nuevo Odontograma';

                return currentOdontogram ? displayString : 'Sin odontograma registrado';
              })()}
            </p>
          </div>
        </div>

        <div className="flex gap-2">

          {/* Volver button (only in history mode) */}
          {isHistoryMode && (
            <button
              onClick={() => {
                setSelectedHistoryId(undefined);
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

          {isReviewMode ? (
            <div className="w-full h-full flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">Detalle de Diagnósticos</h3>
                <button
                  onClick={handleExportPDF}
                  className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" /> Exportar PDF
                </button>
              </div>
              <div className="flex-1 overflow-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3">Fecha</th>
                      {/* <th className="px-4 py-3">Revisión</th> Removed as requested to simplify */}
                      <th className="px-4 py-3">Diente / Rango</th>
                      <th className="px-4 py-3">Superficie</th>
                      <th className="px-4 py-3">Diagnóstico</th>
                      <th className="px-4 py-3">Importe</th>
                      <th className="px-4 py-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {conditions.map((c) => (
                      <tr key={c.id} className="bg-white border-b hover:bg-gray-50">
                        <td className="px-4 py-3">
                          {c.created_date ? formatDate(c.created_date) : '-'} {/* Aqui hay fecha mostrar formato 'dd/MM/yyyy'*/}
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {c.range_end_tooth
                            ? `${c.tooth_number} - ${c.range_end_tooth}`
                            : c.tooth_number
                          }
                        </td>
                        <td className="px-4 py-3">
                          {/* Map Surface to Code */}
                          {SURFACE_CODES[c.surface] || c.surface}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {/* Translate Condition using TOOLBAR_TOOLS */}
                            {TOOLBAR_TOOLS.find(t => t.id === c.condition_type)?.label || c.condition_type}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            className="w-20 p-1 border rounded text-right"
                            defaultValue={c.cost || 0}
                            onBlur={(e) => {
                              const val = parseFloat(e.target.value);
                              saveCondition.mutate({
                                odontogramId: currentOdontogram!.id,
                                toothNumber: c.tooth_number,
                                surface: c.surface,
                                condition: c.condition_type,
                                rangeEndTooth: c.range_end_tooth,
                                notes: c.notes,
                                cost: val
                              });
                            }}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleConvertToTreatment(c)}
                            className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-xs font-medium"
                            title="Pasar a Tratamiento"
                          >
                            <CheckCircle className="h-3 w-3" />
                            Realizar
                          </button>
                        </td>
                      </tr>
                    ))}
                    {conditions.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-gray-500">
                          No hay diagnósticos registrados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Teeth Grid */
            <div id="odontogram-visual-area" className="flex-1 flex flex-col justify-center items-center space-y-8 min-w-[800px] overflow-x-auto p-4 bg-white">
              {/* Upper Arch (Permanent) */}
              <div className="flex gap-1 justify-center">
                {UPPER_FDI.map((number) => (
                  <ToothSVG
                    key={number}
                    number={number}
                    conditions={conditions.filter(c => c.tooth_number === number)}
                    onSurfaceClick={(surface) => handleSurfaceClick(number, surface)}
                    rangeInfo={getRangeInfo(number)}
                    isSelectionStart={selectionStart === number}
                  />
                ))}
              </div>

              {/* Upper Arch (Deciduous) */}
              <div className="flex gap-1 justify-center scale-90">
                {UPPER_DECIDUOUS.map((number) => (
                  <ToothSVG
                    key={number}
                    number={number}
                    conditions={conditions.filter(c => c.tooth_number === number)}
                    onSurfaceClick={(surface) => handleSurfaceClick(number, surface)}
                    rangeInfo={getRangeInfo(number)}
                    isSelectionStart={selectionStart === number}
                  />
                ))}
              </div>

              <div className="w-full border-t border-dashed border-gray-300"></div>

              {/* Lower Arch (Deciduous) */}
              <div className="flex gap-1 justify-center scale-90">
                {LOWER_DECIDUOUS.map((number) => (
                  <ToothSVG
                    key={number}
                    number={number}
                    conditions={conditions.filter(c => c.tooth_number === number)}
                    onSurfaceClick={(surface) => handleSurfaceClick(number, surface)}
                    rangeInfo={getRangeInfo(number)}
                    isSelectionStart={selectionStart === number}
                  />
                ))}
              </div>

              {/* Lower Arch (Permanent) */}
              <div className="flex gap-1 justify-center">
                {LOWER_FDI.map((number) => (
                  <ToothSVG
                    key={number}
                    number={number}
                    conditions={conditions.filter(c => c.tooth_number === number)}
                    onSurfaceClick={(surface) => handleSurfaceClick(number, surface)}
                    rangeInfo={getRangeInfo(number)}
                    isSelectionStart={selectionStart === number}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

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

      {showPrintPreview && currentOdontogram && (
        <OdontogramPrintPreview
          odontogram={currentOdontogram}
          conditions={conditions}
          patientName={patientName}
          patientEmail={patientEmail}
          patientPhone={patientPhone}
          onClose={() => setShowPrintPreview(false)}
        />
      )}
    </div>
  );
};
