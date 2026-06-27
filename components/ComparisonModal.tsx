'use client'
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MessageCircle, Loader2, ChevronDown, ChevronUp } from 'lucide-react'

const PROFILES = [
  { id: 'student', label: 'Student' },
  { id: 'business', label: 'Business' },
  { id: 'creator', label: 'Creator' },
  { id: 'gaming', label: 'Gaming' },
  { id: 'basic', label: 'Basic Use' },
]

export default function ComparisonModal({ isOpen, onClose, phones, onRemove }: {
  isOpen: boolean
  onClose: () => void
  phones: any[]
  onRemove: (id: number) => void
}) {
  const [profile, setProfile] = useState('basic')
  const [aiResult, setAiResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [followUp, setFollowUp] = useState('')
  const [expandedSpecs, setExpandedSpecs] = useState(false)

  const runCompare = async (msgs: any[] = []) => {
    setLoading(true)
    try {
      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phones, profile, messages: msgs }),
      })
      if (!res.ok || !res.body) throw new Error('API error')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let full = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        for (const line of chunk.split('\n')) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const { delta } = JSON.parse(line.slice(6))
              if (delta) full += delta
            } catch {}
          }
        }
      }

      if (msgs.length === 0) {
        try {
          const clean = full.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
          const parsed = JSON.parse(clean)
          setAiResult(parsed)
          setMessages([{ role: 'assistant', content: full }])
        } catch {
          setAiResult({ verdict: full, scores: [], pros_cons: [], recommendation: '' })
        }
      } else {
        const newMsgs = [...msgs, { role: 'assistant', content: full }]
        setMessages(newMsgs)
        setAiResult((prev: any) => ({ ...prev, followup_answer: full }))
      }
    } catch (e) {
      setAiResult({ verdict: 'Error getting comparison. Please try again.', scores: [], pros_cons: [], recommendation: '' })
    } finally {
      setLoading(false)
    }
  }

  const handleFollowUp = async () => {
    if (!followUp.trim()) return
    const newMsgs = [...messages, { role: 'user', content: followUp }]
    setMessages(newMsgs)
    setFollowUp('')
    await runCompare(newMsgs)
  }

  const handleClose = () => {
    setAiResult(null)
    setMessages([])
    setFollowUp('')
    onClose()
  }

  const specs = [
    { label: 'Storage', key: 'storage_gb', suffix: 'GB' },
    { label: 'RAM', key: 'ram_gb', suffix: 'GB' },
    { label: 'Battery', key: 'battery_mah', suffix: 'mAh' },
    { label: 'Camera', key: 'camera_mp', suffix: 'MP' },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="liquid-glass w-full sm:max-w-2xl lg:max-w-4xl rounded-t-[2rem] sm:rounded-[2rem] max-h-[92vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 liquid-glass z-10 flex items-center justify-between p-5 border-b border-white/5">
              <h2 className="text-lg font-display font-black dark:text-white">AI Phone Compare</h2>
              <button onClick={handleClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                <X className="w-5 h-5 dark:text-white" />
              </button>
            </div>

            <div className="p-4 md:p-6 space-y-6">
              {/* Phone Cards - horizontal scroll on mobile */}
              <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
                {phones.map(p => (
                  <div key={p.id} className="snap-start flex-shrink-0 w-36 sm:w-44 liquid-glass rounded-2xl p-3 flex flex-col items-center text-center gap-2">
                    {p.image_url
                      ? <img src={p.image_url} alt={p.name} className="h-16 object-contain" />
                      : <div className="h-16 w-16 rounded-xl bg-white/5 flex items-center justify-center text-2xl">📱</div>
                    }
                    <div className="text-xs font-bold dark:text-white line-clamp-2">{p.name}</div>
                    <div className="text-xs text-premiumYellow font-mono">&#8358;{p.price?.toLocaleString()}</div>
                    <button onClick={() => onRemove(p.id)} className="text-[10px] text-slate-500 hover:text-red-400 transition-colors">Remove</button>
                  </div>
                ))}
              </div>

              {/* Specs comparison - collapsible on mobile */}
              <div className="liquid-glass rounded-2xl overflow-hidden">
                <button
                  onClick={() => setExpandedSpecs(!expandedSpecs)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <span className="text-xs font-mono uppercase tracking-widest text-slate-500">Specs Comparison</span>
                  {expandedSpecs ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                {expandedSpecs && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-t border-white/5">
                          <th className="text-left p-3 text-xs font-mono text-slate-500 uppercase tracking-widest">Spec</th>
                          {phones.map(p => (
                            <th key={p.id} className="p-3 text-xs font-bold dark:text-white text-center">{p.name.split(' ').slice(0,2).join(' ')}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t border-white/5">
                          <td className="p-3 text-xs text-slate-500">Price</td>
                          {phones.map(p => (
                            <td key={p.id} className="p-3 text-xs text-premiumYellow font-mono text-center">&#8358;{p.price?.toLocaleString()}</td>
                          ))}
                        </tr>
                        {specs.map(s => (
                          <tr key={s.key} className="border-t border-white/5">
                            <td className="p-3 text-xs text-slate-500">{s.label}</td>
                            {phones.map(p => (
                              <td key={p.id} className="p-3 text-xs dark:text-white text-center">
                                {p[s.key] ? `${p[s.key]}${s.suffix}` : '—'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Profile Selection */}
              <div>
                <div className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-3">Your Profile</div>
                <div className="flex flex-wrap gap-2">
                  {PROFILES.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setProfile(p.id)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all min-h-[44px] ${
                        profile === p.id
                          ? 'bg-premiumYellow text-black'
                          : 'liquid-glass dark:text-white hover:border-premiumYellow/30 border border-transparent'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Compare Button */}
              {!aiResult && (
                <button
                  onClick={() => runCompare()}
                  disabled={loading || phones.length < 2}
                  className="w-full py-4 rounded-2xl bg-premiumYellow text-black font-bold flex items-center justify-center gap-2 disabled:opacity-50 min-h-[52px]"
                >
                  {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Analysing...</> : 'Compare with AI'}
                </button>
              )}

              {/* AI Result */}
              {aiResult && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  {/* Verdict */}
                  <div className="liquid-glass rounded-2xl p-4">
                    <div className="text-xs font-mono uppercase tracking-widest text-premiumYellow mb-2">AI Verdict</div>
                    <p className="text-sm dark:text-slate-300 leading-relaxed">{aiResult.verdict}</p>
                  </div>

                  {/* Scores */}
                  {aiResult.scores?.length > 0 && (
                    <div className="space-y-3">
                      {aiResult.scores.map((s: any, i: number) => (
                        <div key={i} className="liquid-glass rounded-2xl p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-bold dark:text-white">{s.name}</span>
                            <span className="text-premiumYellow font-mono text-sm">{s.value_score}/100</span>
                          </div>
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${s.value_score}%` }}
                              transition={{ duration: 0.8, delay: i * 0.1 }}
                              className="h-full bg-premiumYellow rounded-full"
                            />
                          </div>
                          <p className="text-xs text-slate-500 mt-2">{s.score_reason}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Pros/Cons - stacked on mobile */}
                  {aiResult.pros_cons?.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {aiResult.pros_cons.map((pc: any, i: number) => (
                        <div key={i} className="liquid-glass rounded-2xl p-4">
                          <div className="text-xs font-bold dark:text-white mb-3">{pc.name}</div>
                          {pc.pros?.map((pro: string, j: number) => (
                            <div key={j} className="flex gap-2 text-xs text-green-400 mb-1"><span>+</span>{pro}</div>
                          ))}
                          {pc.cons?.map((con: string, j: number) => (
                            <div key={j} className="flex gap-2 text-xs text-red-400 mb-1"><span>−</span>{con}</div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Recommendation */}
                  {aiResult.recommendation && (
                    <div className="liquid-glass rounded-2xl p-4 border border-premiumYellow/20">
                      <div className="text-xs font-mono uppercase tracking-widest text-premiumYellow mb-2">Recommendation</div>
                      <p className="text-sm font-bold dark:text-white">{aiResult.recommendation}</p>
                    </div>
                  )}

                  {/* Follow-up answer */}
                  {aiResult.followup_answer && (
                    <div className="liquid-glass rounded-2xl p-4">
                      <div className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-2">Answer</div>
                      <p className="text-sm dark:text-slate-300 leading-relaxed">{aiResult.followup_answer}</p>
                    </div>
                  )}

                  {/* Follow-up input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={followUp}
                      onChange={e => setFollowUp(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleFollowUp()}
                      placeholder={aiResult.follow_up_hint || 'Ask a follow-up question...'}
                      className="flex-1 bg-black/20 border border-white/10 rounded-2xl px-4 py-3 text-base dark:text-white focus:outline-none focus:border-premiumYellow/50 transition-all"
                    />
                    <button
                      onClick={handleFollowUp}
                      disabled={loading || !followUp.trim()}
                      className="px-5 py-3 rounded-2xl bg-premiumYellow text-black font-bold disabled:opacity-50 min-w-[60px] flex items-center justify-center"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Ask'}
                    </button>
                  </div>

                  {/* WhatsApp CTA */}
                  <a
                    href={`https://wa.me/2349029928322?text=${encodeURIComponent(`Hi Fonestack! I compared ${phones.map(p => p.name).join(' vs ')} and I need help deciding.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-4 rounded-2xl bg-[#25D366] text-white font-bold flex items-center justify-center gap-2 min-h-[52px]"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Get Human Advice on WhatsApp
                  </a>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}