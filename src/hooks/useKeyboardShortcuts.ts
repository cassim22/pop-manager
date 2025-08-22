import { useEffect, useCallback } from 'react'

interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  altKey?: boolean
  shiftKey?: boolean
  metaKey?: boolean
  callback: () => void
  description: string
}

interface UseKeyboardShortcutsProps {
  shortcuts: KeyboardShortcut[]
  enabled?: boolean
}

const useKeyboardShortcuts = ({ shortcuts, enabled = true }: UseKeyboardShortcutsProps) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return

    // Ignorar se o usuário estiver digitando em um input, textarea ou elemento editável
    const target = event.target as HTMLElement
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.contentEditable === 'true'
    ) {
      return
    }

    shortcuts.forEach(shortcut => {
      const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase()
      const ctrlMatches = !!shortcut.ctrlKey === event.ctrlKey
      const altMatches = !!shortcut.altKey === event.altKey
      const shiftMatches = !!shortcut.shiftKey === event.shiftKey
      const metaMatches = !!shortcut.metaKey === event.metaKey

      if (keyMatches && ctrlMatches && altMatches && shiftMatches && metaMatches) {
        event.preventDefault()
        shortcut.callback()
      }
    })
  }, [shortcuts, enabled])

  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown, enabled])

  return {
    shortcuts: shortcuts.map(s => ({
      key: s.key,
      ctrlKey: s.ctrlKey,
      altKey: s.altKey,
      shiftKey: s.shiftKey,
      metaKey: s.metaKey,
      description: s.description
    }))
  }
}

export default useKeyboardShortcuts
export type { KeyboardShortcut }