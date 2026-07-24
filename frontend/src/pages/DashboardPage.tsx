import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import CodersTable from '../components/coders/CodersTable';
import ClansTable from '../components/clans/ClansTable';
import TeamLeadersTable from '../components/teamLeaders/TeamLeadersTable';

// Página principal del dashboard: anida rutas dentro del layout con sidebar
export default function DashboardPage() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        {/* Ruta por defecto: redirige a /dashboard/coders */}
        <Route index element={<Navigate to="coders" replace />} />
        <Route path="coders" element={<CodersTable />} />
        <Route path="clans" element={<ClansTable />} />
        <Route path="team-leaders" element={<TeamLeadersTable />} />
      </Route>
    </Routes>
  );
}
