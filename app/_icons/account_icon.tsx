'use client'
export function AccountIcon({ className = '' }: { className?: string }) {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 22 21"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <ellipse
                cx="10.9996"
                cy="6.33333"
                rx="5.71429"
                ry="5.33333"
                strokeWidth="1.5"
            />
            <path
                d="M21 21C21 18.0545 16.5228 15.6667 11 15.6667C5.47715 15.6667 1 18.0545 1 21"
                strokeWidth="1.5"
            />
        </svg>
    )
}
