'use client'

import { useState } from 'react'
import { createBrowserClient } from '@/src/lib/supabase/browser'
import { Button } from '@/src/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, FileText } from 'lucide-react'
import { z } from 'zod'

const JustificativaSchema = z.object({
  date: z.string().min(1, 'Data é obrigatória'),
  reason: z.string().min(5, 'Informe um motivo com pelo menos 5 caracteres'),
})

export default function JustificativaPage() {
  const supabase = createBrowserClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [date, setDate] = useState('')
  const [reason, setReason] = useState('')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

  const fetchUser = async () => {
    const { data } = await supabase.auth.getUser()
    setUser(data.user)
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  ;(() => {
    fetchUser()
  })()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const parse = JustificativaSchema.safeParse({ date, reason })
    if (!parse.success) {
      setMessageType('error')
      setMessage(parse.error.errors[0]?.message ?? 'Dados inválidos')
      return
    }

    setLoading(true)
    setMessage('')

    const { error } = await supabase.from('absence_justifications').insert({
      user_id: user.id,
      date,
      reason,
      created_by: user.id,
    })

    setLoading(false)
    if (error) {
      setMessageType('error')
      setMessage(error.message)
      return
    }
    setMessageType('success')
    setMessage('Justificativa registrada com sucesso.')
    setDate('')
    setReason('')
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
          <FileText className="w-5 h-5 text-emerald-600" />
          <h2 className="text-xl font-bold text-slate-900">Justificar falta</h2>
        </div>
        <p className="text-sm text-slate-600 mb-6">
          Informe a data da ausência e um motivo. Funcionário ou gestor podem preencher.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Data da falta
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Motivo / justificativa
            </label>
            <textarea
              required
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 w-full"
              placeholder="Ex: indisposto, problema de saúde, compromisso particular..."
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            Registrar justificativa
          </Button>
        </form>

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
