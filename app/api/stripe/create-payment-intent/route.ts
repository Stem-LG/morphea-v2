import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/server'

export async function POST(request: NextRequest) {
    try {
        const { amount, currency, orderItems, userId } = await request.json()

        if (!amount || !currency || !orderItems || !userId) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Create a PaymentIntent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Stripe expects amount in cents
            currency: currency.toLowerCase(),
            metadata: {
                userId,
                orderItems: JSON.stringify(orderItems),
            },
        })

        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
        })
    } catch (error: any) {
        console.error('Error creating payment intent:', error)
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}