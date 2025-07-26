"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
    Package, 
    Clock, 
    CheckCircle, 
    XCircle, 
    TrendingUp,
    AlertTriangle
} from "lucide-react";
import { useApprovalStats } from "@/hooks/useProductApprovals";

export function ApprovalStats() {
    const { data: stats, isLoading, error } = useApprovalStats();

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} className="bg-gradient-to-br from-morpheus-blue-dark/40 to-morpheus-blue-light/40 border-slate-700/50 shadow-xl animate-pulse">
                        <CardHeader className="pb-3">
                            <div className="h-4 bg-slate-600/50 rounded w-3/4"></div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-8 bg-slate-600/50 rounded w-1/2 mb-2"></div>
                            <div className="h-3 bg-slate-600/50 rounded w-full"></div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (error || !stats) {
        return (
            <Card className="bg-gradient-to-br from-morpheus-blue-dark/40 to-morpheus-blue-light/40 border-slate-700/50 shadow-xl">
                <CardContent className="p-6 text-center">
                    <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-2" />
                    <p className="text-red-400">Failed to load approval statistics</p>
                </CardContent>
            </Card>
        );
    }

    const statCards = [
        {
            title: "Total Products",
            value: stats.total,
            icon: Package,
            color: "text-blue-400",
            bgColor: "from-blue-500/20 to-blue-600/20",
            description: "All products in system",
            trend: null
        },
        {
            title: "Pending Approval",
            value: stats.pending,
            icon: Clock,
            color: "text-yellow-400",
            bgColor: "from-yellow-500/20 to-yellow-600/20",
            description: "Awaiting review",
            trend: stats.pending > 0 ? "urgent" : null
        },
        {
            title: "Approved",
            value: stats.approved,
            icon: CheckCircle,
            color: "text-green-400",
            bgColor: "from-green-500/20 to-green-600/20",
            description: "Ready for sale",
            trend: stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0
        },
        {
            title: "Approval Rate",
            value: stats.total > 0 ? `${Math.round((stats.approved / stats.total) * 100)}%` : "0%",
            icon: TrendingUp,
            color: "text-morpheus-gold-light",
            bgColor: "from-morpheus-gold-dark/20 to-morpheus-gold-light/20",
            description: "Overall success rate",
            trend: stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {statCards.map((stat) => {
                const Icon = stat.icon;
                const isUrgent = stat.trend === "urgent";
                const isGoodRate = typeof stat.trend === "number" && stat.trend >= 80;
                const isLowRate = typeof stat.trend === "number" && stat.trend < 50;
                
                return (
                    <Card 
                        key={stat.title} 
                        className={`bg-gradient-to-br from-morpheus-blue-dark/40 to-morpheus-blue-light/40 border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 ${
                            isUrgent ? 'ring-2 ring-yellow-400/50' : ''
                        }`}
                    >
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center justify-between text-white">
                                <span className="text-sm font-medium">{stat.title}</span>
                                <div className={`w-10 h-10 bg-gradient-to-r ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                                    <Icon className={`h-5 w-5 ${stat.color}`} />
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="text-2xl font-bold text-white">
                                    {stat.value}
                                </div>
                                <p className="text-sm text-gray-300">
                                    {stat.description}
                                </p>
                                
                                {/* Progress bar for percentages */}
                                {typeof stat.trend === "number" && stat.title !== "Approval Rate" && (
                                    <div className="mt-3">
                                        <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                                            <span>Progress</span>
                                            <span>{stat.trend}%</span>
                                        </div>
                                        <div className="w-full bg-slate-700/50 rounded-full h-2">
                                            <div 
                                                className={`h-2 rounded-full transition-all duration-500 ${
                                                    isGoodRate ? 'bg-gradient-to-r from-green-500 to-green-400' :
                                                    isLowRate ? 'bg-gradient-to-r from-red-500 to-red-400' :
                                                    'bg-gradient-to-r from-yellow-500 to-yellow-400'
                                                }`}
                                                style={{ width: `${Math.min(stat.trend, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Urgent indicator */}
                                {isUrgent && (
                                    <div className="flex items-center gap-1 text-xs text-yellow-400 mt-2">
                                        <AlertTriangle className="h-3 w-3" />
                                        <span>Requires attention</span>
                                    </div>
                                )}
                                
                                {/* Success indicator */}
                                {isGoodRate && stat.title === "Approval Rate" && (
                                    <div className="flex items-center gap-1 text-xs text-green-400 mt-2">
                                        <CheckCircle className="h-3 w-3" />
                                        <span>Excellent rate</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}