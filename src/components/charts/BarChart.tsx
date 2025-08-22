import React from 'react'
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface DataPoint {
  name: string
  [key: string]: string | number
}

interface BarChartProps {
  title: string
  description?: string
  data: DataPoint[]
  bars: {
    dataKey: string
    fill: string
    name: string
  }[]
  height?: number
  className?: string
  showGrid?: boolean
  showLegend?: boolean
  layout?: 'horizontal' | 'vertical'
}

const BarChart: React.FC<BarChartProps> = ({
  title,
  description,
  data,
  bars,
  height = 300,
  className,
  showGrid = true,
  showLegend = true,
  layout = 'vertical'
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
          <RechartsBarChart 
            data={data} 
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            layout={layout}
          >
            {showGrid && <CartesianGrid strokeDasharray="3 3" className="opacity-30" />}
            <XAxis 
              type={layout === 'vertical' ? 'category' : 'number'}
              dataKey={layout === 'vertical' ? 'name' : undefined}
              className="text-xs"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              type={layout === 'vertical' ? 'number' : 'category'}
              dataKey={layout === 'horizontal' ? 'name' : undefined}
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
            {bars.map((bar) => (
              <Bar
                key={bar.dataKey}
                dataKey={bar.dataKey}
                fill={bar.fill}
                name={bar.name}
                radius={[2, 2, 0, 0]}
              />
            ))}
          </RechartsBarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export default BarChart