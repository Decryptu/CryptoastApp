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