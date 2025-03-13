// components/ArticleModal.tsx
import type { FC } from "react";
import { useEffect, useState } from "react";
import {
	Modal,
	View,
	Text,
	TouchableOpacity,
	Dimensions,
	useColorScheme,
	Share,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import colors from "tailwindcss/colors";
import { fetchArticle } from "../services/api";
import type { Article } from "../types/article";
import { ArticleContentSkeleton } from "./ArticleContentSkeleton";
import { ArticleView } from "./ArticleView";

interface ArticleModalProps {
	articleId: number | null;
	visible: boolean;
	onClose: () => void;
	/** Callback to handle internal links tapped within the modal */
	onInternalLinkPress?: (url: string, className?: string) => void;
	/** Flag to indicate initial loading state before article ID is resolved */
	initialLoading?: boolean;
	/** The slug of the article being loaded (for display purposes) */
	slug?: string | null;
}

export const ArticleModal: FC<ArticleModalProps> = ({
	articleId,
	visible,
	onClose,
	onInternalLinkPress = () => {}, // Provide default empty function
	initialLoading = false,
	slug = null,
}) => {
	const [article, setArticle] = useState<Article | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const { height: SCREEN_HEIGHT } = Dimensions.get("window");
	const colorScheme = useColorScheme();
	const isDark = colorScheme === "dark";

	useEffect(() => {
		let isMounted = true;

		const loadArticle = async () => {
			// Reset state when modal becomes visible
			if (visible) {
				setError(null);

				// If we're in initial loading state (waiting for article ID),
				// don't try to fetch the article yet
				if (initialLoading || articleId === null) {
					return;
				}

				try {
					setLoading(true);
					const data = await fetchArticle(articleId);
					if (isMounted) {
						setArticle(data);
					}
				} catch (error) {
					console.error("ArticleModal: failed to fetch article:", error);
					if (isMounted) {
						setError("Failed to load article. Please try again.");
					}
				} finally {
					if (isMounted) {
						setLoading(false);
					}
				}
			}
		};

		void loadArticle();

		return () => {
			isMounted = false;
		};
	}, [articleId, visible, initialLoading]);

	const handleShare = async () => {
		if (!article) return;

		try {
			await Share.share({
				message: article.link,
				title: article.title.rendered,
			});
		} catch (error) {
			console.error("ArticleModal: error sharing article:", error);
		}
	};

	return (
		<Modal
			visible={visible}
			animationType="slide"
			transparent
			onRequestClose={onClose}
		>
			<View className="flex-1 bg-black/30">
				<View
					className={`absolute bottom-0 left-2.5 right-2.5 ${
						isDark ? "bg-zinc-900" : "bg-white"
					} rounded-t-xl overflow-hidden`}
					style={{ height: SCREEN_HEIGHT * 0.9 }}
				>
					{/* Modal Header */}
					<View className="items-end p-2.5 border-b border-zinc-200 dark:border-zinc-800">
						<TouchableOpacity
							onPress={onClose}
							className="p-1"
							accessibilityLabel="Close article"
							accessibilityRole="button"
						>
							<Feather
								name="x"
								size={24}
								color={isDark ? colors.zinc[400] : colors.zinc[600]}
							/>
						</TouchableOpacity>
					</View>

					{/* Modal Content */}
					{initialLoading || loading ? (
						<ArticleContentSkeleton />
					) : error ? (
						<View className="flex-1 justify-center items-center px-4">
							<Feather
								name="alert-circle"
								size={40}
								color={isDark ? colors.red[400] : colors.red[500]}
								className="mb-4"
							/>
							<Text className="text-center text-red-500 dark:text-red-400 text-base mb-2">
								{error}
							</Text>
							<TouchableOpacity
								onPress={onClose}
								className="mt-4 bg-zinc-200 dark:bg-zinc-700 px-4 py-2 rounded-lg"
							>
								<Text className="text-zinc-800 dark:text-zinc-200">Close</Text>
							</TouchableOpacity>
						</View>
					) : article ? (
						<ArticleView
							article={article}
							onShare={handleShare}
							onInternalLinkPress={onInternalLinkPress}
							isModal={true}
						/>
					) : (
						<Text className="text-center text-red-500 dark:text-red-400 text-base mt-5">
							Article not found.
						</Text>
					)}
				</View>
			</View>
		</Modal>
	);
};
