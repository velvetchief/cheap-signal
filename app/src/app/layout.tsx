import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono, Courier_Prime } from "next/font/google";
import "./globals.css";

const plex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

const courier = Courier_Prime({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-courier",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cheap Signal",
  description:
    "When signals get cheap, the people who cared leave. Instagram ran the experiment on photographers. Cosign is the control.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plex.variable} ${mono.variable} ${courier.variable}`}
    >
      <body className={`${plex.className} min-h-screen antialiased`}>
        {children}
      </body>
    </html>
  );
}
