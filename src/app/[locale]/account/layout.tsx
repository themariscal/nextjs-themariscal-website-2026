import { SidebarProvider } from "@/components/ui/sidebar";
import Topbar from "@/components/layout/topbar";
import { AccountAppSidebar } from "@/components/layout/sidebars/account-app-sidebar";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <SidebarProvider>
            <Topbar />
            <div className="pt-12">
                <AccountAppSidebar />
            </div>

            <main className="w-full">
                <div className="mx-auto w-full max-w-3xl px-4 mt-20">{children}</div>
            </main>
        </SidebarProvider>
    );
}
