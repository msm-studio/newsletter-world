import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Bungee } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bungee = Bungee({
  weight: "400",
  variable: "--font-bungee",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Newsletter Enthusiast - Deliver them all!",
  description: "A fun platformer game with unique characters and themed levels. Collect emails and navigate through Arctic, Desert, Jungle, Seaside, and Mountain levels!",
  openGraph: {
    title: "Newsletter Enthusiast - Deliver them all!",
    description: "A fun platformer game with unique characters and themed levels. Collect emails and navigate through Arctic, Desert, Jungle, Seaside, and Mountain levels!",
    url: "https://newsletter-world.vercel.app",
    siteName: "Newsletter Enthusiast",
    images: [
      {
        url: "/social-share.png",
        width: 1200,
        height: 630,
        alt: "Newsletter Enthusiast - Platformer Game",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Newsletter Enthusiast - Deliver them all!",
    description: "A fun platformer game with unique characters and themed levels. Collect emails and navigate through Arctic, Desert, Jungle, Seaside, and Mountain levels!",
    images: ["/social-share.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Newsletter Enthusiast",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover", // Use full screen on notched devices
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${bungee.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
