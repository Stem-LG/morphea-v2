"use client";
import React, { useState } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { ProductManagement } from "@/components/admin/product-management";

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
