'use client'
import { useTheme } from 'next-themes'
import { motion } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="liquid-glass fixed top-6 right-6 w-12 h-12 flex items-center justify-center z-[100] rounded-full shadow-xl"
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === 'dark' ? 0 : 180 }}
        transition={{ type: 'spring', stiffness: 200, damping: 10 }}
      >
        {theme === 'dark' ? (
          <Moon className="text-premiumYellow w-5 h-5 fill-premiumYellow" />
        ) : (
          <Sun className="text-amber-500 w-5 h-5 fill-amber-500" />
        )}
      </motion.div>
    </motion.button>
  )
}