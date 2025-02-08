import React, { type FC, useCallback } from "react";
import {
	useWindowDimensions,
	Linking,
	View,
	useColorScheme,
	type GestureResponderEvent,
} from "react-native";
import RenderHTML from "@builder.io/react-native-render-html";
import colors from "tailwindcss/colors";

// Define the props for ArticleContent
interface ArticleContentProps {
	content: string;
	onInternalLinkPress?: (url: string, className?: string) => void;
}

export const ArticleContent: FC<ArticleContentProps> = ({
	content,
	onInternalLinkPress,
}) => {
	// Get current screen dimensions and color scheme
	const { width: screenWidth } = useWindowDimensions();
	const contentWidth = screenWidth - 32;
	const colorScheme = useColorScheme();
	const isDark = colorScheme === "dark";

	/**
	 * Handle link press events
	 */
	const handleLinkPress = useCallback(
		async (event: GestureResponderEvent, href?: string) => {
			if (!href) return;

			// Check if the link is internal
			if (
				href.includes("cryptoast.fr") &&
				!href.includes("/go-") &&
				!href.includes("/cours-")
			) {
				// Always use the modal for internal links
				onInternalLinkPress?.(href);
			} else {
				// Open external links in browser
				await Linking.openURL(href);
			}
		},
		[onInternalLinkPress],
	);

	// Define color schemes based on the current theme
	const themeColors = {
		text: isDark ? colors.zinc[100] : colors.zinc[900],
		link: isDark ? colors.amber[400] : colors.amber[600],
		blockquoteBorder: isDark ? colors.zinc[700] : colors.zinc[300],
		blockquoteText: isDark ? colors.zinc[300] : colors.zinc[600],
	};

	return (
		<View style={{ flex: 1 }}>
			<RenderHTML
				contentWidth={contentWidth}
				source={{ html: content }}
				renderersProps={{
					a: { onPress: handleLinkPress },
				}}
				// Base style with theme-aware text color
				baseStyle={{
					color: themeColors.text,
				}}
				// Theme-aware styles for HTML tags
				tagsStyles={{
					h1: {
						fontSize: 32,
						fontWeight: "bold",
						marginVertical: 8,
						color: themeColors.text,
					},
					h2: {
						fontSize: 28,
						fontWeight: "bold",
						marginVertical: 8,
						color: themeColors.text,
					},
					h3: {
						fontSize: 24,
						fontWeight: "bold",
						marginVertical: 8,
						color: themeColors.text,
					},
					h4: {
						fontSize: 20,
						fontWeight: "bold",
						marginVertical: 8,
						color: themeColors.text,
					},
					p: {
						fontSize: 16,
						marginVertical: 4,
						lineHeight: 22,
						color: themeColors.text,
					},
					a: {
						color: themeColors.link,
						textDecorationColor: themeColors.link,
						textDecorationLine: "underline",
					},
					blockquote: {
						fontStyle: "italic",
						marginVertical: 8,
						paddingHorizontal: 16,
						borderLeftWidth: 4,
						borderLeftColor: themeColors.blockquoteBorder,
						color: themeColors.blockquoteText,
					},
					img: {
						maxWidth: contentWidth - 32,
						height: "auto",
					},
					// Add any other HTML elements you need to style
					ul: {
						color: themeColors.text,
					},
					ol: {
						color: themeColors.text,
					},
					li: {
						color: themeColors.text,
					},
				}}
			/>
		</View>
	);
};

export default ArticleContent;
