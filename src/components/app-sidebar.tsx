import * as React from "react"
import {
  LayoutDashboard,
  Truck,
  Building2,
  Package,
  ClipboardList,
  CreditCard,
  FileText,
  FileCheck,
  BarChart3,
} from "lucide-react"
import { useLocation } from "react-router-dom"
import { useUser, OrganizationSwitcher } from "@clerk/clerk-react"

import { NavMain } from "@/components/nav-main"
import { NavDocuments } from "@/components/nav-documents"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const navMain = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Shipments",
    url: "/shipments",
    icon: Truck,
  },
  {
    title: "Bookings",
    url: "/bookings",
    icon: Package,
  },
  {
    title: "Quotes",
    url: "/quotes",
    icon: ClipboardList,
  },
]

const navDocuments = [
  {
    name: "Payments",
    url: "/payments",
    icon: CreditCard,
  },
  {
    name: "Documents",
    url: "/documents",
    icon: FileText,
  },
  {
    name: "Compliance",
    url: "/compliance",
    icon: FileCheck,
  },
  {
    name: "Reports",
    url: "/reports",
    icon: BarChart3,
  },
]

const navSecondary = [
  {
    title: "Account",
    url: "/account",
    icon: LayoutDashboard,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser()
  const location = useLocation()

  const userData = user
    ? {
      name: user.fullName || user.firstName || "User",
      email: user.primaryEmailAddress?.emailAddress || "",
      avatar: user.imageUrl || "",
    }
    : {
      name: "Guest",
      email: "",
      avatar: "",
    }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="h-14 border-b">
        <a href="/dashboard" className="flex items-center gap-3 px-4 h-full">
          <img src="/ship-logo.png" alt="MarketLive" className="h-6 w-6" />
          <span className="truncate text-base font-semibold group-data-[collapsible=icon]:hidden">MarketLive</span>
        </a>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavDocuments items={navDocuments} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
