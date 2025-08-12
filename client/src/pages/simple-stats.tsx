import { useQuery } from "@tanstack/react-query";

export default function SimpleStatsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/health"],
    staleTime: 30 * 1000,
  });

  if (isLoading) {
    return <div className="p-8">Cargando...</div>;
  }

  if (error) {
    return <div className="p-8">Error: {String(error)}</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Prueba Simple</h1>
      <p>Estado de la aplicación: {(data as any)?.status || 'Desconocido'}</p>
      <p>Timestamp: {(data as any)?.timestamp || 'N/A'}</p>
    </div>
  );
}