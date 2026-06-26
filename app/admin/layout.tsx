'use client'
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { LayoutDashboard, Package, Receipt, MessageSquare, RefreshCcw, Settings, LogOut } from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState('dashboard');

  const menuItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'products', label: 'Inventory', icon: Package },
    { id: 'invoices', label: 'Sales', icon: Receipt },
    { id: 'enquiries', label: 'Leads', icon: MessageSquare },
    { id: 'trade-ins', label: 'Trade-ins', icon: RefreshCcw },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050505] flex p-4 md:p-6 gap-6">
      {/* Floating Glass Sidebar */}
      <motion.aside 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="hidden lg:flex flex-col w-72 liquid-glass rounded-[2.5rem] border-white/10 p-8 shadow-2xl z-50"
      >
        <div className="text-xl font-display font-black mb-12 dark:text-white">
          FONE<span className="text-premiumYellow">STACK</span>
          <div className="text-[10px] font-mono tracking-[0.3em] opacity-40 uppercase">Admin Console</div>
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 font-medium text-sm
                ${activeTab === item.id 
                  ? 'bg-premiumYellow text-black shadow-lg shadow-premiumYellow/20' 
                  : 'text-slate-500 hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'}`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <button className="flex items-center gap-4 px-6 py-4 rounded-2xl text-red-500 hover:bg-red-500/10 transition-all font-medium text-sm mt-auto">
          <LogOut className="w-5 h-5" /> Sign Out
        </button>
      </motion.aside>

      {/* Main Viewport */}
      <main className="flex-1 overflow-y-auto pr-2">
        <header className="flex justify-between items-center mb-8 px-4">
          <div>
            <h1 className="text-3xl font-display font-black dark:text-white capitalize">{activeTab}</h1>
            <p className="text-xs font-mono opacity-40 dark:text-white uppercase tracking-widest mt-1">Lagos, NG • Live Sync</p>
          </div>
          <div className="flex gap-4">
             <div className="liquid-glass px-4 py-2 rounded-xl text-xs font-bold border-white/10 flex items-center gap-2">
               <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
               Server: Online
             </div>
          </div>
        </header>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  )
}