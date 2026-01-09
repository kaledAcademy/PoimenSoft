import { TrendingUp } from 'lucide-react'
import type { StatItem } from '@/lib/dashboard/types'

interface StatCardProps {
  item: StatItem
}

export function StatCard({ item }: StatCardProps) {
  const Icon = item.icon

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all duration-200">
      <div className="flex justify-between items-start mb-4">
        <div
          className="p-3 rounded-lg"
          style={{ backgroundColor: item.bgColor }}
        >
          <Icon className="w-6 h-6" style={{ color: item.color }} />
        </div>
        <span className="text-green-500 text-xs font-semibold flex items-center gap-0.5">
          {item.change}
          <TrendingUp className="w-3 h-3" />
        </span>
      </div>
      <h3 className="text-gray-500 text-sm font-medium mb-1">{item.label}</h3>
      <p className="text-3xl font-bold text-gray-900">{item.value}</p>
    </div>
  )
}
