import React from "react";

export default function AdminV2Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="">
            {children}
        </div>
    );
}