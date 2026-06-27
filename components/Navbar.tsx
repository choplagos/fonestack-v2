'use client'
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Bookmark, MessageCircle, Menu, X } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

export default function Navbar({ wishlistCount, onSearch }: { wishlistCount: number, onSearch: (val: string) => void }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [mobileSearch, setMobileSearch] = useState('')

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleMobileSearch = (val: string) => {
    setMobileSearch(val)
    onSearch(val)
  }

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-[90] w-[95%] max-w-7xl px-4 md:px-6 py-3 rounded-2xl transition-all duration-500
          ${isScrolled ? 'liquid-glass py-2' : 'bg-transparent'}`}
      >
        <div className="flex items-center justify-between gap-4 md:gap-8">
          {/* Logo */}
          <a href="#" className="text-xl md:text-2xl font-bold tracking-tighter text-slate-900 dark:text-white font-display flex-shrink-0">
            FONE<span className="text-premiumYellow">STACK</span>
          </a>

          {/* Search - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-premiumYellow transition-colors" />
            <input
              type="text"
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search iPhones, Samsung, Pixel..."
              style={{ fontSize: '16px' }}
              className="w-full bg-slate-200/50 dark:bg-white/5 border border-white/10 backdrop-blur-md rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-premiumYellow/50 transition-all"
            />
          </div>

          {/* Nav Links - Desktop */}
          <div className="hidden lg:flex items-center gap-6">
            <NavLink href="#phones">Phones</NavLink>
            <NavLink href="#trade-in">Trade-In</NavLink>
            <NavLink href="#repair">Repairs</NavLink>
            <button className="relative flex items-center gap-2 text-sm font-medium hover:text-premiumYellow transition-colors dark:text-slate-300">
              <Bookmark className="w-4 h-4" />
              <span>Saved</span>
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-premiumYellow text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg">
                  {wishlistCount}
                </span>
              )}
            </button>
            <a
              href="https://wa.me/2349029928322"
              className="bg-premiumYellow text-black px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:scale-105 transition-transform active:scale-95"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </a>
          </div>

          {/* Mobile right side */}
          <div className="flex lg:hidden items-center gap-2">
            {wishlistCount > 0 && (
              <div className="relative p-2">
                <Bookmark className="w-5 h-5 text-slate-900 dark:text-white" />
                <span className="absolute top-0 right-0 bg-premiumYellow text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              </div>
            )}
            {/* Hamburger — 44px tap target */}
            <button
              className="p-3 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-900 dark:text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar — explicit 16px font prevents iOS zoom */}
        <div className="md:hidden mt-3 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={mobileSearch}
            onChange={(e) => handleMobileSearch(e.target.value)}
            placeholder="Search phones..."
            style={{ fontSize: '16px' }}
            className="w-full bg-slate-200/50 dark:bg-white/5 border border-white/10 backdrop-blur-md rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-premiumYellow/50 transition-all"
          />
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[85] liquid-glass flex flex-col p-6 pt-28 gap-5 lg:hidden overflow-y-auto"
          >
            <MobileNavLink href="#phones" onClick={() => setIsMobileMenuOpen(false)}>Shop Phones</MobileNavLink>
            <MobileNavLink href="#brands" onClick={() => setIsMobileMenuOpen(false)}>Brands</MobileNavLink>
            <MobileNavLink href="#trade-in" onClick={() => setIsMobileMenuOpen(false)}>Trade-In</MobileNavLink>
            <MobileNavLink href="#repair" onClick={() => setIsMobileMenuOpen(false)}>Repairs</MobileNavLink>
            <MobileNavLink href="#how" onClick={() => setIsMobileMenuOpen(false)}>How It Works</MobileNavLink>
            <MobileNavLink href="#faq" onClick={() => setIsMobileMenuOpen(false)}>FAQ</MobileNavLink>
            <div className="h-px bg-white/10 w-full" />
            <a
              href="https://wa.me/2349029928322"
              className="w-full bg-premiumYellow text-black text-center py-4 rounded-2xl font-bold text-lg min-h-[52px] flex items-center justify-center"
            >
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
    <a href={href} onClick={onClick} className="text-2xl font-bold text-slate-900 dark:text-white py-1 min-h-[44px] flex items-center">
      {children}
    </a>
  )
}