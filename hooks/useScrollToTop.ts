// hooks/useScrollToTop.ts
import { useEffect } from 'react';
import type { ScrollView } from 'react-native';

export const useScrollToTop = (
  scrollViewRef: React.RefObject<ScrollView | null>,
  triggerId: string | number,
) => {
  // biome-ignore lint/correctness/useExhaustiveDependencies: <scrollViewRef.current changes are tracked via triggerId>
  useEffect(() => {
    const scrollView = scrollViewRef.current;
    if (scrollView) {
      scrollView.scrollTo({ y: 0, animated: true });
    }
  }, [triggerId]);
};