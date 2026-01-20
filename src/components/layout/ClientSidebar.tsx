import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"

interface ClientSidebarProps {
    children: React.ReactNode
}

export default function ClientSidebar({ children }: ClientSidebarProps) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <div className="sticky top-0 z-10 bg-background">
                    <SiteHeader />
                </div>
                <div className="flex flex-1 flex-col gap-4 p-4">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
