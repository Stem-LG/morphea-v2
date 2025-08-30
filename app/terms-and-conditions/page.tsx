"use client";

import { useLanguage } from "@/hooks/useLanguage";
import { createClient } from "@/lib/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Footer from "@/components/footer";
import NavBar from "../_components/nav_bar";
import Link from "next/link";

export default function TermsAndConditionsPage() {
    const { t } = useLanguage();
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
        <div className="relative w-full min-h-screen bg-white">
            <NavBar />
            
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-[#053340] via-[#0a4c5c] to-[#053340] py-32 px-8">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative z-10 max-w-4xl mx-auto text-center">
                    <h1 className="text-5xl md:text-7xl font-serif font-extrabold text-white mb-6 tracking-tight">
                        {t("auth.termsAndConditions")}
                    </h1>
                    <p className="text-xl md:text-2xl text-white/90 font-light leading-relaxed max-w-3xl mx-auto">
                        Découvrez nos conditions d'utilisation et les termes qui régissent votre expérience sur notre plateforme
                    </p>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute top-20 left-10 w-24 h-24 border border-white/20 rounded-full"></div>
                <div className="absolute bottom-20 right-10 w-16 h-16 border border-white/20 rounded-full"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-white/10 rounded-full"></div>
            </section>

            {/* Terms Content */}
            <section className="py-20 px-8 bg-white">
                <div className="max-w-4xl mx-auto">
                    <div className="border border-gray-200 rounded-xl px-6 py-8 shadow-sm hover:shadow-md transition-shadow duration-300">
                        <div className="text-gray-700 leading-relaxed space-y-6">
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-serif font-bold text-[#053340] mb-2">Conditions Générales de Vente – Morphea</h2>
                                <p className="text-gray-600">Les conditions générales de vente exposées ci-dessous sont applicables à compter du 15 août 2025.</p>
                            </div>

                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-xl font-semibold text-[#053340] mb-3">1. Préambule</h3>
                                    <p>Les conditions générales de vente « CGV » régissent la vente des services et produits proposés par Morphea via son site internet, destinés aux professionnels et particuliers.</p>
                                </div>

                                <div>
                                    <h3 className="text-xl font-semibold text-[#053340] mb-3">2. Objet et Acceptation</h3>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li>Elles s'appliquent aux ventes à distance conclues via notre site.</li>
                                        <li>L'acceptation des « CGV » est requise avant toute commande (case à cocher obligatoire).</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-xl font-semibold text-[#053340] mb-3">3. Prix & Disponibilités</h3>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li>Les prix sont indiqués en TTC et en EUR.</li>
                                        <li>L'utilisateur du site peut choisir une devise autre que l'Euro et les pays lui seront affichés dans la devise de préférence selon un taux de conversion de l'Euro et à cette devise de préférence.</li>
                                        <li>La commande est exprimée soit en Euro soit dans la devise de préférence</li>
                                        <li>En cas de livraison hors de l'Union Européenne « UE », des frais de douanes - si applicables - sont à la charge exclusive de l'acheteur.</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-xl font-semibold text-[#053340] mb-3">4. Commande & Paiement</h3>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li>La commande implique : La sélection des services ou produits / stands, l'identification de l'acheteur, l'acceptation des « CGV » et le paiement.</li>
                                        <li>Un e-mail de notification sera envoyé à l'acheteur signifiant confirmation de la commande et irrévocabilité de l'ordre de paiement.</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-xl font-semibold text-[#053340] mb-3">5. Délai de rétractation & Remboursement</h3>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li>Le droit de rétractation de quatorze (14) jours calendaires n'est pas applicable si les prestations sont exécutées immédiatement avec accord.</li>
                                        <li>En cas de remboursement, les frais de livraison restent à la charge de l'acheteur qui s'y oblige.</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-xl font-semibold text-[#053340] mb-3">6. Livraison ou prestation</h3>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li>Les prestations sont disponibles selon les délais indiqués lors de la commande.</li>
                                        <li>Tout retard éventuel sera notifié au client avec proposition de nouvelle date de livraison.</li>
                                        <li>Les délais de livraison sont applicables hors cas de force majeure.</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-xl font-semibold text-[#053340] mb-3">7. Garanties & Responsabilité</h3>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li>Nos prestations sont conformes à la législation française.</li>
                                        <li>La responsabilité de Morphea est limitée à un dommage direct, sauf cas de force majeure.</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-xl font-semibold text-[#053340] mb-3">8. Données personnelles</h3>
                                    <p>Vos données collectées dans le cadre de la commande sont traitées conformément à notre Politique de Confidentialité des Données.</p>
                                </div>

                                <div>
                                    <h3 className="text-xl font-semibold text-[#053340] mb-3">9. Litiges & Loi applicable</h3>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li>Les présentes « CGV » sont soumises au droit français.</li>
                                        <li>En cas de litige, une médiation à l'amiable pourra être engagée avant toute action judiciaire.</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-xl font-semibold text-[#053340] mb-3">10. Modification des « CGV »</h3>
                                    <p>Morphea se réserve le droit de modifier ces « CGV » à tout moment et la nouvelle version des « CGV » est affichée sur le site Morphea.</p>
                                    <p className="mt-2">Les « CGV » applicables sont celles en vigueur à la date de la commande.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 text-center">
                        <Link
                            href="/auth/sign-up"
                            className="inline-block bg-[#053340] hover:bg-[#0a4c5c] text-white px-8 py-4 rounded-xl font-semibold transition-colors duration-300 shadow-lg hover:shadow-xl"
                        >
                            {t("auth.backToSignUp")}
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
