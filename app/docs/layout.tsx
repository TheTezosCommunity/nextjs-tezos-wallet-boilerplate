import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Settings, Puzzle, Code2, BookOpen, AlertTriangle } from "lucide-react";

const navigation = [
    { name: "Installation", href: "/docs/installation", icon: FileText },
    { name: "Configuration", href: "/docs/configuration", icon: Settings },
    { name: "Components", href: "/docs/components", icon: Puzzle },
    { name: "Examples", href: "/docs/examples", icon: Code2 },
    { name: "Wallet Guide", href: "/docs/wallet-guide", icon: BookOpen },
    { name: "Troubleshooting", href: "/docs/troubleshooting", icon: AlertTriangle },
];

export default function DocsLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-background">
            <div className="border-b">
                <div className="container flex h-16 items-center px-4">
                    <Link href="/">
                        <Button variant="ghost" size="sm" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Home
                        </Button>
                    </Link>
                    <div className="ml-6">
                        <h1 className="text-xl font-semibold">Tezos Wallet Boilerplate Docs</h1>
                    </div>
                </div>
            </div>

            <div className="container flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
                <aside className="fixed top-16 z-30 -ml-2 hidden h-[calc(100vh-4rem)] w-full shrink-0 md:sticky md:block">
                    <div className="h-full py-6 pr-6 lg:py-8">
                        <nav className="grid items-start gap-2">
                            {navigation.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                                    >
                                        <Icon className="mr-2 h-4 w-4" />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                </aside>

                <main className="relative py-6 lg:gap-10 lg:py-8 xl:grid xl:grid-cols-[1fr_300px]">
                    <div className="mx-auto w-full min-w-0">
                        <div className="prose prose-slate max-w-none dark:prose-invert">{children}</div>
                    </div>
                </main>
            </div>
        </div>
    );
}
