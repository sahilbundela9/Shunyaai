import { useEffect, useState } from 'react'

export function useTheme() {
  const [theme, setTheme] = useState('dark')

  // Initialize theme on mount
  useEffect(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      setTheme(savedTheme)
      applyTheme(savedTheme)
    } else {
      // Fall back to system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const detectedTheme = prefersDark ? 'dark' : 'light'
      setTheme(detectedTheme)
      applyTheme(detectedTheme)
    }
  }, [])

  const applyTheme = (themeName) => {
    document.documentElement.setAttribute('data-theme', themeName)
    localStorage.setItem('theme', themeName)
  }

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    applyTheme(newTheme)
  }

  const setCurrentTheme = (themeName) => {
    setTheme(themeName)
    applyTheme(themeName)
  }

  return {
    theme,
    toggleTheme,
    setCurrentTheme,
  }
}
