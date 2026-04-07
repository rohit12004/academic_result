import { Inter, Lexend_Deca } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "../context/Web3Context";
import localFont from "next/font/local";

const Agoma = localFont({
  src: './fonts/Agoma-6R1rA.ttf',
  variable: '--font-agoma', // Create a CSS variable
})

const ClashDisplay = localFont({
  src: './fonts/ClashDisplay-Bold.otf',
  variable: '--font-clashdisplay', // Create a CSS variable
})

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const lexend = Lexend_Deca({
  variable: "--font-lexend",
  subsets: ["latin"],
});

export const metadata = {
  title: "Academic Storage | Blockchain Student Records",
  description: "Secure, tamper-proof academic record management and verification using Ethereum.",
};

import { Toaster } from 'sonner';
import PageTransition from "../components/PageTransition";

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${lexend.variable} ${Agoma.variable} ${ClashDisplay.variable} h-full antialiased`}
    >
      <body className="font-lexend bg-[#0a0a0c] text-slate-200 min-h-screen">
        <Web3Provider>
          <PageTransition>
            {children}
          </PageTransition>
        </Web3Provider>
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            style: {
              background: 'rgba(15, 15, 20, 0.7)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              color: '#e2e8f0',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
            }
          }}
        />
      </body>
    </html>
  );
}
