"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle, Package } from "lucide-react";
import { useApprovalStats } from "@/hooks/useProductApprovals";

export function ApprovalStats() {
    const { data: stats, isLoading, error } = useApprovalStats();

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {[...Array(3)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                        <CardHeader className="pb-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-full"></div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (error || !stats) {
        return (
            <Card className="mb-6">
                <CardContent className="p-6">
                    <p className="text-red-600">Failed to load approval statistics</p>
                </CardContent>
            </Card>
        );
    }

    const statCards = [
        {
            title: "Total Products",
            value: stats.total,
            icon: Package,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
        },
        {
            title: "Not Approved",
            value: stats.pending,
            icon: Clock,
            color: "text-yellow-600",
            bgColor: "bg-yellow-50",
        },
        {
            title: "Approved",
            value: stats.approved,
            icon: CheckCircle,
            color: "text-green-600",
            bgColor: "bg-green-50",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {statCards.map((stat) => {
                const Icon = stat.icon;
                return (
                    <Card key={stat.title}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                {stat.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center space-x-2">
                                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                                    <Icon className={`h-4 w-4 ${stat.color}`} />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">{stat.value}</div>
                                    {stats.total > 0 && (
                                        <div className="text-xs text-gray-500">
                                            {((stat.value / stats.total) * 100).toFixed(1)}%
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}