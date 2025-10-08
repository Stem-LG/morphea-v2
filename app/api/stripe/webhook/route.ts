import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/server'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
    try {
        const body = await request.text()
        const headersList = await headers()
        const sig = headersList.get('stripe-signature')

        if (!sig) {
            return NextResponse.json({ error: 'No signature' }, { status: 400 })
        }

        let event

        try {
            // Only verify signature if webhook secret is provided
            if (process.env.STRIPE_WEBHOOK_SECRET) {
                event = stripe.webhooks.constructEvent(
                    body,
                    sig,
                    process.env.STRIPE_WEBHOOK_SECRET
                )
            } else {
                // For development/testing, accept events without signature verification
                event = JSON.parse(body)
            }
        } catch (err: any) {
            console.error('Webhook verification failed:', err.message)
            return NextResponse.json(
                { error: 'Webhook verification failed' },
                { status: 400 }
            )
        }

        const supabase = createClient()

        // Handle the event
        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object
                const { userId, orderItems } = paymentIntent.metadata

                // Update order status to paid
                if (orderItems) {
                    const items = JSON.parse(orderItems)
                    // Here you would update the order status in your database
                    // For now, we'll just log it
                    console.log('Payment succeeded for user:', userId, 'items:', items)
                }
                break

            case 'payment_intent.payment_failed':
                const failedPayment = event.data.object
                console.log('Payment failed:', failedPayment.id)
                // Handle failed payment
                break

            default:
                console.log(`Unhandled event type ${event.type}`)
        }

        return NextResponse.json({ received: true })
    } catch (error: any) {
        console.error('Webhook error:', error)
        return NextResponse.json(
            { error: 'Webhook handler failed' },
            { status: 500 }
        )
    }
}