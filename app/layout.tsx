import type { ReactNode } from "react";

import "../src/index.css";

export const metadata = {
  title: "Foody",
  description: "A shared kitchen for the videos you want to cook.",
};

/** The kitchen page, with the paper background and the Hebrew-capable fonts. */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@500;700&family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600&family=Rubik:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
