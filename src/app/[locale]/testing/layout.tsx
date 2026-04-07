import { SidebarProvider } from "@/components/ui/sidebar";
import Topbar from "@/components/layout/topbar";
import { AdminAppSidebar } from "@/components/layout/sidebars/admin-app-sidebar";
import { TesterAppSidebar } from "@/components/layout/sidebars/tester-app-sidebar";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <SidebarProvider>
            <Topbar />
            <div className="pt-12">
                <TesterAppSidebar />

            </div>

            <main className="w-full">
                <div className="mx-auto w-full max-w-3xl px-4 mt-20">{children}</div>
            </main>
        </SidebarProvider>
    );
}
