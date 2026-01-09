// Wrapper script para npm install que configura el entorno correctamente
// Este script evita la descarga de engines de Prisma durante la instalación
// ejecutando npm install con --ignore-scripts y generando Prisma manualmente después

const path = require('path');
const { spawn } = require('child_process');

// Configurar variables de entorno ANTES de ejecutar npm install
process.env.PRISMA_SKIP_POSTINSTALL_GENERATE = 'true';
process.env.PRISMA_ENGINES_MIRROR = '';
process.env.PRISMA_SKIP_ENV_VALIDATION = 'true';

console.log('📦 Instalando dependencias (evitando descarga de engines de Prisma)...');

const npmInstall = spawn('npm', ['install', '--ignore-scripts'], {
  stdio: 'inherit',
  shell: true,
  env: process.env,
  cwd: path.join(__dirname, '..')
});

npmInstall.on('close', (code) => {
  if (code !== 0) {
    console.error(`\n❌ npm install falló con código ${code}`);
    process.exit(code);
  }
  
  // Generar cliente de Prisma después de la instalación
  console.log('\n📦 Generando cliente de Prisma...');
  
  const prismaGenerate = spawn('npx', ['prisma', 'generate'], {
    stdio: 'inherit',
    shell: true,
    env: process.env,
    cwd: path.join(__dirname, '..')
  });
  
  prismaGenerate.on('close', (generateCode) => {
    if (generateCode !== 0) {
      console.warn(`\n⚠️  prisma generate completó con código ${generateCode}`);
      console.log('Puedes ejecutar manualmente: npm run db:generate');
    } else {
      console.log('\n✅ Instalación completada exitosamente!');
    }
    
    process.exit(generateCode);
  });
  
  prismaGenerate.on('error', (error) => {
    console.error(`\n❌ Error ejecutando prisma generate: ${error.message}`);
    process.exit(1);
  });
});

npmInstall.on('error', (error) => {
  console.error(`\n❌ Error ejecutando npm install: ${error.message}`);
  process.exit(1);
});
