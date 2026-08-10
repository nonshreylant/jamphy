import "./globals.css";
import { Inter } from "next/font/google";
import { Providers } from "../components/Providers";
import { TransitionProvider } from "../components/TransitionProvider";
import AdminShortcut from "../components/AdminShortcut";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: "jamphy",
  description: "Practice IIT JAM Physics questions with math-ready explanations.",
  icons: {
    icon: "/faviconnew.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`h-full antialiased ${inter.variable}`}
    >
      <head>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2942995488059202" crossOrigin="anonymous"></script>
      </head>
      <body className="min-h-full flex flex-col font-sans bg-zinc-950 text-white/90">
        <Providers>
          <TransitionProvider>
            {children}
            <AdminShortcut />
          </TransitionProvider>
        </Providers>
      </body>
    </html>
  );
}
