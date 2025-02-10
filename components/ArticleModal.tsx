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
	articleId: number;
	visible: boolean;
	onClose: () => void;
	/** Callback to handle internal links tapped within the modal */
	onInternalLinkPress?: (url: string, className?: string) => void;
}

export const ArticleModal: FC<ArticleModalProps> = ({
	articleId,
	visible,
	onClose,
	onInternalLinkPress = () => {}, // Provide default empty function
}) => {
	const [article, setArticle] = useState<Article | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const { height: SCREEN_HEIGHT } = Dimensions.get("window");
	const colorScheme = useColorScheme();
	const isDark = colorScheme === "dark";

	useEffect(() => {
		let isMounted = true;

		const loadArticle = async () => {
			if (!visible) return;

			try {
				setLoading(true);
				const data = await fetchArticle(articleId);
				if (isMounted) {
					setArticle(data);
				}
			} catch (error) {
				console.error("ArticleModal: failed to fetch article:", error);
			} finally {
				if (isMounted) {
					setLoading(false);
				}
			}
		};

		void loadArticle();

		return () => {
			isMounted = false;
		};
	}, [articleId, visible]);

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
					{loading ? (
						<ArticleContentSkeleton />
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
