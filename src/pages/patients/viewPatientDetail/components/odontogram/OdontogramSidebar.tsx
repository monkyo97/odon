// src/components/odontogram/OdontogramSidebar.tsx
import React, { useMemo, useState } from 'react';
import { TREATMENTS, type TreatmentCategory } from '@constants/odontogram';
import { Search } from 'lucide-react';

type Props = {
  onPickTreatment: (name: string) => void;
};

export const OdontogramSidebar: React.FC<Props> = ({ onPickTreatment }) => {
  const [tab, setTab] = useState<TreatmentCategory>('todos');
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    return TREATMENTS.filter(t =>
      (tab === 'todos' || t.category === tab) &&
      t.name.toLowerCase().includes(q.toLowerCase())
    );
  }, [tab, q]);

  return (
    <aside className="w-full md:w-80 border rounded-xl p-4 bg-white">
      <h4 className="font-semibold text-blue-700 mb-2">Odontograma</h4>

      <div className="relative mb-3">
        <Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
        <input
          className="pl-8 pr-3 py-2 w-full border rounded-lg text-sm"
          placeholder="Busca un tratamiento…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="flex gap-2 text-xs mb-3">
        {(['todos','individuales','generales','pediatrico'] as TreatmentCategory[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1 rounded-full border ${tab===t ? 'bg-blue-600 text-white border-blue-600' : ''}`}
          >
            {t[0].toUpperCase()+t.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-2 max-h-72 overflow-auto">
        {filtered.map(t => (
          <button
            key={t.id}
            className="w-full text-left border rounded-lg px-3 py-2 text-sm hover:bg-gray-50"
            onClick={() => onPickTreatment(t.name)}
          >
            {t.name}
          </button>
        ))}
        {filtered.length === 0 && <p className="text-xs text-gray-500">Sin resultados</p>}
      </div>
    </aside>
  );
};
