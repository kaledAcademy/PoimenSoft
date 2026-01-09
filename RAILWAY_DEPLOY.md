# 🚀 Guía de Deploy en Railway - POIMENSOFT

## Requisitos Previos

- Cuenta en [Railway](https://railway.app)
- Node.js 18+ instalado localmente
- Git instalado

## 📋 Paso 1: Configurar Railway

### 1.1 Crear Proyecto y Base de Datos

1. Ve a [railway.app](https://railway.app) e inicia sesión
2. Haz clic en **"New Project"**
3. Selecciona **"Provision PostgreSQL"**
4. Renombra el proyecto a **"POIMENSOFT"**

### 1.2 Copiar DATABASE_URL

1. Haz clic en el servicio **"Postgres"**
2. Ve a la pestaña **"Variables"**
3. Copia el valor de **`DATABASE_URL`**
4. Pégalo en tu archivo `.env` local

### 1.3 Agregar Servicio Next.js

1. Haz clic en **"+ New"**
2. Selecciona **"GitHub Repo"** o **"Empty Service"**
3. Nombra el servicio: **"poimensoft-app"**

### 1.4 Configurar Variables de Entorno

En el servicio de la app, agrega estas variables:

| Variable | Valor |
|----------|-------|
| `DATABASE_URL` | (copiado de Postgres) |
| `JWT_SECRET` | (el valor de tu .env) |
| `NEXTAUTH_SECRET` | (mismo que JWT_SECRET) |
| `NODE_ENV` | `production` |

### 1.5 Generar Dominio

1. Haz clic en el servicio **"poimensoft-app"**
2. Ve a **"Settings"**
3. En **"Networking"**, haz clic en **"Generate Domain"**

## 📋 Paso 2: Deploy

### Opción A: Desde GitHub

```bash
git add .
git commit -m "Setup Railway deployment"
git push origin main
```

Railway detectará el push y desplegará automáticamente.

### Opción B: Con Railway CLI

```bash
# Instalar CLI
npm install -g @railway/cli

# Login
railway login

# Conectar al proyecto
railway link

# Desplegar
railway up
```

## 📋 Paso 3: Ejecutar Migraciones y Seed

```bash
# Ejecutar migraciones en Railway
railway run npm run db:migrate

# Ejecutar seed para crear usuarios de prueba
railway run npm run db:seed
```

## 📋 Paso 4: Verificar Deploy

1. Abre tu dominio de Railway: `https://[tu-app].up.railway.app`
2. Ve a `/login`
3. Usa las credenciales de prueba:
   - **Email:** `superadmin@poimensoft.com`
   - **Password:** `Admin123!`

## 🔧 Comandos Útiles

```bash
# Ver logs en tiempo real
railway logs

# Ver variables de entorno
railway variables

# Ejecutar comando remoto
railway run [comando]

# Abrir Prisma Studio
railway run npx prisma studio

# Ver estado del proyecto
railway status
```

## ⚠️ Troubleshooting

### Error: "P1001: Can't reach database server"
- Verifica que `DATABASE_URL` esté correctamente configurado
- Asegúrate de que el servicio PostgreSQL esté corriendo

### Error: "Cannot find module '@prisma/client'"
- El `buildCommand` en `railway.json` debe incluir `npm run db:generate`

### Error: "Table not found"
- Ejecuta las migraciones: `railway run npm run db:migrate`

### Build falla
- Verifica que todas las variables de entorno estén configuradas
- Revisa los logs del build en Railway

## 🔐 Variables de Entorno Requeridas

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | URL de PostgreSQL | `postgresql://user:pass@host:port/db` |
| `JWT_SECRET` | Secret para JWT (64 bytes) | `abc123...` |
| `NEXTAUTH_SECRET` | Secret para NextAuth | (mismo que JWT_SECRET) |
| `NODE_ENV` | Entorno de ejecución | `production` |

## 📊 Arquitectura en Railway

```
┌─────────────────────────────────────┐
│           Railway Project           │
│           "POIMENSOFT"              │
├─────────────────────────────────────┤
│                                     │
│  ┌──────────────┐  ┌─────────────┐ │
│  │   Postgres   │  │  Next.js    │ │
│  │   Database   │◄─┤    App      │ │
│  │              │  │             │ │
│  └──────────────┘  └─────────────┘ │
│                          │         │
│                          ▼         │
│                    ┌──────────┐    │
│                    │  Domain  │    │
│                    │ *.railway│    │
│                    │   .app   │    │
│                    └──────────┘    │
└─────────────────────────────────────┘
```

## 🎯 Checklist de Deploy

- [ ] Proyecto Railway creado
- [ ] PostgreSQL provisionado
- [ ] DATABASE_URL copiado
- [ ] Variables de entorno configuradas
- [ ] Dominio generado
- [ ] Código desplegado
- [ ] Migraciones ejecutadas
- [ ] Seed ejecutado
- [ ] Login probado exitosamente
