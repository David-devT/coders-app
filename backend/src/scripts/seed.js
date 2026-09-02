import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { writeJSON } from '../models/db.js';

async function seed() {
  console.log('🌱 Inicializando datos iniciales (Seed) en backend/src/data/...');

  const now = new Date().toISOString();
  const adminPasswordHash = await bcrypt.hash('Admin123!', 10);
  const tlPasswordHash = await bcrypt.hash('Tl123!', 10);
  const coderPasswordHash = await bcrypt.hash('Coder123!', 10);

  // 1. Team Leaders y Admin
  const adminId = uuidv4();
  const tlId = uuidv4();

  const teamLeaders = [
    {
      id: adminId,
      name: 'System Admin',
      email: 'admin@coders.app',
      password: adminPasswordHash,
      role: 'admin',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: tlId,
      name: 'Alex Rivera (TL)',
      email: 'alex.tl@coders.app',
      password: tlPasswordHash,
      role: 'teamLeader',
      createdAt: now,
      updatedAt: now,
    },
  ];

  // 2. Clanes y Coders
  const clanId = uuidv4();
  const coder1Id = uuidv4();
  const coder2Id = uuidv4();

  const clans = [
    {
      id: clanId,
      name: 'Cyber Dragons',
      description: 'Clan especializado en desarrollo fullstack y arquitectura cloud.',
      teamLeader: tlId,
      coders: [coder1Id, coder2Id],
      createdAt: now,
      updatedAt: now,
    },
  ];

  const coders = [
    {
      id: coder1Id,
      name: 'Elena Rostova',
      email: 'elena@coders.app',
      password: coderPasswordHash,
      clan: clanId,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: coder2Id,
      name: 'Mateo Gómez',
      email: 'mateo@coders.app',
      password: coderPasswordHash,
      clan: clanId,
      createdAt: now,
      updatedAt: now,
    },
  ];

  // 3. Tareas en estados del Kanban
  const tasks = [
    {
      id: uuidv4(),
      title: 'Configurar autenticación JWT',
      description: 'Implementar middleware de verificación y generación de tokens en el backend.',
      status: 'pending',
      priority: 'high',
      assigneeId: coder1Id,
      clanId: clanId,
      deleted: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      title: 'Diseñar componentes del Kanban',
      description: 'Crear columnas y tarjetas con microinteracciones y estilos neón.',
      status: 'review',
      priority: 'medium',
      assigneeId: coder1Id,
      clanId: clanId,
      deleted: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      title: 'Optimizar consultas y caché con React Query',
      description: 'Configurar staleTime y prefetching en rutas clave.',
      status: 'approved',
      priority: 'low',
      assigneeId: coder2Id,
      clanId: clanId,
      deleted: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      title: 'Diseño Cyber-Glass e integración',
      description: 'Refactorización visual del dashboard y tableros.',
      status: 'rejected',
      priority: 'medium',
      assigneeId: coder2Id,
      clanId: clanId,
      deleted: false,
      createdAt: now,
      updatedAt: now,
    },
  ];

  writeJSON('teamLeaders.json', teamLeaders);
  writeJSON('clans.json', clans);
  writeJSON('coders.json', coders);
  writeJSON('tasks.json', tasks);

  console.log('✅ Datos iniciales cargados con éxito (Archivos JSON):');
  console.log('   - Admin:       admin@coders.app    / Admin123!');
  console.log('   - Team Leader: alex.tl@coders.app  / Tl123!');
  console.log('   - Coder 1:     elena@coders.app    / Coder123!');
  console.log('   - Coder 2:     mateo@coders.app    / Coder123!');
}

seed().catch((err) => {
  console.error('❌ Error ejecutando seed:', err);
  process.exit(1);
});
