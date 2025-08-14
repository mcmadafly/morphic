import Link from 'next/link'
import { Suspense } from 'react'

import { Plus } from 'lucide-react'

import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    SidebarTrigger
} from '@/components/ui/sidebar'

import { ChatHistorySection } from './sidebar/chat-history-section'
import { ChatHistorySkeleton } from './sidebar/chat-history-skeleton'

export default function AppSidebar() {
    return (
        <Sidebar side="left" variant="sidebar" collapsible="offcanvas">
            <SidebarHeader className="flex flex-row justify-between items-center">
                <Link href="/" className="flex items-center gap-2 px-2 py-3">
                    {/* <IconLogo className={cn('size-5')} /> */}
                    <span className="font-semibold text-xs">Zeus - Gaming Guide</span>
                </Link>
                <SidebarTrigger />
            </SidebarHeader>
            <SidebarContent className="flex flex-col px-2 py-4 pb-12 h-full">
                <SidebarMenu>
                    <SidebarMenuButton asChild>
                        <Link href="/default" className="flex items-center gap-2">
                            <Plus className="size-4" />
                            <span>Zeus (Default Agent Chat)</span>
                        </Link>
                    </SidebarMenuButton>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Link href="/dune" className="flex items-center gap-2">
                                <Plus className="size-4" />
                                <span>Dune Game Agent</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                <div className="flex-1 overflow-y-auto">
                    <Suspense fallback={<ChatHistorySkeleton />}>
                        <ChatHistorySection />
                    </Suspense>
                </div>
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    )
}
