import { SidebarProvider } from "@/components/ui/sidebar";
import Topbar from "@/components/layout/topbar";
import { AdminAppSidebar } from "@/components/layout/sidebars/admin-app-sidebar";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <SidebarProvider>
            <Topbar />
            <div className="pt-12">
                <AdminAppSidebar />

            </div>

            <main className="w-full">
                <div className="w-full mt-20 px-4 md:px-6 lg:px-8">
                    <div className="mx-auto w-full max-w-6xl">{children}</div>
                </div>
            </main>
        </SidebarProvider>
    );
}
