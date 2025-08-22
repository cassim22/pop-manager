import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BreadcrumbItem {
  label: string
  path: string
  icon?: React.ReactNode
}

interface BreadcrumbsProps {
  className?: string
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ className }) => {
  const location = useLocation()
  
  const getPageInfo = (pathname: string): BreadcrumbItem[] => {
    const routes: Record<string, BreadcrumbItem> = {
      '/': { label: 'Dashboard', path: '/', icon: <Home className="h-4 w-4" /> },
      '/pops': { label: 'POPs', path: '/pops' },
      '/activities': { label: 'Atividades', path: '/activities' },
      '/team': { label: 'Equipe', path: '/team' },
      '/generators': { label: 'Geradores', path: '/generators' },
      '/supplies': { label: 'Abastecimentos', path: '/supplies' },
      '/maintenance': { label: 'Manutenções', path: '/maintenance' },
      '/glpi': { label: 'GLPI', path: '/glpi' },
      '/map': { label: 'Mapa', path: '/map' },
      '/gallery': { label: 'Galeria', path: '/gallery' },
      '/reports': { label: 'Relatórios', path: '/reports' },
      '/settings': { label: 'Configurações', path: '/settings' }
    }

    const pathSegments = pathname.split('/').filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = []

    // Sempre incluir o Dashboard como primeiro item
    if (pathname !== '/') {
      breadcrumbs.push(routes['/'])
    }

    // Construir breadcrumbs baseado no caminho atual
    let currentPath = ''
    pathSegments.forEach((segment) => {
      currentPath += `/${segment}`
      const route = routes[currentPath]
      if (route) {
        breadcrumbs.push(route)
      }
    })

    return breadcrumbs
  }

  const breadcrumbs = getPageInfo(location.pathname)

  if (breadcrumbs.length <= 1) {
    return null
  }

  return (
    <nav className={cn('flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400', className)}>
      {breadcrumbs.map((breadcrumb, index) => {
        const isLast = index === breadcrumbs.length - 1
        
        return (
          <React.Fragment key={breadcrumb.path}>
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-gray-400" />
            )}
            
            {isLast ? (
              <span className="flex items-center space-x-1 font-medium text-gray-900 dark:text-white">
                {breadcrumb.icon}
                <span>{breadcrumb.label}</span>
              </span>
            ) : (
              <Link
                to={breadcrumb.path}
                className="flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {breadcrumb.icon}
                <span>{breadcrumb.label}</span>
              </Link>
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}

export default Breadcrumbs