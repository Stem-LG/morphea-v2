"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import {
  Eye,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Store,
  Camera,
  Filter,
  RefreshCw,
  TrendingUp,
  X,
} from "lucide-react";
import {
  useSceneAnalytics,
  useSceneOptions,
  useBoutiqueOptions,
} from "../_hooks/use-scene-analytics";
import { useLanguage } from "@/hooks/useLanguage";

type ChartType = "bar" | "pie" | "line";
type DataView = "scenes" | "boutiques";

interface SceneAnalyticsChartProps {
  className?: string;
}

// Enhanced color palette using morpheus theme colors
const MORPHEUS_COLORS = [
  "#e8d07a", // morpheus-gold-light
  "#785730", // morpheus-gold-dark
  "#063846", // morpheus-blue-light
  "#05141d", // morpheus-blue-dark
  "#3b82f6", // blue-500
  "#10b981", // emerald-500
  "#f59e0b", // amber-500
  "#ef4444", // red-500
  "#8b5cf6", // violet-500
  "#06b6d4", // cyan-500
];

// Helper function to process pie chart data with "other" grouping
const processPieChartData = (data: any[], threshold: number = 0.05) => {
  if (data.length === 0) return data;

  // Consolidate duplicate scene names by summing their views
  const consolidatedData = data.reduce((acc, item) => {
    const views = Number(item.views) || 0;
    const key = item.name;
    
    if (acc[key]) {
      // If scene name already exists, sum the views
      acc[key].views += views;
    } else {
      // First occurrence of this scene name
      acc[key] = {
        ...item,
        views
      };
    }
    
    return acc;
  }, {} as Record<string, any>);

  // Convert back to array with proper typing
  const consolidatedArray = Object.values(consolidatedData) as any[];

  // Calculate total views
  const totalViews = consolidatedArray.reduce((sum, item) => sum + (item.views || 0), 0);
  
  // Separate items above and below threshold
  const significantItems = consolidatedArray.filter(item => {
    const views = Number(item.views) || 0;
    const percentage = totalViews > 0 ? views / totalViews : 0;
    return percentage >= threshold;
  });
  
  const insignificantItems = consolidatedArray.filter(item => {
    const views = Number(item.views) || 0;
    const percentage = totalViews > 0 ? views / totalViews : 0;
    return percentage < threshold;
  });
  
  // Sort significant items by views (descending)
  significantItems.sort((a, b) => (Number(b.views) || 0) - (Number(a.views) || 0));
  
  // If there are insignificant items, group them into "Other"
  if (insignificantItems.length > 0) {
    const otherViews = insignificantItems.reduce((sum, item) => sum + (Number(item.views) || 0), 0);
    const otherItem = {
      name: "Other",
      fullName: "Other",
      views: otherViews,
      boutique: "Multiple",
      isOther: true
    };
    
    return [...significantItems, otherItem];
  }
  
  return significantItems;
};

// Custom tooltip component
const CustomTooltip = ({ active, payload, label, t }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-morpheus-blue-dark/95 backdrop-blur-sm border border-morpheus-gold-light/20 rounded-lg p-4 shadow-xl">
        <p className="text-morpheus-gold-light font-medium mb-2">
          {data.isOther ? `Other - Multiple ${t('admin.analytics.scenes')}` : `${data.fullName || label}`}
        </p>
        {!data.isOther && data.boutique && (
          <p className="text-gray-300 text-sm mb-1">
            {t('admin.analytics.boutique')}: {data.boutique}
          </p>
        )}
        <p className="text-white font-bold">
          {payload[0].value.toLocaleString()} {t('admin.analytics.views')}
        </p>
        {payload[0].payload.percentage && (
          <p className="text-morpheus-gold-light/80 text-sm">
            {(payload[0].payload.percentage * 100).toFixed(1)}%
          </p>
        )}
      </div>
    );
  }
  return null;
};

export function SceneAnalyticsChart({ className }: SceneAnalyticsChartProps) {
  const { t } = useLanguage();
  const [chartType, setChartType] = useState<ChartType>("bar");
  const [dataView, setDataView] = useState<DataView>("scenes");
  const [selectedBoutique, setSelectedBoutique] = useState<number | undefined>();
  const [selectedScene, setSelectedScene] = useState<number | undefined>();

  const {
    data: analyticsResult,
    isLoading,
    error,
    refetch,
  } = useSceneAnalytics({
    boutiqueId: selectedBoutique,
    sceneId: selectedScene,
  });

  const { data: sceneOptions } = useSceneOptions();
  const { data: boutiqueOptions } = useBoutiqueOptions();

  const analytics = analyticsResult?.data || [];
  const stats = analyticsResult?.stats;

  const handleClearFilters = () => {
    setSelectedBoutique(undefined);
    setSelectedScene(undefined);
  };

  // Summary statistics cards
  const renderSummaryCards = () => {
    if (!stats) return null;

    const summaryData = [
      {
        title: t('admin.analytics.totalViews'),
        value: stats.totalViews.toLocaleString(),
        icon: Eye,
        color: "text-morpheus-gold-light",
        bgColor: "bg-morpheus-gold-light/10",
        change: "+12.5%",
        changeType: "positive" as const,
      },
      {
        title: t('admin.analytics.totalScenes'),
        value: stats.totalScenes.toString(),
        icon: Camera,
        color: "text-blue-400",
        bgColor: "bg-blue-400/10",
        change: "+3",
        changeType: "positive" as const,
      },
      {
        title: t('admin.analytics.averageViews'),
        value: Math.round(stats.averageViewsPerScene).toLocaleString(),
        icon: TrendingUp,
        color: "text-emerald-400",
        bgColor: "bg-emerald-400/10",
        change: "+8.2%",
        changeType: "positive" as const,
      },
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {summaryData.map((item) => (
          <Card
            key={item.title}
            className="bg-gradient-to-br from-morpheus-blue-dark/60 to-morpheus-blue-light/40 border-morpheus-gold-light/20 hover:border-morpheus-gold-light/40 transition-all duration-300 hover:shadow-lg hover:shadow-morpheus-gold-light/10"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm font-medium mb-1">
                    {item.title}
                  </p>
                  <p className="text-2xl font-bold text-white mb-1">
                    {item.value}
                  </p>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-emerald-400" />
                    <span className="text-emerald-400 text-xs font-medium">
                      {item.change}
                    </span>
                    <span className="text-gray-400 text-xs">vs last month</span>
                  </div>
                </div>
                <div className={`${item.bgColor} ${item.color} p-3 rounded-lg`}>
                  <item.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderChart = () => {
    if (isLoading) {
      return (
        <div className="h-80 flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-morpheus-gold-light/20 border-t-morpheus-gold-light mx-auto mb-4"></div>
              <div className="absolute inset-0 animate-pulse">
                <div className="rounded-full h-16 w-16 bg-morpheus-gold-light/10 mx-auto"></div>
              </div>
            </div>
            <p className="text-white font-medium">{t('common.loading')}</p>
            <p className="text-gray-400 text-sm mt-1">Analyzing scene data...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="h-80 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="bg-red-500/10 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Camera className="h-10 w-10 text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {t('admin.analytics.failedToLoad')}
            </h3>
            <p className="text-gray-400 text-sm mb-4">{error.message}</p>
            <Button
              onClick={() => refetch()}
              variant="outline"
              className="border-morpheus-gold-light/30 text-morpheus-gold-light hover:bg-morpheus-gold-light/10 hover:border-morpheus-gold-light/50 transition-all duration-200"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {t('common.retry')}
            </Button>
          </div>
        </div>
      );
    }

    if (!analytics.length) {
      return (
        <div className="h-80 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="bg-gray-500/10 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <Eye className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {t('admin.analytics.noSceneData')}
            </h3>
            <p className="text-gray-300 mb-4">
              {selectedBoutique || selectedScene
                ? t('admin.analytics.noScenesMatchingFilters')
                : t('admin.analytics.noSceneViewData')}
            </p>
            {(selectedBoutique || selectedScene) && (
              <Button
                onClick={handleClearFilters}
                variant="outline"
                className="border-morpheus-gold-light/30 text-morpheus-gold-light hover:bg-morpheus-gold-light/10"
              >
                <X className="h-4 w-4 mr-2" />
                {t('admin.analytics.clearFilters')}
              </Button>
            )}
          </div>
        </div>
      );
    }

    // Prepare chart data based on data view
    let chartData;
    if (dataView === "boutiques" && stats?.viewsByBoutique) {
      chartData = stats.viewsByBoutique.map((boutique) => ({
        name: boutique.boutiqueName.length > 15 
          ? `${boutique.boutiqueName.substring(0, 15)}...` 
          : boutique.boutiqueName,
        fullName: boutique.boutiqueName,
        views: boutique.totalViews,
        sceneCount: boutique.sceneCount,
        type: "boutique",
      }));
    } else {
      chartData = analytics.map((scene) => ({
        name: scene.sceneName.length > 15 
          ? `${scene.sceneName.substring(0, 15)}...` 
          : scene.sceneName,
        fullName: scene.sceneName,
        views: scene.views,
        boutique: scene.boutiqueName || t('admin.unknown'),
        type: "scene",
      }));
    }

    switch (chartType) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#e8d07a" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#785730" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis
                dataKey="name"
                stroke="#9CA3AF"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fill: '#9CA3AF' }}
              />
              <YAxis stroke="#9CA3AF" fontSize={12} tick={{ fill: '#9CA3AF' }} />
              <Tooltip content={<CustomTooltip t={t} />} />
              <Bar 
                dataKey="views" 
                fill="url(#barGradient)" 
                radius={[4, 4, 0, 0]}
                className="hover:opacity-80 transition-opacity duration-200"
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case "pie":
        const pieChartData = processPieChartData(chartData).map((item) => ({
          ...item,
          percentage: stats ? item.views / stats.totalViews : 0,
        }));
        
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <defs>
                {MORPHEUS_COLORS.map((color, index) => (
                  <linearGradient key={index} id={`pieGradient${index}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.8} />
                    <stop offset="100%" stopColor={color} stopOpacity={0.6} />
                  </linearGradient>
                ))}
              </defs>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="views"
                className="outline-none"
              >
                {pieChartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={`url(#pieGradient${index % MORPHEUS_COLORS.length})`}
                    className="hover:opacity-80 transition-opacity duration-200 cursor-pointer"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip t={t} />} />
              <Legend 
                wrapperStyle={{ color: '#F9FAFB', fontSize: '12px' }}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        );

      case "line":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#e8d07a" />
                  <stop offset="100%" stopColor="#785730" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis
                dataKey="name"
                stroke="#9CA3AF"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fill: '#9CA3AF' }}
              />
              <YAxis stroke="#9CA3AF" fontSize={12} tick={{ fill: '#9CA3AF' }} />
              <Tooltip content={<CustomTooltip t={t} />} />
              <Line
                type="monotone"
                dataKey="views"
                stroke="url(#lineGradient)"
                strokeWidth={3}
                dot={{ fill: "#e8d07a", strokeWidth: 2, r: 6 }}
                activeDot={{ 
                  r: 8, 
                  stroke: "#e8d07a", 
                  strokeWidth: 2,
                  className: "animate-pulse"
                }}
                className="drop-shadow-sm"
              />
            </LineChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Summary Statistics Cards */}
      {renderSummaryCards()}

      {/* Main Chart */}
      <Card className="bg-gradient-to-br from-morpheus-blue-dark/60 to-morpheus-blue-light/40 border-morpheus-gold-light/20 shadow-xl shadow-morpheus-blue-dark/20">
        <CardHeader className="pb-4">
          <div className="flex flex-col space-y-4">
            {/* Header with title and main controls */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <CardTitle className="text-white flex items-center gap-3">
                <div className="bg-morpheus-gold-light/20 p-2 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-morpheus-gold-light" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{t('admin.analytics.sceneViewAnalytics')}</h2>
                  <p className="text-gray-300 text-sm font-normal mt-1">
                    Analyze performance across scenes and boutiques
                  </p>
                </div>
              </CardTitle>

              <div className="flex flex-wrap items-center gap-3">
                {/* Data View Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-gray-300 text-sm font-medium">View:</span>
                  <div className="flex items-center bg-morpheus-blue-dark/40 rounded-lg p-1 border border-morpheus-gold-light/20">
                    <Button
                      variant={dataView === "scenes" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setDataView("scenes")}
                      className={`px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                        dataView === "scenes"
                          ? "bg-morpheus-gold-light text-morpheus-blue-dark shadow-sm"
                          : "text-gray-300 hover:text-white hover:bg-morpheus-gold-light/10"
                      }`}
                    >
                      <Camera className="h-3 w-3 mr-1" />
                      Scenes
                    </Button>
                    <Button
                      variant={dataView === "boutiques" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setDataView("boutiques")}
                      className={`px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                        dataView === "boutiques"
                          ? "bg-morpheus-gold-light text-morpheus-blue-dark shadow-sm"
                          : "text-gray-300 hover:text-white hover:bg-morpheus-gold-light/10"
                      }`}
                    >
                      <Store className="h-3 w-3 mr-1" />
                      Boutiques
                    </Button>
                  </div>
                </div>

                {/* Chart Type Selector */}
                <div className="flex items-center bg-morpheus-blue-dark/40 rounded-lg p-1 border border-morpheus-gold-light/20">
                  <Button
                    variant={chartType === "bar" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setChartType("bar")}
                    className={`px-3 py-1.5 transition-all duration-200 ${
                      chartType === "bar"
                        ? "bg-morpheus-gold-light text-morpheus-blue-dark shadow-sm"
                        : "text-gray-300 hover:text-white hover:bg-morpheus-gold-light/10"
                    }`}
                  >
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={chartType === "pie" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setChartType("pie")}
                    className={`px-3 py-1.5 transition-all duration-200 ${
                      chartType === "pie"
                        ? "bg-morpheus-gold-light text-morpheus-blue-dark shadow-sm"
                        : "text-gray-300 hover:text-white hover:bg-morpheus-gold-light/10"
                    }`}
                  >
                    <PieChartIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={chartType === "line" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setChartType("line")}
                    className={`px-3 py-1.5 transition-all duration-200 ${
                      chartType === "line"
                        ? "bg-morpheus-gold-light text-morpheus-blue-dark shadow-sm"
                        : "text-gray-300 hover:text-white hover:bg-morpheus-gold-light/10"
                    }`}
                  >
                    <LineChartIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-gray-300">
                <Filter className="h-4 w-4" />
                <span className="text-sm font-medium">Filters:</span>
              </div>
              
              {/* Boutique Filter */}
              <Select
                value={selectedBoutique?.toString() || "all-boutiques"}
                onValueChange={(value) => setSelectedBoutique(value === "all-boutiques" ? undefined : Number(value))}
              >
                <SelectTrigger className="w-48 bg-morpheus-blue-dark/40 border-morpheus-gold-light/20 text-white hover:border-morpheus-gold-light/40 transition-colors">
                  <SelectValue placeholder={t('admin.analytics.allBoutiques')} />
                </SelectTrigger>
                <SelectContent className="bg-morpheus-blue-dark border-morpheus-gold-light/20">
                  <SelectItem value="all-boutiques" className="text-white hover:bg-morpheus-gold-light/10">
                    {t('admin.analytics.allBoutiques')}
                  </SelectItem>
                  {boutiqueOptions?.map((boutique) => (
                    <SelectItem 
                      key={boutique.value} 
                      value={boutique.value.toString()}
                      className="text-white hover:bg-morpheus-gold-light/10"
                    >
                      {boutique.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Scene Filter */}
              <Select
                value={selectedScene?.toString() || "all-scenes"}
                onValueChange={(value) => setSelectedScene(value === "all-scenes" ? undefined : Number(value))}
              >
                <SelectTrigger className="w-48 bg-morpheus-blue-dark/40 border-morpheus-gold-light/20 text-white hover:border-morpheus-gold-light/40 transition-colors">
                  <SelectValue placeholder={t('admin.analytics.allScenes')} />
                </SelectTrigger>
                <SelectContent className="bg-morpheus-blue-dark border-morpheus-gold-light/20">
                  <SelectItem value="all-scenes" className="text-white hover:bg-morpheus-gold-light/10">
                    {t('admin.analytics.allScenes')}
                  </SelectItem>
                  {sceneOptions?.map((scene) => (
                    <SelectItem 
                      key={scene.value} 
                      value={scene.value.toString()}
                      className="text-white hover:bg-morpheus-gold-light/10"
                    >
                      {scene.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {(selectedBoutique || selectedScene) && (
                <Button
                  onClick={handleClearFilters}
                  variant="outline"
                  size="sm"
                  className="border-morpheus-gold-light/30 text-morpheus-gold-light hover:bg-morpheus-gold-light/10 hover:border-morpheus-gold-light/50 transition-all duration-200"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              )}
            </div>

            {/* Active Filters */}
            {(selectedBoutique || selectedScene) && (
              <div className="flex flex-wrap gap-2">
                {selectedBoutique && (
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30 transition-colors">
                    <Store className="h-3 w-3 mr-1" />
                    {boutiqueOptions?.find(b => b.value === selectedBoutique)?.label}
                  </Badge>
                )}
                {selectedScene && (
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30 transition-colors">
                    <Camera className="h-3 w-3 mr-1" />
                    {sceneOptions?.find(s => s.value === selectedScene)?.label}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="bg-morpheus-blue-dark/20 rounded-lg p-4 border border-morpheus-gold-light/10">
            {renderChart()}
          </div>
        </CardContent>
      </Card>

      {/* Top Boutiques by Views */}
      {stats?.viewsByBoutique.length > 0 && (
        <Card className="bg-gradient-to-br from-morpheus-blue-dark/60 to-morpheus-blue-light/40 border-morpheus-gold-light/20 shadow-xl shadow-morpheus-blue-dark/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-3">
              <div className="bg-morpheus-gold-light/20 p-2 rounded-lg">
                <Store className="h-6 w-6 text-morpheus-gold-light" />
              </div>
              <div>
                <h3 className="text-lg font-bold">{t('admin.analytics.viewsByBoutique')}</h3>
                <p className="text-gray-300 text-sm font-normal mt-1">
                  Top performing boutiques by total views
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.viewsByBoutique.slice(0, 5).map((boutique, index) => (
                <div
                  key={boutique.boutiqueId}
                  className="flex items-center justify-between p-4 bg-morpheus-blue-dark/30 rounded-lg border border-morpheus-gold-light/10 hover:border-morpheus-gold-light/20 transition-all duration-200 hover:bg-morpheus-blue-dark/40"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-morpheus-gold-light/20 to-morpheus-gold-dark/20 rounded-full border border-morpheus-gold-light/30">
                      <span className="text-morpheus-gold-light font-bold text-sm">
                        #{index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-semibold text-base">{boutique.boutiqueName}</p>
                      <p className="text-sm text-gray-400">
                        {boutique.sceneCount} {boutique.sceneCount === 1 ? t('admin.analytics.scene') : t('admin.analytics.scenes')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold text-lg">{boutique.totalViews.toLocaleString()}</p>
                    <p className="text-sm text-gray-400">{t('admin.analytics.views')}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}