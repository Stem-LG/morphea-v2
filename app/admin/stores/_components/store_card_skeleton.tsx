import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Store card skeleton component
export function StoreCardSkeleton() {
    return (
        <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border-gray-700/50 backdrop-blur-sm">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg bg-gray-700" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-32 bg-gray-700" />
                        <Skeleton className="h-4 w-24 bg-gray-700" />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 bg-gray-700" />
                    <Skeleton className="h-4 w-48 bg-gray-700" />
                </div>
            </CardContent>
            <CardFooter>
                <Skeleton className="h-9 w-32 bg-gray-700" />
            </CardFooter>
        </Card>
    );
}
