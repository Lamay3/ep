import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/plus-jakarta-sans";
import "./globals.css";

const site = process.env.URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: { default: "Aplicații Staff · GTA5EastPoint", template: "%s · GTA5EastPoint" },
  description: "GTA5EastPoint Application Center: aplică pentru gradul de Helper.",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }, { url: "/icon-192.png", sizes: "192x192" }, { url: "/icon-512.png", sizes: "512x512" }],
    apple: "/apple-touch-icon.png",
  },
  openGraph: { title: "GTA5EastPoint Application Center", description: "Aplicații Helper GTA5EastPoint.", images: [{ url: "/og-eastpoint.png", width: 1734, height: 907 }], locale: "ro_RO", type: "website" },
  twitter: { card: "summary_large_image", images: ["/og-eastpoint.png"] },
};
export const viewport: Viewport = { themeColor: "#060a13" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <body>{children}</body>
    </html>
  );
}
