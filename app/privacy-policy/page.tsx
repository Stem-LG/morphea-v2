'use client'

import { createClient } from '@/lib/client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Footer from '@/components/footer'
import NavBar from '../_components/nav_bar'

export default function PrivacyPolicyPage() {
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        supabase.auth.onAuthStateChange(async (event) => {
            if (event == 'PASSWORD_RECOVERY') {
                router.push('/auth/update-password')
            }
        })
    }, [router, supabase.auth])

    return (
        <div className="relative min-h-screen w-full bg-white">
            <NavBar />

            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-[#053340] via-[#0a4c5c] to-[#053340] px-8 py-32">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative z-10 mx-auto max-w-4xl text-center">
                    <h1 className="mb-6 font-serif text-5xl font-extrabold tracking-tight text-white md:text-7xl">
                        Confidentialité
                    </h1>
                    <p className="mx-auto max-w-3xl text-xl leading-relaxed font-light text-white/90 md:text-2xl">
                        Découvrez comment nous protégeons et traitons vos
                        données personnelles conformément aux réglementations en
                        vigueur
                    </p>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-20 left-10 h-24 w-24 rounded-full border border-white/20"></div>
                <div className="absolute right-10 bottom-20 h-16 w-16 rounded-full border border-white/20"></div>
                <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 transform rounded-full border border-white/10"></div>
            </section>

            {/* Privacy Policy Content */}
            <section className="bg-white px-8 py-20">
                <div className="mx-auto max-w-4xl">
                    <div className="rounded-xl px-6 py-8">
                        <div className="space-y-8 leading-relaxed text-gray-700">
                            <div className="mb-8 text-center">
                                <h2 className="mb-2 font-serif text-2xl font-bold text-[#053340]">
                                    Politique de confidentialité des données
                                    personnelles – Morphea
                                </h2>
                            </div>

                            <div className="space-y-8">
                                <div>
                                    <h3 className="mb-4 text-xl font-semibold text-[#053340]">
                                        Préambule
                                    </h3>
                                    <p className="mb-4">
                                        La société ……………. est immatriculée au
                                        …………… sous le No ……………., ayant son siège
                                        social sis au …………., son site web est
                                        accessible via l'Uniform Ressource
                                        Locator « URL » …………….., son No de
                                        téléphone est ………………, et est représentée
                                        par …………………
                                    </p>
                                    <p className="italic">
                                        ci-après dénommée La société ;
                                    </p>
                                </div>

                                <div>
                                    <h3 className="mb-4 text-xl font-semibold text-[#053340]">
                                        Introduction
                                    </h3>
                                    <p className="mb-3">
                                        La présente politique de confidentialité
                                        a pour but d'exposer, aux utilisateurs
                                        du site Morphea proposé par La société
                                        ci-dessus référencée, la manière dont
                                        sont collectées et traitées leurs
                                        données à caractère personnel.
                                    </p>
                                    <p>
                                        Les données susceptibles d'identifier un
                                        utilisateur sont considérées données
                                        personnelles.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="mb-4 text-xl font-semibold text-[#053340]">
                                        A – Principes généraux en matière de
                                        collecte et de traitement des données
                                    </h3>
                                    <p className="mb-4">
                                        La société ……………. mettra tout en œuvre
                                        pour assurer la sécurité et la
                                        confidentialité des données à caractère
                                        personnel de ses clients dans le respect
                                        du Règlement Général de Protection des
                                        Données « RGPD » et des règles de l'art.
                                    </p>
                                    <p className="mb-4">
                                        Conformément aux dispositions du RGPD,
                                        la collecte et le traitement des données
                                        des utilisateurs du site Morphea
                                        respectent les principes suivants :
                                    </p>
                                    <ul className="mb-6 list-disc space-y-3 pl-6">
                                        <li>
                                            <strong>
                                                Licéité, loyauté et transparence
                                                :
                                            </strong>{' '}
                                            Les données ne peuvent être
                                            collectées et traitées qu'avec le
                                            consentement de l'utilisateur
                                            propriétaire des données. A chaque
                                            fois que des données à caractère
                                            personnel seront collectées, il sera
                                            indiqué à l'utilisateur que ses
                                            données sont collectées, et pour
                                            quelles raisons ;
                                        </li>
                                        <li>
                                            <strong>
                                                Finalités limitées :
                                            </strong>{' '}
                                            La collecte et le traitement des
                                            données sont exécutés pour répondre
                                            à un ou plusieurs objectifs
                                            déterminés dans les conditions
                                            générales d'utilisation du site
                                            Morphea ;
                                        </li>
                                        <li>
                                            <strong>
                                                Minimisation de la collecte et
                                                du traitement des données :
                                            </strong>{' '}
                                            seules les données nécessaires à la
                                            bonne exécution des objectifs
                                            poursuivis par le site Morphea sont
                                            collectées ;
                                        </li>
                                        <li>
                                            <strong>
                                                Conservation des données
                                                réduites dans le temps :
                                            </strong>{' '}
                                            Les données sont conservées pour une
                                            durée limitée et l'utilisateur en
                                            est informé. Lorsque cette
                                            information ne peut pas être
                                            communiquée, l'utilisateur est
                                            informé des critères utilisés pour
                                            déterminer la durée de conservation
                                            ;
                                        </li>
                                        <li>
                                            <strong>
                                                Intégrité et confidentialité des
                                                données collectées et traitées :
                                            </strong>{' '}
                                            Le responsable du traitement des
                                            données s'engage à garantir
                                            l'intégrité et la confidentialité
                                            des données collectées.
                                        </li>
                                    </ul>
                                    <p className="mb-4">
                                        La collecte et le traitement des données
                                        à caractère personnel ne pourront
                                        intervenir que s'ils respectent au moins
                                        l'une des conditions ci-après énumérées
                                        :
                                    </p>
                                    <ul className="list-disc space-y-2 pl-6">
                                        <li>
                                            L'utilisateur a expressément
                                            consenti au traitement ;
                                        </li>
                                        <li>
                                            Le traitement répond à une
                                            obligation légale ;
                                        </li>
                                        <li>
                                            Le traitement s'explique par une
                                            nécessité liée à la sauvegarde des
                                            intérêts vitaux de la personne
                                            concernée ou d'une autre personne
                                            physique ;
                                        </li>
                                        <li>
                                            Le traitement peut s'expliquer par
                                            une nécessité liée à l'exécution
                                            d'une mission d'intérêt public ou
                                            qui relève de l'exercice de
                                            l'autorité publique ;
                                        </li>
                                        <li>
                                            Le traitement et la collecte des
                                            données à caractère personnel sont
                                            nécessaires aux fins des intérêts
                                            légitimes et privés poursuivis par
                                            le responsable du traitement ou par
                                            un tiers.
                                        </li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="mb-4 text-xl font-semibold text-[#053340]">
                                        B - Identité du responsable du
                                        traitement
                                    </h3>
                                    <p className="mb-3">
                                        La société désigne un représentant
                                        chargé du traitement des données à
                                        caractère personnel de ses clients.
                                    </p>
                                    <p className="mb-3">
                                        L'accès à ce représentant est possible
                                        par email à l'adresse ……………… et par
                                        téléphone sous le numéro : ………………….
                                    </p>
                                    <p>
                                        Dans le cas où l'intégrité, la
                                        confidentialité ou la sécurité des
                                        données à caractère personnel du client
                                        est compromise, le responsable du
                                        traitement s'engage à informer le client
                                        par tout moyen laissant une trace
                                        écrite.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="mb-4 text-xl font-semibold text-[#053340]">
                                        C – Finalités de collecte et de
                                        traitement des données à caractère
                                        personnel
                                    </h3>
                                    <p>
                                        Les données à caractère personnel des
                                        clients sont collectées et traitées à
                                        des fins de gestion du site Morphea,
                                        gestion de la relation client, gestion
                                        des risques notamment opérationnels et
                                        de blanchiment d'argent et de lutte
                                        contre le terrorisme, gestion des
                                        incidents de paiement, prévention de la
                                        fraude, prospection et promotion
                                        commerciale, et toute autre finalité
                                        liée à l'activité ou aux services
                                        proposés au client.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="mb-4 text-xl font-semibold text-[#053340]">
                                        D – Collecte et traitement des données à
                                        caractère personnel
                                    </h3>
                                    <p className="mb-4">
                                        D'une manière générale, les données
                                        collectées d'une personne physique
                                        peuvent couvrir : Nom, Prénom, Pièce
                                        d'identité (type, numéro, date début
                                        validité, date fin validité, autorité de
                                        délivrance), genre, naissance (date et
                                        lieu), adresse postale, adresse email,
                                        numéro de téléphone mobile. La collecte
                                        peut également s'étendre aux cookies,
                                        adresse Internet Protocol « IP »,
                                        comportement de navigation pour
                                        améliorer l'expérience utilisateur.
                                    </p>
                                    <p className="mb-4">
                                        Les données à caractère personnel sont
                                        collectées au moment de l'enrôlement du
                                        client, actualisées en cas de besoin,
                                        traitées suivant les besoins métier, non
                                        transmissibles aux tiers sauf
                                        autorisation légale, conservées pendant
                                        le délai légal et hébergées de manière
                                        sécurisée dans un Data Center.
                                    </p>
                                    <p className="mb-4">
                                        Le client dispose d'un droit d'accès à
                                        ses données à caractère personnel et
                                        peut également demander à ce que ses
                                        données soient actualisées ou
                                        supprimées.
                                    </p>
                                    <p className="mb-4">
                                        Il peut également s'opposer, sous
                                        réserve de justifier d'un motif
                                        légitime, à ce que ses données à
                                        caractère personnel fassent l'objet d'un
                                        traitement.
                                    </p>
                                    <p className="mb-4">
                                        Cette opposition peut être formulée via
                                        le site Morphea et peut entrainer
                                        l'impossibilité pour la société de
                                        fournir le(s) service(s) demandé(s) ou
                                        souscrit(s).
                                    </p>
                                    <p>
                                        La société s'engage à donner suite à la
                                        demande d'opposition formulée par le
                                        client dans les trente (30) jours
                                        ouvrés.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="mb-4 text-xl font-semibold text-[#053340]">
                                        E – Demandes d'informations concernant
                                        les transactions suspectes des clients
                                    </h3>
                                    <p className="mb-3">
                                        La société est assujettie aux sanctions
                                        pénales qui sanctionnent le blanchiment
                                        d'argent et le financement du
                                        terrorisme. Le Client accepte que La
                                        société peut s'informer auprès de lui en
                                        ce qui concerne les opérations qui
                                        paraitront inhabituelles dans le cadre
                                        précité.
                                    </p>
                                    <p>
                                        Le client s'engage à donner à La société
                                        toutes informations utiles sur le
                                        contexte de ces opérations.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 text-center">
                        <div className="flex flex-col justify-center gap-4 sm:flex-row">
                            <button className="rounded-xl bg-[#053340] px-8 py-4 font-semibold text-white shadow-lg transition-colors duration-300 hover:bg-[#0a4c5c] hover:shadow-xl">
                                Nous Contacter
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-20">
                <div className="mx-auto max-w-4xl text-center">
                    <h2 className="mb-6 font-serif text-3xl font-bold text-[#053340] md:text-4xl">
                        Questions sur la Protection de vos Données ?
                    </h2>
                    <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600">
                        Pour toute question concernant le traitement de vos
                        données personnelles ou pour exercer vos droits,
                        contactez notre délégué à la protection des données.
                    </p>
                    <div className="flex flex-col justify-center gap-4 sm:flex-row">
                        <button className="rounded-xl bg-[#053340] px-8 py-4 font-semibold text-white shadow-lg transition-colors duration-300 hover:bg-[#0a4c5c] hover:shadow-xl">
                            Contacter le DPO
                        </button>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}
