import "./globals.css";
import { Providers } from "../components/Providers";
import { TransitionProvider } from "../components/TransitionProvider";
import AdminShortcut from "../components/AdminShortcut";

export const metadata = {
  title: "jamphy",
  description: "Practice IIT JAM Physics questions with math-ready explanations.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <head>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2942995488059202" crossOrigin="anonymous"></script>
      </head>
      <body className="min-h-full flex flex-col">
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
