'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { BarChart3 } from 'lucide-react'
import type { ChartDataPoint } from '@/lib/dashboard/types'

interface GrowthChartProps {
  data: ChartDataPoint[]
}

export function GrowthChart({ data }: GrowthChartProps) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-500" />
          Crecimiento de la Iglesia
        </h3>
        <select className="bg-gray-100 border border-gray-200 rounded-lg text-sm font-medium px-3 py-1.5 outline-none focus:border-blue-500">
          <option>Últimos 6 meses</option>
          <option>Este año</option>
        </select>
      </div>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e5e5e5"
            />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#737373', fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#737373', fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '8px',
                border: 'none',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                backgroundColor: '#ffffff',
              }}
            />
            <Legend />
            <Bar dataKey="miembros" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
            <Bar dataKey="grupos" fill="#0284c7" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
