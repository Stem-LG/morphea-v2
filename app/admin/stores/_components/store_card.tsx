import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { MapPin, Settings, Store, Edit, Trash2 } from "lucide-react";
import Link from "next/link";

interface StoreCardProps {
    store: any;
    onEdit?: (store: any) => void;
    onDelete?: (store: any) => void;
}

// Store card component
export function StoreCard({ store, onEdit, onDelete }: StoreCardProps) {
    const { t } = useLanguage();
    const { data: user } = useAuth();

    const isAdmin = user?.app_metadata?.roles?.includes("admin");

    const handleEdit = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onEdit?.(store);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onDelete?.(store);
    };

    return (
        <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border-gray-700/50 backdrop-blur-sm hover:border-morpheus-gold-light/30 transition-all duration-300 hover:shadow-lg hover:shadow-morpheus-gold-light/10">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light flex items-center justify-center">
                        <Store className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                        <CardTitle className="text-white text-lg">{store.yboutiqueintitule}</CardTitle>
                    </div>
                    {isAdmin && (
                        <div className="flex gap-1">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleEdit}
                                className="h-8 w-8 p-0 border-gray-600 text-gray-300 hover:bg-gray-800/50 hover:text-white hover:border-morpheus-gold-light/50"
                            >
                                <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleDelete}
                                className="h-8 w-8 p-0 border-gray-600 text-gray-300 hover:bg-red-900/50 hover:text-red-400 hover:border-red-500/50"
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-gray-300">
                    <MapPin className="h-4 w-4 text-morpheus-gold-light" />
                    <span className="text-sm">{store.yboutiqueadressemall || t("admin.noAddress")}</span>
                </div>
            </CardContent>
            <CardFooter>
                <Link href={`/admin/stores/${store.yboutiqueid}`} className="w-full">
                    <Button
                        className="w-full bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light hover:from-morpheus-gold-dark hover:to-morpheus-gold-light text-white font-semibold transition-all duration-300 hover:scale-105"
                        size="sm"
                    >
                        <Settings className="h-4 w-4 mr-2" />
                        {t("admin.manageStore")}
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    );
}
