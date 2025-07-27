import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { createClient } from '@/lib/server'

// Helper function to check if user has access to the store
async function checkUserStoreAccess(request: NextRequest, storeId: string) {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return { hasAccess: false, error: 'Unauthorized' }
  }

  const userMetadata = user.app_metadata as { roles?: string[], assigned_stores?: number[] }
  const roles = userMetadata?.roles || []
  const assignedStores = userMetadata?.assigned_stores || []

  // Admin users have access to all stores
  if (roles.includes('admin')) {
    return { hasAccess: true, error: null, user }
  }

  // Store admin users only have access to their assigned stores
  if (roles.includes('store_admin')) {
    const hasAccess = assignedStores.includes(parseInt(storeId))
    return { hasAccess, error: hasAccess ? null : 'Access denied to this store', user }
  }

  return { hasAccess: false, error: 'Insufficient permissions' }
}

// POST /api/admin/stores/[storeId]/products/new - Create a new product with variants and media
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params

    // Check if current user has access to this store
    const { hasAccess, error, user } = await checkUserStoreAccess(request, storeId)
    
    if (!hasAccess) {
      return NextResponse.json(
        { error: error || 'Access denied' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { 
      yprodintitule, 
      yprodcode, 
      yproddetailstech, 
      yprodinfobulle,
      xcategprodidfk,
      variants = [],
      objects3d = []
    } = body

    // Validate required fields
    if (!yprodintitule || !yprodcode || !yproddetailstech) {
      return NextResponse.json(
        { error: 'Product name, code, and description are required' },
        { status: 400 }
      )
    }

    const adminSupabase = createAdminClient()

    // Generate unique product ID
    const productId = Date.now()

    // Create the main product
    const { data: newProduct, error: productError } = await adminSupabase
      .schema('morpheus')
      .from('yprod')
      .insert({
        yprodid: productId,
        yprodintitule,
        yprodcode,
        yproddetailstech,
        yprodinfobulle,
        xcategprodidfk: xcategprodidfk ? parseInt(xcategprodidfk) : null,
        ydesignidfk: parseInt(storeId), // Link to store/design
        yprodstatut: 'not_approved', // New products start as pending approval
        sysdate: new Date().toISOString(),
        sysaction: 'insert',
        sysuser: user?.email || 'system'
      })
      .select()
      .single()

    if (productError) {
      console.error('Error creating product:', productError)
      return NextResponse.json(
        { error: 'Failed to create product' },
        { status: 500 }
      )
    }

    // Create product variants if provided
    const createdVariants = []
    if (variants.length > 0) {
      for (const [index, variant] of variants.entries()) {
        const variantId = Date.now() + index + 1000 // Ensure unique IDs
        
        try {
          const { data: newVariant, error: variantError } = await adminSupabase
            .schema('morpheus')
            .from('yvarprod')
            .insert({
              yprodidfk: productId,
              yvarprodid: variantId,
              yvarprodcode: `${yprodcode}-${variant.color}-${variant.size}`,
              yvarprodintitule: `${yprodintitule} - ${variant.color} ${variant.size}`,
              yvarprodgenre: variant.size || '',
              yvarprodprixcatalogue: variant.price || 0,
              yvarprodnbrjourlivraison: 7, // Default delivery time
              xcouleuridfk: 1, // Default color ID - should be mapped from variant.color
              xtailleidfk: 1, // Default size ID - should be mapped from variant.size
              xdeviseidfk: variant.currencyId || 1, // Use selected currency ID
              sysdate: new Date().toISOString(),
              sysaction: 'insert',
              sysuser: user?.email || 'system'
            })
            .select()
            .single()

          if (variantError) {
            console.error('Error creating variant:', variantError)
            // Continue with other variants even if one fails
          } else {
            createdVariants.push(newVariant)
          }
        } catch (error) {
          console.error('Error creating variant:', error)
          // Continue with other variants
        }
      }
    }

    // Create 3D objects and media if provided - Link to variants, not products
    const created3DObjects = []
    if (objects3d.length > 0 && createdVariants.length > 0) {
      for (const [index, obj] of objects3d.entries()) {
        if (!obj.url || !obj.url.trim()) {
          continue // Skip empty URLs
        }

        // Find matching variant by color, or use first variant as default
        const matchingVariant = createdVariants.find(variant =>
          variant.yvarprodcode?.includes(obj.color?.toLowerCase())
        ) || createdVariants[0]

        try {
          const { data: new3DObject, error: object3dError } = await adminSupabase
            .schema('morpheus')
            .from('yobjet3d')
            .insert({
              yobjet3did: Date.now() + index + 2000, // Ensure unique IDs
              yobjet3durl: obj.url,
              yobjet3dcouleur: obj.color || 'Default',
              yobjet3dorder: obj.order || index,
              yvarprodidfk: matchingVariant.yvarprodid, // Link to variant, not product
              yobjet3daction: 'insert',
              yobjet3dstatut: obj.isActive ? 'active' : 'inactive',
              yobjet3ddescription: obj.description || '',
              sysdate: new Date().toISOString(),
              sysuser: user?.email || 'system'
            })
            .select()
            .single()

          if (object3dError) {
            console.error('Error creating 3D object:', object3dError)
            // Continue with other objects even if one fails
          } else {
            created3DObjects.push(new3DObject)
          }
        } catch (error) {
          console.error('Error creating 3D object:', error)
          // Continue with other objects
        }
      }
    }

    // Return success response with created data
    return NextResponse.json({
      success: true,
      product: newProduct,
      variants: createdVariants,
      objects3d: created3DObjects,
      message: 'Product created successfully with variants and media'
    }, { status: 201 })

  } catch (error) {
    console.error('Error in POST /api/admin/stores/[storeId]/products/new:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/admin/stores/[storeId]/products/new - Get form data (categories, colors, sizes)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params

    // Check if current user has access to this store
    const { hasAccess, error } = await checkUserStoreAccess(request, storeId)
    
    if (!hasAccess) {
      return NextResponse.json(
        { error: error || 'Access denied' },
        { status: 403 }
      )
    }

    const adminSupabase = createAdminClient()

    // Fetch categories
    const { data: categories, error: categoriesError } = await adminSupabase
      .schema('morpheus')
      .from('xcategprod')
      .select('*')
      .order('xcategprodintitule')

    // Fetch colors
    const { data: colors, error: colorsError } = await adminSupabase
      .schema('morpheus')
      .from('xcouleur')
      .select('*')
      .order('xcouleurintitule')

    // Fetch sizes
    const { data: sizes, error: sizesError } = await adminSupabase
      .schema('morpheus')
      .from('xtaille')
      .select('*')
      .order('xtailleintitule')

    // Return form data (even if some queries fail, return what we have)
    return NextResponse.json({
      categories: categories || [],
      colors: colors || [],
      sizes: sizes || [],
      errors: {
        categories: categoriesError?.message,
        colors: colorsError?.message,
        sizes: sizesError?.message
      }
    })

  } catch (error) {
    console.error('Error in GET /api/admin/stores/[storeId]/products/new:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}