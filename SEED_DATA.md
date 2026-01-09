# 🌱 Datos de Prueba - POIMENSOFT

## Descripción

Este documento describe los usuarios de prueba creados por el script de seed para probar la aplicación.

## 📋 Usuarios de Prueba

| Email | Password | Rol | ID | Nombre |
|-------|----------|-----|-----|--------|
| `superadmin@poimensoft.com` | `Admin123!` | SUPERADMIN | SAD001 | Super Administrador |
| `pastor@poimensoft.com` | `Admin123!` | PASTOR | PAS001 | Juan Pastor |
| `supervisor@poimensoft.com` | `Admin123!` | SUPERVISOR | SUP001 | María Supervisora |
| `discipulador@poimensoft.com` | `Admin123!` | DISCIPULADOR | DIS001 | Pedro Discipulador |
| `tesorero@poimensoft.com` | `Admin123!` | TESORERO | TES001 | Ana Tesorera |
| `admin@poimensoft.com` | `Admin123!` | ADMINISTRATIVO | ADM001 | Carlos Administrativo |

## 🔑 Contraseña por Defecto

Todos los usuarios de prueba usan la misma contraseña:

```
Admin123!
```

**⚠️ IMPORTANTE:** Cambiar estas contraseñas en producción.

## 👥 Descripción de Roles

### SUPERADMIN (SAD)
- Acceso total al sistema
- Puede gestionar todos los módulos
- Administra usuarios y configuración

### PASTOR (PAS)
- Líder de área o congregación
- Gestiona supervisores y grupos
- Acceso a reportes generales

### SUPERVISOR (SUP)
- Supervisa grupos de discipulado
- Gestiona discipuladores
- Acceso a reportes de su área

### DISCIPULADOR (DIS)
- Gestiona su grupo de discípulos
- Registra asistencia y seguimiento
- Acceso limitado a su grupo

### TESORERO (TES)
- Gestiona finanzas
- Registra ofrendas y diezmos
- Genera reportes financieros

### ADMINISTRATIVO (ADM)
- Gestión administrativa general
- Mantenimiento de datos
- Soporte a otros roles

## 🚀 Ejecutar Seed

### Localmente

```bash
npm run db:seed
```

### En Railway

```bash
railway run npm run db:seed
```

## 📊 Secuencias de IDs

El seed también crea secuencias para generar IDs únicos:

| Prefijo | Rol | Último Número |
|---------|-----|---------------|
| SAD | SUPERADMIN | 1 |
| PAS | PASTOR | 1 |
| SUP | SUPERVISOR | 1 |
| DIS | DISCIPULADOR | 1 |
| TES | TESORERO | 1 |
| ADM | ADMINISTRATIVO | 1 |

## ⚠️ Notas Importantes

1. **Desarrollo vs Producción:**
   - En desarrollo, el seed elimina datos existentes antes de crear nuevos
   - En producción, usa `upsert` para no duplicar registros

2. **Contraseña hasheada:**
   - Las contraseñas se almacenan hasheadas con bcrypt (10 rounds)
   - Nunca se almacena la contraseña en texto plano

3. **Campos requeridos:**
   - Todos los usuarios tienen `emailVerified` establecido
   - Todos aceptaron términos y política de datos

## 🔄 Regenerar Datos

Para regenerar los datos de prueba:

```bash
# Eliminar todos los datos y recrear
npm run db:seed
```

## 🧪 Probar Login

1. Ir a `/login`
2. Usar cualquier email de la tabla
3. Password: `Admin123!`
4. Verificar redirección al dashboard

## 📁 Archivo Seed

El archivo de seed está en:

```
prisma/seed.ts
```

Se ejecuta con el comando definido en `package.json`:

```json
{
  "scripts": {
    "db:seed": "tsx prisma/seed.ts"
  }
}
```
