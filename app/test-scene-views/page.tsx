"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/client";
import VirtualTour from "@/app/main/_components/virtual-tour";
import { useIncrementSceneView } from "@/app/main/_hooks/use-increment-scene-view";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Eye, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/app/_components/toaster";

interface SceneViewData {
    yscenesid: number;
    yscenesname: string;
    ynombrevu: number | null;
    sysdate: string | null;
}

interface TestLog {
    id: string;
    timestamp: string;
    action: string;
    sceneId: string;
    sceneName: string;
    status: 'success' | 'error' | 'info';
    message: string;
}

export default function TestSceneViewsPage() {
    const [sceneViewData, setSceneViewData] = useState<SceneViewData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [testLogs, setTestLogs] = useState<TestLog[]>([]);
    const [currentScene, setCurrentScene] = useState<string>("15");
    const [viewedScenes, setViewedScenes] = useState<Set<string>>(new Set());
    
    // Using sonner toast directly
    const incrementSceneView = useIncrementSceneView();

    // Add a test log entry
    const addTestLog = (action: string, sceneId: string, sceneName: string, status: 'success' | 'error' | 'info', message: string) => {
        const newLog: TestLog = {
            id: Date.now().toString(),
            timestamp: new Date().toLocaleTimeString(),
            action,
            sceneId,
            sceneName,
            status,
            message
        };
        setTestLogs(prev => [newLog, ...prev.slice(0, 19)]); // Keep only last 20 logs
    };

    // Fetch current scene view counts from database
    const fetchSceneViewData = async () => {
        setIsLoading(true);
        try {
            const supabase = createClient();
            const { data, error } = await supabase
                .schema("morpheus")
                .from("yscenes")
                .select("yscenesid, yscenesname, ynombrevu, sysdate")
                .order("yscenesid");

            if (error) {
                console.error("Error fetching scene view data:", error);
                toast.error("Failed to fetch scene view data");
                return;
            }

            setSceneViewData(data || []);
            addTestLog("FETCH", "ALL", "All Scenes", "success", `Fetched ${data?.length || 0} scenes from database`);
        } catch (error) {
            console.error("Error:", error);
            toast.error("Failed to fetch scene view data");
        } finally {
            setIsLoading(false);
        }
    };

    // Test manual scene view increment
    const testManualIncrement = async (sceneId: number, sceneName: string) => {
        try {
            addTestLog("MANUAL_INCREMENT", sceneId.toString(), sceneName, "info", "Attempting manual increment...");
            
            await incrementSceneView.mutateAsync(sceneId);
            
            addTestLog("MANUAL_INCREMENT", sceneId.toString(), sceneName, "success", "Manual increment successful");
            toast.success(`View count incremented for scene: ${sceneName}`);
            
            // Refresh data after increment
            setTimeout(fetchSceneViewData, 500);
        } catch (error) {
            console.error("Manual increment error:", error);
            addTestLog("MANUAL_INCREMENT", sceneId.toString(), sceneName, "error", `Manual increment failed: ${error}`);
            toast.error(`Failed to increment view count for scene: ${sceneName}`);
        }
    };

    // Test invalid scene ID
    const testInvalidSceneId = async () => {
        const invalidId = 99999;
        try {
            addTestLog("INVALID_ID_TEST", invalidId.toString(), "Invalid Scene", "info", "Testing invalid scene ID...");
            
            await incrementSceneView.mutateAsync(invalidId);
            
            addTestLog("INVALID_ID_TEST", invalidId.toString(), "Invalid Scene", "error", "Invalid ID test should have failed but didn't");
        } catch (error) {
            addTestLog("INVALID_ID_TEST", invalidId.toString(), "Invalid Scene", "success", `Correctly handled invalid ID: ${error}`);
            toast.success("Invalid scene ID was correctly rejected");
        }
    };

    // Reset session viewed scenes (for testing deduplication)
    const resetSessionViews = () => {
        setViewedScenes(new Set());
        addTestLog("RESET_SESSION", "ALL", "Session", "info", "Reset session viewed scenes for deduplication testing");
        toast.info("Viewed scenes tracking has been reset");
    };

    // Monitor scene changes from virtual tour
    useEffect(() => {
        const handleSceneChange = (event: CustomEvent) => {
            const { sceneId, sceneName } = event.detail;
            setCurrentScene(sceneId);
            
            const wasAlreadyViewed = viewedScenes.has(sceneId);
            if (!wasAlreadyViewed) {
                setViewedScenes(prev => new Set(prev).add(sceneId));
                addTestLog("SCENE_VIEW", sceneId, sceneName, "success", "Scene viewed for first time in session");
            } else {
                addTestLog("SCENE_VIEW", sceneId, sceneName, "info", "Scene already viewed in session (deduplication working)");
            }
        };

        window.addEventListener('sceneChanged', handleSceneChange as EventListener);
        return () => window.removeEventListener('sceneChanged', handleSceneChange as EventListener);
    }, [viewedScenes]);

    // Initial data fetch
    useEffect(() => {
        fetchSceneViewData();
    }, []);

    const getStatusIcon = (status: 'success' | 'error' | 'info') => {
        switch (status) {
            case 'success':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'error':
                return <XCircle className="h-4 w-4 text-red-500" />;
            case 'info':
                return <AlertCircle className="h-4 w-4 text-blue-500" />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-gray-900">Scene View Count Test Page</h1>
                    <p className="text-gray-600">
                        Test the scene view count implementation with real-time monitoring and database verification
                    </p>
                </div>

                {/* Control Panel */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Eye className="h-5 w-5" />
                            Test Controls
                        </CardTitle>
                        <CardDescription>
                            Use these controls to test different aspects of the scene view count functionality
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                            <Button onClick={fetchSceneViewData} disabled={isLoading}>
                                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                                Refresh Data
                            </Button>
                            <Button onClick={testInvalidSceneId} variant="outline">
                                Test Invalid Scene ID
                            </Button>
                            <Button onClick={resetSessionViews} variant="outline">
                                Reset Session Views
                            </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <div className="font-medium text-blue-900">Current Scene</div>
                                <div className="text-blue-700">{currentScene}</div>
                            </div>
                            <div className="p-3 bg-green-50 rounded-lg">
                                <div className="font-medium text-green-900">Viewed This Session</div>
                                <div className="text-green-700">{viewedScenes.size} scenes</div>
                            </div>
                            <div className="p-3 bg-purple-50 rounded-lg">
                                <div className="font-medium text-purple-900">Total Scenes</div>
                                <div className="text-purple-700">{sceneViewData.length} scenes</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Virtual Tour */}
                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Virtual Tour</CardTitle>
                                <CardDescription>
                                    Navigate through scenes to test view count increments
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="h-96 w-full">
                                    <VirtualTour
                                        height="384px"
                                        accountForNavbar={false}
                                        startingScene={currentScene}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Scene View Data */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Scene View Counts</CardTitle>
                                <CardDescription>
                                    Current view counts from the database
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                                        Loading scene data...
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                        {sceneViewData.map((scene) => (
                                            <div
                                                key={scene.yscenesid}
                                                className={`flex items-center justify-between p-3 rounded-lg border ${
                                                    currentScene === scene.yscenesid.toString()
                                                        ? 'bg-blue-50 border-blue-200'
                                                        : 'bg-white border-gray-200'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Badge variant="outline">
                                                        ID: {scene.yscenesid}
                                                    </Badge>
                                                    <span className="font-medium">{scene.yscenesname}</span>
                                                    {viewedScenes.has(scene.yscenesid.toString()) && (
                                                        <Badge variant="secondary">Viewed</Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="default">
                                                        {scene.ynombrevu || 0} views
                                                    </Badge>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => testManualIncrement(scene.yscenesid, scene.yscenesname)}
                                                        disabled={incrementSceneView.isPending}
                                                    >
                                                        Test +1
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Test Logs */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Test Activity Log</CardTitle>
                            <CardDescription>
                                Real-time log of scene view count operations and tests
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {testLogs.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        No test activity yet. Navigate through scenes or use test controls.
                                    </div>
                                ) : (
                                    testLogs.map((log) => (
                                        <div
                                            key={log.id}
                                            className={`p-3 rounded-lg border text-sm ${
                                                log.status === 'success'
                                                    ? 'bg-green-50 border-green-200'
                                                    : log.status === 'error'
                                                    ? 'bg-red-50 border-red-200'
                                                    : 'bg-blue-50 border-blue-200'
                                            }`}
                                        >
                                            <div className="flex items-start gap-2">
                                                {getStatusIcon(log.status)}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-medium">{log.action}</span>
                                                        <Badge variant="outline" className="text-xs">
                                                            {log.timestamp}
                                                        </Badge>
                                                    </div>
                                                    <div className="text-gray-600">
                                                        Scene: {log.sceneName} (ID: {log.sceneId})
                                                    </div>
                                                    <div className="text-gray-700 mt-1">
                                                        {log.message}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Instructions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Testing Instructions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-medium mb-2">Automatic Testing:</h4>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    <li>• Navigate through scenes in the virtual tour</li>
                                    <li>• View counts should increment on first visit</li>
                                    <li>• Revisiting scenes in same session won&apos;t increment</li>
                                    <li>• Check the activity log for real-time feedback</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-medium mb-2">Manual Testing:</h4>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    <li>• Use &quot;Test +1&quot; buttons to manually increment</li>
                                    <li>• Test invalid scene ID error handling</li>
                                    <li>• Reset session to test deduplication again</li>
                                    <li>• Refresh data to see database updates</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <Toaster />
        </div>
    );
}