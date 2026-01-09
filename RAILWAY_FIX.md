# Fix para Error de Despliegue en Railway

## Problema Original

El despliegue en Railway fallaba con el error:
```
Error: Cannot find module '/app/scripts/install-wrapper.js'
```

## Causa del Error

El `package.json` tenía un script `install` que se ejecutaba automáticamente durante `npm ci`:

```json
"install": "node scripts/install-wrapper.js"
```

Este script creaba un **bucle infinito** porque:
1. Railway ejecuta `npm ci` para instalar dependencias
2. `npm ci` automáticamente ejecuta el hook `install`
3. El hook intenta ejecutar `scripts/install-wrapper.js`
4. Pero Railway no había copiado la carpeta `scripts/` en esa fase del build
5. El proceso fallaba antes de completar la instalación

## Solución Implementada

### 1. Reemplazar el script `install` por `postinstall`

**Antes:**
```json
"scripts": {
  "install": "node scripts/install-wrapper.js",
  "install:safe": "npm install --ignore-scripts && npm run db:generate"
}
```

**Después:**
```json
"scripts": {
  "postinstall": "prisma generate"
}
```

**Ventajas:**
- ✅ `postinstall` se ejecuta DESPUÉS de que las dependencias estén instaladas
- ✅ Es más simple y directo (solo genera el cliente de Prisma)
- ✅ Es el método estándar recomendado por Prisma
- ✅ Funciona correctamente con Railway/Nixpacks

### 2. Simplificar el `buildCommand` en `railway.json`

**Antes:**
```json
"buildCommand": "npm install && npm run db:generate && npm run build"
```

**Después:**
```json
"buildCommand": "npm run build"
```

**Ventajas:**
- ✅ Railway ya maneja `npm ci` automáticamente
- ✅ `prisma generate` se ejecuta automáticamente con el hook `postinstall`
- ✅ Solo necesitamos ejecutar `build` explícitamente

## Uso Local

Para desarrollo local, ahora puedes usar simplemente:

```bash
# Instalación normal
npm install
# El postinstall generará automáticamente el cliente de Prisma

# Si necesitas regenerar Prisma manualmente
npm run db:generate
```

## Archivos Modificados

1. ✅ `package.json` - Reemplazado script `install` por `postinstall`
2. ✅ `railway.json` - Simplificado `buildCommand`

## Siguiente Paso

Haz commit de estos cambios y despliega nuevamente en Railway:

```bash
git add package.json railway.json RAILWAY_FIX.md
git commit -m "fix: resolver error de despliegue en Railway con install script"
git push origin main
```

El despliegue debería completarse exitosamente ahora. ✨
