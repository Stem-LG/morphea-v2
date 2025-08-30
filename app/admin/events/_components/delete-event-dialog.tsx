'use client'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { useLanguage } from '@/hooks/useLanguage'
import { AlertTriangle } from 'lucide-react'

interface DeleteEventDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    eventName: string
    isLoading?: boolean
}

export function DeleteEventDialog({
    isOpen,
    onClose,
    onConfirm,
    eventName,
    isLoading = false,
}: DeleteEventDialogProps) {
    const { t } = useLanguage()

    const handleClose = () => {
        if (!isLoading) {
            onClose()
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="border-red-200/50 bg-gradient-to-br from-gray-50/95 to-white/95 text-gray-900 backdrop-blur-sm sm:max-w-md shadow-xl">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                        </div>
                        <DialogTitle className="text-xl font-semibold text-gray-900">
                            {t('admin.events.deleteEventTitle')}
                        </DialogTitle>
                    </div>
                </DialogHeader>

                <div className="space-y-4">
                    <p className="text-gray-700">
                        {t('admin.events.deleteEventConfirm')}
                    </p>
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                        <p className="text-center font-medium text-red-700">
                            &ldquo;{eventName}&rdquo;
                        </p>
                    </div>
                    <p className="text-sm text-gray-600">
                        {t('admin.events.deleteEventWarning')}
                    </p>
                </div>

                <DialogFooter className="flex gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        disabled={isLoading}
                        className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    >
                        {t('common.cancel')}
                    </Button>
                    <Button
                        type="button"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="flex-1 bg-gradient-to-r from-red-500 to-red-600 font-semibold text-white transition-all duration-300 hover:scale-105 hover:from-red-600 hover:to-red-700"
                    >
                        {isLoading
                            ? t('admin.events.deleting')
                            : t('admin.events.deleteEvent')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
