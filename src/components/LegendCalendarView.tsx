
// Pequeño componente auxiliar
export const Legend = ({ color, label }: { color: string; label: string }) => (
  <div className="flex items-center space-x-1">
    <div className={`w-3 h-3 rounded ${color}`} />
    <span>{label}</span>
  </div>
);
