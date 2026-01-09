import { CheckCircle2 } from 'lucide-react'
import type { ModuleCard } from '@/lib/dashboard/types'

interface ModuleCardsProps {
  modules: ModuleCard[]
}

export function ModuleCards({ modules }: ModuleCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {modules.map((module, idx) => {
        const Icon = module.icon
        return (
          <div
            key={idx}
            className={`bg-gradient-to-br ${module.gradient} p-6 rounded-xl text-white hover:shadow-lg transition-all cursor-pointer group`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Icon className="w-6 h-6" />
              </div>
              <CheckCircle2 className="w-5 h-5 opacity-70" />
            </div>
            <h4 className="text-lg font-bold mb-1">{module.title}</h4>
            <p className="text-sm opacity-90">{module.description}</p>
          </div>
        )
      })}
    </div>
  )
}
