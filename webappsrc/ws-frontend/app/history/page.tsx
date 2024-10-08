import Link from "next/link";
import { Package2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
export default function Home() {
	return (
		<div className="flex min-h-screen w-full flex-col">
			<header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
				<div className="flex w-full items-center gap-5 md:ml-auto md:gap-5 lg:gap-6">
					<Link href="/" className="flex items-center gap-2 text-lg font-semibold md:text-base">
						<Package2 className="h-6 w-6" />
						<span className="sr-only">Weather</span>
					</Link>
					<Link href="/" className="text-muted-foreground transition-colors hover:text-foreground">
						Current Weather
					</Link>
					<Link href="#" className="text-foreground transition-colors hover:text-foreground">
						History
					</Link>
				</div>
			</header>
			<main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
				<div className="mx-auto grid w-full max-w-6xl gap-2">
					<h1 className="text-3xl font-semibold">Past Weather</h1>
				</div>
				<div className="mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
					<nav
						className="grid gap-4 text-sm text-muted-foreground"
						x-chunk="A sidebar navigation with links to general, security, integrations, support, organizations, and advanced settings."
						x-chunk-container="chunk-container after:right-0"
					>
						<Link href="#" className="font-semibold text-primary">
							ws-pittsburgh-1
						</Link>
						<Link href="#">ws-annapolis-1</Link>
					</nav>
					<div className="grid gap-6">
						<Card x-chunk="A form to update the store name.">
							<CardHeader>
								<CardTitle>Store Name</CardTitle>
								<CardDescription>Used to identify your store in the marketplace.</CardDescription>
							</CardHeader>
							<CardContent>
								<form>
									<Input placeholder="Store Name" />
								</form>
							</CardContent>
							<CardFooter className="border-t px-6 py-4">
								<Button>Save</Button>
							</CardFooter>
						</Card>
						<Card x-chunk="A form to update the plugins directory with a checkbox to allow administrators to change the directory.">
							<CardHeader>
								<CardTitle>Plugins Directory</CardTitle>
								<CardDescription>
									The directory within your project, in which your plugins are located.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<form className="flex flex-col gap-4">
									<Input placeholder="Project Name" defaultValue="/content/plugins" />
									<div className="flex items-center space-x-2">
										<Checkbox id="include" defaultChecked />
										<label
											htmlFor="include"
											className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
										>
											Allow administrators to change the directory.
										</label>
									</div>
								</form>
							</CardContent>
							<CardFooter className="border-t px-6 py-4">
								<Button>Save</Button>
							</CardFooter>
						</Card>
					</div>
				</div>
			</main>
		</div>
	);
}
