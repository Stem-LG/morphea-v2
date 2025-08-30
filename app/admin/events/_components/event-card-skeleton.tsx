'use client'
import { Card, CardContent } from '@/components/ui/card'

// Event Card Skeleton Component
export function EventCardSkeleton() {
    return (
        <Card className="from-gray-50/50 to-white/50 border-gray-200/50 animate-pulse overflow-hidden bg-gradient-to-br backdrop-blur-sm shadow-xl">
            <CardContent className="p-6">
                <div className="mb-4 flex items-start justify-between">
                    <div className="flex-1">
                        <div className="mb-2 h-6 rounded bg-gray-200"></div>
                        <div className="h-4 w-2/3 rounded bg-gray-100"></div>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-gray-200"></div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded bg-gray-200"></div>
                        <div className="h-4 flex-1 rounded bg-gray-100"></div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded bg-gray-200"></div>
                        <div className="h-4 flex-1 rounded bg-gray-100"></div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded bg-gray-200"></div>
                        <div className="h-4 w-3/4 rounded bg-gray-100"></div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
