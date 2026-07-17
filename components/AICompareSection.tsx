'use client'
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Send, BrainCircuit, CheckCircle2, AlertCircle, Trophy } from 'lucide-react'

export default function AICompareSection({ phones }: { phones: any[] }) {
  const [profile, setProfile] = useState('basic');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  const profiles = [
    { id: 'basic', label: 'Basic', icon: '📱' },
    { id: 'student', label: 'Student', icon: '🎓' },
    { id: 'business', label: 'Business', icon: '💼' },
    { id: 'creator', label: 'Creator', icon: '📸' },
    { id: 'gaming', label: 'Gamer', icon: '🎮' }
  ];

  const runAnalysis = async () => {
    setIsLoading(true);
    // Logic preserved: In production, this calls /api/compare
    // For now, simulating the start of the stream
    setTimeout(() => {
      setResult({
        verdict: "The iPhone 15 Pro offers superior longevity, but the S24 Ultra is the powerhouse for productivity.",
        scores: phones.map(p => ({
          name: p.name,
          value_score: Math.floor(Math.random() * 40) + 60,
          score_reason: "High resale value & build quality."
        })),
        recommendation: `Based on your ${profile} profile, the ${phones[0].name} is the best fit.`
      });
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="liquid-glass p-8 rounded-[2.5rem] border-premiumYellow/20 shadow-[0_0_50px_rgba(230,255,0,0.05)]" role="region" aria-label="AI Phone Comparison">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 text-premiumYellow font-mono text-xs tracking-widest uppercase mb-2">
            <Sparkles className="w-4 h-4" aria-hidden="true" /> AI Comparison Engine
          </div>
          <h3 className="text-2xl font-display font-bold dark:text-white">Expert Analysis</h3>
        </div>

        {/* Profile Selector */}
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Select user profile for personalized recommendation">
          {profiles.map(p => (
            <button
              key={p.id}
              onClick={() => setProfile(p.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all border 
                ${profile === p.id 
                  ? 'bg-premiumYellow text-black border-premiumYellow' 
                  : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/30'}`}
              role="radio"
              aria-checked={profile === p.id}
              aria-label={`Select ${p.label} profile`}
            >
              {p.icon} {p.label}
            </button>
          ))}
        </div>
      </div>

      {!result && !isLoading ? (
        <button 
          onClick={runAnalysis}
          className="w-full py-6 rounded-3xl bg-premiumYellow text-black font-display font-black text-xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-premiumYellow/20"
          aria-label="Ask AI to compare selected phones"
        >
          <BrainCircuit className="w-6 h-6" aria-hidden="true" />
          ASK AI TO COMPARE
        </button>
      ) : isLoading ? (
        <div className="py-12 flex flex-col items-center gap-4" aria-live="polite" aria-label="AI analysis in progress">
          <div className="flex gap-2">
            {[0,1,2].map(i => (
              <motion.div 
                key={i}
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                className="w-3 h-3 bg-premiumYellow rounded-full" 
                aria-hidden="true"
              />
            ))}
          </div>
          <p className="text-sm font-mono text-premiumYellow animate-pulse">FONESTACK AI ANALYSING DATA...</p>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          {/* Verdict Text */}
          <div className="text-lg leading-relaxed dark:text-slate-200 font-medium" aria-live="polite">
            "{result.verdict}"
          </div>

          {/* Value Score Bars */}
          <div className="grid md:grid-cols-3 gap-4" role="table" aria-label="Phone comparison scores">
            {result.scores.map((s: any, idx: number) => (
              <div key={idx} className="bg-black/20 p-4 rounded-2xl border border-white/5" role="row">
                <div className="text-[10px] uppercase font-mono opacity-50 mb-1" role="rowheader">{s.name}</div>
                <div className="text-3xl font-display font-black text-premiumYellow" role="cell">{s.value_score}%</div>
                <div className="h-1.5 w-full bg-white/5 rounded-full mt-3 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${s.value_score}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-gradient-to-r from-premiumYellow/50 to-premiumYellow" 
                  />
                </div>
                <p className="text-[10px] opacity-40 mt-2">{s.score_reason}</p>
              </div>
            ))}
          </div>

          {/* Final Recommendation */}
          <div className="bg-premiumYellow/10 border border-premiumYellow/20 p-6 rounded-2xl flex items-start gap-4" aria-live="polite">
             <Trophy className="text-premiumYellow w-8 h-8 shrink-0" aria-hidden="true" />
             <div>
               <div className="text-[10px] font-mono text-premiumYellow uppercase tracking-tighter mb-1">Final Verdict</div>
               <div className="text-sm font-bold dark:text-white leading-relaxed">{result.recommendation}</div>
             </div>
          </div>

          {/* Follow up Mini-Chat */}
          <div className="pt-6 border-t border-white/5">
             <div className="flex gap-3">
                <label htmlFor="followup-question" className="sr-only">Ask a follow up question</label>
                <input 
                  id="followup-question"
                  placeholder="Ask a follow up question..." 
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-premiumYellow/50 transition-colors"
                  aria-label="Ask a follow up question about the comparison"
                />
                <button className="bg-white/10 p-3 rounded-xl hover:bg-premiumYellow hover:text-black transition-all" aria-label="Send follow up question">
                  <Send className="w-5 h-5" aria-hidden="true" />
                </button>
             </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}