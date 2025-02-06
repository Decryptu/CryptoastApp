import { useMemo, useCallback } from "react";
import { categories, CATEGORY_MAPPINGS } from "../data/categories";
import type { Category } from "../data/categories";
import type { ContentSection } from "../services/api";

interface CategoryTab {
	id: number;
	name: string;
}

const SWIPE_THRESHOLD = 100;

export function useCategories(
	section: ContentSection,
	selectedCategory: number | null,
) {
	const sectionCategories = useMemo(() => {
		if (section === "SHEETS") return [] as CategoryTab[];

		const sectionIds: number[] = [...CATEGORY_MAPPINGS[section]];

		return categories
			.flatMap((cat: Category) => cat.children || [])
			.filter((cat: Category) => sectionIds.includes(cat.id))
			.map((cat: Category) => ({
				id: cat.id,
				name: cat.name,
			})) as CategoryTab[];
	}, [section]);

	const currentCategoryIndex = useMemo(() => {
		if (!selectedCategory) return -1;
		return sectionCategories.findIndex(
			(cat: CategoryTab) => cat.id === selectedCategory,
		);
	}, [selectedCategory, sectionCategories]);

	const handleCategoryChange = useCallback(
		(
			direction: "next" | "prev",
			onSelectCategory: (category: number | null) => void,
		) => {
			if (sectionCategories.length === 0) return;

			let newIndex = currentCategoryIndex;
			if (
				direction === "next" &&
				currentCategoryIndex < sectionCategories.length - 1
			) {
				newIndex += 1;
			} else if (direction === "prev" && currentCategoryIndex > -1) {
				newIndex -= 1;
			}

			const newCategory =
				newIndex === -1 ? null : sectionCategories[newIndex].id;
			if (newCategory !== selectedCategory) {
				console.log(`🔄 Switching to category: ${newCategory || "all"}`);
				onSelectCategory(newCategory);
			}
		},
		[currentCategoryIndex, sectionCategories, selectedCategory],
	);

	return {
		sectionCategories,
		handleCategoryChange,
		SWIPE_THRESHOLD,
	};
}
