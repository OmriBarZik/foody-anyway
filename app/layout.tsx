import { Bricolage_Grotesque, Inter, Rubik } from "next/font/google";
import type { ReactNode } from "react";

import "../src/index.css";

export const metadata = {
  title: "Foody",
  description: "A shared kitchen for the videos you want to cook.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f4f4f0",
};

// Next serves the fonts from this site and sizes the fallback to match, so text does not jump when they arrive.
const display = Bricolage_Grotesque({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-display" });
const body = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-body" });
const hebrew = Rubik({ subsets: ["latin", "hebrew"], weight: ["400", "500", "600", "700"], variable: "--font-hebrew" });

/** The kitchen page, with the display and body fonts. Rubik covers Hebrew. */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${hebrew.variable}`}>
      <body>{children}</body>
    </html>
  );
}
