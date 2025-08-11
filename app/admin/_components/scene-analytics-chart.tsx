"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import {
  useSceneAnalytics,
  useSceneOptions,
  useBoutiqueOptions,
} from "../_hooks/use-scene-analytics";
import { useLanguage } from "@/hooks/useLanguage";

type ChartType = "bar" | "pie" | "line";

interface SceneAnalyticsChartProps {
  className?: string;
}

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#00ff00",
  "#0088fe",
  "#00c49f",
  "#ffbb28",
  "#ff8042",
  "#8dd1e1",
];

export function SceneAnalyticsChart({ className }: SceneAnalyticsChartProps) {
  const { t } = useLanguage();
  const [chartType, setChartType] = useState<ChartType>("bar");
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

  const { data: sceneOptions, isLoading: scenesLoading } = useSceneOptions();
  const { data: boutiqueOptions, isLoading: boutiquesLoading } = useBoutiqueOptions();

  const analytics = analyticsResult?.data || [];
  const stats = analyticsResult?.stats;

  const handleClearFilters = () => {
    setSelectedBoutique(undefined);
    setSelectedScene(undefined);
  };

  const renderChart = () => {
    if (isLoading) {
      return (
        <div className="h-80 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-morpheus-gold-light/30 border-t-morpheus-gold-light mx-auto mb-4"></div>
            <p className="text-white">{t('common.loading')}</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="h-80 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-400 mb-4">
              <Camera className="h-12 w-12 mx-auto mb-2" />
              <p>{t('admin.analytics.failedToLoad')}</p>
              <p className="text-sm text-gray-400">{error.message}</p>
            </div>
            <Button
              onClick={() => refetch()}
              variant="outline"
              className="border-slate-600 text-white hover:bg-slate-700/50"
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
          <div className="text-center">
            <Eye className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">{t('admin.analytics.noSceneData')}</h3>
            <p className="text-gray-300">
              {selectedBoutique || selectedScene
                ? t('admin.analytics.noScenesMatchingFilters')
                : t('admin.analytics.noSceneViewData')}
            </p>
            {(selectedBoutique || selectedScene) && (
              <Button
                onClick={handleClearFilters}
                variant="outline"
                className="mt-4 border-slate-600 text-white hover:bg-slate-700/50"
              >
                {t('admin.analytics.clearFilters')}
              </Button>
            )}
          </div>
        </div>
      );
    }

    const chartData = analytics.map((scene) => ({
      name: scene.sceneName.length > 15 
        ? `${scene.sceneName.substring(0, 15)}...` 
        : scene.sceneName,
      fullName: scene.sceneName,
      views: scene.views,
      boutique: scene.boutiqueName || t('admin.unknown'),
    }));

    switch (chartType) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="name"
                stroke="#9CA3AF"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#F9FAFB",
                }}
                formatter={(value: any) => [
                  `${value} ${t('admin.analytics.views')}`,
                  t('admin.analytics.sceneViews'),
                ]}
                labelFormatter={(label: string) => {
                  const scene = chartData.find(d => d.name === label);
                  return scene ? `${scene.fullName} (${scene.boutique})` : label;
                }}
              />
              <Bar dataKey="views" fill="#8884d8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case "pie":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="views"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#F9FAFB",
                }}
                formatter={(value: any) => [`${value} ${t('admin.analytics.views')}`, t('admin.analytics.sceneViews')]}
              />
            </PieChart>
          </ResponsiveContainer>
        );

      case "line":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="name"
                stroke="#9CA3AF"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#F9FAFB",
                }}
                formatter={(value: any) => [`${value} ${t('admin.analytics.views')}`, t('admin.analytics.sceneViews')]}
                labelFormatter={(label: string) => {
                  const scene = chartData.find(d => d.name === label);
                  return scene ? `${scene.fullName} (${scene.boutique})` : label;
                }}
              />
              <Line
                type="monotone"
                dataKey="views"
                stroke="#8884d8"
                strokeWidth={3}
                dot={{ fill: "#8884d8", strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: "#8884d8", strokeWidth: 2 }}
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
      {/* Main Chart */}
      <Card className="bg-gradient-to-br from-morpheus-blue-dark/40 to-morpheus-blue-light/40 border-slate-700/50">
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-morpheus-gold-light" />
              {t('admin.analytics.sceneViewAnalytics')}
            </CardTitle>

            <div className="flex flex-wrap items-center gap-2">
              {/* Chart Type Selector */}
              <div className="flex items-center gap-1 bg-morpheus-blue-dark/30 rounded-lg p-1">
                <Button
                  variant={chartType === "bar" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setChartType("bar")}
                  className={`px-3 py-1 ${
                    chartType === "bar"
                      ? "bg-morpheus-gold-light text-black"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  <BarChart3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={chartType === "pie" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setChartType("pie")}
                  className={`px-3 py-1 ${
                    chartType === "pie"
                      ? "bg-morpheus-gold-light text-black"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  <PieChartIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant={chartType === "line" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setChartType("line")}
                  className={`px-3 py-1 ${
                    chartType === "line"
                      ? "bg-morpheus-gold-light text-black"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  <LineChartIcon className="h-4 w-4" />
                </Button>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                
                {/* Boutique Filter */}
                <select
                  value={selectedBoutique || ""}
                  onChange={(e) => setSelectedBoutique(e.target.value ? Number(e.target.value) : undefined)}
                  className="bg-morpheus-blue-dark/30 border border-slate-600 text-white text-sm rounded px-2 py-1"
                  disabled={boutiquesLoading}
                >
                  <option value="">{t('admin.analytics.allBoutiques')}</option>
                  {boutiqueOptions?.map((boutique) => (
                    <option key={boutique.value} value={boutique.value}>
                      {boutique.label}
                    </option>
                  ))}
                </select>

                {/* Scene Filter */}
                <select
                  value={selectedScene || ""}
                  onChange={(e) => setSelectedScene(e.target.value ? Number(e.target.value) : undefined)}
                  className="bg-morpheus-blue-dark/30 border border-slate-600 text-white text-sm rounded px-2 py-1"
                  disabled={scenesLoading}
                >
                  <option value="">{t('admin.analytics.allScenes')}</option>
                  {sceneOptions?.map((scene) => (
                    <option key={scene.value} value={scene.value}>
                      {scene.label}
                    </option>
                  ))}
                </select>


                {(selectedBoutique || selectedScene) && (
                  <Button
                    onClick={handleClearFilters}
                    variant="outline"
                    size="sm"
                    className="border-slate-600 text-gray-300 hover:bg-slate-700/50"
                  >
                    {t('admin.analytics.clearFilters')}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {(selectedBoutique || selectedScene) && (
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedBoutique && (
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                  {t('admin.analytics.boutique')}: {boutiqueOptions?.find(b => b.value === selectedBoutique)?.label}
                </Badge>
              )}
              {selectedScene && (
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                  {t('admin.analytics.scene')}: {sceneOptions?.find(s => s.value === selectedScene)?.label}
                </Badge>
              )}
            </div>
          )}
        </CardHeader>

        <CardContent>{renderChart()}</CardContent>
      </Card>

      {/* Top Boutiques by Views */}
      {stats?.viewsByBoutique.length > 0 && (
        <Card className="bg-gradient-to-br from-morpheus-blue-dark/40 to-morpheus-blue-light/40 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Store className="h-5 w-5 text-morpheus-gold-light" />
              {t('admin.analytics.viewsByBoutique')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.viewsByBoutique.slice(0, 5).map((boutique, index) => (
                <div
                  key={boutique.boutiqueId}
                  className="flex items-center justify-between p-3 bg-morpheus-blue-dark/20 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-morpheus-gold-light/20 rounded-full">
                      <span className="text-morpheus-gold-light font-bold text-sm">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{boutique.boutiqueName}</p>
                      <p className="text-sm text-gray-400">
                        {boutique.sceneCount} {boutique.sceneCount === 1 ? t('admin.analytics.scene') : t('admin.analytics.scenes')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">{boutique.totalViews.toLocaleString()}</p>
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