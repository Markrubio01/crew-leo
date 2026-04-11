import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { Search, Menu } from "lucide-react";
import { CompanyProvider } from "./context/CompanyContext";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("font-sans", geist.variable)}
    >
      <body
        className="min-h-full flex flex-col overflow-hidden"
        suppressHydrationWarning
      >
        <CompanyProvider>
          {children}
        </CompanyProvider>
      </body>
    </html>
  );
}
