import { type FC, useMemo, useCallback, useState } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	Linking,
	useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import ArticleImage from "../components/ArticleImage";
import BlockQuote from "../components/BlockQuote";
import InfoBlock from "./InfoBlock";
import TableComponent from "./TableComponent";

interface ArticleContentProps {
	content: string;
	onInternalLinkPress?: (url: string) => void;
}

interface TextSegment {
	type: "text" | "bold" | "italic" | "link";
	content: string;
	linkData?: {
		url: string;
		className?: string;
	};
}

/**
 * Extracts article ID from a URL
 */
const extractArticleSlug = (url: string): string | null => {
	// Remove trailing slash if present
	const cleanUrl = url.replace(/\/$/, "");
	// Get the last part of the URL path
	const slug = cleanUrl.split("/").pop();
	return slug ?? null;
};

/**
 * Checks if a link is internal
 */
const isInternalLink = (url: string, className?: string): boolean => {
	if (className?.includes("btn4")) return false;
	return (
		url.includes("cryptoast.fr") &&
		!url.includes("/go-") &&
		!url.includes("/cours-")
	);
};

/**
 * Generates unique IDs for elements
 */
const createIdGenerator = () => {
	let counter = 0;
	return () => `section-${counter++}`;
};

/**
 * Process text to handle bold, italic, and links
 */
const processTextSegments = (rawText: string): TextSegment[] => {
	// First clean up any p tags and transform em tags
	let text = rawText.replace(/<\/?p[^>]*>/g, "");

	// Preserve em content but remove tags
	text = text.replace(/<em>(.*?)<\/em>/g, "$1");

	const segments: TextSegment[] = [];
	const linkMap = new Map<string, TextSegment>();
	let linkCounter = 0;

	// First, extract all links and replace with placeholders
	text = text.replace(
		/<a[^>]*href="([^"]*)"(?:\s+class="([^"]*)")?\s*[^>]*>(.*?)<\/a>/g,
		(_, url, className, content) => {
			const placeholder = `__LINK${linkCounter}__`;
			linkMap.set(placeholder, {
				type: "link",
				content,
				linkData: { url, className },
			});
			linkCounter++;
			return placeholder;
		},
	);

	// Handle strong tags while preserving link placeholders
	text = text.replace(/<strong>(.*?)<\/strong>/g, (_, content) => {
		// Check if this strong section contains any link placeholders
		const containsLink = Array.from(linkMap.keys()).some((placeholder) =>
			content.includes(placeholder),
		);

		if (containsLink) {
			// Split by link placeholders while preserving them
			const parts = content.split(/(__LINK\d+__)/);
			const segmentGroup: TextSegment[] = [];

			for (const part of parts) {
				if (linkMap.has(part)) {
					const linkSegment = linkMap.get(part);
					if (linkSegment) {
						// Safe null check
						segmentGroup.push({
							type: "link",
							content: linkSegment.content,
							linkData: linkSegment.linkData,
						});
					}
				} else if (part.trim()) {
					// This is regular bold text
					segmentGroup.push({
						type: "bold",
						content: part.trim(),
					});
				}
			}

			segments.push(...segmentGroup);
			return "__BOLDGROUP__".repeat(segmentGroup.length);
		}

		// Regular bold text without links
		segments.push({ type: "bold", content });
		return "__BOLD__";
	});

	// Process remaining text and reconstruct final segments
	const parts = text.split(/((?:__BOLD__|__LINK\d+__|__BOLDGROUP__))/);
	const finalSegments: TextSegment[] = [];
	let segmentIndex = 0;

	for (const part of parts) {
		if (!part.trim()) continue;

		if (part.startsWith("__LINK")) {
			const linkSegment = linkMap.get(part);
			if (linkSegment) {
				finalSegments.push(linkSegment);
			}
		} else if (part === "__BOLD__" || part === "__BOLDGROUP__") {
			finalSegments.push(segments[segmentIndex++]);
		} else {
			finalSegments.push({
				type: "text",
				content: part,
			});
		}
	}

	return finalSegments;
};

const extractInfoBlock = (html: string) => {
	const titleMatch = html.match(/<span class="title">(.*?)<\/span>/);
	const contentMatch = html.match(/<div>(.*?)<\/div>/);
	const blockTypeMatch = html.match(/tuto-guide-block\s+(\w+)-block/);

	return {
		title: titleMatch?.[1]?.trim() ?? "",
		content: contentMatch?.[1]?.trim() ?? "",
		blockType: (blockTypeMatch?.[1] as "aim" | "info" | "warning") ?? "info",
	};
};

export const ArticleContent: FC<ArticleContentProps> = ({ content }) => {
	const router = useRouter();
	const { width: screenWidth } = useWindowDimensions();
	const [imageLoadErrors] = useState<Set<string>>(new Set());

	// Calculate content width (subtract padding/margins)
	const contentWidth = screenWidth - 32; // Adjust based on your layout's padding

	const generateId = useMemo(() => createIdGenerator(), []);

	const handleLinkPress = useCallback(
		async (url: string, className?: string) => {
			console.log("Link pressed:", { url, className });

			if (isInternalLink(url, className)) {
				const slug = extractArticleSlug(url);
				if (slug) {
					console.log("Fetching article by slug:", slug);
					try {
						const response = await fetch(
							`https://cryptoast.fr/wp-json/wp/v2/posts?slug=${slug}`,
						);
						const articles = await response.json();

						if (articles && articles.length > 0) {
							const articleId = articles[0].id;
							console.log("Navigating to article:", articleId);
							router.push(`/article/${articleId}`);
						}
					} catch (error) {
						console.error("Error fetching article:", error);
					}
				}
			} else {
				console.log("Opening external link:", url);
				await Linking.openURL(url);
			}
		},
		[router],
	);

	const processedContent = useMemo(() => {
		// Clean content of unwanted elements
		const cleanContent = content
			.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
			.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
			.replace(
				/<blockquote\s+class="twitter-tweet"[^>]*>.*?<\/blockquote>/gs,
				"",
			);

		// Split content into sections
		const sections = cleanContent.split(
			/(<h[1-4][^>]*>.*?<\/h[1-4]>|<p[^>]*>.*?<\/p>|<blockquote[^>]*>.*?<\/blockquote>|<div\s+class="su-table[^>]*>[\s\S]*?<\/div>)/gs,
		);

		return sections
			.map((section) => {
				if (!section.trim()) return null;
				const sectionId = generateId();

				// Handle blockquotes
				if (section.startsWith("<blockquote")) {
					return (
						<BlockQuote
							key={sectionId}
							sectionId={sectionId}
							section={section}
							processTextSegments={processTextSegments}
							handleLinkPress={handleLinkPress}
							isInternalLink={isInternalLink}
						/>
					);
				}

				// Handle tables
				if (section.includes("su-table")) {
					return <TableComponent key={sectionId} html={section} />;
				}

				// Handle info blocks
				if (section.includes("tuto-guide-block")) {
					const { title, content, blockType } = extractInfoBlock(section);
					return (
						<InfoBlock
							key={sectionId}
							title={title}
							content={content}
							blockType={blockType}
						/>
					);
				}

				// Handle images
				if (section.includes("<img")) {
					return <ArticleImage key={sectionId} html={section} />;
				}

				// Handle headings
				if (section.startsWith("<h2")) {
					return (
						<Text
							key={sectionId}
							className="text-2xl font-bold mt-8 mb-4 text-zinc-900 dark:text-white"
						>
							{section.replace(/<[^>]*>/g, "")}
						</Text>
					);
				}

				if (section.startsWith("<h3")) {
					return (
						<Text
							key={sectionId}
							className="text-xl font-bold mt-6 mb-3 text-zinc-900 dark:text-white"
						>
							{section.replace(/<[^>]*>/g, "")}
						</Text>
					);
				}

				if (section.startsWith("<h4")) {
					return (
						<Text
							key={sectionId}
							className="text-lg font-bold mt-6 mb-3 text-zinc-900 dark:text-white"
						>
							{section.replace(/<[^>]*>/g, "")}
						</Text>
					);
				}

				// Handle regular paragraphs
				if (section.startsWith("<p")) {
					// Handle special link with any emoji
					// Handle special link with any emoji
					const emojiRegex = /[\p{Emoji}]/u;
					if (section.startsWith("<p") && emojiRegex.test(section)) {
						const segments = processTextSegments(section);
						const linkSegment = segments.find((s) => s.type === "link");
						const linkUrl = linkSegment?.linkData?.url;

						// Make sure there's only one link and the emoji is at the start or end of the text
						const cleanText = section.replace(/<[^>]*>/g, "").trim();
						const hasEmojiAtStartOrEnd = /^[\p{Emoji}]|[\p{Emoji}]$/u.test(
							cleanText,
						);

						// Only process as special emoji link if:
						// 1. There's exactly one link
						// 2. The emoji is at the start or end
						// 3. The link isn't a "cours-" link
						if (
							linkUrl &&
							hasEmojiAtStartOrEnd &&
							segments.filter((s) => s.type === "link").length === 1 &&
							!linkUrl.includes("/cours-")
						) {
							return (
								<TouchableOpacity
									key={sectionId}
									onPress={() => handleLinkPress(linkUrl)}
									className="flex-row items-center bg-zinc-50 dark:bg-zinc-900 p-4 my-3 rounded-lg"
								>
									<Text className="text-lg mr-2">
										{cleanText.match(emojiRegex)?.[0]}
									</Text>
									<Text className="text-lg leading-5 text-primary-600 dark:text-primary-400 flex-1">
										{linkSegment.content}
									</Text>
								</TouchableOpacity>
							);
						}
					}

					// Handle external "btn4" links
					const btn4Match = section.match(
						/<a[^>]*class="btn4"[^>]*href="([^"]*)"[^>]*>.*?<span[^>]*>(.*?)<\/span><\/a>/,
					);
					if (btn4Match) {
						const [, url, text] = btn4Match;
						const bgColor =
							section.match(/background:[^;]*#([A-F0-9]{6})/i)?.[1] ?? "EC602A";

						return (
							<TouchableOpacity
								key={sectionId}
								onPress={() => handleLinkPress(url, "btn4")}
								style={{ backgroundColor: `#${bgColor}` }}
								className="p-4 my-3 rounded-lg"
							>
								<Text className="text-white text-center font-medium">
									{text.replace(/<[^>]*>/g, "")}
								</Text>
							</TouchableOpacity>
						);
					}

					// Process text segments for regular paragraphs
					const segments = processTextSegments(section);

					return (
						<Text
							key={sectionId}
							className="text-lg text-zinc-800 dark:text-zinc-200 leading-relaxed mb-4"
						>
							{segments.map((segment, index) => {
								const key = `${sectionId}-${index}`;

								if (segment.type === "link") {
									return (
										<Text
											key={key}
											onPress={() =>
												segment.linkData &&
												handleLinkPress(
													segment.linkData.url,
													segment.linkData.className,
												)
											}
											className={
												isInternalLink(
													segment.linkData?.url ?? "",
													segment.linkData?.className,
												)
													? "text-blue-600 dark:text-blue-400"
													: "text-primary-600 dark:text-primary-400"
											}
										>
											{segment.content}
										</Text>
									);
								}

								if (segment.type === "bold") {
									return (
										<Text key={key} className="font-bold">
											{segment.content}
										</Text>
									);
								}

								if (segment.type === "italic") {
									return (
										<Text key={key} className="italic">
											{segment.content}
										</Text>
									);
								}

								return segment.content;
							})}
						</Text>
					);
				}

				return null;
			})
			.filter(Boolean);
	}, [content, generateId, handleLinkPress]);
	return <View className="pb-8">{processedContent}</View>;
};

export default ArticleContent;
