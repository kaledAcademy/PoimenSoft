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

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run start` - Inicia el servidor de producción
- `npm run lint` - Ejecuta ESLint
- `npm run db:generate` - Genera el cliente de Prisma
- `npm run db:push` - Sincroniza el schema con la base de datos
- `npm run db:migrate` - Crea una nueva migración
- `npm run db:studio` - Abre Prisma Studio

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

## 🔧 Próximos Pasos

- Configurar autenticación (NextAuth.js)
- Agregar más modelos a Prisma
- Crear más stores de Zustand según necesidad
- Agregar más componentes de shadcn/ui
- Configurar variables de entorno adicionales

