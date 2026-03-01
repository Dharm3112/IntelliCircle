import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";

export default function PrivacyPolicyPage() {
    return (
        <div className="flex-1 w-full bg-background flex flex-col min-h-screen relative">
            {/* Background elements */}
            <div className="absolute top-0 w-full h-[600px] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-overlay pointer-events-none z-0" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-[150px] pointer-events-none z-0" />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10 w-full">

                <Link href="/" className="inline-flex items-center text-sm font-medium text-zinc-400 hover:text-white mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
                </Link>

                <div className="mb-12">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 border border-primary/20 shadow-[0_0_30px_rgba(79,70,229,0.15)]">
                        <Shield className="w-8 h-8" />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-display font-bold text-white mb-6 tracking-tight">
                        Privacy Policy
                    </h1>
                    <div className="flex items-center gap-4 text-sm text-zinc-400">
                        <span>Last Updated: March 1, 2026</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-600"></span>
                        <span>Effective Date: March 1, 2026</span>
                    </div>
                </div>

                <div className="prose prose-invert prose-indigo max-w-none text-zinc-300">

                    {/* 1. Introduction */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-display font-semibold text-white mb-4">1. Introduction</h2>
                        <p>
                            Welcome to <strong>[Company Name]</strong> ("Company," "we," "us," or "our"). We operate the IntelliCircle platform, a hyper-local, real-time professional networking and community chat application (the "Service").
                        </p>
                        <p>
                            We are committed to protecting your personal information and your right to privacy. This Privacy Policy outlines the scope of our data processing practices, explaining how we collect, use, share, and protect your personal information when you visit our website or use our Service. This policy is applicable to all users, visitors, and others who access the Service.
                        </p>
                    </section>

                    {/* 2. Information We Collect */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-display font-semibold text-white mb-4">2. Information We Collect</h2>

                        <h3 className="text-xl font-medium text-white mt-6 mb-3">A. Information You Provide</h3>
                        <ul className="list-disc pl-5 space-y-2 mb-4">
                            <li><strong>Account Data:</strong> When you register, we collect your username, email address, password, and role/professional title.</li>
                            <li><strong>Profile Information:</strong> Optional information you provide, such as your biography, profile picture, and networking preferences.</li>
                            <li><strong>User-Generated Content:</strong> The messages you send within chat rooms, sessions you join, and interactions with other users on the platform.</li>
                            <li><strong>Communications:</strong> Information you provide when contacting our support team or communicating directly with us.</li>
                        </ul>

                        <h3 className="text-xl font-medium text-white mt-6 mb-3">B. Information Collected Automatically</h3>
                        <ul className="list-disc pl-5 space-y-2 mb-4">
                            <li><strong>Location Data:</strong> As a hyper-local networking application, we collect precise or approximate geolocation data to show you nearby professionals and valid chat rooms.</li>
                            <li><strong>Device Data:</strong> Information such as your IP address, browser type, operating system, device identifiers, and mobile network information.</li>
                            <li><strong>Log Data:</strong> Diagnostic, usage, and performance information our servers automatically collect when you access our Service.</li>
                            <li><strong>Cookies and Tracking:</strong> We use cookies and similar tracking technologies to maintain your session and gather usage analytics.</li>
                        </ul>

                        <h3 className="text-xl font-medium text-white mt-6 mb-3">C. Information from Third Parties</h3>
                        <p>
                            We may receive information about you from third parties, such as authentication providers (if you log in via third-party services) or analytics partners, to enhance our Service delivery.
                        </p>
                    </section>

                    {/* 3. How We Use Information */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-display font-semibold text-white mb-4">3. How We Use Information</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Service Delivery:</strong> To facilitate account creation, authentication, log-in processes, and the core functionality of real-time geo-located chat rooms.</li>
                            <li><strong>Personalization:</strong> To tailor the "Discover" map and room recommendations based on your location and profile data.</li>
                            <li><strong>Communication:</strong> To send administrative information, service updates, security alerts, and support messages.</li>
                            <li><strong>Security:</strong> To detect, prevent, and address technical issues, fraud, unauthorized access, and illegal activities.</li>
                            <li><strong>Analytics & Improvement:</strong> To analyze usage trends and improve the overall user experience and architecture of the Service.</li>
                            <li><strong>Legal Compliance:</strong> To comply with applicable laws, cooperate with law enforcement, and enforce our terms of service.</li>
                        </ul>
                    </section>

                    {/* 4. Legal Basis for Processing */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-display font-semibold text-white mb-4">4. Legal Basis for Processing (GDPR)</h2>
                        <p className="mb-4">If you are residing in the European Economic Area (EEA) or United Kingdom (UK), our legal basis for collecting and processing personal data depends on the information concerned and the context in which it is collected:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Contract:</strong> Processing is necessary for the performance of our contract with you (e.g., to provide the IntelliCircle Service).</li>
                            <li><strong>Consent:</strong> You have given us specific consent to use your personal information in a specific purpose (e.g., explicit location tracking).</li>
                            <li><strong>Legitimate Interests:</strong> Processing is necessary for our legitimate business interests, such as improving the Service and ensuring security, provided those interests are not overridden by your rights.</li>
                            <li><strong>Legal Obligation:</strong> Processing is necessary for compliance with a legal obligation to which we are subject.</li>
                        </ul>
                    </section>

                    {/* 5. How We Share Information */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-display font-semibold text-white mb-4">5. How We Share Information</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Other Users:</strong> Your username, profile details, and messages in public or community chat rooms are visible to other users on the platform.</li>
                            <li><strong>Service Providers:</strong> We share information with third-party vendors who perform services on our behalf (e.g., cloud hosting, database management, real-time websocket provision).</li>
                            <li><strong>Analytics Providers:</strong> To understand how our Service is used, we share anonymized or aggregated data with analytics platforms.</li>
                            <li><strong>Business Transfers:</strong> In connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition.</li>
                            <li><strong>Legal Compliance:</strong> We may disclose information where legally required to do so in order to comply with applicable law, governmental requests, a judicial proceeding, court order, or legal process.</li>
                        </ul>
                    </section>

                    {/* 6. Data Retention Policy */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-display font-semibold text-white mb-4">6. Data Retention Policy</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Account Data:</strong> Retained for as long as your account remains active. If you delete your account, this data is removed from active databases within 30 days.</li>
                            <li><strong>Chat/Session Data:</strong> Public room messages and real-time session logs are retained for [Number, e.g., 90 days] for moderation and context purposes, after which they are anonymized or deleted.</li>
                            <li><strong>System Logs:</strong> Retained for 30-90 days for security and operational diagnostics.</li>
                        </ul>
                    </section>

                    {/* 7. Data Security */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-display font-semibold text-white mb-4">7. Data Security</h2>
                        <p>
                            We have implemented appropriate technical and organizational security measures—including TLS encryption in transit, isolated database environments, and strict access controls—designed to protect the security of any personal information we process. However, despite our safeguards, no internet-based transmission can be guaranteed to be 100% secure. You acknowledge that you use our Service and transmit data at your own risk.
                        </p>
                    </section>

                    {/* 8. International Data Transfers */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-display font-semibold text-white mb-4">8. International Data Transfers</h2>
                        <p>
                            Our servers are located in [Country, e.g., the United States]. If you are accessing our Service from outside this region, please be aware that your information may be transferred to, stored, and processed by us and our third-party service providers in these facilities. If you are a resident in the EEA or UK, we rely on Standard Contractual Clauses (SCCs) and other lawful transfer mechanisms to ensure your data is safeguarded to European standards.
                        </p>
                    </section>

                    {/* 9. Your Rights */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-display font-semibold text-white mb-4">9. Your Privacy Rights</h2>
                        <p className="mb-4">Depending on your location, you may have the following rights regarding your personal data:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Access & Portability:</strong> To request a copy of the personal data we hold about you.</li>
                            <li><strong>Correction:</strong> To request correction of inaccurate personal data.</li>
                            <li><strong>Deletion:</strong> To request the erasure of your personal data ("Right to be Forgotten").</li>
                            <li><strong>Objection & Restriction:</strong> To object to or request the restriction of processing your data.</li>
                            <li><strong>Withdrawal of Consent:</strong> To withdraw your consent at any time where processing is based on consent.</li>
                        </ul>
                        <p className="mt-4">
                            <strong>Notice to California Residents (CCPA/CPRA):</strong> If you are a California resident, you have the right to know what personal information we collect, the right to deletion, the right to opt-out of the "sale" or "sharing" of personal information (note: we do not sell your personal data), and the right to non-discrimination for exercising these rights.
                        </p>
                    </section>

                    {/* 10. Cookies Policy Section */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-display font-semibold text-white mb-4">10. Cookies Policy</h2>
                        <p className="mb-4">We use cookies and similar tracking technologies to access or store information.</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Essential Cookies:</strong> Strictly necessary for the Service to function, such as authenticating users and preventing fraudulent use of user accounts.</li>
                            <li><strong>Functional Cookies:</strong> Used to remember your preferences and settings, such as your last known location grid for the Discover map.</li>
                            <li><strong>Analytics Cookies:</strong> Utilized to understand how visitors interact with the website, track errors, and measure performance.</li>
                        </ul>
                        <p className="mt-4">
                            Most Web browsers are set to accept cookies by default. You can usually choose to set your browser to remove cookies and reject cookies. If you choose to remove or reject cookies, this could affect certain features of our Service.
                        </p>
                    </section>

                    {/* 11. Children's Privacy */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-display font-semibold text-white mb-4">11. Children's Privacy</h2>
                        <p>
                            Our Service is not directed to, and we do not knowingly collect personal information from, children under the age of 16. If we become aware that a child under 16 has provided us with personal information, we will take steps to delete such information from our files immediately.
                        </p>
                    </section>

                    {/* 12. Third-Party Links */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-display font-semibold text-white mb-4">12. Third-Party Links</h2>
                        <p>
                            Users may post links to third-party websites within chat rooms. We are not responsible for the privacy practices or the content of such third-party destinations. We encourage you to read the privacy policies of any site you visit.
                        </p>
                    </section>

                    {/* 13. Changes to This Policy */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-display font-semibold text-white mb-4">13. Changes to This Policy</h2>
                        <p>
                            We may update this Privacy Policy from time to time perfectly reflecting changes to our practices or operational, legal, or regulatory reasons. The updated version will be indicated by an updated "Effective Date" and will be effective as soon as it is accessible. If we make material changes, we may notify you either by prominently posting a notice of such changes or by directly sending you a notification.
                        </p>
                    </section>

                    {/* 14. Contact Information Section */}
                    <section className="mb-10 p-8 rounded-2xl bg-[#111827] border border-[#27272a]">
                        <h2 className="text-2xl font-display font-semibold text-white mb-4">14. Contact Us</h2>
                        <p className="mb-4">
                            If you have questions, comments, or wish to exercise your data privacy rights regarding this Privacy Policy, you may contact our Data Protection Officer (DPO) at:
                        </p>
                        <div className="space-y-2 text-zinc-300">
                            <p><strong>[Company Name]</strong></p>
                            <p>[Company Address Line 1]</p>
                            <p>[Company Address Line 2]</p>
                            <p>Email: <a href="mailto:privacy@[companydomain].com" className="text-primary hover:underline">privacy@[companydomain].com</a></p>
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
}
