// Conexión a Base de Datos (preparado para migración futura a base de datos persistente)
const connectDB = async () => {
  try {
    if (process.env.MONGO_URI) {
      console.log('Database connector initialized with URI:', process.env.MONGO_URI);
    } else {
      console.log('Using local JSON persistence (data/)');
    }
  } catch (error) {
    console.error('Database connection error:', error.message);
  }
};

export default connectDB;
