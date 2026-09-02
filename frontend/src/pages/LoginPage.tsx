import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Zap, AlertCircle, WifiOff, Clock, Loader2, Shield, Layers, ListTodo, Sparkles } from 'lucide-react';

type ErrorType = 'credentials' | 'network' | 'timeout' | 'unknown';

interface ErrorInfo {
  message: string;
  type: ErrorType;
  icon: React.ReactNode;
  colorClass: string;
}

function classifyError(err: unknown): ErrorInfo {
  const axiosErr = err as {
    response?: { status?: number; data?: { message?: string } };
    code?: string;
    message?: string;
  };

  const status = axiosErr.response?.status;
  const code = axiosErr.code;
  const serverMessage = axiosErr.response?.data?.message;

  if (status === 401 || status === 403) {
    return {
      message: 'Correo electrónico o contraseña incorrectos',
      type: 'credentials',
      icon: <AlertCircle className="w-4 h-4" />,
      colorClass: 'text-destructive bg-destructive/10 border-destructive/20',
    };
  }

  if (code === 'ERR_NETWORK' || code === 'ECONNREFUSED' || !axiosErr.response) {
    return {
      message: 'No se pudo conectar con el servidor',
      type: 'network',
      icon: <WifiOff className="w-4 h-4" />,
      colorClass: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    };
  }

  if (code === 'ECONNABORTED' || axiosErr.message?.includes('timeout')) {
    return {
      message: 'El servidor tardó demasiado en responder',
      type: 'timeout',
      icon: <Clock className="w-4 h-4" />,
      colorClass: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    };
  }

  return {
    message: serverMessage || 'Ocurrió un error inesperado',
    type: 'unknown',
    icon: <AlertCircle className="w-4 h-4" />,
    colorClass: 'text-destructive bg-destructive/10 border-destructive/20',
  };
}

export default function LoginPage() {
  const [mode, setMode] = useState<'register' | 'login'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);
  const navigate = useNavigate();

  useEffect(() => {
    if (errorInfo) {
      const timer = setTimeout(() => setErrorInfo(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorInfo]);

  const toggleMode = () => {
    setMode((prev) => (prev === 'register' ? 'login' : 'register'));
    setErrorInfo(null);
    setName('');
    setEmail('');
    setPassword('');
  };

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorInfo(null);

    if (!isValidEmail(email)) {
      setErrorInfo({
        message: 'Por favor ingresa un correo electrónico válido',
        type: 'credentials',
        icon: <AlertCircle className="w-4 h-4" />,
        colorClass: 'text-destructive bg-destructive/10 border-destructive/20',
      });
      return;
    }

    setLoading(true);
    try {
      if (mode === 'register') {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
      navigate('/dashboard');
    } catch (err: unknown) {
      const info = classifyError(err);
      setErrorInfo(info);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  };

  const isRegister = mode === 'register';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
      {/* Background Glow Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-neon-cyan/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-neon-magenta/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* Left Side: Brand Promo / Platform Capabilities */}
        <div className="md:col-span-5 space-y-6 hidden md:block">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel border border-neon-cyan/30 text-neon-cyan text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            PLATAFORMA FULLSTACK
          </div>
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground leading-tight">
              Organiza tu fuerza técnica con <span className="text-gradient-cyan">Precisión</span> & <span className="text-gradient-magenta">Velocidad</span>.
            </h1>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Task Board en tiempo real, gestión de Clans y autenticación RBAC jerárquica.
            </p>
          </div>

          {/* Platform Feature Cards */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 p-3 rounded-xl glass-panel border-white/5">
              <div className="w-8 h-8 rounded-lg bg-neon-cyan/15 border border-neon-cyan/30 flex items-center justify-center text-neon-cyan shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Workspaces de Clans</p>
                <p className="text-[11px] text-muted-foreground">Organiza Coders en unidades técnicas de trabajo</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl glass-panel border-white/5">
              <div className="w-8 h-8 rounded-lg bg-neon-magenta/15 border border-neon-magenta/30 flex items-center justify-center text-neon-magenta shrink-0">
                <ListTodo className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Kanban Pipelines</p>
                <p className="text-[11px] text-muted-foreground">Flujo estricto: Pending, Review, Approved y Rejected</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl glass-panel border-white/5">
              <div className="w-8 h-8 rounded-lg bg-neon-green/15 border border-neon-green/30 flex items-center justify-center text-neon-green shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">RBAC Jerárquico</p>
                <p className="text-[11px] text-muted-foreground">Permisos específicos para Coders, Team Leaders y Admins</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Glass Card */}
        <div className="md:col-span-7">
          <div className={`glass-card p-8 rounded-2xl relative ${shake ? 'animate-shake' : 'animate-fade-in-scale'}`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-xl bg-neon-cyan/15 border border-neon-cyan/40 flex items-center justify-center glow-cyan">
                <Zap className="w-6 h-6 text-neon-cyan animate-pulse-soft" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground tracking-tight">Coders App</h2>
                <p className="text-xs text-muted-foreground">
                  {isRegister ? 'Registra tu perfil de Coder' : 'Inicia sesión para acceder a tu Dashboard'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {errorInfo && (
                <div className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs animate-in fade-in slide-in-from-top-2 ${errorInfo.colorClass}`}>
                  {errorInfo.icon}
                  <span>{errorInfo.message}</span>
                </div>
              )}

              {isRegister && (
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-semibold text-muted-foreground">Nombre Completo</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="glass-input h-11 rounded-xl text-sm"
                    required
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-muted-foreground">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="text"
                  placeholder="user@coders.app"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="glass-input h-11 rounded-xl text-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-semibold text-muted-foreground">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="glass-input h-11 rounded-xl text-sm"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 mt-2 bg-gradient-to-r from-neon-cyan to-blue-600 hover:from-neon-cyan/90 hover:to-blue-600/90 text-background font-bold text-sm rounded-xl shadow-lg glow-cyan transition-all"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {isRegister ? 'Creando cuenta...' : 'Autenticando...'}
                  </span>
                ) : (
                  isRegister ? 'Crear Cuenta Coder' : 'Iniciar Sesión'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-xs text-muted-foreground border-t border-white/5 pt-4">
              {isRegister ? (
                <>
                  ¿Ya tienes cuenta?{' '}
                  <button type="button" onClick={toggleMode} className="text-neon-cyan hover:underline font-semibold ml-1">
                    Iniciar Sesión
                  </button>
                </>
              ) : (
                <>
                  ¿Necesitas una cuenta?{' '}
                  <button type="button" onClick={toggleMode} className="text-neon-cyan hover:underline font-semibold ml-1">
                    Crear Perfil Coder
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
