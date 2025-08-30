import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Store card skeleton component
export function StoreCardSkeleton() {
    return (
        <Card className="bg-gradient-to-br from-gray-50/50 to-white/50 border-gray-200 backdrop-blur-sm">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg bg-gray-300" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-32 bg-gray-300" />
                        <Skeleton className="h-4 w-24 bg-gray-300" />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 bg-gray-300" />
                    <Skeleton className="h-4 w-48 bg-gray-300" />
                </div>
            </CardContent>
            <CardFooter>
                <Skeleton className="h-9 w-32 bg-gray-300" />
            </CardFooter>
        </Card>
    );
}
