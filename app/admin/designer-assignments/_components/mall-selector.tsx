"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";
import { Building2, MapPin } from "lucide-react";
import { useEffect } from "react";

interface MallSelectorProps {
    eventId: number | null;
    selectedMallId: number | null;
    onMallChange: (mallId: number | null) => void;
}

export function MallSelector({ eventId, selectedMallId, onMallChange }: MallSelectorProps) {
    const supabase = createClient();

    const { data: eventMalls = [], isLoading } = useQuery({
        queryKey: ["event-malls", eventId],
        queryFn: async () => {
            if (!eventId) return [];

            // Get malls associated with this event through ydetailsevent
            const { data, error } = await supabase
                .schema("morpheus")
                .from("ydetailsevent")
                .select(`
                    ymallidfk,
                    ymall:ymallidfk (
                        ymallid,
                        ymallintitule,
                        ymalllocalisation,
                        ymalladresse,
                        ymallcontactpersonne
                    )
                `)
                .eq("yeventidfk", eventId)
                .not("ymallidfk", "is", null);

            if (error) {
                throw new Error(`Failed to fetch event malls: ${error.message}`);
            }

            // Get unique malls
            const mallsMap = new Map();
            (data || []).forEach(item => {
                if (item.ymall && !mallsMap.has(item.ymallidfk)) {
                    mallsMap.set(item.ymallidfk, item.ymall);
                }
            });

            return Array.from(mallsMap.values());
        },
        enabled: !!eventId,
    });

    // Auto-select first mall when malls are loaded and no mall is selected
    useEffect(() => {
        if (eventMalls.length > 0 && !selectedMallId && !isLoading) {
            onMallChange(eventMalls[0].ymallid);
        }
    }, [eventMalls, selectedMallId, isLoading, onMallChange]);

    if (!eventId) {
        return (
            <div className="flex items-center gap-2 text-gray-400">
                <Building2 className="h-4 w-4" />
                <span>Select an event first</span>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 text-gray-400">
                <Building2 className="h-4 w-4 animate-pulse" />
                <span>Loading malls...</span>
            </div>
        );
    }

    return (
        <Select
            value={selectedMallId?.toString() || ""}
            onValueChange={(value) => onMallChange(value ? parseInt(value) : null)}
        >
            <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                <SelectValue placeholder="Select a mall">
                    {selectedMallId && (
                        <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-morpheus-gold-light" />
                            <span>
                                {eventMalls.find(m => m.ymallid === selectedMallId)?.ymallintitule || "Unknown Mall"}
                            </span>
                        </div>
                    )}
                </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600 max-h-60">
                {eventMalls.length === 0 ? (
                    <SelectItem value="" disabled className="text-gray-400">
                        No malls available for this event
                    </SelectItem>
                ) : (
                    eventMalls.map((mall) => (
                        <SelectItem
                            key={mall.ymallid}
                            value={mall.ymallid.toString()}
                            className="text-white focus:bg-gray-700"
                        >
                            <div className="flex flex-col gap-1 py-1">
                                <div className="flex items-center gap-2">
                                    <Building2 className="h-4 w-4 text-morpheus-gold-light" />
                                    <span className="font-medium">{mall.ymallintitule}</span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-400">
                                    <MapPin className="h-3 w-3" />
                                    <span>{mall.ymalllocalisation}</span>
                                </div>
                                {mall.ymalladresse && (
                                    <div className="text-xs text-gray-500">
                                        {mall.ymalladresse}
                                    </div>
                                )}
                            </div>
                        </SelectItem>
                    ))
                )}
            </SelectContent>
        </Select>
    );
}