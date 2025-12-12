import React, { useState } from 'react';
import { useTreatmentCatalog } from '@/hooks/useTreatmentCatalog';
import { DollarSign, Search, AlertCircle, Save, Edit } from 'lucide-react';
import { Notifications } from '@/components/Notifications';

export const TreatmentCosts: React.FC = () => {
    const { catalog, costs, loading, updateCost } = useTreatmentCatalog();
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');
    const [saving, setSaving] = useState(false);

    const handleEdit = (id: string, currentCost: number) => {
        setEditingId(id);
        setEditValue(currentCost.toString());
    };

    const handleSave = async (id: string) => {
        try {
            setSaving(true);
            const newCost = parseFloat(editValue) || 0;
            await updateCost(id, newCost);
            setEditingId(null);
            Notifications.success('Costo actualizado');
        } catch (error) {
            console.error(error);
            Notifications.error('Error al actualizar costo');
        } finally {
            setSaving(false);
        }
    };

    const getCost = (catalogId: string) => {
        const costItem = costs.find(c => c.treatment_catalog_id === catalogId);
        return costItem ? costItem.base_cost : 0;
    };

    const filteredCatalog = catalog.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Cargando catálogo...</div>;
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Configuración de Costos</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                        type="text"
                        placeholder="Buscar tratamiento..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                        <tr>
                            <th className="px-6 py-3">Tratamiento</th>
                            <th className="px-6 py-3">Categoría</th>
                            <th className="px-6 py-3">Costo Base (S/)</th>
                            <th className="px-6 py-3 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredCatalog.map((item) => {
                            const currentCost = getCost(item.id);
                            const isEditing = editingId === item.id;

                            return (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                                    <td className="px-6 py-4 text-gray-500">
                                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">{item.category}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {isEditing ? (
                                            <div className="relative max-w-[120px]">
                                                <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={editValue}
                                                    onChange={(e) => setEditValue(e.target.value)}
                                                    className="w-full pl-8 pr-2 py-1 border border-blue-500 rounded focus:outline-none"
                                                    autoFocus
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') handleSave(item.id);
                                                        if (e.key === 'Escape') setEditingId(null);
                                                    }}
                                                />
                                            </div>
                                        ) : (
                                            <span className="font-medium text-gray-700">S/ {currentCost.toFixed(2)}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {isEditing ? (
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleSave(item.id)}
                                                    disabled={saving}
                                                    className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                                                    title="Guardar"
                                                >
                                                    <Save className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => setEditingId(null)}
                                                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                                    title="Cancelar"
                                                >
                                                    <AlertCircle className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleEdit(item.id, currentCost)}
                                                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                title="Editar"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                        {filteredCatalog.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                    <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                    No se encontraron tratamientos
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
