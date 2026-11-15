import { createClient } from '@/src/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ClockButton } from '@/src/components/ClockButton'
import { DayGroup, EventRow } from '@/src/components/EventHistory'
import Link from 'next/link'
import { format, subDays, startOfDay, endOfDay, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type EventType = 'entrada' | 'saida_almoco' | 'volta_almoco' | 'saida_final' | 'hora_extra_inicio' | 'hora_extra_fim'

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
  hora_extra_inicio: 'Hora extra início',
  hora_extra_fim: 'Hora extra fim',
}

export default async function FuncionarioPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'funcionario') redirect('/gestor')

  const today = new Date()
  const todayStr = today.toISOString().slice(0, 10)

  const { data: events } = await supabase
    .from('clock_events')
    .select('event_type, occurred_at')
    .eq('user_id', user.id)
    .gte('occurred_at', startOfDay(today).toISOString())
    .lte('occurred_at', endOfDay(today).toISOString())
    .order('occurred_at', { ascending: true })

  const eventTypesToday = new Set((events ?? []).map((e: { event_type: string }) => e.event_type))

  // Próximo evento na sequência entrada → saída almoço → volta almoço → saída final
  let nextEvent: EventType | null = null
  for (const type of EVENT_ORDER) {
    if (!eventTypesToday.has(type)) {
      nextEvent = type
      break
    }
  }

  // Se já bateu saída final, próximo é hora extra início (se não tiver)
  if (!nextEvent && !eventTypesToday.has('hora_extra_inicio')) {
    nextEvent = 'hora_extra_inicio' as EventType
  } else if (!nextEvent && eventTypesToday.has('hora_extra_inicio') && !eventTypesToday.has('hora_extra_fim')) {
    nextEvent = 'hora_extra_fim' as EventType
  }

  // Histórico dos últimos 7 dias (agrupado por dia)
  const sevenDaysAgo = subDays(today, 7)
  const { data: historyEvents } = await supabase
    .from('clock_events')
    .select('event_type, occurred_at')
    .eq('user_id', user.id)
    .gte('occurred_at', sevenDaysAgo.toISOString())
    .order('occurred_at', { ascending: true })

  const grouped: Record<string, { event_type: string; occurred_at: string }[]> = {}
  ;(historyEvents ?? []).forEach((e: { event_type: string; occurred_at: string }) => {
    const day = e.occurred_at.slice(0, 10)
    if (!grouped[day]) grouped[day] = []
    grouped[day].push(e)
  })

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ponto do dia</h1>
          <p className="text-slate-600">
            Olá, {profile.full_name}. Registre seu ponto com um clique.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
          </span>
          Online
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximo evento */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Próximo evento</h2>
          <ClockButton userId={user.id} nextEvent={nextEvent} />
          {nextEvent && (
            <p className="mt-4 text-xs text-slate-500">
              A hora é registrada automaticamente pelo servidor.
            </p>
          )}
        </div>

        {/* Resumo rápido */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Status hoje</h2>
          <div className="space-y-3">
            {EVENT_ORDER.map((type) => {
              const done = eventTypesToday.has(type)
              return (
                <div key={type} className="flex items-center justify-between text-sm">
                  <span className={done ? 'text-slate-500 line-through' : 'text-slate-600'}>
                    {EVENT_LABELS[type]}
                  </span>
                  {done ? (
                    <span className="flex h-2.5 w-2.5 items-center">
                      <span className="relative flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-full w-full bg-emerald-600"></span>
                    </span>
                  ) : (
                    <span className="flex h-2.5 w-2.5 items-center justify-center">
                      <span className="relative flex h-1.5 w-1.5 rounded-full bg-slate-300"></span>
                    </span>
                  )}
                </div>
              )
            })}
            {!eventTypesToday.has('hora_extra_inicio') && (
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-sm">
                <span className="text-slate-600">Hora extra (início)</span>
                <span className="flex h-2.5 w-2.5 items-center justify-center">
                  <span className="relative flex h-1.5 w-1.5 rounded-full bg-slate-300"></span>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ações rápidas */}
      <div className="mt-8 flex gap-3">
        <Link href="/hora-extra" className="flex-1 bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition flex items-center justify-center gap-2">
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Hora extra
        </Link>
        <Link href="/justificativa" className="flex-1 bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition flex items-center justify-center gap-2">
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Justificar falta
        </Link>
      </div>

      {/* Histórico */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <h2 className="px-6 py-4 border-b border-slate-100 text-sm font-semibold text-slate-700 uppercase tracking-wider">
          Histórico recente
        </h2>
        <div className="p-6">
          {Object.keys(grouped).length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">Nenhum registro ainda.</p>
          ) : (
            Object.entries(grouped)
              .sort(([a], [b]) => b.localeCompare(a))
              .map(([day, events]) => (
                <DayGroup key={day} dayLabel={formatDayLabel(day)} events={events} />
              ))
          )}
        </div>
      </div>
    </div>
  )
}

function formatDayLabel(dateStr: string): string {
  const d = parseISO(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (format(d, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) return 'Hoje'
  if (format(d, 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd')) return 'Ontem'
  return format(d, "dd/MM 'de' MMMM", { locale: ptBR })
}
