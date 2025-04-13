import "./globals.css";
import { GeistSans } from "geist/font/sans";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/navbar";

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
        <Navbar />
        {children}
      </body>
    </html>
  );
}
