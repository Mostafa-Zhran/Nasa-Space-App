import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TRIANGULUM | Planetary Flood Probability & Risk Assessment",
  description:
    "AI-driven flood risk synthesis combining geospatial parameters, LightGBM machine learning, and multi-factorial environmental indicators.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#060911] text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
