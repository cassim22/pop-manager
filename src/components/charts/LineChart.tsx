import React from 'react'
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface DataPoint {
  name: string
  [key: string]: string | number
}

interface LineChartProps {
  title: string
  description?: string
  data: DataPoint[]
  lines: {
    dataKey: string
    stroke: string
    name: string
  }[]
  height?: number
  className?: string
  showGrid?: boolean
  showLegend?: boolean
}

const LineChart: React.FC<LineChartProps> = ({
  title,
  description,
  data,
  lines,
  height = 300,
  className,
  showGrid = true,
  showLegend = true
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
          <RechartsLineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
            {lines.map((line) => (
              <Line
                key={line.dataKey}
                type="monotone"
                dataKey={line.dataKey}
                stroke={line.stroke}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                name={line.name}
              />
            ))}
          </RechartsLineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export default LineChart