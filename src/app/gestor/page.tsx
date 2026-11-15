import { createClient } from '@/src/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { startOfDay, endOfDay, parseISO, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const EVENT_ORDER: ('entrada' | 'saida_almoco' | 'volta_almoco' | 'saida_final')[] = [
  'entrada',
  'saida_almoco',
  'volta_almoco',
  'saida_final',
]

const EVENT_LABELS: Record<string, string> = {
  entrada: 'Entrada',
  saida_almoco: 'Saída almoço',
  volta_almoco: 'Volta almoço',
  saida_final: 'Saída final',
}

export default async function GestorPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'gestor') redirect('/')

  const today = new Date()
  const todayStr = today.toISOString().slice(0, 10)

  // Todos os funcionários
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('role', 'funcionario')
    .order('full_name', { ascending: true })

  // Eventos de hoje
  const { data: events } = await supabase
    .from('clock_events')
    .select('user_id, event_type, occurred_at')
    .gte('occurred_at', startOfDay(today).toISOString())
    .lte('occurred_at', endOfDay(today).toISOString())

  const eventsByUser: Record<string, Set<string>> = {}
  ;(events ?? []).forEach((e: { user_id: string; event_type: string }) => {
    if (!eventsByUser[e.user_id]) eventsByUser[e.user_id] = new Set()
    eventsByUser[e.user_id].add(e.event_type)
  })

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Painel do gestor</h1>
          <p className="text-slate-600">
            Acompanhe o ponto da equipe em {format(today, "dd/MM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
        <Link
          href="/login"
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          Sair
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Funcionário</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status hoje</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Último evento</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(profiles ?? []).map((p: { id: string; full_name: string }) => {
              const userEvents = eventsByUser[p.id] ?? new Set<string>()
              const lastEvent = [...EVENT_ORDER].find((t) => userEvents.has(t))
              const allDone = EVENT_ORDER.every((t) => userEvents.has(t))

              let statusLabel: string
              let statusColor: string

              if (allDone) {
                statusLabel = 'Completo'
                statusColor = 'text-emerald-700 bg-emerald-50 border-emerald-100'
              } else if (userEvents.size === 0) {
                statusLabel = 'Não bateu'
                statusColor = 'text-red-700 bg-red-50 border-red-100'
              } else {
                statusLabel = 'Parcial'
                statusColor = 'text-amber-700 bg-amber-50 border-amber-100'
              }

              return (
                <tr key={p.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 text-sm font-medium">
                        {p.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{p.full_name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColor}`}>
                      {statusLabel}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 text-right">
                    {lastEvent
                      ? format(
                          parseISO(
                            events?.find((e: { event_type: string; occurred_at: string }) => e.event_type === lastEvent)
                              ?.occurred_at ?? ''
                          ),
                          'HH:mm',
                          { locale: ptBR }
                        )
                      : '—'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/gestor/${p.id}`}
                      className="text-sm font-medium text-emerald-600 hover:underline"
                    >
                      Ver histórico
                    </Link>
                  </td>
                </tr>
              )
            })}
            {(profiles ?? []).length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500 text-sm">
                  Nenhum funcionário cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-slate-400 text-center">
        Dados em tempo real via Supabase. Acesso restrito a gestores (RLS).
      </p>
    </div>
  )
}
