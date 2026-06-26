'use client'
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Bookmark, MessageCircle, Menu, X } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

export default function Navbar({ wishlistCount, onSearch }: { wishlistCount: number, onSearch: (val: string) => void }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-[90] w-[95%] max-w-7xl px-6 py-3 rounded-2xl transition-all duration-500 
          ${isScrolled ? 'liquid-glass py-2' : 'bg-transparent'}`}
      >
        <div className="flex items-center justify-between gap-8">
          {/* Logo */}
          <a href="#" className="text-2xl font-bold tracking-tighter text-slate-900 dark:text-white font-display">
            FONE<span className="text-premiumYellow">STACK</span>
          </a>

          {/* Search - Liquid Glass Input */}
          <div className="hidden md:flex flex-1 max-w-md relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-premiumYellow transition-colors" />
            <input
              type="text"
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search iPhones, Samsung, Pixel..."
              className="w-full bg-slate-200/50 dark:bg-white/5 border border-white/10 backdrop-blur-md rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-premiumYellow/50 transition-all"
            />
          </div>

          {/* Nav Links */}
          <div className="hidden lg:flex items-center gap-6">
            <NavLink href="#phones">Phones</NavLink>
            <NavLink href="#repair">Repairs</NavLink>
            <button className="relative group flex items-center gap-2 text-sm font-medium hover:text-premiumYellow transition-colors">
              <Bookmark className="w-4 h-4" />
              <span>Saved</span>
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-premiumYellow text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-lg">
                  {wishlistCount}
                </span>
              )}
            </button>
            <a 
              href={`https://wa.me/2349029928322`}
              className="bg-premiumYellow text-black px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:scale-105 transition-transform active:scale-95"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </a>
          </div>

          {/* Mobile Toggle */}
          <button className="lg:hidden text-slate-900 dark:text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu Backdrop */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[85] liquid-glass rounded-none flex flex-col p-8 pt-24 gap-6 lg:hidden"
          >
            <MobileNavLink href="#phones" onClick={() => setIsMobileMenuOpen(false)}>Shop Phones</MobileNavLink>
            <MobileNavLink href="#repair" onClick={() => setIsMobileMenuOpen(false)}>Repairs</MobileNavLink>
            <MobileNavLink href="#about" onClick={() => setIsMobileMenuOpen(false)}>About Us</MobileNavLink>
            <div className="h-px bg-white/10 w-full" />
            <a href="https://wa.me/2349029928322" className="w-full bg-premiumYellow text-black text-center py-4 rounded-2xl font-bold">
              Chat on WhatsApp
            </a>
          </motion.div>
        )}
      </AnimatePresence>
      
      <ThemeToggle />
    </>
  )
}

function NavLink({ href, children }: { href: string, children: React.ReactNode }) {
  return (
    <a href={href} className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-premiumYellow transition-colors">
      {children}
    </a>
  )
}

function MobileNavLink({ href, children, onClick }: { href: string, children: React.ReactNode, onClick: () => void }) {
  return (
    <a href={href} onClick={onClick} className="text-2xl font-bold text-slate-900 dark:text-white">
      {children}
    </a>
  )
}