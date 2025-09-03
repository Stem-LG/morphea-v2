'use client'
export function SearchIcon({ className = '' }: { className?: string }) {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 23 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <line
                x1="0.75"
                y1="-0.75"
                x2="6.8742"
                y2="-0.75"
                transform="matrix(0.721387 0.692532 -0.721387 0.692532 16.5 16.72)"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
            <path
                d="M10.083 0.75C15.2667 0.75 19.4168 4.77649 19.417 9.67969C19.417 14.583 15.2668 18.6104 10.083 18.6104C4.89935 18.6102 0.75 14.5829 0.75 9.67969C0.750176 4.77659 4.89946 0.750168 10.083 0.75Z"
                strokeWidth="1.5"
            />
        </svg>
    )
}
