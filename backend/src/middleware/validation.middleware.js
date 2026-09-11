// Expresión regular para validación básica de formato de correo electrónico
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Expresión regular opcional para validar URLs de GitHub
const GITHUB_URL_REGEX = /^(https?:\/\/)?(www\.)?github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+/;

// Valida los datos requeridos para el registro de un nuevo usuario
export const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ ok: false, message: 'El nombre es obligatorio' });
  }
  if (!email || !EMAIL_REGEX.test(email)) {
    return res.status(400).json({ ok: false, message: 'El correo electrónico no es válido' });
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ ok: false, message: 'La contraseña debe tener al menos 6 caracteres' });
  }
  next();
};

// Valida credenciales requeridas para inicio de sesión
export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !EMAIL_REGEX.test(email)) {
    return res.status(400).json({ ok: false, message: 'El correo electrónico no es válido' });
  }
  if (!password || typeof password !== 'string' || password.trim().length === 0) {
    return res.status(400).json({ ok: false, message: 'La contraseña es obligatoria' });
  }
  next();
};

// Valida los campos en la creación de una tarea técnica
export const validateCreateTask = (req, res, next) => {
  const { title, priority, githubUrl } = req.body;
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({ ok: false, message: 'El título de la tarea es obligatorio' });
  }
  if (priority && !['low', 'medium', 'high'].includes(priority)) {
    return res.status(400).json({ ok: false, message: 'La prioridad debe ser low, medium o high' });
  }
  if (githubUrl && typeof githubUrl === 'string' && githubUrl.trim().length > 0) {
    if (!GITHUB_URL_REGEX.test(githubUrl.trim())) {
      return res.status(400).json({ ok: false, message: 'La URL debe pertenecer al dominio github.com' });
    }
  }
  next();
};

// Valida el estado destino en la transición de una tarea técnica
export const validateUpdateTaskStatus = (req, res, next) => {
  const { status } = req.body;
  if (!status || !['pending', 'review', 'approved', 'rejected'].includes(status)) {
    return res.status(400).json({ ok: false, message: 'Estado de tarea no válido' });
  }
  next();
};
