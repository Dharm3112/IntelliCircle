import Link from "next/link";
import { Scale, ArrowLeft } from "lucide-react";

export default function TermsOfServicePage() {
    return (
        <div className="flex-1 w-full bg-background flex flex-col min-h-screen relative">
            {/* Background elements */}
            <div className="absolute top-0 w-full h-[600px] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-overlay pointer-events-none z-0" />
            <div className="absolute top-0 right-1/2 translate-x-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-[150px] pointer-events-none z-0" />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10 w-full">

                <Link href="/" className="inline-flex items-center text-sm font-medium text-zinc-400 hover:text-white mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
                </Link>

                <div className="mb-12">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 border border-primary/20 shadow-[0_0_30px_rgba(79,70,229,0.15)]">
                        <Scale className="w-8 h-8" />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-display font-bold text-white mb-6 tracking-tight">
                        Terms of Service
                    </h1>
                    <div className="flex items-center gap-4 text-sm text-zinc-400">
                        <span>Last Updated: March 1, 2026</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-600"></span>
                        <span>Effective Date: March 1, 2026</span>
                    </div>
                </div>

                <div className="prose prose-invert prose-indigo max-w-none text-zinc-300">

                    {/* 1. Acceptance of Terms */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-display font-semibold text-white mb-4">1. Acceptance of Terms</h2>
                        <p>
                            These Terms of Service ("Terms") constitute a legally binding agreement made between you ("User," "you," or "your") and <strong>[Company Name]</strong> ("Company," "we," "us," or "our"). These Terms govern your access to and use of the IntelliCircle platform, applications, and any related services (collectively, the "Service").
                        </p>
                        <p>
                            By accessing or using the Service, you signify that you have read, understood, and agree to be bound by these Terms. If you do not agree with all of these Terms, you are expressly prohibited from using the Service and must discontinue use immediately.
                        </p>
                        <p>
                            <strong>Eligibility:</strong> The Service is intended only for access and use by individuals at least 18 years old. By using the Service, you warrant and represent that you are at least 18 years of age.
                        </p>
                    </section>

                    {/* 2. Description of Services */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-display font-semibold text-white mb-4">2. Description of Services</h2>
                        <p>
                            IntelliCircle is a hyper-local, real-time networking and community chat platform that connects professionals based on geolocation. The Service allows users to discover active conversational "rooms" nearby, chat instantly with other users, and facilitate offline networking.
                        </p>
                        <p>
                            We reserve the right to modify, suspend, or discontinue any aspect, feature, or functionality of the Service at any time without prior notice or liability.
                        </p>
                    </section>

                    {/* 3. User Accounts */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-display font-semibold text-white mb-4">3. User Accounts</h2>
                        <p>
                            To access certain features of the Service (such as creating or joining chat rooms), you must register for an account. You agree to provide accurate, current, and complete information during registration.
                        </p>
                        <ul className="list-disc pl-5 mt-4 space-y-2">
                            <li>You are solely responsible for safeguarding the confidentiality of your account credentials.</li>
                            <li>You are fully responsible for all activities that occur under your account.</li>
                            <li>You agree to notify us immediately of any unauthorized use or suspected security breach.</li>
                        </ul>
                        <p className="mt-4">
                            We reserve the right to suspend, disable, or delete your account at our sole discretion if we suspect unauthorized use, violation of these Terms, or any conduct that we determine to be harmful to our community or business.
                        </p>
                    </section>

                    {/* 4. Acceptable Use Policy */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-display font-semibold text-white mb-4">4. Acceptable Use Policy</h2>
                        <p className="mb-4">As a user of the Service, you agree not to use the platform to:</p>
                        <ul className="list-disc pl-5 border-l-4 border-red-500/50 space-y-2 bg-[#111827]/50 p-4 rounded-r-xl">
                            <li>Harass, abuse, stalk, threaten, or defame any person or entity.</li>
                            <li>Post or transmit spam, unsolicited promotions, advertising, or mass communications.</li>
                            <li>Engage in or coordinate any illegal, fraudulent, or malicious activity.</li>
                            <li>Attempt to bypass, disable, or interfere with security-related features of the platform.</li>
                            <li>Reverse engineer, decompile, or disassemble any aspect of the Service architecture.</li>
                            <li>Use automated scripts, bots, data mining, scraping, or extraction tools to collect data from the Service.</li>
                            <li>Impersonate any person, entity, or misrepresent your professional affiliation.</li>
                        </ul>
                    </section>

                    {/* 5. User-Generated Content */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-display font-semibold text-white mb-4">5. User-Generated Content</h2>
                        <p>
                            The Service allows you to chat, post messages, create rooms, and share profile information ("User Content").
                        </p>
                        <ul className="list-disc pl-5 mt-4 space-y-2">
                            <li><strong>Ownership:</strong> You retain ownership of all intellectual property rights in your User Content.</li>
                            <li><strong>License:</strong> By posting User Content, you grant us a worldwide, non-exclusive, royalty-free, transferable license to use, reproduce, distribute, display, and perform that content solely for the purpose of operating, securing, and improving the Service.</li>
                            <li><strong>Moderation:</strong> While we are under no obligation to monitor all User Content, we reserve the absolute right to remove, edit, or block any content that violates these Terms or is otherwise objectionable in our sole discretion.</li>
                        </ul>
                    </section>

                    {/* 6. Intellectual Property Rights */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-display font-semibold text-white mb-4">6. Intellectual Property Rights</h2>
                        <p>
                            Excluding your User Content, all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Service (collectively, the "Content") and the trademarks, service marks, and logos contained therein are owned or controlled by us. They are protected by copyright, trademark, and other intellectual property laws.
                        </p>
                        <p>
                            No part of the Service and no Content may be copied, reproduced, aggregated, republished, uploaded, posted, publicly displayed, encoded, translated, transmitted, distributed, sold, or otherwise exploited for any commercial purpose whatsoever without our express prior written permission.
                        </p>
                    </section>

                    {/* 7. Payments & Subscriptions */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-display font-semibold text-white mb-4">7. Payments & Subscriptions</h2>
                        <p>
                            Certain premium features of the Service may require payment of subscription fees. By selecting a premium tier, you agree to pay the applicable pricing.
                        </p>
                        <ul className="list-disc pl-5 mt-4 space-y-2">
                            <li><strong>Billing:</strong> Subscriptions are billed on a recurring basis (e.g., monthly). You authorize us (or our third-party payment processor) to bill your payment method.</li>
                            <li><strong>Cancellations:</strong> You may cancel your subscription at any time. Cancellations will become effective at the end of the current billing cycle.</li>
                            <li><strong>Refunds:</strong> Except as required by law, all fees are non-refundable.</li>
                            <li><strong>Price Changes:</strong> We reserve the right to alter pricing with reasonable prior notice to users.</li>
                        </ul>
                    </section>

                    {/* 8. Privacy Reference */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-display font-semibold text-white mb-4">8. Privacy</h2>
                        <p>
                            We care about data privacy and security. Please review our <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>. By using the Service, you agree to be bound by our Privacy Policy, which is incorporated into these Terms.
                        </p>
                    </section>

                    {/* 9. Disclaimers */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-display font-semibold text-white mb-4">9. Disclaimers</h2>
                        <p className="uppercase font-bold text-sm tracking-wide text-zinc-400 mb-2">Please read carefully</p>
                        <p>
                            THE SERVICE IS PROVIDED ON AN "AS-IS" AND "AS-AVAILABLE" BASIS. YOU AGREE THAT YOUR USE OF THE SERVICE WILL BE AT YOUR SOLE RISK. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, IN CONNECTION WITH THE SERVICE AND YOUR USE THEREOF, INCLUDING, WITHOUT LIMITATION, THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                        </p>
                        <p>
                            We make no warranties or representations about the accuracy or completeness of the Service's content or the safety of interacting with other users offline following online interactions. We guarantee no specific uptime or continuous availability of the platform.
                        </p>
                    </section>

                    {/* 10. Limitation of Liability */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-display font-semibold text-white mb-4">10. Limitation of Liability</h2>
                        <p>
                            IN NO EVENT WILL WE OR OUR DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY DIRECT, INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFIT, LOST REVENUE, LOSS OF DATA, OR OTHER DAMAGES ARISING FROM YOUR USE OF THE SERVICE.
                        </p>
                        <p>
                            OUR LIABILITY TO YOU FOR ANY CAUSE WHATSOEVER AND REGARDLESS OF THE FORM OF THE ACTION, WILL AT ALL TIMES BE LIMITED TO THE AMOUNT PAID, IF ANY, BY YOU TO US DURING THE SIX (6) MONTH PERIOD PRIOR TO ANY CAUSE OF ACTION ARISING.
                        </p>
                    </section>

                    {/* 11. Indemnification */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-display font-semibold text-white mb-4">11. Indemnification</h2>
                        <p>
                            You agree to defend, indemnify, and hold us harmless from and against any loss, damage, liability, claim, or demand, including reasonable attorneys' fees, made by any third party due to or arising out of: (1) your User Content; (2) use of the Service; (3) breach of these Terms; or (4) any overt harmful act toward any other user of the Service with whom you connected via the Service.
                        </p>
                    </section>

                    {/* 12. Termination */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-display font-semibold text-white mb-4">12. Termination</h2>
                        <p>
                            These Terms shall remain in full force and effect while you use the Service. We may terminate or suspend your access to the Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Service will cease immediately.
                        </p>
                    </section>

                    {/* 13. Governing Law */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-display font-semibold text-white mb-4">13. Governing Law & Dispute Resolution</h2>
                        <p>
                            These Terms and your use of the Service are governed by and construed in accordance with the laws of <strong>[Jurisdiction/State/Country]</strong> applicable to agreements made and to be entirely performed within the jurisdiction, without regard to its conflict of law principles.
                        </p>
                        <p>
                            Any legal action or dispute arising out of or related to these Terms will be resolved through binding arbitration in <strong>[Jurisdiction/City]</strong>, rather than in court.
                        </p>
                    </section>

                    {/* 14. Changes to Terms */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-display font-semibold text-white mb-4">14. Changes to Terms</h2>
                        <p>
                            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will alert you about any changes by updating the "Last Updated" date of these Terms. It is your responsibility to periodically review these Terms to stay informed of updates. Your continued use of the Service after the revised Terms become effective indicates your agreement to remain bound by the updated Terms.
                        </p>
                    </section>

                    {/* 15. Contact Information Section */}
                    <section className="mb-10 p-8 rounded-2xl bg-[#111827] border border-[#27272a]">
                        <h2 className="text-2xl font-display font-semibold text-white mb-4">15. Contact Us</h2>
                        <p className="mb-4">
                            In order to resolve a complaint regarding the Service or to receive further information regarding use of the Service, please contact us at:
                        </p>
                        <div className="space-y-2 text-zinc-300">
                            <p><strong>[Company Name]</strong></p>
                            <p>[Company Address Line 1]</p>
                            <p>[Company Address Line 2]</p>
                            <p>Email: <a href="mailto:legal@[companydomain].com" className="text-primary hover:underline">legal@[companydomain].com</a></p>
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
}
