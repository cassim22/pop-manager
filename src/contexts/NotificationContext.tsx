import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { toast } from 'sonner'

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  timestamp: Date
  read: boolean
  actionUrl?: string
  actionLabel?: string
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearAll: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

interface NotificationProviderProps {
  children: ReactNode
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Sistema Online',
      message: 'Todos os sistemas estão operacionais',
      type: 'success',
      timestamp: new Date(),
      read: false
    },
    {
      id: '2',
      title: 'Manutenção Agendada',
      message: 'Manutenção preventiva no POP Central agendada para amanhã às 14h',
      type: 'info',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      read: false,
      actionUrl: '/maintenance',
      actionLabel: 'Ver Detalhes'
    },
    {
      id: '3',
      title: 'Alerta de Capacidade',
      message: 'POP Norte atingiu 85% da capacidade',
      type: 'warning',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: true,
      actionUrl: '/pops',
      actionLabel: 'Verificar'
    }
  ])

  const unreadCount = notifications.filter(n => !n.read).length

  const addNotification = useCallback((notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false
    }

    setNotifications(prev => [newNotification, ...prev])
    
    // Mostrar toast baseado no tipo
    switch (notificationData.type) {
      case 'success':
        toast.success(notificationData.title, { description: notificationData.message })
        break
      case 'error':
        toast.error(notificationData.title, { description: notificationData.message })
        break
      case 'warning':
        toast.warning(notificationData.title, { description: notificationData.message })
        break
      default:
        toast.info(notificationData.title, { description: notificationData.message })
    }
  }, [])

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    )
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    )
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}