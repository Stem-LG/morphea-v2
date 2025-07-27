import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';
import { createClient } from '@/lib/client';

export default function ProductApprovals() {
  const { t } = useLanguage();
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Fetch products with yprodstatut = 'not_approved'
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const supabase = createClient();
      const { data } = await supabase
        .schema('morpheus')
        .from('yprod')
        .select('*')
        .eq('yprodstatut', 'not_approved');
      setProducts(data || []);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.productApprovals.title') || 'Product Approvals'}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>{t('common.loading')}</div>
          ) : (
            <div>
              {products.length === 0 ? (
                <div>{t('admin.productApprovals.noProducts') || 'No products to approve.'}</div>
              ) : (
                <ul className="space-y-2">
                  {products.map(product => (
                    <li key={product.yprodid} className="border p-2 rounded flex justify-between items-center">
                      <span>{product.yprodintitule}</span>
                      <Button size="sm" onClick={() => { setSelectedProduct(product); setShowDetails(true); }}>
                        {t('admin.productApprovals.details') || 'Details'}
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      {/* Details Modal/Drawer */}
      {showDetails && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
          <Card className="max-w-lg w-full mx-4">
            <CardHeader>
              <CardTitle>{selectedProduct.yprodintitule}</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Product details and approval form will go here */}
              <div className="space-y-2">
                <div><strong>{t('admin.productApprovals.code') || 'Code'}:</strong> {selectedProduct.yprodcode}</div>
                <div><strong>{t('admin.productApprovals.status') || 'Status'}:</strong> {selectedProduct.yprodstatut}</div>
                <div><strong>{t('admin.productApprovals.details') || 'Details'}:</strong> {selectedProduct.yproddetailstech}</div>
                {/* Approval actions */}
                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="default" onClick={() => {/* handle approve */}}>
                    {t('admin.productApprovals.approve') || 'Approve'}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => {/* handle needs revision */}}>
                    {t('admin.productApprovals.needsRevision') || 'Needs Revision'}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => { setShowDetails(false); setSelectedProduct(null); }}>
                    {t('common.cancel') || 'Cancel'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
