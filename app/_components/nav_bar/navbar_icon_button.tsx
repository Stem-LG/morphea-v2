import { cn } from "@/lib/utils"

export function NavBarIconButton({
    onClick,
    variant = 'trailing',
    children,
}: {
    onClick?: () => void
    variant?: 'leading' | 'trailing'
    children: React.ReactNode
}) {
    return (
        <div
            onClick={onClick}
            className={cn(
                'fill-morpheus-blue-dark stroke-morpheus-blue-dark flex cursor-pointer items-center justify-center transition duration-300 hover:stroke-white hover:fill-white',
                variant === 'leading' ? 'size-8 md:size-9' : 'size-10'
            )}
        >
            {children}
        </div>
    )
}
