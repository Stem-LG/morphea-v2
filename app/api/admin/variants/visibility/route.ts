import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase';

const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Update single variant visibility
export async function PATCH(request: NextRequest) {
    try {
        const { variantId, yestvisible } = await request.json();

        if (!variantId || typeof yestvisible !== 'boolean') {
            return NextResponse.json(
                { error: 'Variant ID and visibility status are required' },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .schema('morpheus')
            .from('yvarprod')
            .update({ yestvisible })
            .eq('yvarprodid', variantId)
            .select('yvarprodid, yestvisible')
            .single();

        if (error) {
            console.error('Error updating variant visibility:', error);
            return NextResponse.json(
                { error: 'Failed to update variant visibility' },
                { status: 500 }
            );
        }

        return NextResponse.json({ data });
    } catch (error) {
        console.error('Error in PATCH /api/admin/variants/visibility:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Bulk update variant visibility
export async function POST(request: NextRequest) {
    try {
        const { variantIds, yestvisible } = await request.json();

        if (!variantIds || !Array.isArray(variantIds) || typeof yestvisible !== 'boolean') {
            return NextResponse.json(
                { error: 'Variant IDs array and visibility status are required' },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .schema('morpheus')
            .from('yvarprod')
            .update({ yestvisible })
            .in('yvarprodid', variantIds)
            .select('yvarprodid, yestvisible');

        if (error) {
            console.error('Error bulk updating variant visibility:', error);
            return NextResponse.json(
                { error: 'Failed to update variant visibility' },
                { status: 500 }
            );
        }

        return NextResponse.json({ 
            data, 
            message: `Updated ${data.length} variants` 
        });
    } catch (error) {
        console.error('Error in POST /api/admin/variants/visibility:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}