import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, AlertCircle, WifiOff, Clock, Loader2 } from 'lucide-react';

// Tipos de error para mostrar iconos y estilos diferenciados en la UI.
// Cada tipo tiene un color e icono propio para que el usuario
// distinga rápidamente qué salió mal.
type ErrorType = 'credentials' | 'network' | 'timeout' | 'unknown';

interface ErrorInfo {
  message: string;
  type: ErrorType;
  icon: React.ReactNode;
  colorClass: string;
}

// Clasifica el error recibido según el código HTTP o el tipo de error de Axios.
// Devuelve un ErrorInfo con el mensaje, icono y estilo adecuados para cada caso.
function classifyError(err: unknown): ErrorInfo {
  const axiosErr = err as {
    response?: { status?: number; data?: { message?: string } };
    code?: string;
    message?: string;
  };

  const status = axiosErr.response?.status;
  const code = axiosErr.code;
  const serverMessage = axiosErr.response?.data?.message;

  // Credenciales incorrectas (401 o 403)
  if (status === 401 || status === 403) {
    return {
      message: 'Email or password is incorrect',
      type: 'credentials',
      icon: <AlertCircle className="w-4 h-4" />,
      colorClass: 'text-destructive bg-destructive/10 border-destructive/20',
    };
  }

  // Sin conexión a internet o servidor caído
  if (code === 'ERR_NETWORK' || code === 'ECONNREFUSED' || !axiosErr.response) {
    return {
      message: 'Unable to connect. Check your internet connection',
      type: 'network',
      icon: <WifiOff className="w-4 h-4" />,
      colorClass: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    };
  }

  // El servidor tardó demasiado en responder
  if (code === 'ECONNABORTED' || axiosErr.message?.includes('timeout')) {
    return {
      message: 'Server took too long to respond. Try again',
      type: 'timeout',
      icon: <Clock className="w-4 h-4" />,
      colorClass: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    };
  }

  // Cualquier otro error: usa el mensaje del servidor si existe
  return {
    message: serverMessage || 'An unexpected error occurred',
    type: 'unknown',
    icon: <AlertCircle className="w-4 h-4" />,
    colorClass: 'text-destructive bg-destructive/10 border-destructive/20',
  };
}

// Página de login/registro dual.
// Por defecto muestra el formulario de Sign In (cuenta existente).
// El usuario puede cambiar a modo registro (Create Account) que
// solo crea cuentas con rol 'coder'.
export default function LoginPage() {
  // Modo del formulario: 'login' o 'register' (login por defecto)
  const [mode, setMode] = useState<'register' | 'login'>('login');
  // Campos del formulario
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Estado del banner de error (null = sin error)
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | null>(null);
  // Estado de loading mientras se procesa la petición
  const [loading, setLoading] = useState(false);
  // Activa la animación shake cuando hay un error
  const [shake, setShake] = useState(false);
  // Acciones del store de autenticación
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);
  const navigate = useNavigate();

  // Auto-dismiss del error después de 5 segundos.
  // Si el errorInfo cambia, se reinicia el timer.
  useEffect(() => {
    if (errorInfo) {
      const timer = setTimeout(() => setErrorInfo(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorInfo]);

  // Alterna entre modo login y registro.
  // Limpia todos los campos y errores al cambiar.
  const toggleMode = () => {
    setMode((prev) => (prev === 'register' ? 'login' : 'register'));
    setErrorInfo(null);
    setName('');
    setEmail('');
    setPassword('');
  };

  // Valida que el email tenga un formato válido (nombre@dominio.ext).
  // Se usa una expresión regular simple pero efectiva.
  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  // Maneja el envío del formulario.
  // Primero valida el email en el cliente, luego llama a login o register
  // según el modo activo. Si todo sale bien, redirige al dashboard.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorInfo(null);

    // Validación de formato de email antes de enviar al servidor
    if (!isValidEmail(email)) {
      setErrorInfo({
        message: 'Please enter a valid email address',
        type: 'credentials',
        icon: <AlertCircle className="w-4 h-4" />,
        colorClass: 'text-destructive bg-destructive/10 border-destructive/20',
      });
      return;
    }

    setLoading(true);
    try {
      // Ejecutar login o registro según el modo seleccionado
      if (mode === 'register') {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
      navigate('/dashboard');
    } catch (err: unknown) {
      // Clasificar el error y mostrarlo en el banner
      const info = classifyError(err);
      setErrorInfo(info);
      // Activar animación shake para feedback visual
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  };

  // Variable de conveniencia para simplificar las condicionales del JSX
  const isRegister = mode === 'register';

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      {/* Efectos de fondo decorativos: dos círculos difusos con color neon sutil */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-cyan/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-magenta/5 rounded-full blur-3xl" />
      </div>

      {/* Tarjeta principal del formulario con animación shake al haber error */}
      <Card className={`w-full max-w-md relative border-border bg-card/80 backdrop-blur-sm ${shake ? 'animate-shake' : ''}`}>
        {/* Brillo neon sutil en el borde de la tarjeta */}
        <div className="absolute inset-0 rounded-xl glow-cyan opacity-20 pointer-events-none" />

        <CardHeader className="text-center space-y-2">
          {/* Icono de la app */}
          <div className="mx-auto w-12 h-12 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center glow-cyan">
            <Zap className="w-6 h-6 text-neon-cyan" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">Coders App</CardTitle>
          {/* Subtítulo dinámico según el modo */}
          <p className="text-sm text-muted-foreground">
            {isRegister ? 'Create your coder account' : 'Sign in to your account'}
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Banner de error: se muestra cuando hay un error con icono y colores diferenciados */}
            {errorInfo && (
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm animate-in fade-in slide-in-from-top-2 ${errorInfo.colorClass}`}>
                {errorInfo.icon}
                <span>{errorInfo.message}</span>
              </div>
            )}

            {/* Campo nombre: solo visible en modo registro */}
            {isRegister && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-muted-foreground">Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-input border-border focus:border-neon-cyan focus:ring-neon-cyan/20"
                  required
                />
              </div>
            )}

            {/* Campo email: visible en ambos modos. Type "text" en lugar de "email"
                para que la validación custom muestre nuestro mensaje de error */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-muted-foreground">Email</Label>
              <Input
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-input border-border focus:border-neon-cyan focus:ring-neon-cyan/20"
                required
              />
            </div>

            {/* Campo contraseña: visible en ambos modos */}
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

            {/* Botón principal: texto y loading state cambian según el modo */}
            <Button
              type="submit"
              className="w-full bg-neon-cyan text-background hover:bg-neon-cyan/90 font-semibold"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isRegister ? 'Creating account...' : 'Signing in...'}
                </span>
              ) : (
                isRegister ? 'Create Account' : 'Sign In'
              )}
            </Button>
          </form>

          {/* Enlace para alternar entre login y registro */}
          <div className="mt-4 text-center text-sm text-muted-foreground">
            {isRegister ? (
              <>
                Already have an account?{' '}
                <button type="button" onClick={toggleMode} className="text-neon-cyan hover:underline font-medium">
                  Sign In
                </button>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <button type="button" onClick={toggleMode} className="text-neon-cyan hover:underline font-medium">
                  Create one
                </button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
