// constants/routes.ts
import type { ComponentProps } from 'react';
import type { Feather } from '@expo/vector-icons';

export const ROUTES = {
  HOME: 'home',
  VIDEO: 'video',
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RouteName = typeof ROUTES[RouteKey];

export interface TabRoute {
  readonly name: RouteName;
  readonly title: string;
  readonly iconName: ComponentProps<typeof Feather>['name'];
}

export const TAB_ROUTES: readonly TabRoute[] = [
  { name: ROUTES.HOME, title: 'Accueil', iconName: 'home' },
  { name: ROUTES.VIDEO, title: 'Vidéos', iconName: 'play-circle' },
] as const;

export const getRouteTitle = (routeName: string): string => 
  TAB_ROUTES.find(route => route.name === routeName)?.title ?? 'Accueil';

// Section types for the home page upper tabs
export const SECTIONS = {
  NEWS: 'news',
  GUIDES: 'guides', 
  SHEETS: 'sheets',
  REPORTS: 'reports',
} as const;

export type SectionKey = keyof typeof SECTIONS;
export type SectionName = typeof SECTIONS[SectionKey];

export interface Section {
  readonly name: SectionName;
  readonly title: string;
  readonly iconName: ComponentProps<typeof Feather>['name'];
}

export const HOME_SECTIONS: readonly Section[] = [
  { name: SECTIONS.NEWS, title: 'Actualités', iconName: 'file-text' },
  { name: SECTIONS.GUIDES, title: 'Formations', iconName: 'book' },
  { name: SECTIONS.SHEETS, title: 'Analyses', iconName: 'file-text' },
  { name: SECTIONS.REPORTS, title: 'Dossiers', iconName: 'bar-chart-2' },
] as const;