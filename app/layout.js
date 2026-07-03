import { Fraunces, Archivo } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  style: ["normal", "italic"],
  axes: ["opsz"],
});

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata = {
  title: "Rex Chao",
  description:
    "I build AI agents that do real work — an AI front desk for a dental practice, an agent framework that runs my family's life. UCLA '29.",
  openGraph: {
    title: "Rex Chao",
    description: "I build AI agents that do real work.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${archivo.variable}`}>
      <body>{children}</body>
    </html>
  );
}
