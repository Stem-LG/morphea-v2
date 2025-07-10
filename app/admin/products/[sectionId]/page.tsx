import { ProductSectionClient } from "./_components/product-section-client";

interface ProductSectionPageProps {
    params: {
        sectionId: string;
    };
    searchParams: {
        storeName?: string;
        sectionTitle?: string;
    };
}

export default function ProductSectionPage({ params, searchParams }: ProductSectionPageProps) {
    return (
        <ProductSectionClient 
            sectionId={params.sectionId}
            storeName={searchParams.storeName || ""}
            sectionTitle={searchParams.sectionTitle || ""}
        />
    );
}