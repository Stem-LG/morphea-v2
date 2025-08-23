'use client'

import { useLanguage } from '@/hooks/useLanguage'
import {
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu'
import Image from 'next/image'

export const LanguageSwitcher = () => {
    const { language, setLanguage, t } = useLanguage()

    const languages = [
        {
            code: 'fr' as const,
            name: t('common.french'),
            flag: '/flags/fr.svg',
        },
        {
            code: 'en' as const,
            name: t('common.english'),
            flag: '/flags/us.svg',
        },
    ]

    return (
        <DropdownMenuSub>
            <DropdownMenuSubTrigger>
                <span className="flex-1">{t('common.language')}</span>
                <span className="mr-2">
                    {languages.find((lang) => lang.code === language)?.flag && (
                        <Image
                            src={
                                languages.find((lang) => lang.code === language)
                                    ?.flag
                            }
                            alt={
                                languages.find((lang) => lang.code === language)
                                    ?.name
                            }
                            width={20}
                            height={20}
                            className="inline h-5 w-5 rounded-sm"
                        />
                    )}
                </span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
                <DropdownMenuRadioGroup
                    value={language}
                    onValueChange={setLanguage}
                >
                    {languages.map((lang) => (
                        <DropdownMenuRadioItem
                            key={lang.code}
                            value={lang.code}
                        >
                            <img
                                src={lang.flag}
                                alt={lang.name}
                                className="h-5 w-5 rounded-sm"
                            />
                            <span>{lang.name}</span>
                        </DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
        </DropdownMenuSub>
    )
}
