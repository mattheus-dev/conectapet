import { useEffect } from 'react'

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [toast, onClose])

  if (!toast) return null

  const isSuccess = toast.type === 'success'

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl text-white text-sm font-medium max-w-sm animate-fade-in ${
        isSuccess ? 'bg-emerald-500' : 'bg-red-500'
      }`}
    >
      <span className="text-base flex-shrink-0">{isSuccess ? '✅' : '❌'}</span>
      <span className="flex-1">{toast.message}</span>
      <button
        onClick={onClose}
        className="ml-1 opacity-70 hover:opacity-100 cursor-pointer text-lg leading-none"
      >
        ×
      </button>
    </div>
  )
}
