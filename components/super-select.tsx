import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Command as CommandPrimitive } from "cmdk";
import { Check, ChevronsUpDown, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { forwardRef, useEffect, useState } from "react";

interface SuperSelectProps {
    value?: string | number | null;
    onValueChange?: (value: string | number) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    options: { value: string | number; label: string }[];
    className?: string;
    disabled?: boolean;
    triggerClassName?: string;
    contentClassName?: string;
    actions?: React.ReactNode;
    onCreate?: (value: string) => void;
    createButtonLabel?: string;
    autoSelectFirst?: boolean;
}

const SuperSelect = forwardRef<HTMLButtonElement, SuperSelectProps>(
    (
        {
            value,
            onValueChange,
            placeholder = "Select an option",
            searchPlaceholder = "Search...",
            emptyMessage = "No results found.",
            options,
            className,
            disabled,
            triggerClassName,
            contentClassName,
            actions,
            onCreate,
            createButtonLabel = "Create",
            autoSelectFirst = false,
        },
        ref
    ) => {
        const [open, setOpen] = useState(false);
        const [search, setSearch] = useState("");

        // Auto-select first option if enabled and no value is selected
        useEffect(() => {
            if (autoSelectFirst && !value && options.length > 0) {
                onValueChange?.(options[0].value);
            }
        }, [autoSelectFirst, value, options, onValueChange]);

        const selectedOption = options.find((option) => option.value === value);
        const filteredOptions = search
            ? options.filter(
                  (option) =>
                      option.label.toLowerCase().includes(search.toLowerCase()) ||
                      String(option.value).toLowerCase().includes(search.toLowerCase())
              )
            : options;

        const showCreateButton =
            onCreate && search && !options.some((option) => option.label.toLowerCase() === search.toLowerCase());

        return (
            <div className={className}>
                <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
                    <PopoverPrimitive.Trigger asChild>
                        <button
                            ref={ref}
                            type="button"
                            disabled={disabled}
                            className={cn(
                                "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
                                triggerClassName
                            )}
                        >
                            <span>{selectedOption?.label || placeholder}</span>
                            <ChevronsUpDown className="h-4 w-4 opacity-50" />
                        </button>
                    </PopoverPrimitive.Trigger>
                    <PopoverPrimitive.Content
                        className={cn(
                            "z-50 w-[--radix-popover-trigger-width] rounded-md border bg-popover p-0 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
                            contentClassName
                        )}
                        style={{ width: "var(--radix-popover-trigger-width)" }}
                    >
                        <CommandPrimitive className="flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground">
                            <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
                                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                                <CommandPrimitive.Input
                                    className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder={searchPlaceholder}
                                    value={search}
                                    onValueChange={setSearch}
                                />
                            </div>
                            <CommandPrimitive.List className="max-h-[300px] overflow-y-auto overflow-x-hidden">
                                {showCreateButton && (
                                    <div className="p-1">
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start gap-2"
                                            onClick={() => {
                                                onCreate(search);
                                                setOpen(false);
                                                setSearch("");
                                            }}
                                        >
                                            <Plus className="h-4 w-4" />
                                            {createButtonLabel} &ldquo;{search}&rdquo;
                                        </Button>
                                    </div>
                                )}
                                {actions && <div className="border-b p-1">{actions}</div>}
                                {!filteredOptions.length && !showCreateButton ? (
                                    <CommandPrimitive.Empty className="py-6 text-center text-sm">
                                        {emptyMessage}
                                    </CommandPrimitive.Empty>
                                ) : (
                                    <CommandPrimitive.Group className="overflow-hidden p-1">
                                        {filteredOptions.map((option) => (
                                            <CommandPrimitive.Item
                                                key={option.value}
                                                onSelect={() => {
                                                    onValueChange?.(option.value);
                                                    setOpen(false);
                                                    setSearch("");
                                                }}
                                                className="relative flex cursor-default select-none items-center justify-between rounded-sm px-2 py-1.5 text-sm outline-none aria-disabled:pointer-events-none aria-selected:bg-accent aria-selected:text-accent-foreground aria-disabled:opacity-50"
                                                aria-selected={value === option.value}
                                            >
                                                {option.label}
                                                {value === option.value && <Check className="h-4 w-4" />}
                                            </CommandPrimitive.Item>
                                        ))}
                                    </CommandPrimitive.Group>
                                )}
                            </CommandPrimitive.List>
                        </CommandPrimitive>
                    </PopoverPrimitive.Content>
                </PopoverPrimitive.Root>
            </div>
        );
    }
);

SuperSelect.displayName = "SuperSelect";

export { SuperSelect };
export type { SuperSelectProps };
