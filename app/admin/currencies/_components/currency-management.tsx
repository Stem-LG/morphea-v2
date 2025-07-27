"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Plus,
    Edit,
    Trash2,
    DollarSign,
    Search,
    CheckCircle,
    X,
    Save
} from "lucide-react";
import {
    useCurrencies,
    useCreateCurrency,
    useUpdateCurrency,
    useDeleteCurrency
} from "@/hooks/useCurrencies";

interface CurrencyFormData {
    xdeviseintitule: string;
    xdevisecodealpha: string;
    xdevisecodenum: string;
    xdevisenbrdec: number;
    xdeviseboolautorisepaiement: string;
}

export function CurrencyManagement() {
    const [searchTerm, setSearchTerm] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingCurrency, setEditingCurrency] = useState<number | null>(null);
    const [formData, setFormData] = useState<CurrencyFormData>({
        xdeviseintitule: "",
        xdevisecodealpha: "",
        xdevisecodenum: "",
        xdevisenbrdec: 2,
        xdeviseboolautorisepaiement: "false"
    });

    const { data: currencies, isLoading } = useCurrencies();
    const createCurrencyMutation = useCreateCurrency();
    const updateCurrencyMutation = useUpdateCurrency();
    const deleteCurrencyMutation = useDeleteCurrency();

    // Filter currencies based on search term
    const filteredCurrencies = currencies?.filter(currency =>
        currency.xdeviseintitule?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        currency.xdevisecodealpha?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        currency.xdevisecodenum?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const resetForm = () => {
        setFormData({
            xdeviseintitule: "",
            xdevisecodealpha: "",
            xdevisecodenum: "",
            xdevisenbrdec: 2,
            xdeviseboolautorisepaiement: "false"
        });
        setEditingCurrency(null);
        setShowForm(false);
    };

    const handleEdit = (currency: any) => {
        setFormData({
            xdeviseintitule: currency.xdeviseintitule || "",
            xdevisecodealpha: currency.xdevisecodealpha || "",
            xdevisecodenum: currency.xdevisecodenum || "",
            xdevisenbrdec: currency.xdevisenbrdec || 2,
            xdeviseboolautorisepaiement: currency.xdeviseboolautorisepaiement === "Y" ? "true" : "false"
        });
        setEditingCurrency(currency.xdeviseid);
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            if (editingCurrency) {
                await updateCurrencyMutation.mutateAsync({
                    currencyId: editingCurrency,
                    updates: formData
                });
            } else {
                await createCurrencyMutation.mutateAsync(formData);
            }
            resetForm();
        } catch (error) {
            console.error('Failed to save currency:', error);
        }
    };

    const handleDelete = async (currencyId: number) => {
        if (confirm('Are you sure you want to delete this currency? This action cannot be undone.')) {
            try {
                await deleteCurrencyMutation.mutateAsync(currencyId);
            } catch (error) {
                console.error('Failed to delete currency:', error);
            }
        }
    };

    const validateForm = () => {
        return formData.xdeviseintitule.trim() !== "" &&
               formData.xdevisecodealpha.trim() !== "" &&
               formData.xdevisecodenum.trim() !== "" &&
               formData.xdevisenbrdec >= 0;
    };

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-morpheus-gold-light/30 border-t-morpheus-gold-light mx-auto mb-4"></div>
                        <p className="text-white text-lg">Loading currencies...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                        Currency Management
                    </h1>
                    <p className="text-lg text-gray-300">
                        Manage currencies for the platform
                    </p>
                </div>
                <Button
                    onClick={() => setShowForm(true)}
                    className="bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light hover:from-morpheus-gold-light hover:to-morpheus-gold-dark text-white shadow-lg"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Currency
                </Button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                    placeholder="Search currencies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-morpheus-blue-dark/30 border-slate-600 text-white placeholder-gray-400"
                />
            </div>

            {/* Currency Form */}
            {showForm && (
                <Card className="bg-gradient-to-br from-morpheus-blue-dark/40 to-morpheus-blue-light/40 border-slate-700/50">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-morpheus-gold-light" />
                            {editingCurrency ? 'Edit Currency' : 'Add New Currency'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-gray-300">Currency Name *</Label>
                                    <Input
                                        value={formData.xdeviseintitule}
                                        onChange={(e) => setFormData(prev => ({ ...prev, xdeviseintitule: e.target.value }))}
                                        className="bg-morpheus-blue-dark/30 border-slate-600 text-white"
                                        placeholder="e.g., US Dollar"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label className="text-gray-300">Alpha Code *</Label>
                                    <Input
                                        value={formData.xdevisecodealpha}
                                        onChange={(e) => setFormData(prev => ({ ...prev, xdevisecodealpha: e.target.value.toUpperCase() }))}
                                        className="bg-morpheus-blue-dark/30 border-slate-600 text-white"
                                        placeholder="e.g., USD"
                                        maxLength={3}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label className="text-gray-300">Numeric Code *</Label>
                                    <Input
                                        value={formData.xdevisecodenum}
                                        onChange={(e) => setFormData(prev => ({ ...prev, xdevisecodenum: e.target.value }))}
                                        className="bg-morpheus-blue-dark/30 border-slate-600 text-white"
                                        placeholder="e.g., 840"
                                        maxLength={3}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label className="text-gray-300">Decimal Places *</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        max="4"
                                        value={formData.xdevisenbrdec}
                                        onChange={(e) => setFormData(prev => ({ ...prev, xdevisenbrdec: parseInt(e.target.value) || 0 }))}
                                        className="bg-morpheus-blue-dark/30 border-slate-600 text-white"
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="allowPayment"
                                    checked={formData.xdeviseboolautorisepaiement === "true"}
                                    onChange={(e) => setFormData(prev => ({ 
                                        ...prev, 
                                        xdeviseboolautorisepaiement: e.target.checked ? "true" : "false" 
                                    }))}
                                    className="rounded border-slate-600"
                                />
                                <Label htmlFor="allowPayment" className="text-gray-300">
                                    Allow payments in this currency
                                </Label>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="submit"
                                    disabled={!validateForm() || createCurrencyMutation.isPending || updateCurrencyMutation.isPending}
                                    className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white"
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    {editingCurrency ? 'Update' : 'Create'} Currency
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={resetForm}
                                    className="border-slate-600 text-gray-300 hover:bg-slate-700/50"
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Currencies List */}
            {filteredCurrencies.length === 0 ? (
                <div className="text-center py-12">
                    <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-white mb-2">
                        {searchTerm ? "No currencies match your search" : "No currencies found"}
                    </h3>
                    <p className="text-gray-300">
                        {searchTerm 
                            ? "Try adjusting your search criteria"
                            : "Start by adding your first currency to the system."
                        }
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredCurrencies.map((currency) => (
                        <Card
                            key={currency.xdeviseid}
                            className="bg-gradient-to-br from-morpheus-blue-dark/40 to-morpheus-blue-light/40 border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300"
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <CardTitle className="text-white text-lg">
                                        {currency.xdeviseintitule}
                                    </CardTitle>
                                    <div className="flex items-center gap-2">
                                        {currency.xdeviseboolautorisepaiement === "Y" && (
                                            <Badge className="px-2 py-1 text-xs font-medium flex items-center gap-1 border text-green-400 bg-green-400/10 border-green-400/20">
                                                <CheckCircle className="h-3 w-3" />
                                                Payment
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            
                            <CardContent className="space-y-3">
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span className="text-gray-400">Alpha Code:</span>
                                        <p className="text-white font-medium">{currency.xdevisecodealpha}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">Numeric:</span>
                                        <p className="text-white font-medium">{currency.xdevisecodenum}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">Decimals:</span>
                                        <p className="text-white font-medium">{currency.xdevisenbrdec}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">Status:</span>
                                        <p className={`font-medium ${currency.xdeviseboolautorisepaiement === "Y" ? "text-green-400" : "text-gray-400"}`}>
                                            {currency.xdeviseboolautorisepaiement === "Y" ? "Active" : "Inactive"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleEdit(currency)}
                                        className="flex-1 border-slate-600 text-white hover:bg-slate-700/50"
                                    >
                                        <Edit className="h-4 w-4 mr-1" />
                                        Edit
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDelete(currency.xdeviseid)}
                                        disabled={deleteCurrencyMutation.isPending}
                                        className="px-3 border-red-600 text-red-400 hover:bg-red-600/10"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}