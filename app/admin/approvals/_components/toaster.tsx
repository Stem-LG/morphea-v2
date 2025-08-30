"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
    return (
        <SonnerToaster
            position="top-right"
            richColors
            theme="light"
            toastOptions={{
                style: {
                    background: 'rgb(255 255 255)',
                    border: '1px solid rgb(209 213 219)',
                    color: 'rgb(17 24 39)',
                },
            }}
        />
    );
}