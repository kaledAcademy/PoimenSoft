# Estructura del Dashboard

Este documento describe la arquitectura modular del dashboard implementado en POIMENSOFT.

## Arquitectura

El dashboard está diseñado siguiendo principios de **Clean Code** y **arquitectura modular**:

```
app/
  └── dashboard/
      └── page.tsx              # Página principal del dashboard

components/
  └── dashboard/
      ├── Sidebar.tsx           # Barra lateral de navegación
      ├── Header.tsx            # Encabezado superior
      ├── DashboardContent.tsx  # Contenedor principal del contenido
      ├── StatCard.tsx          # Tarjeta de estadísticas
      ├── GrowthChart.tsx       # Gráfico de crecimiento
      ├── DistributionChart.tsx # Gráfico de distribución (pie)
      ├── RecentMembers.tsx    # Lista de miembros recientes
      ├── UpcomingEvents.tsx    # Próximos eventos
      └── ModuleCards.tsx       # Tarjetas de módulos

lib/
  └── dashboard/
      ├── types.ts              # Definiciones de tipos TypeScript
      └── constants.ts          # Constantes y datos mock
```

## Principios de Diseño

### 1. Separación de Responsabilidades
- **Componentes UI**: Solo se encargan de la presentación
- **Lógica de datos**: Centralizada en `lib/dashboard/constants.ts`
- **Tipos**: Definidos en `lib/dashboard/types.ts`

### 2. Componentes Modulares
Cada componente es independiente y reutilizable:
- `StatCard`: Muestra una estadística individual
- `GrowthChart`: Gráfico de barras para crecimiento
- `DistributionChart`: Gráfico de pastel para distribución
- `RecentMembers`: Lista de miembros recientes
- `UpcomingEvents`: Lista de eventos próximos
- `ModuleCards`: Tarjetas de módulos del sistema

### 3. TypeScript Estricto
Todos los componentes están tipados con interfaces TypeScript:
- `NavigationItem`: Elementos de navegación
- `StatItem`: Datos de estadísticas
- `ChartDataPoint`: Puntos de datos para gráficos
- `PieDataItem`: Datos para gráfico de pastel
- `RecentMember`: Información de miembros
- `UpcomingEvent`: Información de eventos
- `ModuleCard`: Información de módulos

### 4. Datos Mock Centralizados
Todos los datos de ejemplo están en `lib/dashboard/constants.ts`:
- `NAVIGATION`: Menú de navegación
- `STATS_DATA`: Estadísticas principales
- `GROWTH_CHART_DATA`: Datos para gráfico de crecimiento
- `PIE_DATA`: Datos para gráfico de distribución
- `RECENT_MEMBERS`: Miembros recientes
- `UPCOMING_EVENTS`: Eventos próximos
- `MODULE_CARDS`: Tarjetas de módulos

## Uso

### Acceder al Dashboard
```typescript
// Navegar a /dashboard
import Link from 'next/link'
<Link href="/dashboard">Ir al Dashboard</Link>
```

### Personalizar Datos
Para cambiar los datos mostrados, edita `lib/dashboard/constants.ts`:

```typescript
export const STATS_DATA: StatItem[] = [
  {
    label: 'Total Miembros',
    value: '1,284',
    change: '+12%',
    trend: 'up',
    icon: Users,
    color: '#0ea5e9',
    bgColor: '#f0f9ff',
  },
  // ... más estadísticas
]
```

### Agregar Nuevos Componentes
1. Crear el componente en `components/dashboard/`
2. Definir tipos en `lib/dashboard/types.ts` si es necesario
3. Importar y usar en `DashboardContent.tsx`

## Características

- ✅ **Modular**: Cada componente es independiente
- ✅ **Tipado**: TypeScript estricto en todo el código
- ✅ **Reutilizable**: Componentes pueden usarse en otros contextos
- ✅ **Mantenible**: Código limpio y bien organizado
- ✅ **Escalable**: Fácil agregar nuevas funcionalidades
- ✅ **Moderno**: Usa Next.js 14 App Router y React 18

## Próximos Pasos

Para integrar con datos reales:
1. Crear hooks personalizados para fetch de datos
2. Integrar con Prisma para obtener datos de la base de datos
3. Agregar estado global con Zustand si es necesario
4. Implementar paginación y filtros
