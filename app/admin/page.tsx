"use client";
import React, { useState } from "react";
import { AdminSidebar } from "@/app/admin/_components/admin-sidebar";
import { AdminDashboard } from "@/app/admin/_components/admin-dashboard";
import { ProductManagement } from "@/app/admin/_components/product-management";

export default function AdminPanel() {
    const [activeSection, setActiveSection] = useState("dashboard");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const renderContent = () => {
        switch (activeSection) {
            case "dashboard":
                return <AdminDashboard />;
            case "products":
                return <ProductManagement />;
            default:
                return <AdminDashboard />;
        }
    };

    const handleSectionChange = (section: string) => {
        setActiveSection(section);
        setSidebarOpen(false); // Close sidebar on mobile when selecting a section
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <AdminSidebar
                activeSection={activeSection}
                onSectionChange={handleSectionChange}
                isOpen={sidebarOpen}
                onToggle={() => setSidebarOpen(!sidebarOpen)}
            />
            <div className="flex-1 overflow-auto">{renderContent()}</div>
        </div>
    );
}
