// utils/events.ts
import { createRef } from "react";
import type { FlatList } from "react-native";

type ScrollToTopEvent = {
	section: string;
	ref: React.RefObject<FlatList>;
};

const listeners = new Map<string, ScrollToTopEvent>();

export const ScrollEvents = {
	register: (section: string, ref: React.RefObject<FlatList>) => {
		listeners.set(section, { section, ref });
	},

	unregister: (section: string) => {
		listeners.delete(section);
	},

	scrollToTop: (section: string) => {
		const event = listeners.get(section);
		if (event?.ref.current) {
			event.ref.current.scrollToOffset({ offset: 0, animated: true });
		}
	},
};
