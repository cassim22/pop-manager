import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Keyboard, Command } from 'lucide-react'


interface ShortcutItem {
  keys: string[]
  description: string
  category: string
}

const KeyboardShortcutsHelp: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)

  const shortcuts: ShortcutItem[] = [
    {
      keys: ['Ctrl', 'K'],
      description: 'Abrir busca global',
      category: 'Navegação'
    },
    {
      keys: ['/'],
      description: 'Abrir busca global',
      category: 'Navegação'
    },
    {
      keys: ['Ctrl', 'R'],
      description: 'Atualizar dados do dashboard',
      category: 'Ações'
    },
    {
      keys: ['Ctrl', 'D'],
      description: 'Alternar modo escuro/claro',
      category: 'Interface'
    },
    {
      keys: ['Esc'],
      description: 'Fechar modais e diálogos',
      category: 'Navegação'
    },
    {
      keys: ['↑', '↓'],
      description: 'Navegar pelos resultados da busca',
      category: 'Busca'
    },
    {
      keys: ['Enter'],
      description: 'Selecionar item da busca',
      category: 'Busca'
    }
  ]

  const categories = Array.from(new Set(shortcuts.map(s => s.category)))

  const renderKey = (key: string) => {
    const keyMap: Record<string, string> = {
      'Ctrl': '⌃',
      'Alt': '⌥',
      'Shift': '⇧',
      'Enter': '↵',
      'Esc': '⎋'
    }

    return (
      <Badge 
        variant="outline" 
        className="px-2 py-1 text-xs font-mono bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
      >
        {keyMap[key] || key}
      </Badge>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-white hover:bg-white/20"
          title="Atalhos de Teclado"
        >
          <Keyboard className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Command className="h-5 w-5" />
            Atalhos de Teclado
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {categories.map(category => {
            const categoryShortcuts = shortcuts.filter(s => s.category === category)
            
            return (
              <div key={category} className="space-y-3">
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-1">
                  {category}
                </h3>
                
                <div className="space-y-2">
                  {categoryShortcuts.map((shortcut, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                    >
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {shortcut.description}
                      </span>
                      
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <React.Fragment key={keyIndex}>
                            {keyIndex > 0 && (
                              <span className="text-gray-400 text-xs mx-1">+</span>
                            )}
                            {renderKey(key)}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <div className="text-blue-600 dark:text-blue-400 mt-0.5">
              <Command className="h-4 w-4" />
            </div>
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-1">Dica:</p>
              <p>Os atalhos de teclado funcionam em qualquer lugar do sistema, exceto quando você estiver digitando em campos de texto.</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default KeyboardShortcutsHelp