# POIMENSOFT

Proyecto Next.js configurado con las siguientes tecnologías:

- **Next.js 14** - Framework React con App Router
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos utilitarios
- **shadcn/ui** - Componentes UI reutilizables
- **Prisma** - ORM para base de datos
- **Zustand** - Gestión de estado global

## 🚀 Inicio Rápido

### Instalación

**IMPORTANTE:** Si encuentras errores `ECONNRESET` durante la instalación de Prisma, usa el script de instalación automático:

```bash
npm install
```

O directamente en PowerShell:
```powershell
powershell -ExecutionPolicy Bypass -File .\install.ps1
```

Este script configura automáticamente el entorno para evitar problemas de descarga de engines de Prisma durante la instalación.

### Configuración de Base de Datos

1. Copia el archivo `.env.example` a `.env`:
```bash
cp .env.example .env
```

2. Configura tu `DATABASE_URL` en el archivo `.env`

3. Genera el cliente de Prisma:
```bash
npm run db:generate
```

4. Crea las tablas en la base de datos:
```bash
npm run db:push
```

5. Pobla la base de datos con usuarios de prueba:
```bash
npm run db:seed
```

### Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Estructura del Proyecto

```
├── app/                 # App Router de Next.js
│   ├── layout.tsx      # Layout principal
│   ├── page.tsx        # Página principal
│   └── globals.css     # Estilos globales
├── components/          # Componentes React
│   └── ui/             # Componentes de shadcn/ui
├── lib/                # Utilidades y configuraciones
│   ├── prisma.ts       # Cliente de Prisma
│   └── utils.ts        # Utilidades generales
├── store/              # Stores de Zustand
│   └── useStore.ts     # Store de ejemplo
└── prisma/             # Configuración de Prisma
    └── schema.prisma   # Schema de la base de datos
```

## 🛠️ Scripts Disponibles

### Desarrollo
- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run start` - Inicia el servidor de producción
- `npm run lint` - Ejecuta ESLint

### Base de Datos
- `npm run db:generate` - Genera el cliente de Prisma
- `npm run db:push` - Sincroniza el schema con la base de datos
- `npm run db:migrate` - Crea una nueva migración
- `npm run db:seed` - Pobla la BD con usuarios de prueba
- `npm run db:studio` - Abre Prisma Studio (GUI para ver la BD)

### Seguridad
- `npm run change-passwords` - Cambia contraseñas de usuarios de prueba (producción)

## 📦 Agregar Componentes de shadcn/ui

Para agregar más componentes de shadcn/ui, puedes usar:

```bash
npx shadcn-ui@latest add [component-name]
```

Ejemplo:
```bash
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
```

## 👥 Usuarios de Prueba

El proyecto incluye un seed que crea usuarios de prueba para cada rol del sistema. Estos usuarios se crean automáticamente al ejecutar `npm run db:seed`.

### Credenciales de Acceso

> **🔒 Nota de Seguridad:** Las credenciales de prueba son generadas por el script `prisma/seed.ts`. 
> Para obtener las credenciales actuales, ejecuta el seed y consulta la salida en consola, o revisa el código fuente del seed.

El seed crea **6 usuarios de prueba**, uno para cada rol:

| Rol | Descripción |
|-----|-------------|
| SUPERADMIN | Acceso total al sistema |
| PASTOR | Gestión pastoral |
| SUPERVISOR | Supervisión de grupos |
| DISCIPULADOR | Gestión de discipulado |
| TESORERO | Gestión financiera |
| ADMINISTRATIVO | Gestión administrativa |

**Para ver las credenciales generadas:**
```bash
# Ejecuta el seed y observa la salida en consola
npm run db:seed

# O revisa el código fuente
cat prisma/seed.ts
```

### Cómo probar el Dashboard

1. **Ejecuta el seed para crear usuarios de prueba:**
   ```bash
   npm run db:seed
   ```
   
   El seed mostrará en consola las credenciales generadas.

2. **Inicia el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

3. **Accede a la aplicación:**
   ```
   http://localhost:3000
   ```

4. **Inicia sesión** con las credenciales mostradas en el paso 1.

5. **Explora las funcionalidades** según el rol del usuario:
   - **SUPERADMIN**: Acceso completo a todas las funcionalidades
   - **PASTOR**: Dashboard pastoral, gestión de miembros
   - **SUPERVISOR**: Supervisión de grupos y actividades
   - **DISCIPULADOR**: Seguimiento de discipulados
   - **TESORERO**: Reportes financieros y transacciones
   - **ADMINISTRATIVO**: Gestión administrativa general

### Regenerar usuarios de prueba

Si necesitas regenerar los usuarios de prueba (solo en desarrollo):

```bash
# Elimina la base de datos actual
npm run db:push -- --force-reset

# Vuelve a crear las tablas
npm run db:push

# Regenera los usuarios de prueba
npm run db:seed
```

## 🔧 Próximos Pasos

- ✅ Configurar autenticación (NextAuth.js) - **COMPLETADO**
- Agregar más modelos a Prisma
- Crear más stores de Zustand según necesidad
- Agregar más componentes de shadcn/ui
- Configurar variables de entorno adicionales

