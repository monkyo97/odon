import React from 'react';
import { Odontogram } from '@/types/odontogram';
import { Clock, CheckCircle2, Circle } from 'lucide-react';

interface OdontogramHistoryPanelProps {
    odontograms: Odontogram[];
    activeId: string | undefined;
    onSelectVersion: (id: string) => void;
    onClose: () => void;
}

export const OdontogramHistoryPanel: React.FC<OdontogramHistoryPanelProps> = ({
    odontograms,
    activeId,
    onSelectVersion,
    onClose,
}) => {
    return (
        <div className="h-full flex flex-col bg-white border-l shadow-xl">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-500" />
                    Historial de Versiones
                </h3>
                <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700 p-1 hover:bg-gray-200 rounded"
                >
                    ✕
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {odontograms.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">No hay versiones registradas.</p>
                )}
                {odontograms.map((odon) => {
                    const isActive = activeId === odon.id;
                    return (
                        <div
                            key={odon.id}
                            onClick={() => onSelectVersion(odon.id)}
                            className={`
                group relative p-3 rounded-lg border transition-all cursor-pointer
                ${isActive
                                    ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-300'
                                    : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'
                                }
              `}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-sm font-medium ${isActive ? 'text-blue-700' : 'text-gray-900'}`}>
                                    {odon.name}
                                </span>
                                {isActive ? (
                                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                                ) : (
                                    <Circle className="w-4 h-4 text-gray-300 group-hover:text-blue-400" />
                                )}
                            </div>

                            <div className="space-y-1">
                                <div className="text-xs text-gray-500 flex justify-between">
                                    <span>Fecha:</span>
                                    <span>{new Date(odon.date).toLocaleDateString()}</span>
                                </div>
                                <div className="text-xs text-gray-500 flex justify-between">
                                    <span>Tipo:</span>
                                    <span className="capitalize">{odon.type === 'initial' ? 'Inicial' : 'Evolución'}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
