import React from 'react';
import { TOOLBAR_TOOLS } from '../../../../../constants/odontogram';
import { ToothConditionType } from '../../../../../types/odontogram';

interface OdontogramSidebarProps {
  selectedTool: ToothConditionType | null;
  onSelectTool: (tool: ToothConditionType) => void;
}

export const OdontogramSidebar: React.FC<OdontogramSidebarProps> = ({ selectedTool, onSelectTool }) => {
  return (
    <div className="bg-white border rounded-xl p-4 shadow-sm h-full  overflow-y-auto">
      <h3 className="font-semibold text-gray-900 mb-4">Herramientas</h3>

      <div className="space-y-2">
        {TOOLBAR_TOOLS.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onSelectTool(tool.id)}
            className={`w-full flex items-center p-3 rounded-lg transition-all ${selectedTool === tool.id
              ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500'
              : 'bg-white border border-gray-200 hover:bg-gray-50'
              }`}
          >
            <div
              className="w-4 h-4 rounded-full mr-3 border border-gray-300"
              style={{ backgroundColor: tool.color }}
            />
            <span className="text-sm font-medium text-gray-700">{tool.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg text-xs text-gray-500">
        <p className="font-medium mb-1">Instrucciones:</p>
        <ol className="list-decimal pl-4 space-y-1">
          <li>Selecciona una herramienta.</li>
          <li>Haz clic en la superficie del diente para aplicar.</li>
          <li>Para borrar, selecciona "Sano" (Sano) y haz clic.</li>
        </ol>
      </div>
    </div>
  );
};
