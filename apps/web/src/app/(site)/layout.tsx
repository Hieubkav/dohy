import type { Metadata } from "next";
import "../../index.css";
import Header from "@/components/header";

export const metadata: Metadata = {
  title: "dohy",
  description: "dohy",
};

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="grid grid-rows-[auto_1fr] h-svh">
      <Header />
      {children}
    </div>
  );
}

