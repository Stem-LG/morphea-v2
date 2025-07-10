import { ProductSectionClient } from "./_components/product-section-client";

export default function ProductSectionPage({ params, searchParams }) {
    return (
        <ProductSectionClient 
            sectionId={params.sectionId}
            storeName={searchParams.storeName || ""}
            sectionTitle={searchParams.sectionTitle || ""}
        />
    );
}