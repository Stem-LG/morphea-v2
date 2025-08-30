'use client'

import { useState } from 'react'
import { useNotifications } from '@/app/_hooks/use-notifications'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
    Credenza,
    CredenzaContent,
    CredenzaHeader,
    CredenzaTitle,
} from '@/components/ui/credenza'
import { Bell, CheckCheck, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

interface NotificationsDialogProps {
    isOpen: boolean
    onClose: () => void
}

export function NotificationsDialog({
    isOpen,
    onClose,
}: NotificationsDialogProps) {
    const { data: currentUser } = useAuth()
    const router = useRouter()

    // Debug logging
    console.log('NotificationsDialog - currentUser:', currentUser)
    console.log('NotificationsDialog - userId:', currentUser?.id)

    const {
        notifications,
        unreadCount,
        hasNextPage,
        fetchNextPage,
        isLoading,
        isFetchingNextPage,
        markAsSeen,
        markAllAsSeen,
    } = useNotifications(currentUser?.id || '')

    const handleNotificationClick = (notification: any) => {
        // Mark notification as read if it's unread
        if (!notification.yest_lu) {
            markAsSeen(notification.ynotificationid)
        }

        // Navigate to the link if it exists
        if (notification.ylien) {
            router.push(notification.ylien)
            onClose() // Close the notification dialog
        }
    }

    const handleMarkAllAsRead = () => {
        markAllAsSeen()
    }

    if (isLoading) {
        return (
            <Credenza open={isOpen} onOpenChange={onClose}>
                <CredenzaContent className="max-h-[80vh] max-w-md border border-gray-200 bg-white shadow-2xl">
                    <CredenzaHeader className="border-b border-gray-100 pb-4">
                        <CredenzaTitle className="flex items-center gap-3 text-[#053340]">
                            <div className="rounded-lg bg-gray-50 p-2">
                                <Bell className="h-5 w-5 text-blue-500" />
                            </div>
                            <span className="font-recia text-2xl font-extrabold">
                                Notifications
                            </span>
                        </CredenzaTitle>
                    </CredenzaHeader>
                    <div className="flex items-center justify-center p-8">
                        <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                </CredenzaContent>
            </Credenza>
        )
    }

    return (
        <Credenza open={isOpen} onOpenChange={onClose}>
            <CredenzaContent className="max-h-[80vh] max-w-md border border-gray-200 bg-white shadow-2xl">
                <CredenzaHeader className="border-b border-gray-100 pb-4">
                    <CredenzaTitle className="flex items-center gap-3 text-[#053340]">
                        <div className="rounded-lg bg-gray-50 p-2">
                            <Bell className="h-5 w-5 text-blue-500" />
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="font-recia text-2xl font-extrabold">
                                Notifications
                            </span>
                            {unreadCount > 0 && (
                                <Badge
                                    variant="destructive"
                                    className="rounded-full"
                                >
                                    {unreadCount}
                                </Badge>
                            )}
                        </div>
                    </CredenzaTitle>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleMarkAllAsRead}
                            className="mt-2 text-blue-600 hover:text-blue-800"
                        >
                            <CheckCheck className="mr-2 h-4 w-4" />
                            Marquer tout comme lu
                        </Button>
                    )}
                </CredenzaHeader>

                <ScrollArea className="max-h-96">
                    {notifications.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                            <Bell className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                            <p className="text-lg font-medium">
                                Aucune notification
                            </p>
                            <p className="text-sm">Vous êtes à jour !</p>
                        </div>
                    ) : (
                        <div className="p-4">
                            {notifications.map((notification, index) => (
                                <div key={notification.ynotificationid}>
                                    <div
                                        className={`cursor-pointer rounded-lg p-3 transition-colors hover:bg-gray-50 ${
                                            !notification.yest_lu
                                                ? 'bg-blue-50'
                                                : ''
                                        }`}
                                        onClick={() =>
                                            handleNotificationClick(
                                                notification
                                            )
                                        }
                                    >
                                        <div className="flex items-start gap-3">
                                            {!notification.yest_lu && (
                                                <div className="mt-2 h-2 w-2 rounded-full bg-blue-500" />
                                            )}
                                            <div className="flex-1">
                                                <h4 className="font-medium text-gray-900">
                                                    {notification.ytitre}
                                                </h4>
                                                {notification.ymessage && (
                                                    <p className="mt-1 text-sm text-gray-600">
                                                        {notification.ymessage}
                                                    </p>
                                                )}
                                                <p className="mt-2 text-xs text-gray-400">
                                                    {formatDistanceToNow(
                                                        new Date(
                                                            notification.sysdate
                                                        ),
                                                        {
                                                            addSuffix: true,
                                                            locale: fr,
                                                        }
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    {index < notifications.length - 1 && (
                                        <Separator className="my-2" />
                                    )}
                                </div>
                            ))}

                            {hasNextPage && (
                                <div className="mt-4 text-center">
                                    <Button
                                        variant="ghost"
                                        onClick={() => fetchNextPage()}
                                        disabled={isFetchingNextPage}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        {isFetchingNextPage ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Chargement...
                                            </>
                                        ) : (
                                            'Charger plus'
                                        )}
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </ScrollArea>
            </CredenzaContent>
        </Credenza>
    )
}
