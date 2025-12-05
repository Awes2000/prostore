import Header from "@/components/ui/shared/header";
import Footer from "@/components/ui/footer";

export default function RootGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen flex-col">
        <Header/>
        <main className="flex-1 wrapper">
            {children}
        </main>
        <Footer/>
    </div>
  );
}