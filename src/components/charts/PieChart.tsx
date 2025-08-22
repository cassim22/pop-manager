import React from 'react'
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface DataPoint {
  name: string
  value: number
  color?: string
}

interface PieChartProps {
  title: string
  description?: string
  data: DataPoint[]
  height?: number
  className?: string
  showLegend?: boolean
  showLabels?: boolean
  innerRadius?: number
  outerRadius?: number
  colors?: string[]
}

const COLORS = [
  '#0088FE',
  '#00C49F', 
  '#FFBB28',
  '#FF8042',
  '#8884D8',
  '#82CA9D',
  '#FFC658',
  '#FF7C7C',
  '#8DD1E1',
  '#D084D0'
]

const PieChart: React.FC<PieChartProps> = ({
  title,
  description,
  data,
  height = 300,
  className,
  showLegend = true,
  showLabels = true,
  innerRadius = 0,
  outerRadius = 80,
  colors = COLORS
}) => {
  const renderCustomizedLabel = (entry: any) => {
    const percent = ((entry.value / data.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)
    return `${percent}%`
  }

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
          <RechartsPieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={showLabels ? renderCustomizedLabel : false}
              outerRadius={outerRadius}
              innerRadius={innerRadius}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color || colors[index % colors.length]} 
                />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
                fontSize: '12px'
              }}
              formatter={(value: number) => [
                value,
                'Valor'
              ]}
            />
            {showLegend && (
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value) => (
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {value}
                  </span>
                )}
              />
            )}
          </RechartsPieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export default PieChart