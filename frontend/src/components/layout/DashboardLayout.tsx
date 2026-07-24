import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

// Layout principal del dashboard: sidebar fija a la izquierda + área de contenido scrollable
export default function DashboardLayout() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6">
        <Outlet /> {/* Renderiza las rutas hijas (CodersTable, ClansTable, etc.) */}
      </main>
    </div>
  );
}
