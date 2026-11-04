'use client'

import { CircleDollarSign, TrendingUp } from 'lucide-react'

export type InventoryValueProduct = {
  stock_quantity: number
  price: number
  cost_price: number | null
}

function formatNaira(value: number) {
  return `₦${Number(value).toLocaleString('en-NG')}`
}

export default function InventorySummary({ products }: { products: InventoryValueProduct[] }) {
  const costed = products.filter((product) => product.cost_price !== null && Number.isFinite(Number(product.cost_price)))
  const ignored = products.length - costed.length
  const costValue = costed.reduce((sum, product) => sum + product.stock_quantity * Number(product.cost_price), 0)
  const sellingValue = products.reduce((sum, product) => sum + product.stock_quantity * product.price, 0)
  const potentialProfit = costed.reduce((sum, product) => sum + product.stock_quantity * (product.price - Number(product.cost_price)), 0)

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {[
        { label: 'Stock value at cost', value: formatNaira(costValue), note: `${ignored} product${ignored === 1 ? '' : 's'} ignored (no cost price)`, icon: CircleDollarSign },
        { label: 'Stock value at selling price', value: formatNaira(sellingValue), note: 'Based on current stock quantity', icon: CircleDollarSign },
        { label: 'Potential profit', value: formatNaira(potentialProfit), note: 'At current stock levels', icon: TrendingUp },
      ].map((item) => (
        <section key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between gap-3 text-xs text-slate-400">
            {item.label}<item.icon className="h-4 w-4 text-premiumYellow" aria-hidden="true" />
          </div>
          <p className="mt-2 text-xl font-black text-white">{item.value}</p>
          <p className="mt-1 text-[11px] text-slate-500">{item.note}</p>
        </section>
      ))}
    </div>
  )
}
