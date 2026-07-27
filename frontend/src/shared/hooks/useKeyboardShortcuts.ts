import { useEffect } from 'react'

interface KeyboardShortcuts {
  onNewTask?: () => void
  onSearch?: () => void
  onEscape?: () => void
}

export function useKeyboardShortcuts({ onNewTask, onSearch, onEscape }: KeyboardShortcuts) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement

      if (e.key === 'Escape' && onEscape) {
        onEscape()
        return
      }

      if ((e.ctrlKey || e.metaKey) && !isInput) {
        if (e.key === 'n' && onNewTask) {
          e.preventDefault()
          onNewTask()
        }
        if (e.key === 'k' && onSearch) {
          e.preventDefault()
          onSearch()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onNewTask, onSearch, onEscape])
}
