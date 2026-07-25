import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, AlertCircle, WifiOff, Clock, Loader2 } from 'lucide-react';

// Tipos de error para mostrar iconos y estilos diferenciados
type ErrorType = 'credentials' | 'network' | 'timeout' | 'unknown';

interface ErrorInfo {
  message: string;
  type: ErrorType;
  icon: React.ReactNode;
  colorClass: string;
}

// Clasificar el error según el código HTTP o mensaje
function classifyError(err: unknown): ErrorInfo {
  const axiosErr = err as {
    response?: { status?: number; data?: { message?: string } };
    code?: string;
    message?: string;
  };

  const status = axiosErr.response?.status;
  const code = axiosErr.code;
  const serverMessage = axiosErr.response?.data?.message;

  // Error de credenciales (401 o 403)
  if (status === 401 || status === 403) {
    return {
      message: 'Email or password is incorrect',
      type: 'credentials',
      icon: <AlertCircle className="w-4 h-4" />,
      colorClass: 'text-destructive bg-destructive/10 border-destructive/20',
    };
  }

  // Error de red (sin respuesta del servidor)
  if (code === 'ERR_NETWORK' || code === 'ECONNREFUSED' || !axiosErr.response) {
    return {
      message: 'Unable to connect. Check your internet connection',
      type: 'network',
      icon: <WifiOff className="w-4 h-4" />,
      colorClass: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    };
  }

  // Timeout
  if (code === 'ECONNABORTED' || axiosErr.message?.includes('timeout')) {
    return {
      message: 'Server took too long to respond. Try again',
      type: 'timeout',
      icon: <Clock className="w-4 h-4" />,
      colorClass: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    };
  }

  // Error genérico
  return {
    message: serverMessage || 'An unexpected error occurred',
    type: 'unknown',
    icon: <AlertCircle className="w-4 h-4" />,
    colorClass: 'text-destructive bg-destructive/10 border-destructive/20',
  };
}

// Página de login: formulario de email/password con estado de error y loading
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  // Auto-dismiss del error después de 5 segundos
  useEffect(() => {
    if (errorInfo) {
      const timer = setTimeout(() => setErrorInfo(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorInfo]);

  // Manejar submit del formulario: login via Zustand store y redirigir al dashboard
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorInfo(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: unknown) {
      const info = classifyError(err);
      setErrorInfo(info);
      // Activar animación shake
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      {/* Efectos de fondo decorativos con blur (neon glow) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-cyan/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-magenta/5 rounded-full blur-3xl" />
      </div>

      <Card className={`w-full max-w-md relative border-border bg-card/80 backdrop-blur-sm ${shake ? 'animate-shake' : ''}`}>
        <div className="absolute inset-0 rounded-xl glow-cyan opacity-20 pointer-events-none" />
        <CardHeader className="text-center space-y-2">
          {/* Icono de la app */}
          <div className="mx-auto w-12 h-12 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center glow-cyan">
            <Zap className="w-6 h-6 text-neon-cyan" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">Coders App</CardTitle>
          <p className="text-sm text-muted-foreground">Sign in to your account</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Banner de error mejorado con icono y colores diferenciados */}
            {errorInfo && (
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm animate-in fade-in slide-in-from-top-2 ${errorInfo.colorClass}`}>
                {errorInfo.icon}
                <span>{errorInfo.message}</span>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-muted-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-input border-border focus:border-neon-cyan focus:ring-neon-cyan/20"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-muted-foreground">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-input border-border focus:border-neon-cyan focus:ring-neon-cyan/20"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-neon-cyan text-background hover:bg-neon-cyan/90 font-semibold"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
