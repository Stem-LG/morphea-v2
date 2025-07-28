"use client";
import { Card, CardContent } from "@/components/ui/card";

// Event Card Skeleton Component
export function EventCardSkeleton() {
    return (
        <Card className="bg-gradient-to-br from-morpheus-purple/20 to-morpheus-blue/10 border-morpheus-purple/30 backdrop-blur-sm overflow-hidden animate-pulse">
            <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <div className="h-6 bg-gray-700/50 rounded mb-2"></div>
                        <div className="h-4 bg-gray-700/30 rounded w-2/3"></div>
                    </div>
                    <div className="h-12 w-12 bg-gray-700/50 rounded-full"></div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="h-4 w-4 bg-gray-700/50 rounded"></div>
                        <div className="h-4 bg-gray-700/30 rounded flex-1"></div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-4 w-4 bg-gray-700/50 rounded"></div>
                        <div className="h-4 bg-gray-700/30 rounded flex-1"></div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-4 w-4 bg-gray-700/50 rounded"></div>
                        <div className="h-4 bg-gray-700/30 rounded w-3/4"></div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
