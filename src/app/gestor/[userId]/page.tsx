import { createClient } from '@/src/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { DayGroup, formatDayLabel } from '@/src/components/EventHistory'
import { parseISO, format, subDays, startOfDay, endOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default async function GestorUserPage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const { userId } = await params

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

  const { data: targetProfile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', userId)
    .single()

  if (!targetProfile) notFound()

  // Últimos 30 dias de eventos
  const thirtyDaysAgo = subDays(new Date(), 30)
  const { data: events } = await supabase
    .from('clock_events')
    .select('event_type, occurred_at')
    .eq('user_id', userId)
    .gte('occurred_at', thirtyDaysAgo.toISOString())
    .order('occurred_at', { ascending: true })

  // Justificativas do funcionário
  const { data: justifications } = await supabase
    .from('absence_justifications')
    .select('id, date, reason, created_at')
    .eq('user_id', userId)
    .order('date', { ascending: true })

  const grouped: Record<string, { event_type: string; occurred_at: string }[]> = {}
  ;(events ?? []).forEach((e) => {
    const day = e.occurred_at.slice(0, 10)
    if (!grouped[day]) grouped[day] = []
    grouped[day].push(e)
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <Link
          href="/gestor"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Voltar
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{targetProfile.full_name}</h1>
          <p className="text-sm text-slate-500 capitalize">{targetProfile.role}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Dias trabalhados</p>
          <p className="text-2xl font-bold text-slate-900">{Object.keys(grouped).length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Justificativas</p>
          <p className="text-2xl font-bold text-slate-900">{justifications?.length ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Total de batidas</p>
          <p className="text-2xl font-bold text-slate-900">{events?.length ?? 0}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <h2 className="px-6 py-4 border-b border-slate-100 text-sm font-semibold text-slate-700 uppercase tracking-wider">
          Histórico de batidas (últimos 30 dias)
        </h2>
        <div className="p-6">
          {Object.keys(grouped).length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">Sem registros no período.</p>
          ) : (
            Object.entries(grouped)
              .sort(([a], [b]) => b.localeCompare(a))
              .map(([day, evts]) => (
                <DayGroup key={day} dayLabel={formatDayLabel(day)} events={evts} />
              ))
          )}
        </div>
      </div>

      {justifications && justifications.length > 0 && (
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <h2 className="px-6 py-4 border-b border-slate-100 text-sm font-semibold text-slate-700 uppercase tracking-wider">
            Justificativas de falta
          </h2>
          <table className="w-full text-left text-sm divide-y divide-slate-100">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Motivo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Registrado em</th>
              </tr>
            </thead>
            <tbody>
              {justifications.map((j) => (
                <tr key={j.id}>
                  <td className="px-6 py-3 text-slate-600 font-mono">
                    {format(parseISO(j.date), "dd/MM/yyyy", { locale: ptBR })}
                  </td>
                  <td className="px-6 py-3 text-slate-700">{j.reason}</td>
                  <td className="px-6 py-3 text-slate-500 font-mono text-xs">
                    {format(parseISO(j.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
