'use client'

import type { NavigationItem } from '@/lib/dashboard/types'

interface SidebarProps {
  navigation: NavigationItem[]
  activeTab: string
  onTabChange: (tab: string) => void
  isOpen?: boolean
}

export function Sidebar({
  navigation,
  activeTab,
  onTabChange,
  isOpen = true,
}: SidebarProps) {
  return (
    <aside
      className={`${
        isOpen ? 'w-60' : 'w-20'
      } bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}
    >
      {/* Logo */}
      <div
        className={`${
          isOpen ? 'h-24' : 'h-20'
        } px-4 flex items-center justify-center border-b border-gray-200 transition-all duration-300 flex-shrink-0`}
      >
        <div
          className={`${
            isOpen ? 'w-20 h-20' : 'w-10 h-10'
          } rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl transition-all duration-300`}
        >
          {isOpen ? 'POIMEN' : 'P'}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        <div
          className={`mb-4 px-3 transition-opacity duration-300 ${
            isOpen ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {isOpen && (
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Principal
            </p>
          )}
        </div>
        {navigation.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                activeTab === item.id
                  ? 'bg-blue-50 text-blue-500 font-semibold'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {isOpen && <span className="text-sm">{item.name}</span>}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        {isOpen && (
          <p className="text-xs text-gray-400 text-center">© 2024 Poimen</p>
        )}
      </div>
    </aside>
  )
}
