'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password })
      setMessage(error ? error.message : 'Kayıt başarılı! E-postanızı kontrol edin.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      setMessage(error ? error.message : '')
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  if (loading) {
    return <div className="bg-black min-h-screen pt-32 text-center text-cream/50">Yükleniyor...</div>
  }

  if (user) {
    return (
      <div className="bg-black min-h-screen pt-24 md:pt-32 pb-20">
        <div className="max-w-2xl mx-auto px-4 md:px-8">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-cream mb-2">Hesabım</h1>
          <div className="h-1 w-24 bg-gold mb-8" />
          <div className="border border-gold/20 rounded-lg p-6">
            <p className="text-cream/70 mb-1">Giriş yapıldı:</p>
            <p className="text-cream font-medium mb-6">{user.email}</p>
            <button onClick={signOut} className="px-6 py-2 border border-gold text-gold rounded-md hover:bg-gold hover:text-black transition-colors text-sm uppercase tracking-wider">
              Çıkış Yap
            </button>
          </div>
          <p className="text-cream/40 text-sm mt-6">Sipariş geçmişiniz ve favorileriniz yakında burada görünecek.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-black min-h-screen pt-24 md:pt-32 pb-20">
      <div className="max-w-md mx-auto px-4 md:px-8">
        <h1 className="text-3xl md:text-5xl font-serif font-bold text-cream mb-2">
          {mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
        </h1>
        <div className="h-1 w-24 bg-gold mb-8" />

        <form onSubmit={handleAuth} className="space-y-4">
          <input required type="email" placeholder="E-posta" value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-black border border-cream/20 text-cream px-4 py-3 rounded-md focus:border-gold outline-none" />
          <input required type="password" placeholder="Şifre" value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-black border border-cream/20 text-cream px-4 py-3 rounded-md focus:border-gold outline-none" />
          <button type="submit"
            className="w-full py-3 bg-gold text-black font-semibold uppercase tracking-widest hover:bg-gold/80 transition-colors">
            {mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
          </button>
        </form>

        {message && <p className="text-gold text-sm mt-4">{message}</p>}

        <button
          onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
          className="text-cream/60 hover:text-gold text-sm mt-6 underline"
        >
          {mode === 'login' ? 'Hesabınız yok mu? Kayıt olun' : 'Zaten hesabınız var mı? Giriş yapın'}
        </button>
      </div>
    </div>
  )
}
