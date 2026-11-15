'use client'

import { useState } from 'react'
import { createBrowserClient } from '@/src/lib/supabase/browser'
import { Button } from '@/src/components/ui/button'
import Link from 'next/link'
import { Clock, ArrowLeft } from 'lucide-react'

const EVENT_LABELS: Record<string, string> = {
  hora_extra_inicio: 'Início da hora extra',
  hora_extra_fim: 'Fim da hora extra',
}

export default function HoraExtraPage() {
  const supabase = createBrowserClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

  const fetchUser = async () => {
    const { data } = await supabase.auth.getUser()
    setUser(data.user)
    setLoading(false)
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  ;(() => {
    fetchUser()
  })()

  const register = async (eventType: 'hora_extra_inicio' | 'hora_extra_fim') => {
    if (!user) return
    setLoading(true)
    setMessage('')

    const { error } = await supabase.from('clock_events').insert({
      user_id: user.id,
      event_type: eventType,
      occurred_at: new Date().toISOString(),
    })

    setLoading(false)
    if (error) {
      setMessageType('error')
      setMessage(error.message)
      return
    }
    setMessageType('success')
    setMessage(`Registrado: ${EVENT_LABELS[eventType]}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">Não autenticado.</div>
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar ao ponto
      </Link>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="w-5 h-5 text-emerald-600" />
          <h2 className="text-xl font-bold text-slate-900">Hora extra</h2>
        </div>
        <p className="text-sm text-slate-600 mb-6">
          Registre o início e o fim da hora extra. A hora é registrada automaticamente pelo servidor.
        </p>

        <div className="space-y-3">
          <Button
            onClick={() => register('hora_extra_inicio')}
            className="w-full flex items-center justify-center gap-2"
            disabled={loading}
          >
            <Clock className="w-4 h-4" />
            {EVENT_LABELS.hora_extra_inicio}
          </Button>
          <Button
            onClick={() => register('hora_extra_fim')}
            className="w-full flex items-center justify-center gap-2 border border-slate-300 hover:bg-slate-50 text-slate-700"
            disabled={loading}
          >
            <Clock className="w-4 h-4" />
            {EVENT_LABELS.hora_extra_fim}
          </Button>
        </div>

        {message && (
          <div className={`mt-6 rounded-lg px-3 py-2 text-sm ${
            messageType === 'success'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
              : 'bg-red-50 text-red-700 border border-red-100'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  )
}
