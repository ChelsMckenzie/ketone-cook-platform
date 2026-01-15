import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ketomate.co.za";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "KetoMate - Automate Your Keto Journey | Smart Keto, Simplified",
    template: "%s | KetoMate",
  },
  description:
    "KetoMate is your intelligent keto companion. Automate meal planning with AI-powered recipe generation, track fasting windows, analyze meals with photo recognition, and monitor ketone levels. Smart keto, simplified.",
  keywords: [
    "keto",
    "ketogenic diet",
    "keto recipes",
    "intermittent fasting",
    "fasting tracker",
    "meal planning",
    "ketone tracking",
    "low carb",
    "LCHF",
    "keto meal planner",
    "AI recipe generator",
    "macro tracking",
    "keto South Africa",
  ],
  authors: [{ name: "KetoMate" }],
  creator: "KetoMate",
  publisher: "KetoMate",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_ZA",
    url: siteUrl,
    siteName: "KetoMate",
    title: "KetoMate - Automate Your Keto Journey",
    description:
      "Your intelligent keto companion. AI-powered recipes, fasting tracker, meal analysis & ketone monitoring. Smart keto, simplified.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "KetoMate - Smart Keto, Simplified",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KetoMate - Automate Your Keto Journey",
    description:
      "Your intelligent keto companion. AI-powered recipes, fasting tracker & ketone monitoring.",
    images: ["/og-image.png"],
    creator: "@ketomate",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add your verification codes here when you have them
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
  alternates: {
    canonical: siteUrl,
  },
  category: "Health & Fitness",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
