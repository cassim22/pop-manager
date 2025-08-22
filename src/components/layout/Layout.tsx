import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, 
  Building2, 
  Activity, 
  Users, 
  Zap, 
  Package, 
  Wrench, 
  Map, 
  Camera, 
  FileText, 
  Settings,
  Menu,
  X,
  Search,
  Bell,
  User,
  ChevronDown,
  ChevronLeft,
  LogOut,
  Upload
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

interface LayoutProps {
  children: React.ReactNode
}

const navigationSections = [
  {
    title: 'Principal',
    items: [
      {
        title: 'Dashboard',
        href: '/',
        icon: LayoutDashboard,
        badge: null,
        description: 'Visão geral do sistema'
      }
    ]
  },
  {
    title: 'Infraestrutura',
    items: [
      {
        title: 'POPs',
        href: '/pops',
        icon: Building2,
        badge: null,
        description: 'Pontos de Presença'
      },
      {
        title: 'Mapa',
        href: '/map',
        icon: Map,
        badge: null,
        description: 'Localização dos POPs'
      },
      {
        title: 'Geradores',
        href: '/generators',
        icon: Zap,
        badge: '3',
        description: 'Equipamentos de energia'
      }
    ]
  },
  {
    title: 'Operações',
    items: [
      {
        title: 'Atividades',
        href: '/activities',
        icon: Activity,
        badge: '12',
        description: 'Atividades em andamento'
      },
      {
        title: 'Manutenções',
        href: '/maintenance',
        icon: Wrench,
        badge: '5',
        description: 'Manutenções programadas'
      },
      {
        title: 'Abastecimentos',
        href: '/supplies',
        icon: Package,
        badge: null,
        description: 'Controle de combustível'
      }
    ]
  },
  {
    title: 'Recursos',
    items: [
      {
        title: 'Equipe',
        href: '/team',
        icon: Users,
        badge: null,
        description: 'Gestão de técnicos'
      },
      {
        title: 'Galeria',
        href: '/gallery',
        icon: Camera,
        badge: null,
        description: 'Fotos e evidências'
      },
      {
        title: 'GLPI',
        href: '/glpi',
        icon: Upload,
        badge: 'Novo',
        description: 'Integração GLPI'
      }
    ]
  },
  {
    title: 'Análises',
    items: [
      {
        title: 'Relatórios',
        href: '/reports',
        icon: FileText,
        badge: null,
        description: 'Relatórios e métricas'
      }
    ]
  },
  {
    title: 'Sistema',
    items: [
      {
        title: 'Configurações',
        href: '/settings',
        icon: Settings,
        badge: null,
        description: 'Configurações do sistema'
      }
    ]
  }
]

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const location = useLocation()

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(href)
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 lg:flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 bg-white dark:bg-gray-800 shadow-lg transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto lg:flex-shrink-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full",
        sidebarCollapsed ? "lg:w-16" : "lg:w-64",
        "w-64"
      )}>
        <div className={cn(
          "flex items-center h-16 border-b border-gray-200 dark:border-gray-700",
          sidebarCollapsed ? "justify-center px-2" : "justify-between px-6"
        )}>
          <div className={cn(
            "flex items-center",
            sidebarCollapsed ? "" : "space-x-2"
          )}>
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            {!sidebarCollapsed && (
              <span className="text-xl font-bold text-gray-900 dark:text-white">POPs Manager</span>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              className="hidden lg:flex"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              <ChevronLeft className={cn(
                "h-4 w-4 transition-transform duration-200",
                sidebarCollapsed && "rotate-180"
              )} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <nav className={cn(
          "flex-1 py-6 space-y-6 overflow-y-auto",
          sidebarCollapsed ? "px-2" : "px-4"
        )}>
          {navigationSections.map((section, sectionIndex) => (
            <div key={section.title} className="space-y-2">
              {/* Section Header */}
              {!sidebarCollapsed && (
                <div className="px-3 mb-3">
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {section.title}
                  </h3>
                </div>
              )}
              
              {/* Section Items */}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.href)
                  
                  return (
                    <div key={item.href} className="group relative">
                      <Link
                        to={item.href}
                        className={cn(
                          "flex items-center rounded-lg text-sm font-medium transition-all duration-200 relative",
                          sidebarCollapsed ? "justify-center px-3 py-3" : "justify-between px-3 py-2.5",
                          active
                            ? "bg-primary text-white shadow-sm"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white hover:shadow-sm"
                        )}
                        onClick={() => setSidebarOpen(false)}
                        title={sidebarCollapsed ? `${item.title} - ${item.description}` : item.description}
                      >
                        <div className={cn(
                          "flex items-center",
                          sidebarCollapsed ? "" : "space-x-3"
                        )}>
                          <Icon className={cn(
                            "h-5 w-5 transition-colors",
                            active ? "text-white" : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                          )} />
                          {!sidebarCollapsed && (
                            <span className="truncate">{item.title}</span>
                          )}
                        </div>
                        {item.badge && !sidebarCollapsed && (
                          <Badge 
                            variant={active ? "secondary" : "default"} 
                            className={cn(
                              "text-xs font-medium",
                              active 
                                ? "bg-white/20 text-white border-white/30" 
                                : "bg-gray-100 text-gray-600 border-gray-200"
                            )}
                          >
                            {item.badge}
                          </Badge>
                        )}
                        {item.badge && sidebarCollapsed && (
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
                        )}
                      </Link>
                      
                      {/* Tooltip for desktop */}
                      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 hidden lg:block">
                        {item.description}
                        <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                      </div>
                    </div>
                  )
                })}
              </div>
              
              {/* Separator (except for last section) */}
              {sectionIndex < navigationSections.length - 1 && (
                <div className="border-t border-gray-200 dark:border-gray-700 mt-4"></div>
              )}
            </div>
          ))}
        </nav>

        {/* User info at bottom */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex items-center space-x-3 mb-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                João Silva
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                Administrador • Online
              </p>
            </div>
          </div>
          
          {/* Quick actions */}
          <div className="flex items-center justify-between text-xs">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              <Settings className="h-3 w-3 mr-1" />
              Perfil
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <LogOut className="h-3 w-3 mr-1" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:flex-1 lg:flex lg:flex-col lg:min-h-screen">
        {/* Top header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="hidden lg:flex"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                title={sidebarCollapsed ? "Expandir menu" : "Recolher menu"}
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              {/* Search bar */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <Input
                  type="search"
                  placeholder="Buscar POPs, atividades, técnicos..."
                  className="pl-10 w-80 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  3
                </Badge>
              </Button>

              {/* User menu */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                  </div>
                  <span className="hidden md:block text-sm font-medium text-gray-900 dark:text-white">João Silva</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Perfil
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Configurações
                    </Link>
                    <hr className="my-1 border-gray-200 dark:border-gray-600" />
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => {
                        setUserMenuOpen(false)
                        // Handle logout
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sair
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 bg-gray-50 dark:bg-gray-900 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout