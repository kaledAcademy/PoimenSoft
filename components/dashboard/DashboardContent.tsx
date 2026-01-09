'use client'

import { PlusCircle } from 'lucide-react'
import { StatCard } from './StatCard'
import { GrowthChart } from './GrowthChart'
import { DistributionChart } from './DistributionChart'
import { RecentMembers } from './RecentMembers'
import { UpcomingEvents } from './UpcomingEvents'
import { ModuleCards } from './ModuleCards'
import { Button } from '@/components/ui/button'
import {
  STATS_DATA,
  GROWTH_CHART_DATA,
  PIE_DATA,
  RECENT_MEMBERS,
  UPCOMING_EVENTS,
  MODULE_CARDS,
  NAVIGATION,
} from '@/lib/dashboard/constants'

interface DashboardContentProps {
  activeTab: string
}

export function DashboardContent({ activeTab }: DashboardContentProps) {
  const currentPage = NAVIGATION.find((n) => n.id === activeTab)

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[1536px] mx-auto p-8 space-y-8">
        {/* Page Header */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              {currentPage?.name || 'Dashboard'}
            </h1>
            <p className="text-gray-500">
              Resumen general de las actividades de hoy
            </p>
          </div>
          <Button className="flex items-center gap-2 shadow-lg">
            <PlusCircle className="w-5 h-5" />
            <span>Nuevo Registro</span>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS_DATA.map((item, idx) => (
            <StatCard key={idx} item={item} />
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <GrowthChart data={GROWTH_CHART_DATA} />
          <DistributionChart data={PIE_DATA} />
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentMembers members={RECENT_MEMBERS} />
          <UpcomingEvents events={UPCOMING_EVENTS} />
        </div>

        {/* Module Cards */}
        <ModuleCards modules={MODULE_CARDS} />
      </div>
    </div>
  )
}
