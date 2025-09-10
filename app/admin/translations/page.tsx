'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import {
    Plus,
    Edit,
    Trash2,
    Search,
    Filter,
    Save,
    X,
    Loader2,
} from 'lucide-react'
import { useDynamicTranslations } from '@/hooks/use-dynamic-translations'
import { createClient } from '@/lib/client'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { Language } from '@/hooks/useLanguage'

interface DynamicTranslation {
    id: string
    language_code: Language
    namespace: string
    key_path: string
    translation_value: string
    is_active: boolean
    updated_at: string
}

const NAMESPACES = [
    'common',
    'nav',
    'auth',
    'admin',
    'homepage',
    'shop',
    'cart',
    'profile',
    'orders',
    'contact',
    'footer',
    'notifications',
    'visitorForm',
    'order',
    'orderConfirmation',
    'productDetails',
    'wishlist',
    'landing',
    'product3DViewer',
    'cookies',
    'analytics',
    'panel',
    'account',
    'profileSettings',
    'loadingSystem',
    'dashboard',
    'products',
    'management',
    'productManagement',
    'productApprovals',
    'pendingProducts',
    'approvedProducts',
    'rejectedProducts',
    'event',
    'boutique',
    'allBoutiques',
    'designer',
    'selectBoutique',
    'resetFilters',
    'visibility',
    'visible',
    'invisible',
    'allVisibility',
    'selectVisibility',
    'makeAllVisible',
    'makeAllInvisible',
    'userManagement',
    'storeManagement',
    'eventManagement',
    'currencyManagement',
    'categoryManagement',
    'events',
    'virtualTourAdmin',
    'settings',
    'createProduct',
    'productView',
    'users',
    'designerAssignments',
    'tour',
    'mediaManager',
    'approvals',
    'currencies',
    'categories',
    'activity',
    'checkout',
    'stepper',
    'stepDescriptions',
    'continueToShipping',
    'continueToPayment',
    'continueToReview',
    'backToCart',
    'backToShipping',
    'backToPayment',
    'pleaseCompleteAddressFields',
    'pleaseCompletePaymentFields',
    'invalidCardNumber',
    'orderPlacedSuccessfully',
    'failedToPlaceOrder',
    'addItemsToCheckout',
    'fullNamePlaceholder',
    'firstNamePlaceholder',
    'lastNamePlaceholder',
    'phonePlaceholder',
    'addressPlaceholder',
    'city',
    'cityPlaceholder',
    'postalCode',
    'postalCodePlaceholder',
    'country',
    'countryPlaceholder',
    'cardholderName',
    'cardholderNamePlaceholder',
    'cardNumber',
    'cardNumberPlaceholder',
    'expiryDate',
    'expiryDatePlaceholder',
    'cvv',
    'cvvPlaceholder',
]

export default function TranslationsAdminPage() {
    const supabase = createClient()
    const queryClient = useQueryClient()
    const { data: translations, isLoading } = useDynamicTranslations()

    const [searchTerm, setSearchTerm] = useState('')
    const [selectedNamespace, setSelectedNamespace] = useState<string>('all')
    const [selectedLanguage, setSelectedLanguage] = useState<Language | 'all'>('all')
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [editingTranslation, setEditingTranslation] = useState<DynamicTranslation | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Form state
    const [formData, setFormData] = useState({
        language_code: 'fr' as Language,
        namespace: '',
        key_path: '',
        translation_value: '',
    })

    // Flatten translations for table display
    const flatTranslations = translations ? Object.entries(translations).flatMap(([lang, namespaces]) =>
        Object.entries(namespaces).flatMap(([namespace, keys]) =>
            Object.entries(keys).map(([key, value]) => ({
                id: `${lang}-${namespace}-${key}`,
                language_code: lang as Language,
                namespace,
                key_path: key,
                translation_value: value,
                is_active: true,
                updated_at: new Date().toISOString(),
            }))
        )
    ) : []

    // Filter translations
    const filteredTranslations = flatTranslations.filter(translation => {
        const matchesSearch = searchTerm === '' ||
            translation.key_path.toLowerCase().includes(searchTerm.toLowerCase()) ||
            translation.translation_value.toLowerCase().includes(searchTerm.toLowerCase()) ||
            translation.namespace.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesNamespace = selectedNamespace === 'all' || translation.namespace === selectedNamespace
        const matchesLanguage = selectedLanguage === 'all' || translation.language_code === selectedLanguage

        return matchesSearch && matchesNamespace && matchesLanguage
    })

    const handleCreate = async () => {
        if (!formData.namespace || !formData.key_path || !formData.translation_value) {
            toast.error('Please fill in all required fields')
            return
        }

        setIsSubmitting(true)
        try {
            const { error } = await supabase
                .schema('morpheus')
                .from('dynamic_translations')
                .insert({
                    language_code: formData.language_code,
                    namespace: formData.namespace,
                    key_path: formData.key_path,
                    translation_value: formData.translation_value,
                    is_active: true,
                })

            if (error) throw error

            toast.success('Translation created successfully')
            setIsCreateDialogOpen(false)
            setFormData({
                language_code: 'fr',
                namespace: '',
                key_path: '',
                translation_value: '',
            })
            queryClient.invalidateQueries({ queryKey: ['dynamic-translations'] })
        } catch (error: any) {
            console.error('Error creating translation:', error)
            toast.error('Failed to create translation: ' + error.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleEdit = async () => {
        if (!editingTranslation || !formData.translation_value) {
            toast.error('Please fill in all required fields')
            return
        }

        setIsSubmitting(true)
        try {
            const { error } = await supabase
                .schema('morpheus')
                .from('dynamic_translations')
                .update({
                    translation_value: formData.translation_value,
                    updated_at: new Date().toISOString(),
                })
                .eq('language_code', editingTranslation.language_code)
                .eq('namespace', editingTranslation.namespace)
                .eq('key_path', editingTranslation.key_path)

            if (error) throw error

            toast.success('Translation updated successfully')
            setIsEditDialogOpen(false)
            setEditingTranslation(null)
            queryClient.invalidateQueries({ queryKey: ['dynamic-translations'] })
        } catch (error: any) {
            console.error('Error updating translation:', error)
            toast.error('Failed to update translation: ' + error.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (translation: DynamicTranslation) => {
        if (!confirm('Are you sure you want to delete this translation?')) return

        try {
            const { error } = await supabase
                .schema('morpheus')
                .from('dynamic_translations')
                .delete()
                .eq('language_code', translation.language_code)
                .eq('namespace', translation.namespace)
                .eq('key_path', translation.key_path)

            if (error) throw error

            toast.success('Translation deleted successfully')
            queryClient.invalidateQueries({ queryKey: ['dynamic-translations'] })
        } catch (error: any) {
            console.error('Error deleting translation:', error)
            toast.error('Failed to delete translation: ' + error.message)
        }
    }

    const openEditDialog = (translation: DynamicTranslation) => {
        setEditingTranslation(translation)
        setFormData({
            language_code: translation.language_code,
            namespace: translation.namespace,
            key_path: translation.key_path,
            translation_value: translation.translation_value,
        })
        setIsEditDialogOpen(true)
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading translations...</span>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Dynamic Translations Management</h1>
                <p className="text-gray-600 mt-2">
                    Manage dynamic translations that override static translations from the codebase.
                </p>
            </div>

            {/* Filters and Search */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search translations..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>
                <Select value={selectedNamespace} onValueChange={setSelectedNamespace}>
                    <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="All Namespaces" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Namespaces</SelectItem>
                        {NAMESPACES.map(namespace => (
                            <SelectItem key={namespace} value={namespace}>
                                {namespace}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={selectedLanguage} onValueChange={(value) => setSelectedLanguage(value as Language | 'all')}>
                    <SelectTrigger className="w-full sm:w-32">
                        <SelectValue placeholder="All Languages" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                    </SelectContent>
                </Select>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Translation
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Add New Translation</DialogTitle>
                            <DialogDescription>
                                Create a new dynamic translation that will override static translations.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="language">Language</Label>
                                <Select
                                    value={formData.language_code}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, language_code: value as Language }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="en">English</SelectItem>
                                        <SelectItem value="fr">French</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="namespace">Namespace</Label>
                                <Select
                                    value={formData.namespace}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, namespace: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select namespace" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {NAMESPACES.map(namespace => (
                                            <SelectItem key={namespace} value={namespace}>
                                                {namespace}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="key_path">Key Path</Label>
                                <Input
                                    id="key_path"
                                    placeholder="e.g., nav.home, common.loading"
                                    value={formData.key_path}
                                    onChange={(e) => setFormData(prev => ({ ...prev, key_path: e.target.value }))}
                                />
                            </div>
                            <div>
                                <Label htmlFor="translation_value">Translation Value</Label>
                                <Textarea
                                    id="translation_value"
                                    placeholder="Enter the translation text"
                                    value={formData.translation_value}
                                    onChange={(e) => setFormData(prev => ({ ...prev, translation_value: e.target.value }))}
                                    rows={3}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreate} disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                Create
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Translations Table */}
            <div className="bg-white rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Language</TableHead>
                            <TableHead>Namespace</TableHead>
                            <TableHead>Key Path</TableHead>
                            <TableHead>Translation</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredTranslations.map((translation) => (
                            <TableRow key={translation.id}>
                                <TableCell>
                                    <Badge variant={translation.language_code === 'en' ? 'default' : 'secondary'}>
                                        {translation.language_code.toUpperCase()}
                                    </Badge>
                                </TableCell>
                                <TableCell className="font-medium">
                                    {translation.namespace}
                                </TableCell>
                                <TableCell className="font-mono text-sm">
                                    {translation.key_path}
                                </TableCell>
                                <TableCell className="max-w-xs truncate">
                                    {translation.translation_value}
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => openEditDialog(translation)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDelete(translation)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredTranslations.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                    No translations found matching your criteria.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Translation</DialogTitle>
                        <DialogDescription>
                            Update the translation value.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Language</Label>
                            <Badge variant={formData.language_code === 'en' ? 'default' : 'secondary'}>
                                {formData.language_code.toUpperCase()}
                            </Badge>
                        </div>
                        <div>
                            <Label>Namespace</Label>
                            <Badge variant="outline">{formData.namespace}</Badge>
                        </div>
                        <div>
                            <Label>Key Path</Label>
                            <code className="block p-2 bg-gray-100 rounded text-sm">
                                {formData.key_path}
                            </code>
                        </div>
                        <div>
                            <Label htmlFor="edit_translation_value">Translation Value</Label>
                            <Textarea
                                id="edit_translation_value"
                                value={formData.translation_value}
                                onChange={(e) => setFormData(prev => ({ ...prev, translation_value: e.target.value }))}
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleEdit} disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Update
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}