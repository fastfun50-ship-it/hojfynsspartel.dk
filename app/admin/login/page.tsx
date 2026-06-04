'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!password) return

    setIsLoading(true)

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        toast.success('Velkommen til CMS')
        router.push('/admin')
        router.refresh()
      } else {
        toast.error(data.error || 'Forkert adgangskode')
      }
    } catch (err) {
      toast.error('Der opstod en fejl. Prøv igen.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="text-4xl font-semibold tracking-[-2px] text-white">H</div>
            <div>
              <div className="text-xl font-medium tracking-[-0.5px]">Højfynsspartel</div>
              <div className="text-[10px] text-white/50 -mt-0.5">CMS</div>
            </div>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">Log ind</h1>
          <p className="mt-2 text-white/60">Administrer indhold på højfynsspartel.dk</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs tracking-[2px] text-white/50 mb-2">ADGANGSKODE</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#111] border border-white/20 rounded-2xl px-5 py-3.5 text-white placeholder:text-white/40 focus:border-[#C5A36E] focus:outline-none text-lg"
              placeholder="••••••••"
              required
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !password}
            className="w-full h-14 rounded-2xl bg-[#C5A36E] text-[#0A0A0A] font-semibold text-base hover:bg-[#D4B47F] active:scale-[0.985] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? 'Logger ind...' : 'Log ind i CMS'}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-white/40">
          Dette område er kun for Michael. <br />Ændringer er live med det samme.
        </p>
      </div>
    </div>
  )
}
