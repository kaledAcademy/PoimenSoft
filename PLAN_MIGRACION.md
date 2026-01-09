# Plan de Migración de Autenticación: Amaxoft → POIMENSOFT

## Estado Actual

### POIMENSOFT (Destino)
- ✅ Proyecto Next.js 14 básico creado
- ✅ Prisma configurado (schema básico)
- ✅ Un componente UI (button.tsx)
- ✅ Estructura app/ básica
- ❌ Sin autenticación
- ❌ Sin middleware
- ❌ Sin rutas API de auth

### Amaxoft (Origen)
- ✅ Sistema de autenticación completo (100%)
- ✅ 18 tests unitarios + E2E
- ✅ Middleware de protección
- ✅ Rutas API completas
- ✅ 30+ componentes UI

---

## Fases de Migración

### FASE 1: Preparación (COMPLETAR AHORA)
- [x] Analizar proyecto POIMENSOFT
- [ ] Actualizar package.json con dependencias
- [ ] Instalar dependencias
- [ ] Crear estructura de carpetas

### FASE 2: Base de Datos
- [ ] Migrar schema.prisma completo
- [ ] Adaptar roles según PRD de POIMENSOFT
- [ ] Ejecutar migración de Prisma
- [ ] Configurar variables de entorno

### FASE 3: Utilidades Core
- [ ] Copiar /lib/jwt-utils.ts
- [ ] Copiar /lib/auth-cookies.ts
- [ ] Copiar /lib/user-transformers.ts
- [ ] Copiar /lib/error-handler.ts
- [ ] Copiar /lib/logger.ts
- [ ] Copiar /lib/http.ts
- [ ] Copiar /lib/prisma.ts

### FASE 4: Validaciones y Tipos
- [ ] Copiar /types/auth.ts
- [ ] Copiar /lib/validations/auth-schemas.ts
- [ ] Copiar /lib/validations/common-schemas.ts

### FASE 5: Rutas API
- [ ] Crear /app/api/auth/login/route.ts
- [ ] Crear /app/api/auth/register/route.ts
- [ ] Crear /app/api/auth/me/route.ts
- [ ] Crear /app/api/auth/logout/route.ts

### FASE 6: Middleware
- [ ] Copiar /middleware.ts (raíz)
- [ ] Copiar /lib/middleware-modules/ (completo)

### FASE 7: Servicios y Stores
- [ ] Copiar /lib/auth.ts (AuthService)
- [ ] Copiar /stores/auth-store.ts

### FASE 8: Componentes UI
- [ ] Instalar componentes shadcn/ui faltantes:
  - input, label, card, form, alert, etc.
- [ ] Copiar estructura de componentes

### FASE 9: Página de Login
- [ ] Crear /app/(auth)/login/page.tsx
- [ ] Adaptar branding a POIMENSOFT
- [ ] Cambiar colores y logo

### FASE 10: Testing (Opcional)
- [ ] Configurar Jest
- [ ] Copiar tests unitarios
- [ ] Configurar Playwright

### FASE 11: Verificación
- [ ] Probar flujo completo de login
- [ ] Probar registro
- [ ] Probar middleware de protección
- [ ] Verificar rutas protegidas

---

## Roles a Adaptar

### Amaxoft (Origen)
```typescript
USST, USPR, USPL, ASIN, ASEX, ADM1, ADM2, CEO1, CEO2, CEO3, CEOM, USSS
```

### POIMENSOFT (Destino - según PRD)
```typescript
SUPERADMIN    - Acceso total al sistema
PASTOR        - Pastores/Líderes de Área
SUPERVISOR    - Supervisores de grupos
DISCIPULADOR  - Discipuladores
TESORERO      - Tesorería
ADMINISTRATIVO - Administrativos
```

---

## Elementos a Remover

- ❌ hasCompletedPurchase (específico de Amaxoft)
- ❌ purchaseDate
- ❌ membershipId
- ❌ Lógica de multi-tenant (simplificar)
- ❌ Google OAuth (por ahora)

---

## Elementos a Mantener

- ✅ HttpOnly cookies
- ✅ JWT tokens (30 días)
- ✅ bcrypt para passwords
- ✅ Rate limiting
- ✅ Audit logging
- ✅ Security headers
- ✅ Validaciones Zod
- ✅ React Hook Form
- ✅ Zustand para state

---

## Próximos Pasos Inmediatos

1. Actualizar package.json
2. Ejecutar `npm install` (puede tardar)
3. Migrar schema de Prisma
4. Configurar .env
5. Comenzar migración de archivos

---

## Notas Importantes

- **NO modificar** archivos de Amaxoft (solo copiar)
- Mantener estructura modular de Amaxoft
- Adaptar branding gradualmente
- Probar cada fase antes de continuar
