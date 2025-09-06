import Header from "@/components/header";

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

