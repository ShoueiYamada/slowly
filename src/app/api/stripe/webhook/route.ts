import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error('Webhook signature error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  console.log('Webhook event type:', event.type)

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.userId
    console.log('userId from metadata:', userId)

    if (userId) {
      const { error } = await supabase
        .from('profiles')
        .upsert({ id: userId, plan: 'pro' })
      console.log('Supabase update error:', error)
      if (!error) console.log('Successfully upgraded to pro:', userId)
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    const customerId = subscription.customer as string
    const customer = await stripe.customers.retrieve(customerId)

    if (customer && !customer.deleted && 'email' in customer && customer.email) {
      const { data: user } = await supabase.auth.admin.getUserByEmail(customer.email)
      if (user?.user?.id) {
        await supabase.from('profiles').upsert({ id: user.user.id, plan: 'free' })
        console.log('Downgraded to free:', user.user.id)
      }
    }
  }

  return NextResponse.json({ received: true })
}
