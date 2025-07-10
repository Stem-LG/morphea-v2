import { ProductCategoryClient } from "./_components/product-category-client";

export default function ProductCategoryPage({ params, searchParams }) {
    return (
        <div className="p-6">
            <ProductCategoryClient
                storeId={params.storeId}
                categoryId={params.categoryId}
                storeName={searchParams.storeName as string || ""}
                categoryName={searchParams.categoryName as string || ""}
            />
        </div>
    );
}