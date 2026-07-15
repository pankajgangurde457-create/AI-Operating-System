'use client'

import { useState } from 'react'
import { signup } from '../login/actions'
import { Lock, Mail, ArrowRight, Loader2, KeyRound } from 'lucide-react'
import Link from 'next/link'

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    
    try {
      const result = await signup(formData)
      if (result?.error) {
        setError(result.error)
      }
    } catch (err: any) {
      if (err.message !== 'NEXT_REDIRECT') {
        setError('An unexpected error occurred')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      {/* Background Effect */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="glass-card w-full max-w-md p-8 rounded-2xl border border-border-glass z-10 relative">
        <div className="flex justify-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.3)]">
            <Lock className="w-6 h-6 text-black" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center mb-2">
          Initialize System
        </h1>
        <p className="text-sm text-text-secondary text-center mb-8">
          Create your Personal Knowledge OS account
        </p>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-mono text-center flex flex-col gap-1">
            <span>{error}</span>
            {error.toLowerCase().includes("confirm") && (
              <span className="text-[11px] text-text-secondary block mt-1 normal-case font-sans leading-relaxed">
                Tip: Disable "Confirm email" in your Supabase Dashboard under Authentication ➡️ Providers ➡️ Email to allow direct logins without verification.
              </span>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-mono tracking-widest text-text-secondary uppercase">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input 
                name="email"
                type="email" 
                required
                placeholder="system@ai-os.dev"
                className="w-full bg-white/5 border border-border-glass rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-white/40 transition-colors text-white"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-mono tracking-widest text-text-secondary uppercase">Password</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input 
                name="password"
                type="password" 
                required
                placeholder="••••••••"
                className="w-full bg-white/5 border border-border-glass rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-white/40 transition-colors text-white"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="mt-4 flex items-center justify-center gap-2 w-full bg-white text-black py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Create Account
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link 
            href="/login"
            className="text-xs text-text-secondary hover:text-white transition-colors"
          >
            Already initialized? Authenticate
          </Link>
        </div>
      </div>
    </div>
  )
}
