'use client'
import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Download, Share2, Printer, ShieldCheck } from 'lucide-react'

export default function InvoicePage({ params }: { params: { id: string } }) {
  const [invoice, setInvoice] = useState<any>(null);

  useEffect(() => {
    // Preserved logic: Fetch from Supabase RPC get_public_invoice
    // Simulating data for preview
    setInvoice({
      invoice_number: 'FST-1024',
      customer_name: 'Chioma Jide',
      created_at: new Date().toISOString(),
      status: 'paid',
      total_amount: 850000,
      unit_price: 850000,
      quantity: 1,
      payment_method: 'Bank Transfer',
      product_snapshot: { name: 'iPhone 14 Pro Max', spec: '256GB - Deep Purple' },
      imei: '358912345678901'
    });
  }, [params.id]);

  if (!invoice) return <div className="min-h-screen flex items-center justify-center font-mono animate-pulse">VERIFYING INVOICE...</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8 flex items-center justify-center font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl liquid-glass rounded-[2.5rem] border-white/10 overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)]"
      >
        {/* Receipt Header */}
        <div className="bg-gradient-to-b from-white/10 to-transparent p-10 text-center border-b border-white/5">
          <div className="text-3xl font-display font-black tracking-tighter mb-2">
            FONE<span className="text-premiumYellow">STACK</span>
          </div>
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] opacity-40">Official Receipt</div>
          
          <motion.div 
            initial={{ scale: 0 }} 
            animate={{ scale: 1 }} 
            transition={{ type: 'spring', delay: 0.3 }}
            className="mt-8 inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-400 px-6 py-2 rounded-full text-xs font-bold"
          >
            <CheckCircle2 className="w-4 h-4" /> 
            {invoice.status.toUpperCase()}
          </motion.div>
        </div>

        {/* Receipt Content */}
        <div className="p-8 md:p-10 space-y-8">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest opacity-40 mb-1">Invoice Number</div>
              <div className="text-lg font-bold text-premiumYellow">{invoice.invoice_number}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-mono uppercase tracking-widest opacity-40 mb-1">Date Issued</div>
              <div className="text-sm font-medium">{new Date(invoice.created_at).toLocaleDateString()}</div>
            </div>
          </div>

          {/* Item Box */}
          <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
            <div className="text-[10px] font-mono uppercase tracking-widest opacity-40 mb-3">Item Purchased</div>
            <div className="text-xl font-bold mb-1">{invoice.product_snapshot.name}</div>
            <div className="text-xs opacity-50 mb-4">{invoice.product_snapshot.spec}</div>
            <div className="flex items-center gap-2 text-[10px] font-mono bg-black/40 w-fit px-3 py-1 rounded-lg">
              <span className="opacity-40 uppercase">IMEI:</span>
              <span className="text-premiumYellow">{invoice.imei}</span>
            </div>
          </div>

          {/* Totals */}
          <div className="space-y-3 px-2">
            <div className="flex justify-between text-sm opacity-60">
              <span>Subtotal (x{invoice.quantity})</span>
              <span>₦{invoice.unit_price.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm opacity-60">
              <span>Payment Method</span>
              <span>{invoice.payment_method}</span>
            </div>
            <div className="pt-4 flex justify-between items-end border-t border-white/10">
              <span className="text-sm font-bold uppercase tracking-widest">Total Paid</span>
              <span className="text-4xl font-display font-black text-premiumYellow">₦{invoice.total_amount.toLocaleString()}</span>
            </div>
          </div>

          {/* Warranty Info */}
          <div className="bg-premiumYellow/5 border border-premiumYellow/10 rounded-2xl p-4 flex items-center gap-4">
             <ShieldCheck className="text-premiumYellow w-6 h-6 shrink-0" />
             <div className="text-[11px] leading-relaxed opacity-80">
               This device is covered under Fonestack Standard Warranty for 6 months from the date of purchase.
             </div>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="p-8 bg-white/5 border-t border-white/10 grid grid-cols-2 gap-4">
          <button onClick={() => window.print()} className="flex items-center justify-center gap-2 bg-white/10 py-4 rounded-2xl font-bold text-sm hover:bg-white/20 transition-all">
            <Printer className="w-4 h-4" /> Print
          </button>
          <button className="flex items-center justify-center gap-2 bg-premiumYellow text-black py-4 rounded-2xl font-bold text-sm hover:scale-105 transition-all">
            <Download className="w-4 h-4" /> Download
          </button>
        </div>
      </motion.div>
    </div>
  )
}