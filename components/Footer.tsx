import { BUSINESS_REGISTRATION_NUMBER, SOCIAL_LINKS, SITE_URL } from '@/lib/constants'

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-white/5 py-8 bg-transparent print:hidden">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm text-slate-400">
          <div className="font-medium text-white">Fonestack</div>
          <div className="mt-1">Business Registration: <span className="font-mono">{BUSINESS_REGISTRATION_NUMBER}</span></div>
          <div className="mt-1">&copy; {new Date().getFullYear()} Fonestack — <a href={SITE_URL} className="underline">fonestack.vercel.app</a></div>
        </div>

        <div className="flex items-center gap-4">
          {/* Social icons */}
          <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-slate-300 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.5" y2="6.5"></line>
            </svg>
          </a>

          <a href={SOCIAL_LINKS.snapchat} target="_blank" rel="noopener noreferrer" aria-label="Snapchat" className="text-slate-300 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M12 2c-3.866 0-7 3.134-7 7 0 1.477.467 2.845 1.263 3.976C6.56 14.915 6 15.898 6 17c0 1.657 1.343 3 3 3h6c1.657 0 3-1.343 3-3 0-1.102-.56-2.085-1.263-3.024C18.533 11.845 19 10.477 19 9c0-3.866-3.134-7-7-7z" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  )
}
