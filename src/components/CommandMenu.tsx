"use client";

import * as React from "react";
import { Command } from "cmdk";
import { useNavigate } from "react-router-dom";
import { Search, Box, FileText, Calendar, Wallet } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function CommandMenu() {
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState("");
    const navigate = useNavigate();

    // Search Query - Disabled per user request
    // const results = useQuery(api.search.globalSearch, search ? { query: search } : "skip");
    const results: any = {}; // Empty results

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const runCommand = (command: () => void) => {
        setOpen(false);
        command();
    };

    return (
        <Command.Dialog
            open={open}
            onOpenChange={setOpen}
            label="Global Command Menu"
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[640px] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-[9999]"
            overlayClassName="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
        >
            <div className="flex items-center border-b px-3">
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <Command.Input
                    value={search}
                    onValueChange={setSearch}
                    placeholder="Type a command or search..."
                    className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-gray-500 disabled:cursor-not-allowed disabled:opacity-50"
                />
            </div>
            <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2">
                <Command.Empty className="py-6 text-center text-sm">No results found.</Command.Empty>

                {search === "" && (
                    <Command.Group heading="Pages">
                        <Command.Item onSelect={() => runCommand(() => navigate("/dashboard"))} className="flex items-center px-2 py-2 rounded-md hover:bg-gray-100 cursor-pointer text-sm">
                            <Box className="mr-2 h-4 w-4" /> Dashboard
                        </Command.Item>
                        <Command.Item onSelect={() => runCommand(() => navigate("/documents"))} className="flex items-center px-2 py-2 rounded-md hover:bg-gray-100 cursor-pointer text-sm">
                            <FileText className="mr-2 h-4 w-4" /> Documents
                        </Command.Item>
                        <Command.Item onSelect={() => runCommand(() => navigate("/bookings"))} className="flex items-center px-2 py-2 rounded-md hover:bg-gray-100 cursor-pointer text-sm">
                            <Calendar className="mr-2 h-4 w-4" /> Bookings
                        </Command.Item>
                        <Command.Item onSelect={() => runCommand(() => navigate("/payments"))} className="flex items-center px-2 py-2 rounded-md hover:bg-gray-100 cursor-pointer text-sm">
                            <Wallet className="mr-2 h-4 w-4" /> Payments
                        </Command.Item>
                    </Command.Group>
                )}

                {results?.shipments && results.shipments.length > 0 && (
                    <Command.Group heading="Shipments">
                        {results.shipments.map((s: any) => (
                            <Command.Item
                                key={s.id}
                                onSelect={() => runCommand(() => navigate(s.url))}
                                className="flex flex-col items-start px-2 py-2 rounded-md hover:bg-gray-100 cursor-pointer text-sm"
                            >
                                <span className="font-medium">{s.title}</span>
                                <span className="text-xs text-gray-500">{s.subtitle}</span>
                            </Command.Item>
                        ))}
                    </Command.Group>
                )}

                {results?.documents && results.documents.length > 0 && (
                    <Command.Group heading="Documents">
                        {results.documents.map((d: any) => (
                            <Command.Item
                                key={d.id}
                                onSelect={() => runCommand(() => navigate(d.url))}
                                className="flex flex-col items-start px-2 py-2 rounded-md hover:bg-gray-100 cursor-pointer text-sm"
                            >
                                <span className="font-medium">{d.title}</span>
                                <span className="text-xs text-gray-500">{d.subtitle}</span>
                            </Command.Item>
                        ))}
                    </Command.Group>
                )}

            </Command.List>
        </Command.Dialog>
    );
}
