import React, { type FC, useCallback, useMemo } from "react";
import {
	useWindowDimensions,
	Linking,
	View,
	Text,
	useColorScheme,
	type GestureResponderEvent,
	StyleSheet,
	ScrollView,
} from "react-native";
import RenderHTML, {
	type TNode,
	type TText,
	type CustomMixedRenderer,
	type CustomBlockRenderer,
	HTMLContentModel,
	HTMLElementModel,
	type MixedStyleDeclaration,
} from "react-native-render-html";
import type { Element as DOMElement } from "domhandler";
import WebView from "react-native-webview";
import colors from "tailwindcss/colors";
import { CTAButton } from "./CTAButton";

interface ArticleContentProps {
	content: string;
	onInternalLinkPress?: (url: string, className?: string) => void;
}

const isTextTNode = (node: TNode): node is TText =>
	typeof (node as TText).data === "string";

const extractText = (node: TNode): string => {
	if (isTextTNode(node)) return node.data;
	if (node.children && node.children.length > 0) {
		return node.children.map(extractText).join("");
	}
	return "";
};

const ArticleContent: FC<ArticleContentProps> = ({
	content,
	onInternalLinkPress,
}) => {
	const { width: screenWidth } = useWindowDimensions();
	const contentWidth = screenWidth - 32;
	const colorScheme = useColorScheme();
	const isDark = colorScheme === "dark";

	// Custom element models
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

	const themeColors = useMemo(
		() => ({
			text: isDark ? colors.zinc[100] : colors.zinc[900],
			link: isDark ? colors.amber[400] : colors.amber[500],
			blockquoteBorder: isDark ? colors.amber[400] : colors.amber[400],
			blockquoteText: isDark ? colors.zinc[300] : colors.zinc[600],
		}),
		[isDark],
	);

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

	// Define table styles with a forced width for each cell
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
			table: {
				borderWidth: 0.5,
				borderColor: "lightgray",
				borderStyle: "solid",
				width: "auto",
				alignSelf: "flex-start",
				marginVertical: 8,
				borderRadius: 4,
				overflow: "hidden",
			} as MixedStyleDeclaration,
			th: {
				borderWidth: 0.5,
				borderColor: "lightgray",
				borderStyle: "solid",
				padding: 8,
				width: 150, // force fixed width for header cells
			} as MixedStyleDeclaration,
			td: {
				borderWidth: 0.5,
				borderColor: "lightgray",
				borderStyle: "solid",
				padding: 8,
				width: 150, // force fixed width for each cell
			} as MixedStyleDeclaration,
		}),
		[themeColors, stylesMemo],
	);

	const YouTubeIframeRenderer: CustomBlockRenderer = ({ tnode }) => {
		const src = tnode.attributes?.src;
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
	};

	// Wrap the table in a horizontal ScrollView.
	const SimpleTableRenderer: CustomBlockRenderer = ({
		tnode,
		TDefaultRenderer,
		...props
	}) => {
		console.log("Rendering table with fixed cell width of 150");
		return (
			<ScrollView horizontal contentContainerStyle={{ flexGrow: 1 }}>
				<View style={{ borderRadius: 4, overflow: "hidden" }}>
					<TDefaultRenderer tnode={tnode} {...props} />
				</View>
			</ScrollView>
		);
	};

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

	const CustomAnchorRenderer: CustomMixedRenderer = ({
		tnode,
		TDefaultRenderer,
		...props
	}) => {
		if (tnode.classes?.includes("btn4")) {
			let gradientColors: readonly [string, string, ...string[]] = [
				"#000000",
				"#000000",
			];
			let buttonText = "";
			if (tnode.children && tnode.children.length > 0) {
				const spanNode = tnode.children.find(
					(child) => child.tagName === "span",
				);
				if (spanNode) {
					const styleAttr = spanNode.attributes?.style;
					if (styleAttr) {
						const regex =
							/linear-gradient\(to right,\s*(#[0-9A-Fa-f]{6}),\s*(#[0-9A-Fa-f]{6})\)/;
						const match = regex.exec(styleAttr);
						if (match) {
							gradientColors = [match[1], match[2]];
						}
					}
					buttonText = extractText(spanNode);
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

	const CustomDivRenderer: CustomBlockRenderer = ({
		tnode,
		TDefaultRenderer,
		...props
	}) => {
		if (tnode.classes?.includes("blcatt")) {
			const adText = tnode.children
				? tnode.children.map(extractText).join("")
				: "";
			return <Text style={customDivStyles.adText}>{adText}</Text>;
		}
		return <TDefaultRenderer tnode={tnode} {...props} />;
	};

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
		table: SimpleTableRenderer, // our simplified table renderer
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
