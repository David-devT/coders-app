import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useAuthStore } from './stores/authStore';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));

// Cliente de React Query para manejo de caché y estado asíncrono.
// staleTime: 30s evita re-fetches innecarios al navegar entre páginas.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

// Ruta protegida: redirige a /login si el usuario no está autenticado
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  // Mostrar spinner mientras se valida el token en /auth/me
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background text-xs font-semibold gap-3">
        <div className="w-8 h-8 border-2 border-[#AB978C]/30 border-t-[#AB978C] rounded-full animate-spin glow-bronze" />
        <span className="text-[#E9E6E7]">Verificando sesión...</span>
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PageFallback() {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-xs font-semibold gap-3">
      <div className="w-8 h-8 border-2 border-[#AB978C]/30 border-t-[#AB978C] rounded-full animate-spin glow-bronze" />
      <span className="text-[#E9E6E7]">Cargando vista...</span>
    </div>
  );
}

function App() {
  const checkAuth = useAuthStore((s) => s.checkAuth);

  // Verificar token almacenado al montar la app (valida con /api/auth/me)
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster
        position="top-right"
        theme="dark"
        toastOptions={{
          style: {
            background: '#1C2029',
            border: '1px solid rgba(123, 127, 138, 0.25)',
            borderTop: '1px solid rgba(171, 151, 140, 0.35)',
            color: '#E9E6E7',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.7)',
            borderRadius: '0.75rem',
            fontSize: '12px',
          },
        }}
      />
      <BrowserRouter>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/dashboard/*"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            {/* Fallback: cualquier ruta desconocida redirige al dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
