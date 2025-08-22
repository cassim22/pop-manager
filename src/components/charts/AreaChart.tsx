import React from 'react'
import { AreaChart as RechartsAreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface DataPoint {
  name: string
  [key: string]: string | number
}

interface AreaChartProps {
  title: string
  description?: string
  data: DataPoint[]
  areas: {
    dataKey: string
    stroke: string
    fill: string
    name: string
  }[]
  height?: number
  className?: string
  showGrid?: boolean
  showLegend?: boolean
  stacked?: boolean
}

const AreaChart: React.FC<AreaChartProps> = ({
  title,
  description,
  data,
  areas,
  height = 300,
  className,
  showGrid = true,
  showLegend = true,
  stacked = false
}) => {
  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <RechartsAreaChart 
            data={data} 
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <defs>
              {areas.map((area) => (
                <linearGradient key={area.dataKey} id={`gradient-${area.dataKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={area.stroke} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={area.stroke} stopOpacity={0.1}/>
                </linearGradient>
              ))}
            </defs>
            {showGrid && <CartesianGrid strokeDasharray="3 3" className="opacity-30" />}
            <XAxis 
              dataKey="name" 
              className="text-xs"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
                fontSize: '12px'
              }}
            />
            {showLegend && <Legend />}
            {areas.map((area) => (
              <Area
                key={area.dataKey}
                type="monotone"
                dataKey={area.dataKey}
                stackId={stacked ? "1" : area.dataKey}
                stroke={area.stroke}
                fill={`url(#gradient-${area.dataKey})`}
                strokeWidth={2}
                name={area.name}
              />
            ))}
          </RechartsAreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export default AreaChart