"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
    return (
        <SonnerToaster
            position="top-right"
            richColors
            theme="dark"
            toastOptions={{
                style: {
                    background: 'rgb(31 41 55)',
                    border: '1px solid rgb(75 85 99)',
                    color: 'rgb(243 244 246)',
                },
            }}
        />
    );
}