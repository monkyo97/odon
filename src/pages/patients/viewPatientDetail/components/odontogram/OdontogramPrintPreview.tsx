import React, { useRef, useState } from 'react';
import { Odontogram, ToothCondition } from '@/types/odontogram';
import { ToothSVG } from '@/components/odontogram/ToothSVG';
import { UPPER_FDI, LOWER_FDI, UPPER_DECIDUOUS, LOWER_DECIDUOUS, TOOLBAR_TOOLS, CONDITIONS, SURFACE_CODES } from '@/constants/odontogram';
import { X, Download, Loader2 } from 'lucide-react';
import { generateOdontogramPDF } from '@/utils/pdfGenerator';
import { Notifications } from '@/components/Notifications';

interface OdontogramPrintPreviewProps {
    odontogram: Odontogram;
    conditions: ToothCondition[];
    patientName: string;
    patientEmail?: string;
    patientPhone?: string;
    onClose: () => void;
}

export const OdontogramPrintPreview: React.FC<OdontogramPrintPreviewProps> = ({
    odontogram,
    conditions,
    patientName,
    patientEmail,
    patientPhone,
    onClose
}) => {
    const [generating, setGenerating] = useState(false);

    // Copying logic from Odontogram.tsx for rendering but simplified
    // We need to render the visual part so html2canvas can capture it.
    // We will render it directly in the modal.

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

    const handleDownload = async () => {
        setGenerating(true);
        try {
            await generateOdontogramPDF({
                clinicName: 'Clínica Dental DevMC',
                patientName,
                patientEmail,
                patientPhone,
                odontogram: odontogram,
                conditions,
                elementIdToCapture: 'preview-odontogram-visual'
            });
            Notifications.success('PDF descargado');
            onClose(); // Optional: close after download
        } catch (error) {
            console.error(error);
            Notifications.error('Error al generar PDF');
        } finally {
            setGenerating(false);
        }
    };

    const renderTooth = (number: number) => (
        <ToothSVG
            key={number}
            number={number}
            conditions={conditions.filter(c => c.tooth_number === number)}
            onSurfaceClick={() => { }} // No interaction in preview
            rangeInfo={getRangeInfo(number)}
            isSelectionStart={false} // No selection in preview
        />
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b bg-gray-50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Vista Previa de Impresión</h2>
                        <p className="text-sm text-gray-500">Revisa el odontograma y los diagnósticos antes de exportar.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Body - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-100 flex flex-col gap-6">

                    {/* Visual Section - Wrapper for auto-sizing/capture */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center">
                        <h3 className="text-sm font-semibold text-gray-500 mb-4 w-full text-left uppercase tracking-wider">Odontograma</h3>

                        {/* THE PART TO CAPTURE */}
                        <div id="preview-odontogram-visual" className="flex flex-col items-center space-y-4 p-4 bg-white w-full overflow-x-auto">
                            {/* Upper Arch (Permanent) */}
                            <div className="flex gap-1 justify-center scale-[0.85] origin-center">
                                {UPPER_FDI.map(renderTooth)}
                            </div>
                            {/* Upper Arch (Deciduous) */}
                            <div className="flex gap-1 justify-center scale-[0.75] origin-center">
                                {UPPER_DECIDUOUS.map(renderTooth)}
                            </div>

                            <div className="w-full max-w-2xl border-t border-dashed border-gray-300 my-2"></div>

                            {/* Lower Arch (Deciduous) */}
                            <div className="flex gap-1 justify-center scale-[0.75] origin-center">
                                {LOWER_DECIDUOUS.map(renderTooth)}
                            </div>
                            {/* Lower Arch (Permanent) */}
                            <div className="flex gap-1 justify-center scale-[0.85] origin-center">
                                {LOWER_FDI.map(renderTooth)}
                            </div>
                        </div>
                    </div>

                    {/* Table Section */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wider">Detalle de Diagnósticos</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2">Fecha</th>
                                        <th className="px-4 py-2">Diente</th>
                                        <th className="px-4 py-2">Sup.</th>
                                        <th className="px-4 py-2">Diagnóstico</th>
                                        <th className="px-4 py-2 text-right">Importe</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {conditions.length > 0 ? conditions.map((c) => (
                                        <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50">
                                            <td className="px-4 py-2 text-gray-600">
                                                {c.created_date ? new Date(c.created_date).toLocaleDateString() : '-'}
                                            </td>
                                            <td className="px-4 py-2 font-medium">
                                                {c.range_end_tooth ? `${c.tooth_number} - ${c.range_end_tooth}` : c.tooth_number}
                                            </td>
                                            <td className="px-4 py-2 text-gray-600">
                                                {SURFACE_CODES[c.surface] || c.surface}
                                            </td>
                                            <td className="px-4 py-2">
                                                {TOOLBAR_TOOLS.find(t => t.id === c.condition_type)?.label || c.condition_type}
                                            </td>
                                            <td className="px-4 py-2 text-right">
                                                ${c.cost || 0}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-8 text-center text-gray-500">No hay diagnósticos registrados.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="border-t p-4 bg-white flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleDownload}
                        disabled={generating}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        Descargar PDF
                    </button>
                </div>
            </div>
        </div>
    );
};
