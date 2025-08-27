'use client'

import { createClient } from "@/lib/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Footer from "@/components/footer";
import NavBar from "../_components/nav_bar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQPage() {
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        supabase.auth.onAuthStateChange(async (event) => {
            if (event == 'PASSWORD_RECOVERY') {
                router.push('/auth/update-password')
            }
        })
    }, [router, supabase.auth])

    // FAQ data organized by categories
    const faqData = {
        general: {
            title: "Questions Générales",
            questions: [
                {
                    id: "general-1",
                    question: "Qu'est-ce que cette plateforme ?",
                    answer: "Notre plateforme est un marketplace exclusif dédié à la mode et aux créations artisanales de haute qualité. Nous mettons en avant des créateurs talentueux et leurs collections uniques, en offrant une expérience d'achat premium et personnalisée."
                },
                {
                    id: "general-2", 
                    question: "Comment puis-je créer un compte ?",
                    answer: "Pour créer un compte, cliquez sur le bouton 'Se connecter' dans la barre de navigation, puis sélectionnez 'Créer un compte'. Remplissez vos informations personnelles et confirmez votre adresse email. Votre compte sera activé instantanément."
                },
                {
                    id: "general-3",
                    question: "Qui sont vos créateurs partenaires ?",
                    answer: "Nous travaillons exclusivement avec des créateurs sélectionnés pour leur savoir-faire exceptionnel et leur vision artistique unique. Nos partenaires incluent des designers de haute couture, des bijoutiers artisanaux et des créateurs d'accessoires de luxe basés principalement en Tunisie."
                }
            ]
        },
        orders: {
            title: "Commandes et Livraisons",
            questions: [
                {
                    id: "orders-1",
                    question: "Comment passer une commande ?",
                    answer: "Parcourez nos collections, sélectionnez vos articles favoris et ajoutez-les à votre panier. Procédez au checkout en renseignant vos informations de livraison et de paiement. Vous recevrez une confirmation par email avec le suivi de votre commande."
                },
                {
                    id: "orders-2",
                    question: "Quels sont les délais de livraison ?",
                    answer: "Les délais varient selon le type d'article et votre localisation. Pour les pièces en stock : 3-5 jours ouvrables en Tunisie, 7-14 jours à l'international. Pour les pièces sur-mesure : 2-4 semaines selon la complexité de la création."
                },
                {
                    id: "orders-3",
                    question: "Puis-je suivre ma commande ?",
                    answer: "Oui, dès l'expédition de votre commande, vous recevrez un email avec un numéro de suivi. Vous pouvez également consulter le statut de vos commandes dans votre espace client sous 'Mes Commandes'."
                },
                {
                    id: "orders-4",
                    question: "Livrez-vous à l'international ?",
                    answer: "Oui, nous livrons dans le monde entier. Les frais de livraison et délais sont calculés automatiquement lors du checkout selon votre destination. Certaines restrictions peuvent s'appliquer pour des articles spécifiques."
                }
            ]
        },
        products: {
            title: "Produits et Collections",
            questions: [
                {
                    id: "products-1",
                    question: "Comment sont sélectionnés vos produits ?",
                    answer: "Chaque produit est soigneusement sélectionné par notre équipe d'experts en mode et artisanat. Nous privilégions la qualité, l'originalité et le savoir-faire traditionnel. Tous nos créateurs passent par un processus de validation rigoureux."
                },
                {
                    id: "products-2",
                    question: "Proposez-vous des pièces sur-mesure ?",
                    answer: "Absolument ! Beaucoup de nos créateurs proposent des services de personnalisation. Contactez directement le créateur via la fiche produit ou notre service client pour discuter de vos besoins spécifiques et obtenir un devis personnalisé."
                },
                {
                    id: "products-3",
                    question: "Comment connaître les tailles disponibles ?",
                    answer: "Chaque fiche produit inclut un guide des tailles détaillé. Pour les vêtements, nous recommandons de consulter le tableau de mesures spécifique à chaque créateur. En cas de doute, n'hésitez pas à nous contacter pour des conseils personnalisés."
                }
            ]
        },
        payment: {
            title: "Paiement et Sécurité",
            questions: [
                {
                    id: "payment-1",
                    question: "Quels moyens de paiement acceptez-vous ?",
                    answer: "Nous acceptons les cartes bancaires (Visa, Mastercard), PayPal, et les virements bancaires. Tous les paiements sont sécurisés par un chiffrement SSL et traités par des prestataires certifiés PCI-DSS."
                },
                {
                    id: "payment-2",
                    question: "Mes données de paiement sont-elles sécurisées ?",
                    answer: "Absolument. Nous ne stockons jamais vos données de paiement sur nos serveurs. Toutes les transactions sont traitées par des partenaires bancaires agréés avec les plus hauts standards de sécurité internationaux."
                },
                {
                    id: "payment-3",
                    question: "Puis-je payer en plusieurs fois ?",
                    answer: "Oui, pour les commandes supérieures à 200 TND, nous proposons un paiement en 2 ou 3 fois sans frais via notre partenaire financier. Cette option est disponible au moment du checkout."
                }
            ]
        },
        returns: {
            title: "Retours et Échanges",
            questions: [
                {
                    id: "returns-1",
                    question: "Quelle est votre politique de retour ?",
                    answer: "Vous disposez de 30 jours à compter de la réception pour retourner un article non-personnalisé, dans son état d'origine avec son emballage. Les frais de retour sont à votre charge sauf en cas de défaut ou d'erreur de notre part."
                },
                {
                    id: "returns-2",
                    question: "Comment procéder à un retour ?",
                    answer: "Connectez-vous à votre compte, allez dans 'Mes Commandes', sélectionnez la commande concernée et cliquez sur 'Demander un retour'. Suivez les instructions pour imprimer l'étiquette de retour et emballer votre article."
                },
                {
                    id: "returns-3",
                    question: "Sous quel délai serai-je remboursé ?",
                    answer: "Une fois votre retour réceptionné et vérifié (3-5 jours ouvrables), nous procédons au remboursement sous 5-10 jours ouvrables selon votre mode de paiement initial. Vous recevrez une confirmation par email."
                }
            ]
        }
    };

    return (
        <div className="relative w-full min-h-screen bg-white">
            <NavBar />
            
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-[#053340] via-[#0a4c5c] to-[#053340] py-32 px-8">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative z-10 max-w-4xl mx-auto text-center">
                    <h1 className="text-5xl md:text-7xl font-serif font-extrabold text-white mb-6 tracking-tight">
                        FAQ
                    </h1>
                    <p className="text-xl md:text-2xl text-white/90 font-light leading-relaxed max-w-3xl mx-auto">
                        Trouvez rapidement les réponses à toutes vos questions sur notre plateforme, 
                        nos créateurs et nos services exclusifs
                    </p>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute top-20 left-10 w-24 h-24 border border-white/20 rounded-full"></div>
                <div className="absolute bottom-20 right-10 w-16 h-16 border border-white/20 rounded-full"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-white/10 rounded-full"></div>
            </section>

            {/* FAQ Content */}
            <section className="py-20 px-8 bg-white">
                <div className="max-w-4xl mx-auto">
                    {Object.entries(faqData).map(([categoryKey, category]) => (
                        <div key={categoryKey} className="mb-16">
                            <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#053340] mb-8 text-center">
                                {category.title}
                            </h2>
                            
                            <Accordion type="single" collapsible className="space-y-4">
                                {category.questions.map((faq) => (
                                    <AccordionItem 
                                        key={faq.id} 
                                        value={faq.id}
                                        className="border border-gray-200 rounded-xl px-6 py-2 shadow-sm hover:shadow-md transition-shadow duration-300"
                                    >
                                        <AccordionTrigger className="text-left text-lg font-semibold text-[#053340] hover:text-[#0a4c5c] transition-colors py-6 [&[data-state=open]]:text-[#0a4c5c]">
                                            {faq.question}
                                        </AccordionTrigger>
                                        <AccordionContent className="text-gray-700 leading-relaxed pb-6">
                                            <div className="pt-2 border-t border-gray-100">
                                                {faq.answer}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </div>
                    ))}
                </div>
            </section>

            {/* Contact Section */}
            <section className="bg-gradient-to-r from-gray-50 to-gray-100 py-20 px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#053340] mb-6">
                        Vous ne trouvez pas votre réponse ?
                    </h2>
                    <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                        Notre équipe est là pour vous aider. Contactez-nous et nous vous répondrons dans les plus brefs délais.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="bg-[#053340] hover:bg-[#0a4c5c] text-white px-8 py-4 rounded-xl font-semibold transition-colors duration-300 shadow-lg hover:shadow-xl">
                            Contacter le Support
                        </button>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}