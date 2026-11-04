'use client'

import { Pencil, Trash2 } from 'lucide-react'

export type InventoryProductRow = {
  id: number
  name: string
  brand: string
  price: number
  cost_price: number | null
  status: string
  image_url: string | null
  stock_quantity: number
  low_stock_threshold: number
  condition_grade: string | null
  storage_gb?: number | null
  ram_gb?: number | null
  color?: string | null
  imei: string | null
  warranty_months: number | null
}

type Props = {
  products: InventoryProductRow[]
  selectedIds: number[]
  allSelected: boolean
  canSelect: boolean
  canManage: boolean
  isOwner: boolean
  onSelectAll: (checked: boolean) => void
  onSelect: (id: number, checked: boolean) => void
  onEdit: (product: InventoryProductRow) => void
  onDelete: (product: InventoryProductRow) => void
}

function formatNaira(value: number) {
  return `₦${Number(value).toLocaleString('en-NG')}`
}

export default function InventoryProductTable({
  products,
  selectedIds,
  allSelected,
  canSelect,
  canManage,
  isOwner,
  onSelectAll,
  onSelect,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1100px] text-left text-sm">
        <thead className="text-xs uppercase tracking-wider text-slate-500">
          <tr>
            <th className="px-3 py-3">{canSelect && <input type="checkbox" aria-label="Select all filtered products" checked={allSelected} onChange={(event) => onSelectAll(event.target.checked)} />}</th>
            <th className="px-3 py-3">Product</th>
            <th className="px-3 py-3">Price</th>
            <th className="px-3 py-3">Cost</th>
            <th className="px-3 py-3">Margin</th>
            <th className="px-3 py-3">Condition</th>
            <th className="px-3 py-3">Stock</th>
            <th className="px-3 py-3">Status</th>
            <th className="px-3 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 text-slate-200">
          {products.length === 0 ? (
            <tr><td colSpan={9} className="px-5 py-8 text-center text-slate-400">No matching products found.</td></tr>
          ) : products.map((product) => {
            const lowStock = product.stock_quantity <= product.low_stock_threshold
            const margin = product.cost_price === null ? null : product.price - Number(product.cost_price)
            const marginPercent = margin === null || product.price === 0
              ? null
              : margin / product.price * 100
            return (
              <tr key={product.id}>
                <td className="px-3 py-4">
                  {canSelect && <input type="checkbox" aria-label={`Select ${product.brand} ${product.name}`} checked={selectedIds.includes(product.id)} onChange={(event) => onSelect(product.id, event.target.checked)} />}
                </td>
                <td className="px-3 py-4">
                  <div className="flex items-center gap-3">
                    {product.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.image_url} alt="" className="h-12 w-12 rounded-lg border border-white/10 object-cover" />
                    ) : <div className="h-12 w-12 rounded-lg border border-white/10 bg-black/20" aria-hidden="true" />}
                    <div className="min-w-0">
                      <div className="font-semibold text-white">{product.brand} {product.name}</div>
                      <div className="mt-1 max-w-xs truncate text-xs text-slate-500">
                        {[product.storage_gb && `${product.storage_gb}GB`, product.ram_gb && `${product.ram_gb}GB RAM`, product.color].filter(Boolean).join(' · ')}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-4">{formatNaira(product.price)}</td>
                <td className="px-3 py-4">{product.cost_price === null ? '—' : formatNaira(Number(product.cost_price))}</td>
                <td className={`px-3 py-4 ${margin === null ? 'text-slate-500' : margin > 0 ? 'text-green-300' : margin < 0 ? 'text-red-300' : 'text-slate-300'}`}>
                  {margin === null ? '—' : <>{formatNaira(margin)}<span className="ml-1 text-xs">({marginPercent === null ? '—' : `${marginPercent.toFixed(1)}%`})</span></>}
                </td>
                <td className="px-3 py-4">{product.condition_grade ?? '—'}</td>
                <td className={`px-3 py-4 font-semibold ${lowStock ? 'text-amber-300' : ''}`}>{product.stock_quantity} {lowStock ? '· Low' : ''}</td>
                <td className="px-3 py-4 capitalize">{product.status}</td>
                <td className="px-3 py-4">
                  <div className="flex justify-end gap-2">
                    {canManage && <button type="button" onClick={() => onEdit(product)} aria-label={`Edit ${product.name}`} className="rounded-lg border border-white/10 p-2 text-slate-300 hover:text-premiumYellow"><Pencil className="h-4 w-4" aria-hidden="true" /></button>}
                    {isOwner && <button type="button" onClick={() => onDelete(product)} aria-label={`Delete ${product.name}`} className="rounded-lg border border-white/10 p-2 text-slate-300 hover:text-red-400"><Trash2 className="h-4 w-4" aria-hidden="true" /></button>}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
