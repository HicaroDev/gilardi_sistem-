'use server'

import { createClient } from '@/src/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function registerClockEvent(
  userId: string,
  eventType: 'entrada' | 'saida_almoco' | 'volta_almoco' | 'saida_final' | 'hora_extra_inicio' | 'hora_extra_fim'
) {
  const supabase = createClient()

  const { error } = await supabase.from('clock_events').insert({
    user_id: userId,
    event_type: eventType,
    occurred_at: new Date().toISOString(),
  })

  if (error) throw error

  revalidatePath('/')
  revalidatePath('/gestor')
  return { success: true }
}

export async function registerAbsenceJustification({
  userId,
  date,
  reason,
}: {
  userId: string
  date: string
  reason: string
}) {
  const supabase = createClient()

  const { error } = await supabase.from('absence_justifications').insert({
    user_id: userId,
    date,
    reason,
    created_by: userId,
  })

  if (error) throw error

  revalidatePath('/')
  revalidatePath('/gestor')
  return { success: true }
}

export async function registerAbsenceJustificationForUser({
  userId,
  createdBy,
  date,
  reason,
}: {
  userId: string
  createdBy: string
  date: string
  reason: string
}) {
  const supabase = createClient()

  const { error } = await supabase.from('absence_justifications').insert({
    user_id: userId,
    date,
    reason,
    created_by: createdBy,
  })

  if (error) throw error

  revalidatePath(`/gestor/${userId}`)
  revalidatePath('/gestor')
  return { success: true }
}
