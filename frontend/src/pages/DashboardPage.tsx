import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';

const CodersTable = lazy(() => import('../components/coders/CodersTable'));
const ClansTable = lazy(() => import('../components/clans/ClansTable'));
const TeamLeadersTable = lazy(() => import('../components/teamLeaders/TeamLeadersTable'));
const TaskBoard = lazy(() => import('../components/tasks/TaskBoard'));

function ViewFallback() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-xs text-muted-foreground gap-3">
      <div className="w-8 h-8 border-2 border-[#AB978C]/30 border-t-[#AB978C] rounded-full animate-spin glow-bronze" />
      <span className="text-[#E9E6E7]">Cargando módulo...</span>
    </div>
  );
}

// Página principal del dashboard: anida rutas dentro del layout con sidebar
export default function DashboardPage() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        {/* Ruta por defecto: redirige a /dashboard/coders */}
        <Route index element={<Navigate to="coders" replace />} />
        <Route
          path="coders"
          element={
            <Suspense fallback={<ViewFallback />}>
              <CodersTable />
            </Suspense>
          }
        />
        <Route
          path="clans"
          element={
            <Suspense fallback={<ViewFallback />}>
              <ClansTable />
            </Suspense>
          }
        />
        <Route
          path="tasks"
          element={
            <Suspense fallback={<ViewFallback />}>
              <TaskBoard />
            </Suspense>
          }
        />
        <Route
          path="team-leaders"
          element={
            <Suspense fallback={<ViewFallback />}>
              <TeamLeadersTable />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  );
}
