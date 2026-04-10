import "./globals.css";
import type { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";
import Script from "next/script";

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body suppressHydrationWarning>
          <Script id="admin-theme-init" strategy="beforeInteractive">
            {`
              try {
                var saved = localStorage.getItem("admin-theme");
                if (saved === "dark") {
                  document.documentElement.classList.add("dark");
                }
              } catch (e) {}
            `}
          </Script>

          {children}
          <Toaster position="top-right" />
        </body>
      </html>
    </ClerkProvider>
  );
}