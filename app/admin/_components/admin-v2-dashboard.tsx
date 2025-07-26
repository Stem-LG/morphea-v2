"use client";
import React from "react";
import { AdminV2Layout } from "./admin-v2-layout";
import { DashboardContent } from "./dashboard-content";

export function AdminV2Dashboard() {
    return (
        <AdminV2Layout>
            <DashboardContent />
        </AdminV2Layout>
    );
}