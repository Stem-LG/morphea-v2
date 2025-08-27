import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase';

const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Update single product visibility
export async function PATCH(request: NextRequest) {
    try {
        const { productId, yestvisible } = await request.json();

        if (!productId || typeof yestvisible !== 'boolean') {
            return NextResponse.json(
                { error: 'Product ID and visibility status are required' },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .schema('morpheus')
            .from('yprod')
            .update({ yestvisible })
            .eq('yprodid', productId)
            .select('yprodid, yestvisible')
            .single();

        if (error) {
            console.error('Error updating product visibility:', error);
            return NextResponse.json(
                { error: 'Failed to update product visibility' },
                { status: 500 }
            );
        }

        return NextResponse.json({ data });
    } catch (error) {
        console.error('Error in PATCH /api/admin/products/visibility:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Bulk update product visibility
export async function POST(request: NextRequest) {
    try {
        const { productIds, yestvisible } = await request.json();

        if (!productIds || !Array.isArray(productIds) || typeof yestvisible !== 'boolean') {
            return NextResponse.json(
                { error: 'Product IDs array and visibility status are required' },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .schema('morpheus')
            .from('yprod')
            .update({ yestvisible })
            .in('yprodid', productIds)
            .select('yprodid, yestvisible');

        if (error) {
            console.error('Error bulk updating product visibility:', error);
            return NextResponse.json(
                { error: 'Failed to update product visibility' },
                { status: 500 }
            );
        }

        return NextResponse.json({ 
            data, 
            message: `Updated ${data.length} products` 
        });
    } catch (error) {
        console.error('Error in POST /api/admin/products/visibility:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}