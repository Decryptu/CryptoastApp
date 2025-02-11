import React, { type FC, useCallback, useMemo } from "react";
import {
	useWindowDimensions,
	Linking,
	View,
	Text,
	useColorScheme,
	type GestureResponderEvent,
	StyleSheet,
} from "react-native";
import RenderHTML, {
	type MixedStyleDeclaration,
	type RenderersProps,
	HTMLElementModel,
	HTMLContentModel,
} from "react-native-render-html";
import type { Element as DOMElement } from "domhandler";
import WebView from "react-native-webview";
import colors from "tailwindcss/colors";
import { CTAButton } from "./CTAButton";

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

	// Register custom models for non-standard tags (using literal "block")
	const customHTMLElementModels = useMemo(
		() => ({
			iframe: HTMLElementModel.fromCustomModel({
				tagName: "iframe",
				contentModel: HTMLContentModel.block, // use the enum value here
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

	// Theme colors based on light/dark mode
	const themeColors = useMemo(
		() => ({
			text: isDark ? colors.zinc[100] : colors.zinc[900],
			link: isDark ? colors.amber[400] : colors.amber[500],
			blockquoteBorder: isDark ? colors.amber[400] : colors.amber[400],
			blockquoteText: isDark ? colors.zinc[300] : colors.zinc[600],
		}),
		[isDark],
	);

	// Memoized styles for images and video container
	const stylesMemo = useMemo(
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

	// Tag styles for RenderHTML
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
			img: stylesMemo.image,
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
			"div.vidcontainer": stylesMemo.videoContainer,
		}),
		[themeColors, stylesMemo],
	);

	// Custom renderer for YouTube iframes
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

	// Default link press handling for non-CTA links
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

	// Renderer props for images and links
	const renderersProps = useMemo(
		() => ({
			img: {
				enableExperimentalPercentWidth: true,
				initialDimensions: { width: contentWidth, height: 200 },
			},
			a: {
				onPress: handleLinkPress,
			},
		}),
		[handleLinkPress, contentWidth],
	);

	// ── CUSTOM RENDERERS ──
	// ...
	// Helper function to recursively extract text content from a node.
	const extractText = (node: any): string => {
		if (!node) return "";
		if (node.data) return node.data;
		if (node.children && node.children.length > 0) {
			return node.children.map(extractText).join("");
		}
		return "";
	};

	// Custom renderer for <a> tags to handle CTA buttons (class "btn4")
	const CustomAnchorRenderer = ({ tnode, TDefaultRenderer, ...props }: any) => {
		if (tnode?.classes?.includes("btn4")) {
			console.log("Rendering CTA button:", tnode);
			let gradientColors: readonly [string, string, ...string[]] = [
				"#000000",
				"#000000",
			];
			let buttonText = "";
			if (tnode.children && tnode.children.length > 0) {
				// Look for the inner <span> node
				const spanNode = tnode.children.find(
					(child: any) => child.tagName === "span",
				);
				if (spanNode) {
					// Extract the inline style for the gradient
					const styleAttr = spanNode.attributes?.style;
					if (styleAttr) {
						const regex =
							/linear-gradient\(to right,\s*(#[0-9A-Fa-f]{6}),\s*(#[0-9A-Fa-f]{6})\)/;
						const match = regex.exec(styleAttr);
						if (match) {
							gradientColors = [match[1], match[2]];
							console.log("Extracted gradient colors:", gradientColors);
						}
					}
					// Recursively extract text from the span node
					buttonText = extractText(spanNode);
					console.log("Extracted button text:", buttonText);
				}
			}
			const href = tnode.attributes?.href || "";
			return (
				<CTAButton
					gradientColors={gradientColors}
					text={buttonText}
					href={href}
				/>
			);
		}
		return <TDefaultRenderer tnode={tnode} {...props} />;
	};

	// Custom renderer for <div> tags to handle publicity text (class "blcatt")
	const CustomDivRenderer = ({ tnode, TDefaultRenderer, ...props }: any) => {
		if (tnode?.classes?.includes("blcatt")) {
			console.log("Rendering publicity text:", tnode);
			let adText = "";
			if (tnode.children && tnode.children.length > 0) {
				adText = tnode.children.map((child: any) => child.data || "").join("");
			}
			return <Text style={customDivStyles.adText}>{adText}</Text>;
		}
		return <TDefaultRenderer tnode={tnode} {...props} />;
	};

	// Styles specific to publicity text
	const customDivStyles = StyleSheet.create({
		adText: {
			fontSize: 12,
			color: "grey",
			textAlign: "center",
			marginVertical: 4,
		},
	});

	const customRenderers = {
		a: CustomAnchorRenderer,
		div: CustomDivRenderer,
		iframe: YouTubeIframeRenderer,
	};

	return (
		<View style={{ flex: 1 }}>
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
				renderers={customRenderers}
				renderersProps={renderersProps}
				baseStyle={{ color: themeColors.text, fontSize: 16 }}
				tagsStyles={tagsStyles}
			/>
		</View>
	);
};

export default ArticleContent;
