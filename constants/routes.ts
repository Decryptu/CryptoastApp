// constants/routes.ts
import type { Feather } from "@expo/vector-icons";

export type TabRoute = {
	name: string;
	title: string;
	iconName: keyof typeof Feather.glyphMap;
};

export const ROUTES = {
	NEWS: "news",
	GUIDES: "guides",
	SHEETS: "sheets",
	REPORTS: "reports",
} as const;

export const TAB_ROUTES: TabRoute[] = [
	{
		name: ROUTES.NEWS,
		title: "Actualités",
		iconName: "home",
	},
	{
		name: ROUTES.GUIDES,
		title: "Formations",
		iconName: "book",
	},
	{
		name: ROUTES.SHEETS,
		title: "Analyses",
		iconName: "file-text",
	},
	{
		name: ROUTES.REPORTS,
		title: "Dossiers",
		iconName: "bar-chart-2",
	},
] as const;

export function getRouteTitle(routeName: string): string {
	const route = TAB_ROUTES.find((r) => r.name === routeName);
	return route?.title || "Actualités";
}
