import { LucideIcon } from 'lucide-react'

export interface NavigationItem {
  id: string
  name: string
  icon: LucideIcon
}

export interface StatItem {
  label: string
  value: string
  change: string
  trend: 'up' | 'down'
  icon: LucideIcon
  color: string
  bgColor: string
}

export interface ChartDataPoint {
  month: string
  miembros: number
  grupos: number
}

export interface PieDataItem {
  name: string
  value: number
  color: string
}

export interface RecentMember {
  id: number
  name: string
  date: string
  status: string
  email: string
  statusColor: 'primary' | 'info' | 'success' | 'warning'
}

export interface UpcomingEvent {
  title: string
  time: string
  type: string
  icon: LucideIcon
  color: string
  bgColor: string
}

export interface ModuleCard {
  title: string
  description: string
  icon: LucideIcon
  color: string
  gradient: string
}
