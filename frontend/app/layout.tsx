import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BlackRock Aladdin 2.0",
  description: "AI-Powered Investment Analysis System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className} suppressHydrationWarning={true}>
        <Navbar />
        <main className="min-h-screen bg-black text-white selection:bg-blue-500/30">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 lg:col-span-9">
                {children}
              </div>
              <div className="col-span-12 lg:col-span-3">
                <Sidebar />
              </div>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
