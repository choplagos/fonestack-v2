'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Package, Clock, CheckCircle } from 'lucide-react'

export default function AdminDashboard() {
  const stats = [
    { label: 'Revenue (30d)', value: '₦42.5M', trend: '+12.5%', icon: TrendingUp, color: 'text-green-500' },
    { label: 'Active Inventory', value: '142', trend: '8 Low Stock', icon: Package, color: 'text-premiumYellow' },
    { label: 'Pending Orders', value: '12', trend: 'Requires Action', icon: Clock, color: 'text-blue-500' },
    { label: 'Completed Sales', value: '89', trend: 'This Month', icon: CheckCircle, color: 'text-purple-500' },
  ];

  return (
    <div className="space-y-8 p-4">
      {/* Stat Lens Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -5 }}
            className="liquid-glass p-8 rounded-[2.5rem] border-white/5 relative overflow-hidden"
          >
            {/* Subtle radial glow */}
            <div className={`absolute top-[-20%] right-[-20%] w-32 h-32 blur-3xl opacity-20 rounded-full ${stat.color.replace('text-', 'bg-')}`} />
            
            <stat.icon className={`w-8 h-8 ${stat.color} mb-6`} />
            <div className="text-sm font-mono opacity-40 uppercase tracking-widest mb-1">{stat.label}</div>
            <div className="text-3xl font-display font-black dark:text-white">{stat.value}</div>
            <div className="mt-4 text-[10px] font-bold py-1 px-3 bg-white/5 rounded-full w-fit">
              {stat.trend}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity Glass Table */}
      <div className="liquid-glass rounded-[2.5rem] border-white/5 p-8">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-bold dark:text-white">Recent Transactions</h3>
          <button className="text-xs font-mono text-premiumYellow hover:underline">View All Sales</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-[10px] font-mono uppercase tracking-widest opacity-40">
                <th className="pb-4 px-4">Invoice</th>
                <th className="pb-4 px-4">Customer</th>
                <th className="pb-4 px-4">Device</th>
                <th className="pb-4 px-4">Amount</th>
                <th className="pb-4 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="group hover:bg-white/5 transition-colors">
                  <td className="py-4 px-4 font-mono text-xs text-premiumYellow">#FST-102{i}</td>
                  <td className="py-4 px-4 font-medium dark:text-white text-sm">Customer Name</td>
                  <td className="py-4 px-4 text-slate-400 text-sm">iPhone 15 Pro Max</td>
                  <td className="py-4 px-4 font-bold text-sm">₦1,250,000</td>
                  <td className="py-4 px-4">
                    <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter">
                      Paid
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}