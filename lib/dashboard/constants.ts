import {
  Users,
  UserPlus,
  Home,
  GraduationCap,
  BarChart3,
  Settings,
  CheckCircle2,
  Calendar,
  Clock,
} from 'lucide-react'
import type {
  NavigationItem,
  StatItem,
  ChartDataPoint,
  PieDataItem,
  RecentMember,
  UpcomingEvent,
  ModuleCard,
} from './types'

export const NAVIGATION: NavigationItem[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    icon: BarChart3,
  },
  {
    id: 'ganar',
    name: 'Ganar',
    icon: UserPlus,
  },
  {
    id: 'afirmar',
    name: 'Afirmar',
    icon: CheckCircle2,
  },
  {
    id: 'discipular',
    name: 'Discipular',
    icon: GraduationCap,
  },
  {
    id: 'enviar',
    name: 'Enviar',
    icon: Home,
  },
  {
    id: 'administracion',
    name: 'Administración',
    icon: Users,
  },
  {
    id: 'configuracion',
    name: 'Configuración',
    icon: Settings,
  },
]

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
  {
    label: 'Nuevos Contactos',
    value: '42',
    change: '+5%',
    trend: 'up',
    icon: UserPlus,
    color: '#0284c7',
    bgColor: '#e0f2fe',
  },
  {
    label: 'Grupos Activos',
    value: '86',
    change: '+2',
    trend: 'up',
    icon: Home,
    color: '#0369a1',
    bgColor: '#bae6fd',
  },
  {
    label: 'En Formación',
    value: '156',
    change: '+18%',
    trend: 'up',
    icon: GraduationCap,
    color: '#075985',
    bgColor: '#7dd3fc',
  },
]

export const GROWTH_CHART_DATA: ChartDataPoint[] = [
  { month: 'Ene', miembros: 1100, grupos: 70 },
  { month: 'Feb', miembros: 1140, grupos: 72 },
  { month: 'Mar', miembros: 1180, grupos: 75 },
  { month: 'Abr', miembros: 1210, grupos: 78 },
  { month: 'May', miembros: 1250, grupos: 82 },
  { month: 'Jun', miembros: 1284, grupos: 86 },
]

export const PIE_DATA: PieDataItem[] = [
  {
    name: 'Miembros',
    value: 850,
    color: '#0ea5e9',
  },
  {
    name: 'Visitantes',
    value: 240,
    color: '#0284c7',
  },
  {
    name: 'En Proceso',
    value: 194,
    color: '#38bdf8',
  },
]

export const RECENT_MEMBERS: RecentMember[] = [
  {
    id: 1,
    name: 'Carlos Mendoza',
    date: 'Hace 2 horas',
    status: 'Nuevo',
    email: 'c.mendoza@email.com',
    statusColor: 'primary',
  },
  {
    id: 2,
    name: 'Elena Rodríguez',
    date: 'Hace 5 horas',
    status: 'Visitante',
    email: 'elena.r@email.com',
    statusColor: 'info',
  },
  {
    id: 3,
    name: 'Roberto Sánchez',
    date: 'Ayer',
    status: 'Bautismo',
    email: 'rsanchez@email.com',
    statusColor: 'success',
  },
  {
    id: 4,
    name: 'Ana Lucía Gómez',
    date: 'Hace 2 días',
    status: 'Traslado',
    email: 'analucia@email.com',
    statusColor: 'warning',
  },
]

export const UPCOMING_EVENTS: UpcomingEvent[] = [
  {
    title: 'Reunión de Grupos en Casa',
    time: 'Hoy, 7:00 PM',
    type: 'Grupo',
    icon: Home,
    color: '#0369a1',
    bgColor: '#bae6fd',
  },
  {
    title: 'Clase de Discipulado Nivel 1',
    time: 'Mañana, 6:30 PM',
    type: 'Formación',
    icon: GraduationCap,
    color: '#075985',
    bgColor: '#7dd3fc',
  },
  {
    title: 'Salida de Evangelismo',
    time: 'Sábado, 10:00 AM',
    type: 'Outreach',
    icon: UserPlus,
    color: '#0284c7',
    bgColor: '#e0f2fe',
  },
  {
    title: 'Servicio Dominical Principal',
    time: 'Dom, 11:00 AM',
    type: 'Servicio',
    icon: Users,
    color: '#0ea5e9',
    bgColor: '#f0f9ff',
  },
]

export const MODULE_CARDS: ModuleCard[] = [
  {
    title: 'Membresía',
    description: 'Control total de datos de feligreses.',
    icon: Users,
    color: '#0ea5e9',
    gradient: 'from-[#0ea5e9] to-[#0284c7]',
  },
  {
    title: 'Evangelismo',
    description: 'Seguimiento de prospectos y visitas.',
    icon: UserPlus,
    color: '#0284c7',
    gradient: 'from-[#0284c7] to-[#0369a1]',
  },
  {
    title: 'Grupos en Casa',
    description: 'Liderazgo y ubicación de células.',
    icon: Home,
    color: '#0369a1',
    gradient: 'from-[#0369a1] to-[#075985]',
  },
  {
    title: 'Discipulado',
    description: 'Avance espiritual y formación.',
    icon: GraduationCap,
    color: '#075985',
    gradient: 'from-[#075985] to-[#0c4a6e]',
  },
]
