'use client'

import { format, formatDistanceToNowStrict, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface EventRowProps {
  eventType: string
  occurredAt: string
}

export function EventRow({ eventType, occurredAt }: EventRowProps) {
  const labels: Record<string, string> = {
    entrada: 'Entrada',
    saida_almoco: 'Saída almoço',
    volta_almoco: 'Volta almoço',
    saida_final: 'Saída final',
    hora_extra_inicio: 'Hora extra início',
    hora_extra_fim: 'Hora extra fim',
  }

  const date = parseISO(occurredAt)
  return (
    <tr className="border-b border-slate-100 last:border-0">
      <td className="py-2 text-sm text-slate-600 capitalize">
        {labels[eventType] ?? eventType}
      </td>
      <td className="py-2 text-sm text-slate-500 text-right font-mono">
        {format(date, 'HH:mm:ss', { locale: ptBR })}
      </td>
      <td className="py-2 text-sm text-slate-400 text-right">
        {formatDistanceToNowStrict(date, { addSuffix: true, locale: ptBR })}
      </td>
    </tr>
  )
}

interface DayGroupProps {
  dayLabel: string
  events: { event_type: string; occurred_at: string }[]
}

export function DayGroup({ dayLabel, events }: DayGroupProps) {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-slate-700 mb-2 border-b pb-1 border-slate-200">
        {dayLabel}
      </h3>
      <table className="w-full text-left text-sm">
        <thead className="text-slate-400 text-xs uppercase">
          <tr>
            <th className="pb-1">Evento</th>
            <th className="pb-1 text-right">Horário</th>
            <th className="pb-1 text-right">Há</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e) => (
            <EventRow key={e.occurred_at} eventType={e.event_type} occurredAt={e.occurred_at} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function formatDayLabel(dateStr: string): string {
  const d = parseISO(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (format(d, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) return 'Hoje'
  if (format(d, 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd')) return 'Ontem'
  return format(d, "dd/MM 'de' MMMM", { locale: ptBR })
}
