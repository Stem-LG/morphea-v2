"use client";
import React, { useState } from "react";
import { AdminSidebar } from "@/app/admin/_components/admin-sidebar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <div className="flex min-h-screen bg-gray-50">
            <AdminSidebar
                isOpen={sidebarOpen}
                isCollapsed={sidebarCollapsed}
                onToggle={() => setSidebarOpen(!sidebarOpen)}
                onCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
            <div className="flex-1 overflow-auto">{children}</div>
        </div>
    );
}