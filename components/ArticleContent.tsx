import { type FC, useMemo, useCallback } from "react";
import { View, Text, TouchableOpacity, Linking } from "react-native";
import { useRouter } from "expo-router";

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
	return url.includes("cryptoast.fr") && !url.includes("/go-");
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
	// First clean up any p tags
	let text = rawText.replace(/<\/?p[^>]*>/g, "");
	const segments: TextSegment[] = [];

	// Remove em tags but keep their content
	text = text.replace(/<\/?em>/g, "");

	// Handle strong/bold tags
	text = text.replace(/<strong>(.*?)<\/strong>/g, (_, content) => {
		segments.push({ type: "bold", content });
		return "__BOLD__";
	});

	// Handle links
	text = text.replace(
		/<a[^>]*href="([^"]*)"(?:\s+class="([^"]*)")?\s*[^>]*>(.*?)<\/a>/g,
		(_, url, className, content) => {
			segments.push({
				type: "link",
				content,
				linkData: { url, className },
			});
			return "__LINK__";
		},
	);

	// Split remaining text by our placeholders
	const parts = text.split(/((?:__BOLD__|__LINK__))/);

	const finalSegments: TextSegment[] = [];
	let currentIndex = 0;

	for (const part of parts) {
		if (!part.trim()) continue;

		if (part === "__BOLD__") {
			finalSegments.push(segments[currentIndex++]);
		} else if (part === "__LINK__") {
			finalSegments.push(segments[currentIndex++]);
		} else {
			finalSegments.push({
				type: "text",
				content: part,
			});
		}
	}

	return finalSegments;
};

export const ArticleContent: FC<ArticleContentProps> = ({ content }) => {
	const router = useRouter();
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
			/(<h[1-4][^>]*>.*?<\/h[1-4]>|<p[^>]*>.*?<\/p>|<blockquote[^>]*>.*?<\/blockquote>)/gs,
		);

		return sections
			.map((section) => {
				if (!section.trim()) return null;
				const sectionId = generateId();

				// Handle blockquotes
				if (section.startsWith("<blockquote")) {
					const citation =
						section.match(/<p class="blockquote-citation">(.*?)<\/p>/s)?.[1] ??
						"";
					const segments = processTextSegments(citation);

					return (
						<View
							key={sectionId}
							className="my-6 px-6 py-4 bg-zinc-50 dark:bg-zinc-800 border-l-4 border-primary-600 rounded-r-lg"
						>
							<Text className="font-serif italic text-lg text-zinc-700 dark:text-zinc-300">
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
						</View>
					);
				}

				// Handle headings
				if (section.startsWith("<h1")) {
					return (
						<Text
							key={sectionId}
							className="text-4xl font-bold mt-8 mb-6 text-zinc-900 dark:text-white"
						>
							{section.replace(/<[^>]*>/g, "")}
						</Text>
					);
				}

				if (section.startsWith("<h2")) {
					return (
						<Text
							key={sectionId}
							className="text-3xl font-bold mt-8 mb-4 text-zinc-900 dark:text-white"
						>
							{section.replace(/<[^>]*>/g, "")}
						</Text>
					);
				}

				if (section.startsWith("<h3")) {
					return (
						<Text
							key={sectionId}
							className="text-2xl font-bold mt-6 mb-3 text-zinc-900 dark:text-white"
						>
							{section.replace(/<[^>]*>/g, "")}
						</Text>
					);
				}

				if (section.startsWith("<h4")) {
					return (
						<Text
							key={sectionId}
							className="text-xl font-bold mt-6 mb-3 text-zinc-900 dark:text-white"
						>
							{section.replace(/<[^>]*>/g, "")}
						</Text>
					);
				}

				// Handle regular paragraphs
				if (section.startsWith("<p")) {
					// Handle special link with any emoji
					const emojiRegex = /[\p{Emoji}]/u;
					// Only process as emoji link if the paragraph contains exactly one emoji and one link
					if (emojiRegex.test(section)) {
						const segments = processTextSegments(section);
						const linkSegment = segments.find((s) => s.type === "link");
						const linkUrl = linkSegment?.linkData?.url;

						// Find the emoji in the section
						const emoji = section.match(emojiRegex)?.[0];

						// Check if this is a source citation or another type of link
						const isSourceCitation = section.toLowerCase().includes("source");

						// Only process as emoji link if it's not a source citation and meets the criteria
						if (linkUrl && emoji && !isSourceCitation) {
							return (
								<TouchableOpacity
									key={sectionId}
									onPress={() => handleLinkPress(linkUrl)}
									className="flex-row items-center bg-zinc-50 dark:bg-zinc-900 p-4 my-3 rounded-lg"
								>
									<Text className="text-lg mr-2">{emoji}</Text>
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
