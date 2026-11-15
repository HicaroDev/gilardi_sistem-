'use client'

import { Button } from '@/src/components/ui/button'
import { Clock, Plus, Timer } from 'lucide-react'
import { registerClockEvent } from '@/src/app/actions'
import { useEffect, useState } from 'react'

type EventType = 'entrada' | 'saida_almoco' | 'volta_almoco' | 'saida_final' | 'hora_extra_inicio' | 'hora_extra_fim'

interface ClockButtonProps {
  userId: string
  nextEvent: EventType | null
  disabled?: boolean
}

const EVENT_LABELS: Record<EventType, { label: string; icon: React.ElementType }> = {
  entrada: { label: 'Bater entrada', icon: Timer },
  saida_almoco: { label: 'Saída pro almoço', icon: Clock },
  volta_almoco: { label: 'Volta do almoço', icon: Clock },
  saida_final: { label: 'Saída final', icon: Timer },
  hora_extra_inicio: { label: 'Início hora extra', icon: Plus },
  hora_extra_fim: { label: 'Fim hora extra', icon: Plus },
}

export function ClockButton({ userId, nextEvent, disabled }: ClockButtonProps) {
  const [pending, setPending] = useState(false)

  const handleClick = async () => {
    if (!nextEvent || disabled) return
    setPending(true)
    try {
      await registerClockEvent(userId, nextEvent)
    } catch (err) {
      console.error(err)
      alert('Erro ao registrar ponto. Tente novamente.')
    } finally {
      setPending(false)
    }
  }

  if (!nextEvent) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-slate-100 text-slate-400 text-sm font-medium">
        <Clock className="w-4 h-4" />
        <span>Sem evento pendente hoje</span>
      </div>
    )
  }

  const { label, icon: Icon } = EVENT_LABELS[nextEvent]

  return (
    <Button
      onClick={handleClick}
      disabled={pending || disabled}
      className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 px-4 py-3 text-lg font-semibold"
      loading={pending}
    >
      <Icon className="w-5 h-5" />
      {label}
    </Button>
  )
}
