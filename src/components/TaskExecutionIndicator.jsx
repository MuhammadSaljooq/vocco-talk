import { useState, useEffect } from 'react'

/**
 * Component to show when automated tasks are being executed
 */
export default function TaskExecutionIndicator({ task, isExecuting, onComplete }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (isExecuting) {
      setShow(true)
    } else {
      // Hide after animation
      const timer = setTimeout(() => setShow(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [isExecuting])

  if (!show) return null

  return (
    <div className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
      isExecuting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
    }`}>
      <div className="bg-surface-card border border-primary/30 rounded-xl px-6 py-4 shadow-xl backdrop-blur-md flex items-center gap-4 min-w-[300px]">
        <div className="relative">
          {isExecuting ? (
            <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          ) : (
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-lg">check</span>
            </div>
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">
            {isExecuting ? 'Executing Task...' : 'Task Completed'}
          </p>
          <p className="text-xs text-secondary-grey">
            {task}
          </p>
        </div>
      </div>
    </div>
  )
}


