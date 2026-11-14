
import "./globals.css";
import Script from "next/script";

export const metadata = {
  title: "OnionFrys — Growth Engineering Sandbox",
  description: "A working ecommerce and growth engineering laboratory."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Script
          id="google-tag-manager"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-KWNRVJNN');
            `
          }}
        />

        {children}
      </body>
    </html>
  );
}
