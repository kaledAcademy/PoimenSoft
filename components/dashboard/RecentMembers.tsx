import type { RecentMember } from '@/lib/dashboard/types'

interface RecentMembersProps {
  members: RecentMember[]
}

const statusColorClasses = {
  primary: 'bg-blue-50 text-blue-700',
  info: 'bg-blue-50 text-blue-800',
  success: 'bg-green-50 text-green-700',
  warning: 'bg-yellow-50 text-yellow-700',
}

export function RecentMembers({ members }: RecentMembersProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">
          Nuevos Miembros
        </h3>
        <button className="text-blue-500 text-sm font-medium hover:underline">
          Ver todos
        </button>
      </div>
      <div className="divide-y divide-gray-100">
        {members.map((member) => (
          <div
            key={member.id}
            className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-sm font-semibold">
              {member.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">
                {member.name}
              </p>
              <p className="text-xs text-gray-500">{member.email}</p>
            </div>
            <div className="text-right">
              <span
                className={`text-xs px-2 py-1 rounded-md font-medium ${statusColorClasses[member.statusColor]}`}
              >
                {member.status}
              </span>
              <p className="text-xs text-gray-400 mt-1">{member.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
