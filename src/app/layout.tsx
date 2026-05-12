import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import FirstEntryModalWrapper from "@/components/FirstEntryModalWrapper";

export const metadata: Metadata = {
  title: {
    default: "NetMasr.org — نت مصر",
    template: "%s | نت مصر",
  },
  description: "منصة مجتمعية غير ربحية تجمع صوت المصريين من أجل إنترنت أفضل، عادل، وغير محدود.",
  icons: {
    icon: "/logo.png",
  },
  openGraph: {
    title: "NetMasr.org — نت مصر",
    description: "منصة مجتمعية غير ربحية تجمع صوت المصريين من أجل إنترنت أفضل، عادل، وغير محدود.",
    locale: "ar_EG",
    siteName: "NetMasr.org",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <FirstEntryModalWrapper />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              fontFamily: "'Cairo', 'Tahoma', sans-serif",
              direction: "rtl",
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}