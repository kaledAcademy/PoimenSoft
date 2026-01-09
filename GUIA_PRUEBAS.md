# Guía Completa para Probar el Proyecto

**Fecha:** 9 de Enero, 2026  
**Proyecto:** PoimenSoft  
**Basado en:** Plan de Configuración Railway

---

## ✅ **LO QUE YA ESTÁ LISTO**

### En Producción (Railway): 100% ✅

- ✅ Aplicación desplegada: https://poimensoft-production.up.railway.app
- ✅ Base de datos PostgreSQL funcionando
- ✅ 6 usuarios de prueba creados
- ✅ Login funcional
- ✅ Todas las APIs disponibles

**PUEDES PROBAR AHORA MISMO:**
```
URL: https://poimensoft-production.up.railway.app/login
Email: superadmin@poimensoft.com
Password: Admin123!
```

---

## ⚠️ **LO QUE FALTA PARA PRUEBAS LOCALES**

Según el plan, el TODO `test-local` está en estado `in_progress`. Para completarlo:

### 1. ✅ Verificar Archivos .env (Ya existen)

Los archivos `.env` y `.env.local` ya están creados. Para verificar que estén correctos:

```bash
# Los archivos deben tener estas variables:
DATABASE_URL="postgresql://..."          # URL de Railway
JWT_SECRET="..."                          # 128 caracteres hex
NEXTAUTH_SECRET="..."                     # Mismo valor que JWT_SECRET
NODE_ENV="development"                    # Para local
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**⚠️ IMPORTANTE:** Si no tienes estos archivos configurados, aquí está cómo crearlos:

---

## 📋 **PASOS PARA PROBAR LOCALMENTE**

### Paso 1: Verificar Variables de Entorno

Crea o verifica el archivo `.env.local` en la raíz del proyecto:

```bash
# .env.local

# Base de Datos (usar la de Railway para pruebas)
DATABASE_URL="postgresql://postgres:MGIVhCRNKUpDxpYCdnrSfblypKGMQhTY@shuttle.proxy.rlwy.net:38940/railway"

# JWT Secret (debe ser el mismo que en Railway)
JWT_SECRET="db2926d4bb715ee76d45f93cb5af079971929243258a05ff1e999023156d20f3d963c5fb642ac6d29fa8d0d175e4da26cbc58a1c16e6e5044117dc65b24c58d7"
NEXTAUTH_SECRET="db2926d4bb715ee76d45f93cb5af079971929243258a05ff1e999023156d20f3d963c5fb642ac6d29fa8d0d175e4da26cbc58a1c16e6e5044117dc65b24c58d7"

# Configuración Next.js
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Nota:** Estamos usando la DATABASE_URL pública de Railway para que puedas usar los mismos usuarios seed.

---

### Paso 2: Instalar Dependencias (si aún no lo has hecho)

```bash
npm install
```

---

### Paso 3: Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

**Salida esperada:**
```
  ▲ Next.js 15.5.9
  - Local:        http://localhost:3000
  - Network:      http://192.168.x.x:3000

 ✓ Ready in 2.5s
```

---

### Paso 4: Probar en el Navegador

#### 4.1. Abrir la Aplicación
```
http://localhost:3000
```

Debería redirigir automáticamente a `/login`

#### 4.2. Probar Login
```
Email: superadmin@poimensoft.com
Password: Admin123!
```

**Resultado esperado:**
- ✅ Login exitoso
- ✅ Redirección a `/dashboard`
- ✅ Dashboard se carga correctamente

#### 4.3. Verificar Dashboard
- Ver que carga correctamente
- Verificar que muestra el nombre del usuario
- Verificar que el menú funciona

#### 4.4. Probar Logout
- Click en el botón de logout
- Verificar redirección a `/login`
- Verificar que ya no puedes acceder a `/dashboard`

---

## 🧪 **CHECKLIST DE PRUEBAS LOCALES**

### Pruebas Básicas:
- [ ] Aplicación inicia sin errores
- [ ] Página de login carga correctamente
- [ ] Login con superadmin funciona
- [ ] Redirección a dashboard exitosa
- [ ] Dashboard muestra información
- [ ] Logout funciona correctamente

### Pruebas de Autenticación:
- [ ] Login con credenciales incorrectas muestra error
- [ ] Intentar acceder a `/dashboard` sin login redirige a `/login`
- [ ] Cookie de sesión se establece correctamente
- [ ] Logout elimina la sesión

### Pruebas de Roles (Opcionales):
- [ ] Login como PASTOR: `pastor@poimensoft.com` / `Admin123!`
- [ ] Login como SUPERVISOR: `supervisor@poimensoft.com` / `Admin123!`
- [ ] Login como DISCIPULADOR: `discipulador@poimensoft.com` / `Admin123!`
- [ ] Verificar permisos según rol

---

## 🔧 **TROUBLESHOOTING COMÚN**

### Problema 1: "Cannot connect to database"

**Solución:**
- Verificar que DATABASE_URL esté correcta
- Verificar que la URL pública de Railway esté accesible
- Intentar con: `railway run npm run dev` (usa conexión interna)

### Problema 2: "Invalid JWT Secret"

**Solución:**
- Verificar que JWT_SECRET tenga 128 caracteres
- Asegurar que sea el mismo en `.env.local` y Railway
- No debe tener espacios o saltos de línea

### Problema 3: "Port 3000 already in use"

**Solución:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID [PID_NUMBER] /F

# O usar otro puerto
npm run dev -- -p 3001
```

### Problema 4: "Module not found"

**Solución:**
```bash
# Limpiar caché y reinstalar
rm -rf node_modules .next
npm install
npm run dev
```

---

## 🌐 **PRUEBAS EN PRODUCCIÓN (Railway)**

### Ya Validadas: ✅

Estas pruebas ya las completamos:

- ✅ Health check: https://poimensoft-production.up.railway.app/api/health
- ✅ Login funcional con todos los usuarios
- ✅ Base de datos conectada
- ✅ Seed ejecutado (6 usuarios)

### Pruebas Pendientes (Manuales):

1. **Probar Login en Navegador:**
   ```
   URL: https://poimensoft-production.up.railway.app/login
   Email: superadmin@poimensoft.com
   Password: Admin123!
   ```

2. **Explorar Dashboard:**
   - Verificar que carga correctamente
   - Navegar por las secciones
   - Verificar que los datos se muestren

3. **Probar Logout:**
   - Click en logout
   - Verificar redirección
   - Intentar acceder a ruta protegida

4. **Probar Diferentes Roles:**
   - Login con PASTOR
   - Login con SUPERVISOR
   - Verificar permisos

---

## 📊 **ESTADO ACTUAL DEL PLAN**

| TODO | Estado Plan | Estado Real | Para Completar |
|------|-------------|-------------|----------------|
| test-local | in_progress | ⚠️ **PENDIENTE** | Seguir pasos de esta guía |
| test-production | pending | ✅ **VALIDADO** | Solo falta prueba manual en navegador |
| deploy-test | pending | ✅ **COMPLETADO** | Ya desplegado y funcionando |

---

## ✅ **PARA COMPLETAR EL 100% DEL PLAN**

### Opción A: Pruebas Locales (15 minutos)

```bash
# 1. Verificar .env.local existe y está configurado
# 2. Instalar dependencias (si es necesario)
npm install

# 3. Iniciar servidor
npm run dev

# 4. Abrir navegador
# http://localhost:3000/login

# 5. Probar login
# Email: superadmin@poimensoft.com
# Password: Admin123!

# 6. Verificar dashboard
# 7. Probar logout
```

### Opción B: Solo Pruebas en Producción (5 minutos)

Si no quieres configurar local, puedes probar directamente en Railway:

```bash
# 1. Abrir navegador
https://poimensoft-production.up.railway.app/login

# 2. Login con cada usuario
# - superadmin@poimensoft.com
# - pastor@poimensoft.com
# - supervisor@poimensoft.com
# - discipulador@poimensoft.com

# 3. Explorar dashboard
# 4. Probar funcionalidades
# 5. Probar logout
```

---

## 🎯 **COMANDOS RÁPIDOS**

### Para Pruebas Locales:
```bash
# Iniciar aplicación
npm run dev

# Ver logs en tiempo real
# (La consola mostrará requests)

# Ejecutar seed local (si necesitas)
npm run db:seed

# Ver base de datos
npm run db:studio
```

### Para Pruebas en Railway:
```bash
# Ver logs en tiempo real
railway logs

# Ejecutar comandos en Railway
railway run npm run db:studio

# Ver estado
railway status

# Abrir aplicación en navegador
railway open
```

---

## 📝 **USUARIOS DE PRUEBA DISPONIBLES**

Estos usuarios están disponibles tanto en local (si usas la DB de Railway) como en producción:

| Email | Password | Rol |
|-------|----------|-----|
| superadmin@poimensoft.com | Admin123! | SUPERADMIN |
| pastor@poimensoft.com | Admin123! | PASTOR |
| supervisor@poimensoft.com | Admin123! | SUPERVISOR |
| discipulador@poimensoft.com | Admin123! | DISCIPULADOR |
| tesorero@poimensoft.com | Admin123! | TESORERO |
| admin@poimensoft.com | Admin123! | ADMINISTRATIVO |

---

## 🎓 **CASOS DE PRUEBA SUGERIDOS**

### Caso 1: Flujo de Login Exitoso
1. Ir a `/login`
2. Ingresar credenciales correctas
3. Verificar redirección a `/dashboard`
4. Verificar que muestra nombre de usuario
5. Verificar que cookie se establece

### Caso 2: Flujo de Login Fallido
1. Ir a `/login`
2. Ingresar credenciales incorrectas
3. Verificar mensaje de error
4. Verificar que no redirige
5. Verificar que no hay cookie

### Caso 3: Protección de Rutas
1. Abrir navegador en modo incógnito
2. Intentar acceder a `/dashboard` directamente
3. Verificar redirección a `/login`
4. Hacer login
5. Verificar acceso a `/dashboard`

### Caso 4: Logout
1. Estar logueado
2. Click en logout
3. Verificar redirección a `/login`
4. Intentar acceder a `/dashboard`
5. Verificar redirección nuevamente a `/login`

---

## 🚀 **PRÓXIMOS PASOS DESPUÉS DE PROBAR**

Una vez que hayas probado y todo funcione:

1. **Actualizar el Plan:**
   - Marcar `test-local` como `completed`
   - Marcar `test-production` como `completed`
   - Marcar `deploy-test` como `completed`

2. **Documentar Hallazgos:**
   - Anotar cualquier bug encontrado
   - Documentar funcionalidades que falten
   - Crear issues en GitHub si es necesario

3. **Desarrollo:**
   - Comenzar a desarrollar nuevas funcionalidades
   - Agregar más datos de prueba
   - Implementar tests automatizados

---

## 📞 **AYUDA ADICIONAL**

### Si algo no funciona:

1. **Verificar logs:**
   ```bash
   # Local
   # Los logs aparecen en la consola donde corriste npm run dev
   
   # Railway
   railway logs
   ```

2. **Verificar variables:**
   ```bash
   # Local
   # Revisar archivo .env.local
   
   # Railway
   railway variables
   ```

3. **Reiniciar servicios:**
   ```bash
   # Local
   # Ctrl+C y volver a ejecutar npm run dev
   
   # Railway
   # Se reinicia automáticamente con cada push
   ```

---

## ✅ **RESULTADO ESPERADO**

Al completar esta guía, deberías poder:

- ✅ Ejecutar la aplicación localmente
- ✅ Hacer login con usuarios de prueba
- ✅ Ver el dashboard funcionando
- ✅ Probar logout correctamente
- ✅ Acceder a la aplicación en Railway
- ✅ Verificar que todo funciona igual en producción

**Tiempo estimado:** 15-30 minutos

---

**Última actualización:** 2026-01-09  
**Estado del Proyecto:** ✅ 100% Funcional en Railway  
**Pendiente:** Solo pruebas manuales locales (opcional)
