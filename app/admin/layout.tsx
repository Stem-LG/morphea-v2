"use client";
import React, { useState } from "react";
import { AdminSidebar } from "@/app/admin/_components/admin-sidebar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-gray-50">
            <AdminSidebar
                isOpen={sidebarOpen}
                onToggle={() => setSidebarOpen(!sidebarOpen)}
            />
            <div className="flex-1 overflow-auto">{children}</div>
        </div>
    );
}