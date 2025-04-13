import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/navbar";
import { ClientLoadingProvider } from "@/components/client-loading-provider";
import { MusicProvider } from "@/lib/music-context";

export const metadata = {
  title: "Rizz Lab - Train Your Flirting Skills",
  description:
    "Improve your rizz with Rizz Lab. Get real-time AI feedback on your pickup lines and flirting messages. Level up your game!",
  openGraph: {
    images: [
      {
        url: "/og?title=Rizz Lab - Train Your Flirting Skills",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: [
      {
        url: "/og?title=Rizz Lab - Train Your Flirting Skills",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head></head>
      <body className={cn(GeistSans.className, "antialiased dark")}>
        <Toaster position="top-center" richColors />
        <MusicProvider>
          <ClientLoadingProvider>
            <Navbar />
            {children}
          </ClientLoadingProvider>
        </MusicProvider>
      </body>
    </html>
  );
}
