import { useEffect } from "react";
import type { ScrollView } from "react-native";

export const useScrollToTop = (
	scrollViewRef: React.RefObject<ScrollView>,
	triggerId: string | number,
) => {
	// biome-ignore lint/correctness/useExhaustiveDependencies: <works-as-designed>
	useEffect(() => {
		const scrollView = scrollViewRef.current;
		if (scrollView) {
			scrollView.scrollTo({ y: 0, animated: true });
		}
	}, [triggerId]);
};
