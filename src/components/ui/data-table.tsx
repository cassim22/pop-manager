// React import removed as not used
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { MoreVertical } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

interface Column {
  key: string
  label: string
  render?: (value: any, row: any) => React.ReactNode
  className?: string
  sortable?: boolean
}

interface Action {
  label: string
  icon?: React.ReactNode
  onClick: (row: any) => void
  variant?: 'default' | 'destructive' | 'outline'
  className?: string
}

interface DataTableProps {
  data: any[]
  columns: Column[]
  actions?: Action[]
  loading?: boolean
  emptyMessage?: string
  className?: string
  cardTitle?: (row: any) => string
  cardSubtitle?: (row: any) => string
  cardBadge?: (row: any) => { text: string; variant?: 'default' | 'secondary' | 'destructive' | 'outline' }
}

const DataTable: React.FC<DataTableProps> = ({
  data,
  columns,
  actions = [],
  loading = false,
  emptyMessage = 'Nenhum dado encontrado',
  className,
  cardTitle,
  cardSubtitle,
  cardBadge
}) => {
  if (loading) {
    return (
      <div className={cn('space-y-4', className)}>
        {/* Desktop skeleton */}
        <div className="hidden md:block">
          <div className="border rounded-lg">
            <div className="h-12 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-t-lg" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 border-t bg-gray-50 dark:bg-gray-900 animate-pulse" />
            ))}
          </div>
        </div>
        {/* Mobile skeleton */}
        <div className="md:hidden space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        <div className="text-gray-500 dark:text-gray-400">
          <div className="text-lg font-medium mb-2">Sem dados</div>
          <div className="text-sm">{emptyMessage}</div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={cn(
                      'px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider',
                      column.className
                    )}
                  >
                    {column.label}
                  </th>
                ))}
                {actions.length > 0 && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Ações
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {data.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn(
                        'px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100',
                        column.className
                      )}
                    >
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </td>
                  ))}
                  {actions.length > 0 && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {actions.length === 1 ? (
                        <Button
                          variant={actions[0].variant || 'outline'}
                          size="sm"
                          onClick={() => actions[0].onClick(row)}
                          className={actions[0].className}
                        >
                          {actions[0].icon}
                          {actions[0].label}
                        </Button>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {actions.map((action, actionIndex) => (
                              <DropdownMenuItem
                                key={actionIndex}
                                onClick={() => action.onClick(row)}
                                className={action.className}
                              >
                                {action.icon}
                                {action.label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {data.map((row, index) => {
          const title = cardTitle ? cardTitle(row) : row[columns[0]?.key] || `Item ${index + 1}`
          const subtitle = cardSubtitle ? cardSubtitle(row) : row[columns[1]?.key]
          const badge = cardBadge ? cardBadge(row) : null

          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base font-medium truncate">
                      {title}
                    </CardTitle>
                    {subtitle && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
                        {subtitle}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {badge && (
                      <Badge variant={badge.variant || 'default'} className="text-xs">
                        {badge.text}
                      </Badge>
                    )}
                    {actions.length > 0 && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {actions.map((action, actionIndex) => (
                            <DropdownMenuItem
                              key={actionIndex}
                              onClick={() => action.onClick(row)}
                              className={action.className}
                            >
                              {action.icon}
                              {action.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 gap-3">
                  {columns.slice(cardTitle && cardSubtitle ? 2 : cardTitle || cardSubtitle ? 1 : 0).map((column) => {
                    const value = row[column.key]
                    if (value === undefined || value === null || value === '') return null
                    
                    return (
                      <div key={column.key} className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          {column.label}:
                        </span>
                        <span className="text-sm text-gray-900 dark:text-gray-100 text-right">
                          {column.render ? column.render(value, row) : value}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export default DataTable
export type { Column, Action, DataTableProps }