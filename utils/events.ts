// utils/events.ts
import type { FlatList } from "react-native";

type ScrollToTopEvent = {
  section: string;
  ref: React.RefObject<FlatList>;
};

// Maps tab names to their registered FlatLists
// Key format: "tab-category" (e.g., "news-all", "news-5")
const listeners = new Map<string, ScrollToTopEvent>();

export const ScrollEvents = {
  /**
   * Register a FlatList with a specific section and category
   */
  register: (section: string, ref: React.RefObject<FlatList>) => {
    // Normalize section to lowercase for consistency
    const normalizedSection = section.toLowerCase();
    console.log(`📜 ScrollEvents: Registering ${normalizedSection}`);
    listeners.set(normalizedSection, { section: normalizedSection, ref });
  },

  /**
   * Unregister a FlatList for a specific section
   */
  unregister: (section: string) => {
    const normalizedSection = section.toLowerCase();
    console.log(`📜 ScrollEvents: Unregistering ${normalizedSection}`);
    listeners.delete(normalizedSection);
  },

  /**
   * Scroll to top for a specific tab
   * This will find all registered FlatLists for the tab and scroll the active ones
   */
  scrollToTop: (tabName: string) => {
    // Find all entries that start with the tabName (e.g., "news-all", "news-5", etc.)
    const normalizedTabName = tabName.toLowerCase();
    console.log(`📜 ScrollEvents: Scrolling to top for tab ${normalizedTabName}`);
    
    // Get all registered sections for this tab
    const matchingSections = Array.from(listeners.keys()).filter(
      key => key.startsWith(normalizedTabName)
    );
    
    if (matchingSections.length === 0) {
      console.log(`📜 ScrollEvents: No matching sections found for ${normalizedTabName}`);
      return;
    }
    
    // Scroll all matching sections to top
    // In practice, only the visible one will actually update the UI
    for (const section of matchingSections) {
      const event = listeners.get(section);
      if (event?.ref.current) {
        console.log(`📜 ScrollEvents: Scrolling ${section} to top`);
        event.ref.current.scrollToOffset({ offset: 0, animated: true });
      }
    }
  },
  
  /**
   * Debug method to see all registered listeners
   */
  logListeners: () => {
    console.log('📜 ScrollEvents: All registered listeners:');
    console.log(Array.from(listeners.keys()));
  }
};