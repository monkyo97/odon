export const formatDate = (date: string | Date | number): string => {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};
