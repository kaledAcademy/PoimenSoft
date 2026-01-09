# Solución de Problemas de Instalación

Si encuentras errores durante `npm install` relacionados con Prisma (especialmente `ECONNRESET`), prueba las siguientes soluciones:

## Solución 1: Instalación Segura (Recomendada)

```bash
npm run install:safe
```

Este comando instala todas las dependencias sin ejecutar scripts post-instalación, y luego genera el cliente de Prisma manualmente.

## Solución 2: Limpiar Caché y Reinstalar

```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

En Windows PowerShell:
```powershell
npm cache clean --force
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install
```

## Solución 3: Instalar Prisma por Separado

Si la instalación falla específicamente en Prisma:

```bash
# Instalar todas las dependencias excepto Prisma
npm install --ignore-scripts

# Instalar Prisma por separado
npm install prisma @prisma/client --save-dev --save

# Generar cliente de Prisma
npm run db:generate
```

## Solución 4: Usar Variables de Entorno

Configura estas variables antes de instalar:

**Windows PowerShell:**
```powershell
$env:PRISMA_SKIP_POSTINSTALL_GENERATE="true"
npm install
npm run db:generate
```

**Windows CMD:**
```cmd
set PRISMA_SKIP_POSTINSTALL_GENERATE=true
npm install
npm run db:generate
```

**Linux/Mac:**
```bash
PRISMA_SKIP_POSTINSTALL_GENERATE=true npm install
npm run db:generate
```

## Solución 5: Usar un Mirror Alternativo

Si tienes problemas de conectividad, puedes configurar un mirror:

```bash
npm config set registry https://registry.npmjs.org/
npm install
```

## Solución 6: Verificar Conectividad

El error `ECONNRESET` generalmente indica problemas de red. Verifica:

1. Tu conexión a internet está activa
2. No hay firewall bloqueando npm/Prisma
3. No estás detrás de un proxy corporativo restrictivo

Si estás detrás de un proxy, configura npm:
```bash
npm config set proxy http://proxy-server:port
npm config set https-proxy http://proxy-server:port
```

## Después de la Instalación Exitosa

Una vez que la instalación sea exitosa, asegúrate de:

1. Crear el archivo `.env` con tu `DATABASE_URL`
2. Ejecutar `npm run db:generate` para generar el cliente de Prisma
3. Ejecutar `npm run db:push` para crear las tablas en tu base de datos
