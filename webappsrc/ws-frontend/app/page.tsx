"use client";

import Link from "next/link";
import { Package2, Thermometer, Droplets, ChevronsDownUp, LoaderCircle, Ellipsis, Waves, Flower2 } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const fetcher = (url: string) => fetch(url).then((res) => res.json());
import useSWR from "swr";

const getRelativeTime = (timestamp: number) => {
	const now = Date.now();
	const secondsElapsed = Math.floor((now - timestamp) / 1000);
	const thresholds = [
		{ limit: 60, unit: "second", value: secondsElapsed },
		{ limit: 300, unit: "minute", value: Math.floor(secondsElapsed / 60) },
	];

	for (const { limit, unit, value } of thresholds) {
		if (value < limit) {
			return `${value} ${unit}${value !== 1 ? "s" : ""} ago`;
		}
	}
	return "More than 5 minutes ago";
};

export default function Home() {
	const { data, error, isLoading } = useSWR(
		"https://omfkah358h.execute-api.us-east-2.amazonaws.com/current?station=ws-pittsburgh-1",
		fetcher
	);

	if (error) {
		// ESLint moment
	}

	//if (isLoading) return <div>Loading...</div>;

	return (
		<div className="flex min-h-screen w-full flex-col">
			<header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
				<div className="flex w-full items-center gap-5 md:ml-auto md:gap-5 lg:gap-6">
					<Link href="#" className="flex items-center gap-2 text-lg font-semibold md:text-base">
						<Package2 className="h-6 w-6" />
						<span className="sr-only">Weather</span>
					</Link>
					<Link href="#" className="text-foreground transition-colors hover:text-foreground">
						Current Weather
					</Link>
					<Link href="/history" className="text-muted-foreground transition-colors hover:text-foreground">
						History
					</Link>
				</div>
			</header>
			<main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
				<div className="mx-auto grid w-full max-w-6xl gap-2">
					<h1 className="text-3xl font-semibold">Current Weather</h1>
					{isLoading ? (
						<h2 className="text-3x1">
							Last Updated: <Ellipsis className="animate-ping inline" />
						</h2>
					) : (
						<h2 className="text-3x1">Last Updated: {getRelativeTime(data.scanTime)}</h2>
					)}
				</div>
				<div className="mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
					<nav
						className="grid gap-4 text-sm text-muted-foreground"
						x-chunk="A sidebar navigation with links to the available weather stations."
						x-chunk-container="chunk-container after:right-0"
					>
						<Link href="#" className="font-semibold text-primary">
							ws-pittsburgh-1
						</Link>
						<Link href="#">ws-annapolis-1</Link>
					</nav>
					<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
						<Card x-chunk="A graphic of the current Temperature">
							<CardHeader>
								<CardDescription>Temperature</CardDescription>
								<CardTitle className="flex">
									{isLoading ? (
										<LoaderCircle className="animate-spin" />
									) : (
										<div id="current-temperature-holder">
											{((data.temperature * 9) / 5 + 32).toFixed(1)}°F
										</div>
									)}
									<Thermometer />
								</CardTitle>
							</CardHeader>
							<CardContent></CardContent>
						</Card>
						<Card x-chunk="A graphic of the current Humidity">
							<CardHeader>
								<CardDescription>Humidity</CardDescription>
								<CardTitle className="flex">
									{isLoading ? (
										<LoaderCircle className="animate-spin" />
									) : (
										<div id="current-humidity-holder">{data.humidity.toFixed(1)}%</div>
									)}
									<Droplets className="mx-0.5" />
								</CardTitle>
							</CardHeader>
							<CardContent></CardContent>
						</Card>
						<Card x-chunk="A graphic of the current Pressure">
							<CardHeader>
								<CardDescription>Pressure</CardDescription>
								<CardTitle className="flex">
									{isLoading ? (
										<LoaderCircle className="animate-spin" />
									) : (
										<div id="current-pressure-holder">
											{(data.pressure / 3386.39).toFixed(2)} in.
										</div>
									)}
									<ChevronsDownUp />
								</CardTitle>
							</CardHeader>
							<CardContent></CardContent>
						</Card>
						<Card className="row-span-2" x-chunk="A graphic of the current Air Quality">
							<CardHeader>
								<CardDescription>Air Quality</CardDescription>
								<CardTitle className="flex">
									{isLoading ? (
										<LoaderCircle className="animate-spin" />
									) : (
										<div id="current-mainaqi-holder">{data.pm25env} PM2.5</div>
									)}
									<Waves className="mx-1.5" />
								</CardTitle>
							</CardHeader>
							{isLoading ? (
								<CardContent>
									<LoaderCircle className="animate-spin" />
								</CardContent>
							) : (
								<CardContent className="grid grid-cols-2 justify-center">
									<div>PM1.0</div>
									<div id="current-aqi10-holder">{data.pm10env}</div>
									<div>PM2.5</div>
									<div id="current-aqi25-holder">{data.pm25env}</div>
									<div>PM10.0</div>
									<div id="current-aqi100-holder">{data.pm100env}</div>
								</CardContent>
							)}
						</Card>
						<Card className="row-span-3" x-chunk="A graphic of the current Particle Count">
							<CardHeader>
								<CardDescription>Particle Count (µg/m3)</CardDescription>
								<CardTitle className="flex">
									{isLoading ? (
										<LoaderCircle className="animate-spin" />
									) : (
										<div id="current-mainparticles-holder">{data.particles10} (&gt;1.0)</div>
									)}
									<Flower2 className="mx-1.5" />
								</CardTitle>
							</CardHeader>
							{isLoading ? (
								<CardContent>
									<LoaderCircle className="animate-spin" />
								</CardContent>
							) : (
								<CardContent className="grid grid-cols-2 justify-center">
									<div>Size</div>
									<div>Quantity</div>
									<div>0.3</div>
									<div id="current-particles05-holder">{data.particles03}</div>
									<div>0.5</div>
									<div id="current-particles05-holder">{data.particles05}</div>
									<div>1.0</div>
									<div id="current-particles10-holder">{data.particles10}</div>
									<div>2.5</div>
									<div id="current-particles05-holder">{data.particles25}</div>
									<div>5.0</div>
									<div id="current-particles05-holder">{data.particles50}</div>
									<div>10.0</div>
									<div id="current-particles05-holder">{data.particles100}</div>
								</CardContent>
							)}
						</Card>
					</div>
				</div>
			</main>
		</div>
	);
}
