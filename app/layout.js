import "./globals.css";

export const metadata = {
  title: "OnionFrys — Growth Engineering Sandbox",
  description: "A working ecommerce and growth engineering laboratory."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
