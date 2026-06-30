import { createClient } from '@/lib/supabase'

export type Plan = 'free' | 'pro'

export const LIMITS = {
  free: {
    clients: 2,
    invoicesPerMonth: 3,
    remindersPerMonth: 2,
  },
  pro: {
    clients: Infinity,
    invoicesPerMonth: Infinity,
    remindersPerMonth: Infinity,
  },
}

export async function getUserPlan(): Promise<Plan> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 'free'

  const { data } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  return (data?.plan as Plan) || 'free'
}

export async function getUsage(userId: string) {
  const supabase = createClient()
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [{ count: clientCount }, { data: profile }] = await Promise.all([
    supabase.from('clients').select('*', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('profiles').select('*').eq('id', userId).single(),
  ])

  const resetAt = profile?.invoice_reset_at ? new Date(profile.invoice_reset_at) : new Date(0)
  const needsReset = resetAt.getMonth() !== now.getMonth() || resetAt.getFullYear() !== now.getFullYear()

  if (needsReset) {
    await supabase.from('profiles').update({
      invoice_count_this_month: 0,
      reminder_count_this_month: 0,
      invoice_reset_at: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
    }).eq('id', userId)
  }

  return {
    plan: (profile?.plan as Plan) || 'free',
    clientCount: clientCount || 0,
    invoiceCount: needsReset ? 0 : (profile?.invoice_count_this_month || 0),
    reminderCount: needsReset ? 0 : (profile?.reminder_count_this_month || 0),
  }
}

export async function incrementInvoiceCount(userId: string) {
  const supabase = createClient()
  const { data } = await supabase.from('profiles').select('invoice_count_this_month').eq('id', userId).single()
  await supabase.from('profiles').update({
    invoice_count_this_month: (data?.invoice_count_this_month || 0) + 1
  }).eq('id', userId)
}

export async function incrementReminderCount(userId: string) {
  const supabase = createClient()
  const { data } = await supabase.from('profiles').select('reminder_count_this_month').eq('id', userId).single()
  await supabase.from('profiles').update({
    reminder_count_this_month: (data?.reminder_count_this_month || 0) + 1
  }).eq('id', userId)
}
