import { Calendar, Clock, ChevronRight } from 'lucide-react'
import type { UpcomingEvent } from '@/lib/dashboard/types'

interface UpcomingEventsProps {
  events: UpcomingEvent[]
}

export function UpcomingEvents({ events }: UpcomingEventsProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-blue-500" />
        Próximos Eventos
      </h3>
      <div className="space-y-4">
        {events.map((event, idx) => {
          const Icon = event.icon
          return (
            <div
              key={idx}
              className="flex items-center gap-4 p-3 rounded-lg border border-gray-100 hover:border-blue-300 hover:bg-gray-50 transition-all cursor-pointer"
            >
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: event.bgColor }}
              >
                <Icon className="w-5 h-5" style={{ color: event.color }} />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-900">
                  {event.title}
                </h4>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {event.time}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          )
        })}
      </div>
      <button className="w-full mt-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg text-sm font-medium transition-colors">
        Ver Calendario Completo
      </button>
    </div>
  )
}
