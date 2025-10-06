'use client'

import { ChevronRight, ChevronDown, X } from 'lucide-react'
import Image from 'next/image'
import { useState, type FormEvent, useEffect, useRef } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { createClient } from '@/lib/client'
import { toast } from 'sonner'
import { useHomeSettings } from '@/hooks/use-home-settings'
import { useCategories } from '@/hooks/useCategories'
import { PoweredBy } from './powered-by'

export default function Footer() {
    const [email, setEmail] = useState('')
    const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSocialMediaOpen, setIsSocialMediaOpen] = useState(false)
    const { language, setLanguage, t } = useLanguage()
    const dropdownRef = useRef<HTMLDivElement>(null)
    const socialSectionRef = useRef<HTMLDivElement>(null)
    const supabase = createClient()
    const { data: homeSettings } = useHomeSettings()
    const { data: categories = [] } = useCategories()

    // Email validation function
    const isValidEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault()

        if (!email.trim()) {
            toast.error(t('footer.newsletter.emailRequired'))
            return
        }

        if (!isValidEmail(email)) {
            toast.error(t('footer.newsletter.emailInvalid'))
            return
        }

        setIsSubmitting(true)

        try {
            // Insert into xnewsletter table in morpheus schema
            await supabase.schema('morpheus').from('xnewsletter').insert({
                email: email.trim().toLowerCase(),
                subscribed: true,
            })

            // Always show success message regardless of the response
            // (as requested - even if email already exists due to unique constraint)
            toast.success(t('footer.newsletter.success'))
            setEmail('')
        } catch (error) {
            // Still show success message as requested
            toast.success(t('footer.newsletter.success'))
            setEmail('')
        } finally {
            setIsSubmitting(false)
        }
    }

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsLanguageDropdownOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    // Smooth scroll to social media section when it opens
    useEffect(() => {
        if (isSocialMediaOpen && socialSectionRef.current) {
            socialSectionRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            })
        }
    }, [isSocialMediaOpen])

    const languages = [
        {
            code: 'fr' as const,
            name: t('common.french'),
            flag: '/flags/fr.svg',
            shortName: 'FR',
        },
        {
            code: 'en' as const,
            name: t('common.english'),
            flag: '/flags/us.svg',
            shortName: 'EN',
        },
    ]

    const currentLanguage =
        languages.find((lang) => lang.code === language) || languages[0]

    return (
        <footer className="font-supreme relative border-t border-gray-200 bg-white">
            <div className="mx-auto px-4 md:px-6 lg:px-10">
                {/* Top grid - Mobile Responsive */}
                <div className="grid grid-cols-1 gap-8 py-8 md:grid-cols-12 md:gap-10 md:py-12">
                    {/* Brand + Newsletter */}
                    <div className="flex flex-col items-center text-center md:col-span-5">
                        <div className="mb-4 w-fit md:mb-6">
                            <Image
                                src="/images/morph_logo.webp"
                                alt="Morphea"
                                width={160}
                                height={54}
                                className="h-12 w-36 object-cover md:h-16 md:w-44"
                            />
                        </div>
                        <p className="mb-4 max-w-xs px-2 text-lg leading-6 text-neutral-700 md:max-w-md md:px-0 md:text-xl">
                            {t('footer.newsletter.description')}
                        </p>
                        <form
                            onSubmit={onSubmit}
                            className="relative w-full max-w-80"
                        >
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder={t(
                                    'footer.newsletter.emailPlaceholder'
                                )}
                                disabled={isSubmitting}
                                className="font-supreme h-12 w-full rounded-full border border-gray-300 pr-12 pl-4 text-base transition outline-none focus:border-gray-400 disabled:cursor-not-allowed disabled:opacity-50 md:h-12"
                            />
                            <button
                                aria-label={t('footer.newsletter.subscribe')}
                                type="submit"
                                disabled={isSubmitting}
                                className="absolute top-1/2 right-1 flex size-10 -translate-y-1/2 touch-manipulation items-center justify-center rounded-full bg-gradient-to-b from-slate-900 via-sky-900 to-cyan-950 text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                ) : (
                                    <ChevronRight className="size-5 md:size-6" />
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Columns - Mobile Responsive */}
                    <div className="grid grid-cols-1 gap-6 md:col-span-7 md:grid-cols-3 md:gap-8">
                        <div>
                            <h3 className="font-recia mb-3 text-base text-neutral-400 uppercase md:mb-4 md:text-lg">
                                {t('footer.about.title')}
                            </h3>
                            <ul className="space-y-2 md:space-y-3">
                                <li>
                                    <a
                                        href={
                                            homeSettings?.footer.links.origin ||
                                            '/a-lorigine-de-morphea'
                                        }
                                        className="block touch-manipulation py-1 text-base text-neutral-700 transition-colors hover:text-black md:text-lg"
                                    >
                                        {t('footer.about.origin')}
                                    </a>
                                </li>

                                <li>
                                    <a
                                        href={
                                            homeSettings?.footer.links.events ||
                                            '/#collections'
                                        }
                                        className="block touch-manipulation py-1 text-base text-neutral-700 transition-colors hover:text-black md:text-lg"
                                    >
                                        {t('footer.about.events')}
                                    </a>
                                </li>
                                <li>
                                    <button
                                        onClick={() =>
                                            setIsSocialMediaOpen(true)
                                        }
                                        className="block touch-manipulation py-1 text-base text-neutral-700 transition-colors hover:text-black md:text-lg"
                                    >
                                        {t('footer.about.socialMedia')}
                                    </button>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-recia mb-3 text-base text-neutral-400 uppercase md:mb-4 md:text-lg">
                                {t('footer.customerService.title')}
                            </h3>
                            <ul className="space-y-2 md:space-y-3">
                                <li>
                                    <a
                                        href={
                                            homeSettings?.footer.links
                                                .myAccount || '/profile'
                                        }
                                        className="block touch-manipulation py-1 text-base text-neutral-700 transition-colors hover:text-black md:text-lg"
                                    >
                                        {t('footer.customerService.myAccount')}
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href={
                                            homeSettings?.footer.links
                                                .ordersDelivery || '/my-orders'
                                        }
                                        className="block touch-manipulation py-1 text-base text-neutral-700 transition-colors hover:text-black md:text-lg"
                                    >
                                        {t(
                                            'footer.customerService.ordersDelivery'
                                        )}
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href={
                                            homeSettings?.footer.links
                                                .cookiesPrivacy ||
                                            '/privacy-policy'
                                        }
                                        className="block touch-manipulation py-1 text-base text-neutral-700 transition-colors hover:text-black md:text-lg"
                                    >
                                        {t(
                                            'footer.customerService.cookiesPrivacy'
                                        )}
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="/faq"
                                        className="block touch-manipulation py-1 text-base text-neutral-700 transition-colors hover:text-black md:text-lg"
                                    >
                                        {t('footer.customerService.faq')}
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href={
                                            homeSettings?.footer.links.terms ||
                                            '/terms-and-conditions'
                                        }
                                        className="block touch-manipulation py-1 text-base text-neutral-700 transition-colors hover:text-black md:text-lg"
                                    >
                                        {t('footer.customerService.terms')}
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-recia mb-3 text-base text-neutral-400 uppercase md:mb-4 md:text-lg">
                                {t('footer.categories.title')}
                            </h3>
                            <ul className="space-y-2 md:space-y-3">
                                {(() => {
                                    // Get selected category IDs from settings
                                    const selectedCategoryIds =
                                        homeSettings?.footer.categoryIds || []

                                    // If no dynamic categories are selected, show fallback static categories
                                    if (selectedCategoryIds.length === 0) {
                                        return (
                                            <>
                                                <li>
                                                    <a
                                                        href="#"
                                                        className="block touch-manipulation py-1 text-base text-neutral-700 transition-colors hover:text-black md:text-lg"
                                                    >
                                                        {t(
                                                            'footer.categories.newCollection'
                                                        )}
                                                    </a>
                                                </li>
                                                <li>
                                                    <a
                                                        href="#"
                                                        className="block touch-manipulation py-1 text-base text-neutral-700 transition-colors hover:text-black md:text-lg"
                                                    >
                                                        {t(
                                                            'footer.categories.clothing'
                                                        )}
                                                    </a>
                                                </li>
                                                <li>
                                                    <a
                                                        href="#"
                                                        className="block touch-manipulation py-1 text-base text-neutral-700 transition-colors hover:text-black md:text-lg"
                                                    >
                                                        {t(
                                                            'footer.categories.jewelry'
                                                        )}
                                                    </a>
                                                </li>
                                                <li>
                                                    <a
                                                        href="#"
                                                        className="block touch-manipulation py-1 text-base text-neutral-700 transition-colors hover:text-black md:text-lg"
                                                    >
                                                        {t(
                                                            'footer.categories.accessories'
                                                        )}
                                                    </a>
                                                </li>
                                            </>
                                        )
                                    }

                                    // Show dynamic categories in the order they were configured
                                    return selectedCategoryIds.map(
                                        (categoryId) => {
                                            const category = categories.find(
                                                (cat) =>
                                                    cat.xcategprodid ===
                                                    categoryId
                                            )
                                            if (!category) return null

                                            return (
                                                <li key={categoryId}>
                                                    <a
                                                        href={`/shop?categoryId=${categoryId}`}
                                                        className="block touch-manipulation py-1 text-base text-neutral-700 transition-colors hover:text-black md:text-lg"
                                                    >
                                                        {
                                                            category.xcategprodintitule
                                                        }
                                                    </a>
                                                </li>
                                            )
                                        }
                                    )
                                })()}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Follow us bar - Mobile Responsive - Conditionally rendered */}
                {isSocialMediaOpen && (
                    <div
                        ref={socialSectionRef}
                        className="border-y border-gray-200 pt-3 pb-8 md:pt-4 md:pb-11">
                        <div className="flex flex-col items-center justify-center gap-4 md:gap-6">
                            <div className="flex w-full items-center justify-between">
                                <div className="size-8" />
                                <span className="font-recia text-lg font-semibold text-neutral-700 md:text-xl">
                                    {t('footer.social.followUs')}
                                </span>
                                <button
                                    onClick={() => setIsSocialMediaOpen(false)}
                                    className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200 hover:text-black"
                                    aria-label="Close social media"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="flex items-center gap-5 text-gray-700 md:gap-7">
                                <a
                                    aria-label="Facebook"
                                    href={
                                        homeSettings?.footer.social.facebook ||
                                        '#'
                                    }
                                    className="-m-2 touch-manipulation p-2 transition-colors hover:text-black"
                                >
                                    <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 13 22"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="md:h-[22px] md:w-[22px]"
                                    >
                                        <path
                                            d="M7.79559 12.6272V21H4.08371V12.6272H1V9.23225H4.08371V7.99704C4.08371 3.41124 5.93251 1 9.84426 1C11.0435 1 11.3433 1.1997 12 1.36243V4.72041C11.2648 4.58728 11.0578 4.51331 10.294 4.51331C9.38741 4.51331 8.90201 4.77959 8.45944 5.30473C8.01687 5.82988 7.79559 6.73964 7.79559 8.04142V9.23964H12L10.8722 12.6346H7.79559V12.6272Z"
                                            stroke="black"
                                        />
                                    </svg>
                                </a>
                                <a
                                    aria-label="Instagram"
                                    href={
                                        homeSettings?.footer.social.instagram ||
                                        '#'
                                    }
                                    className="-m-2 touch-manipulation p-2 transition-colors hover:text-black"
                                >
                                    <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 22 22"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="md:h-[22px] md:w-[22px]"
                                    >
                                        <path
                                            d="M17.6571 21H4.34292C2.50308 21 1 19.4969 1 17.6571V4.34292C1 2.50308 2.50308 1 4.34292 1H17.6571C19.4969 1 21 2.50308 21 4.34292V17.6571C21 19.5051 19.5051 21 17.6571 21Z"
                                            stroke="black"
                                        />
                                        <path
                                            d="M7.37417 14.6345C8.34337 15.6037 9.6329 16.1375 11.0046 16.1375C12.3762 16.1375 13.6575 15.6037 14.635 14.6345C15.6042 13.6653 16.138 12.3757 16.138 11.0041C16.138 9.63241 15.6042 8.34288 14.635 7.37369C13.6658 6.40449 12.3762 5.87061 11.0046 5.87061C9.6329 5.87061 8.34337 6.40449 7.37417 7.37369C6.40497 8.34288 5.87109 9.63241 5.87109 11.0041C5.87109 12.3757 6.40497 13.6653 7.37417 14.6345Z"
                                            stroke="black"
                                        />
                                        <path
                                            d="M17.138 5.70202C17.6824 5.70202 18.1236 5.26072 18.1236 4.71636C18.1236 4.172 17.6824 3.73071 17.138 3.73071C16.5936 3.73071 16.1523 4.172 16.1523 4.71636C16.1523 5.26072 16.5936 5.70202 17.138 5.70202Z"
                                            stroke="black"
                                        />
                                    </svg>
                                </a>
                                <a
                                    aria-label="LinkedIn"
                                    href={
                                        homeSettings?.footer.social.linkedin ||
                                        '#'
                                    }
                                    className="-m-2 touch-manipulation p-2 transition-colors hover:text-black"
                                >
                                    <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 22 22"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="md:h-[22px] md:w-[22px]"
                                    >
                                        <path
                                            d="M5.51699 7.5769H1.33789V20.9038H5.51699V7.5769Z"
                                            stroke="black"
                                        />
                                        <path
                                            d="M16.8209 7.28792C16.6669 7.26866 16.5032 7.25903 16.3395 7.2494C13.9996 7.15311 12.6804 8.53972 12.2182 9.13674C12.093 9.30044 12.0352 9.39673 12.0352 9.39673V7.61531H8.03906V20.9422H12.0352H12.2182C12.2182 19.5845 12.2182 18.2364 12.2182 16.8787C12.2182 16.1469 12.2182 15.415 12.2182 14.6832C12.2182 13.7781 12.1508 12.8151 12.6033 11.987C12.9885 11.2937 13.6818 10.947 14.4618 10.947C16.7728 10.947 16.8209 13.0366 16.8209 13.2292C16.8209 13.2388 16.8209 13.2484 16.8209 13.2484V21H21V12.3048C21 9.32932 19.4883 7.57679 16.8209 7.28792Z"
                                            stroke="black"
                                        />
                                        <path
                                            d="M3.42657 5.85316C4.76673 5.85316 5.85315 4.76674 5.85315 3.42658C5.85315 2.08642 4.76673 1 3.42657 1C2.08641 1 1 2.08642 1 3.42658C1 4.76674 2.08641 5.85316 3.42657 5.85316Z"
                                            stroke="black"
                                        />
                                    </svg>
                                </a>
                                <a
                                    aria-label="X"
                                    href={
                                        homeSettings?.footer.social.twitter ||
                                        '#'
                                    }
                                    className="-m-2 touch-manipulation p-2 transition-colors hover:text-black"
                                >
                                    <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 20 20"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <rect
                                            width="20"
                                            height="20"
                                            fill="url(#pattern0_82_261)"
                                        />
                                        <defs>
                                            <pattern
                                                id="pattern0_82_261"
                                                patternContentUnits="objectBoundingBox"
                                                width="1"
                                                height="1"
                                            >
                                                <use
                                                    xlinkHref="#image0_82_261"
                                                    transform="scale(0.00195312)"
                                                />
                                            </pattern>
                                            <image
                                                id="image0_82_261"
                                                width="512"
                                                height="512"
                                                preserveAspectRatio="none"
                                                xlinkHref="data:image/png;base64,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"
                                            />
                                        </defs>
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                )}



                {/* Bottom language row - Mobile Responsive */}
                <div className="font-supreme sm:flex justify-between py-3 text-base text-stone-500 md:py-4 md:text-lg">
                    {/* Language selector hidden - French only version */}
                    {/* <div className="relative inline-block flex-1 mb-4 sm:mb-0" ref={dropdownRef}>
                        <button
                            onClick={() =>
                                setIsLanguageDropdownOpen(
                                    !isLanguageDropdownOpen
                                )
                            }
                            className="-m-2 flex touch-manipulation items-center gap-2 p-2 transition-colors hover:text-black"
                        >
                            <span>{t('common.language')} :</span>
                            <span className="flex items-center gap-1">
                                <Image 
                                    src={currentLanguage.flag} 
                                    alt={currentLanguage.name}
                                    width={18}
                                    height={14}
                                    className="rounded-xs"
                                />
                                <span>{currentLanguage.shortName}</span>
                                <ChevronDown
                                    className={`size-4 transition-transform ${isLanguageDropdownOpen ? 'rotate-180' : ''}`}
                                />
                            </span>
                        </button>

                        {isLanguageDropdownOpen && (
                            <div className="absolute bottom-full left-0 z-10 mb-2 min-w-32 rounded-md border border-gray-200 bg-white shadow-lg">
                                {languages.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => {
                                            setLanguage(lang.code)
                                            setIsLanguageDropdownOpen(false)
                                        }}
                                        className={`flex w-full touch-manipulation items-center gap-2 px-3 py-3 text-left hover:bg-gray-50 md:py-2 ${
                                            language === lang.code
                                                ? 'bg-gray-100'
                                                : ''
                                        }`}
                                    >
                                        <Image 
                                            src={lang.flag} 
                                            alt={lang.name}
                                            width={16}
                                            height={12}
                                            className="rounded-xs"
                                        />
                                        <span className="">{lang.name}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div> */}
                    <div className="flex-1"></div>
                    <PoweredBy />
                    <div className='flex-1'></div>
                </div>
            </div>
        </footer>
    )
}
