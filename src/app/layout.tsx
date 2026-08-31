import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ClinicFlow — Practice management for independent PT clinics",
  description: "Scheduling, SOAP notes, billing, and insurance claims in one HIPAA-ready platform. Built for independent physical therapy clinics. $49/therapist/month, patient portal free.",
  keywords: ["physical therapy software", "PT clinic management", "SOAP notes", "CMS-1500 claims", "ClinicFlow"],
  authors: [{ name: "ClinicFlow" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "ClinicFlow — Practice management for independent PT clinics",
    description: "Scheduling, SOAP notes, billing, and claims in one integrated platform. $49/therapist/month. Patient portal free.",
    siteName: "ClinicFlow",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ClinicFlow — Practice management for independent PT clinics",
    description: "Scheduling, SOAP notes, billing, and claims in one integrated platform.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
