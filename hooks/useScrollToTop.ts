// hooks/useScrollToTop.ts
import { useEffect } from "react";
import type { ScrollView } from "react-native";

export const useScrollToTop = (
	scrollViewRef: React.RefObject<ScrollView>,
	triggerId: string | number,
) => {
	useEffect(() => {
		const scrollView = scrollViewRef.current;
		if (scrollView) {
			scrollView.scrollTo({ y: 0, animated: true });
		}
	}, [triggerId]);
};
