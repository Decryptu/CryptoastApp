import React, { type FC, useCallback, useMemo } from "react";
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
} from "react-native-render-html";
import type { Element as DOMElement } from "domhandler";
import WebView from "react-native-webview";
import colors from "tailwindcss/colors";

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

type TextStyle = {
	fontSize: number;
	fontWeight:
		| "100"
		| "200"
		| "300"
		| "400"
		| "500"
		| "600"
		| "700"
		| "800"
		| "900"
		| "bold"
		| "normal";
	marginVertical: number;
	color: string;
};

export const ArticleContent: FC<ArticleContentProps> = ({
	content,
	onInternalLinkPress,
}) => {
	const { width: screenWidth } = useWindowDimensions();
	const contentWidth = screenWidth - 32;
	const colorScheme = useColorScheme();
	const isDark = colorScheme === "dark";

	// Memoize custom element models
	const customHTMLElementModels = useMemo(
		() => ({
			iframe: HTMLElementModel.fromCustomModel({
				tagName: "iframe",
				contentModel: HTMLContentModel.block,
				isVoid: false,
				isOpaque: false,
			}),
			center: HTMLElementModel.fromCustomModel({
				tagName: "center",
				contentModel: HTMLContentModel.block,
			}),
		}),
		[],
	);

	// Memoize theme colors
	const themeColors = useMemo(
		() => ({
			text: isDark ? colors.zinc[100] : colors.zinc[900],
			link: isDark ? colors.amber[400] : colors.amber[500],
			blockquoteBorder: isDark ? colors.amber[400] : colors.amber[400],
			blockquoteText: isDark ? colors.zinc[300] : colors.zinc[600],
		}),
		[isDark],
	);

	// Memoize styles
	const styles = useMemo(
		() => ({
			image: {
				width: "100%",
				height: undefined,
				alignSelf: "center",
				marginVertical: 8,
				paddingVertical: 16,
				borderRadius: 8,
				objectFit: "contain",
			} as MixedStyleDeclaration,
			videoContainer: {
				marginVertical: 8,
				alignSelf: "center",
			} as MixedStyleDeclaration,
		}),
		[],
	);

	// Memoize tag styles
	const tagsStyles = useMemo(
		() => ({
			h1: {
				fontSize: 32,
				fontWeight: "bold",
				marginVertical: 8,
				color: themeColors.text,
			} as MixedStyleDeclaration,
			h2: {
				fontSize: 28,
				fontWeight: "bold",
				marginVertical: 8,
				color: themeColors.text,
			} as MixedStyleDeclaration,
			h3: {
				fontSize: 24,
				fontWeight: "bold",
				marginVertical: 8,
				color: themeColors.text,
			} as MixedStyleDeclaration,
			h4: {
				fontSize: 20,
				fontWeight: "bold",
				marginVertical: 8,
				color: themeColors.text,
			} as MixedStyleDeclaration,
			p: {
				fontSize: 16,
				marginVertical: 4,
				lineHeight: 22,
				color: themeColors.text,
			} as MixedStyleDeclaration,
			a: {
				color: themeColors.link,
				textDecorationColor: themeColors.link,
				textDecorationLine: "underline",
			} as MixedStyleDeclaration,
			blockquote: {
				fontStyle: "italic",
				marginVertical: 8,
				paddingHorizontal: 16,
				marginHorizontal: 4,
				borderLeftWidth: 4,
				borderLeftColor: themeColors.blockquoteBorder,
				color: themeColors.blockquoteText,
			} as MixedStyleDeclaration,
			img: styles.image,
			figure: {
				marginVertical: 8,
				alignSelf: "center",
			} as MixedStyleDeclaration,
			figcaption: {
				fontSize: 14,
				color: themeColors.blockquoteText,
				textAlign: "center",
				marginTop: 4,
			} as MixedStyleDeclaration,
			ul: {
				color: themeColors.text,
				marginLeft: 16,
			} as MixedStyleDeclaration,
			ol: {
				color: themeColors.text,
				marginLeft: 16,
			} as MixedStyleDeclaration,
			li: {
				color: themeColors.text,
				marginVertical: 2,
			} as MixedStyleDeclaration,
			"div.vidcontainer": styles.videoContainer,
		}),
		[themeColors, styles],
	);

	// Memoize YouTube renderer
	const YouTubeIframeRenderer = useCallback<FC<RenderersProps["iframe"]>>(
		({ tnode }) => {
			const src = tnode.attributes.src;
			if (!src) return null;

			const isYouTube =
				src.includes("youtube.com/embed") || src.includes("youtu.be");
			if (!isYouTube) return null;

			const uri = src.startsWith("//") ? `https:${src}` : src;
			const videoHeight = (contentWidth * 9) / 16;

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
		},
		[contentWidth],
	);

	// Memoize link handler
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

	// Memoize renderers props
	const renderersProps = useMemo(
		() => ({
			a: { onPress: handleLinkPress },
			img: {
				enableExperimentalPercentWidth: true,
				initialDimensions: { width: contentWidth, height: 200 },
			},
		}),
		[handleLinkPress, contentWidth],
	);

	return (
		<View className="flex-1">
			<RenderHTML
				contentWidth={contentWidth}
				source={{ html: content }}
				domVisitors={{
					onElement: (element: DOMElement) => {
						if (element.tagName === "img") {
							element.attribs = {
								...element.attribs,
								width: "100%",
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
				renderersProps={renderersProps}
				baseStyle={{ color: themeColors.text, fontSize: 16 }}
				tagsStyles={tagsStyles}
			/>
		</View>
	);
};

export default ArticleContent;
