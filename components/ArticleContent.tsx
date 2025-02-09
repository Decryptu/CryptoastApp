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
	type RenderersProps,
	HTMLElementModel,
} from "@builder.io/react-native-render-html";
import type { Element as DOMElement } from "domhandler";
import WebView from "react-native-webview";
import colors from "tailwindcss/colors";

// Instead of importing HTMLContentModel from an internal path, define it here:
enum HTMLContentModel {
	block = "block",
	textual = "textual",
	mixed = "mixed",
	none = "none",
}

interface ArticleContentProps {
	content: string;
	onInternalLinkPress?: (url: string, className?: string) => void;
}

// Create a custom HTMLElementModel for <iframe> using fromCustomModel.
// This sets the content model to "block" so its children are parsed.
const customHTMLElementModels = {
	iframe: HTMLElementModel.fromCustomModel({
		tagName: "iframe",
		contentModel: HTMLContentModel.block,
		isVoid: false, // Allows children
		isOpaque: false, // Allows inner content parsing if needed
	}),
};

export const ArticleContent: FC<ArticleContentProps> = ({
	content,
	onInternalLinkPress,
}) => {
	const { width: screenWidth } = useWindowDimensions();
	const contentWidth = screenWidth - 32;
	const colorScheme = useColorScheme();
	const isDark = colorScheme === "dark";

	// Custom renderer for YouTube iframes.
	// Checks if the iframe's src is a YouTube URL and then renders it in a WebView.
	const YouTubeIframeRenderer: FC<RenderersProps["iframe"]> = ({ tnode }) => {
		const src = tnode.attributes.src;
		if (!src) return null;

		const isYouTube =
			src.includes("youtube.com/embed") || src.includes("youtu.be");
		if (!isYouTube) return null;

		// Fix protocol-relative URLs (e.g. //www.youtube.com/...)
		const uri = src.startsWith("//") ? `https:${src}` : src;
		const videoHeight = (contentWidth * 9) / 16;

		console.log(`Rendering YouTube embed with URL: ${uri}`);

		return (
			<WebView
				source={{ uri }}
				style={{
					width: contentWidth,
					height: videoHeight,
					marginVertical: 8,
				}}
				allowsFullscreenVideo
				javaScriptEnabled
				scalesPageToFit
			/>
		);
	};

	// Handle link presses (internal vs. external).
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
		width: "100%", // Set width to 100% of contentWidth
		height: undefined, // Let height adjust based on aspect ratio
		alignSelf: "center",
		marginVertical: 8,
		borderRadius: 8,
		objectFit: "contain", // Maintain aspect ratio
	};

	const videoContainerStyle: MixedStyleDeclaration = {
		marginVertical: 8,
		alignSelf: "center",
	};

	return (
		<View className="flex-1">
			<RenderHTML
				contentWidth={contentWidth}
				source={{ html: content }}
				domVisitors={{
					onElement: (element: DOMElement) => {
						if (element.tagName === "img") {
							// Create new attribs object if it doesn't exist
							element.attribs = {
								...element.attribs,
								width: "100%",
								// Set height to empty string instead of removing it
								height: "",
							};
						}
					},
				}}
				customHTMLElementModels={customHTMLElementModels}
				enableExperimentalBRCollapsing
				enableExperimentalGhostLinesPrevention
				renderers={{
					iframe: YouTubeIframeRenderer,
				}}
				renderersProps={{
					a: { onPress: handleLinkPress },
					img: {
						enableExperimentalPercentWidth: true,
						initialDimensions: { width: contentWidth, height: 200 },
					},
				}}
				baseStyle={{ color: themeColors.text, fontSize: 16 }}
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
						paddingVertical: 32
					},
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
					ul: { color: themeColors.text, marginLeft: 16 },
					ol: { color: themeColors.text, marginLeft: 16 },
					li: { color: themeColors.text, marginVertical: 2 },
					"div.vidcontainer": videoContainerStyle,
					// Remove any styles that hide the iframe.
					// iframe: { display: "none" },
				}}
			/>
		</View>
	);
};

export default ArticleContent;
