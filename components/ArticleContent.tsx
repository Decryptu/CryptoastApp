import React, { type FC, useCallback } from "react";
import {
	useWindowDimensions,
	Linking,
	View,
	useColorScheme,
	type GestureResponderEvent,
} from "react-native";
import RenderHTML, {
	type MixedStyleDeclaration,
} from "@builder.io/react-native-render-html";
import colors from "tailwindcss/colors";

interface ArticleContentProps {
	content: string;
	onInternalLinkPress?: (url: string, className?: string) => void;
}

export const ArticleContent: FC<ArticleContentProps> = ({
	content,
	onInternalLinkPress,
}) => {
	const { width: screenWidth } = useWindowDimensions();
	const contentWidth = screenWidth - 32;
	const colorScheme = useColorScheme();
	const isDark = colorScheme === "dark";

	const handleLinkPress = useCallback(
		async (event: GestureResponderEvent, href?: string) => {
			if (!href) return;

			if (
				href.includes("cryptoast.fr") &&
				!href.includes("/go-") &&
				!href.includes("/cours-")
			) {
				onInternalLinkPress?.(href);
			} else {
				await Linking.openURL(href);
			}
		},
		[onInternalLinkPress],
	);

	const themeColors = {
		text: isDark ? colors.zinc[100] : colors.zinc[900],
		link: isDark ? colors.amber[400] : colors.amber[600],
		blockquoteBorder: isDark ? colors.zinc[700] : colors.zinc[300],
		blockquoteText: isDark ? colors.zinc[300] : colors.zinc[600],
	};

	const imageStyle: MixedStyleDeclaration = {
		alignSelf: "center",
		marginVertical: 8,
		borderRadius: 8,
		objectFit: "contain",
	};

	return (
		<View className="flex-1">
			<RenderHTML
				contentWidth={contentWidth}
				source={{ html: content }}
				enableExperimentalBRCollapsing
				enableExperimentalGhostLinesPrevention
				renderersProps={{
					a: { onPress: handleLinkPress },
					img: {
						enableExperimentalPercentWidth: true,
						initialDimensions: {
							width: contentWidth,
							height: 200,
						},
					},
				}}
				baseStyle={{
					color: themeColors.text,
					fontSize: 16,
				}}
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
					img: imageStyle,
					figure: {
						marginVertical: 8,
						alignSelf: "center",
					},
					figcaption: {
						fontSize: 14,
						color: themeColors.blockquoteText,
						textAlign: "center",
						marginTop: 4,
					},
					ul: {
						color: themeColors.text,
						marginLeft: 16,
					},
					ol: {
						color: themeColors.text,
						marginLeft: 16,
					},
					li: {
						color: themeColors.text,
						marginVertical: 2,
					},
				}}
			/>
		</View>
	);
};

export default ArticleContent;
