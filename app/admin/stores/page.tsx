"use client";
import React from "react";
import { AdminV2Layout } from "../_components/admin-v2-layout";
import { StoresManagement } from "./_components/stores-management";

export default function StoresPage() {
    return (
        <AdminV2Layout>
            <StoresManagement />
        </AdminV2Layout>
    );
}