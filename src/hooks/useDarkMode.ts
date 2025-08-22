import { useState, useEffect } from 'react'

export const useDarkMode = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Verificar se há preferência salva no localStorage
    const saved = localStorage.getItem('darkMode')
    if (saved !== null) {
      return JSON.parse(saved)
    }
    
    // Se não há preferência salva, usar a preferência do sistema
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    // Salvar preferência no localStorage
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode))
    
    // Aplicar/remover classe dark no documento
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  const toggleDarkMode = () => {
    setIsDarkMode((previous: boolean) => !previous)
  }

  return { isDarkMode, toggleDarkMode }
}