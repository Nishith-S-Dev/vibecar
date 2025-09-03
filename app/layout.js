import { Inter } from "next/font/google";
import "./globals.css";
import Header from "../ui/Header";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
const inter = Inter({subsets: ["latin"]})

export const metadata = {
  title: "Vehicle Ai Management System",
  description: "Drive in vibe with AI",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>

     
    <html lang="en">
      <body
        className={`${inter.className} antialiased`}
      >
        <Header/>
        <main className="bg-gray-100 min-h-screen">
        <Toaster richColors/>
        {children}
        </main>
        <footer className="bg-blue-50 py-12">
          <div className="container mx-auto px-4 text-center   text-gray-500">
            <p>
              🚖 Made by Bronish
            </p>
          </div>
        </footer>
      </body>
    </html>
    </ClerkProvider>
  );
}
