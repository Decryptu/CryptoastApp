import { type FC, useMemo } from "react";
import { View, Text, ScrollView } from "react-native";

interface TableCellData {
	id: string; // Add unique ID for keys
	content: string;
	isBold: boolean;
	isCenter: boolean;
}

interface TableProps {
	html: string;
}

const cleanHtmlContent = (html: string): string => {
	return html
		.replace(/<p>/g, "")
		.replace(/<\/p>/g, "\n")
		.replace(/<\/?(?:strong|b)>/g, "")
		.replace(/<\/?[^>]+(>|$)/g, "")
		.replace(/\n+/g, "\n")
		.trim();
};

const isStrongContent = (content: string): boolean => {
	return /<(strong|b)>.*?<\/(strong|b)>/i.test(content);
};

const isCenterAligned = (style: string | undefined): boolean => {
	return style?.includes("text-align: center") ?? false;
};

const extractTableContent = (html: string): string => {
	const tableMatch = html.match(/<table[\s\S]*?<\/table>/);
	return tableMatch ? tableMatch[0] : "";
};

// Add a function to generate unique IDs
const generateUniqueId = (): string => {
	return Math.random().toString(36).substring(2, 11);
};

export const TableComponent: FC<TableProps> = ({ html }) => {
	const tableData = useMemo(() => {
		const tableContent = extractTableContent(html);
		const rowsMatch = tableContent.match(/<tr>[\s\S]*?<\/tr>/g);
		if (!rowsMatch) {
			return [];
		}

		return rowsMatch.map((row) => {
			const cellsMatch = row.match(/<td[^>]*>[\s\S]*?<\/td>/g);
			if (!cellsMatch) return [];

			return cellsMatch.map((cell): TableCellData => {
				const styleMatch = cell.match(/style="([^"]*)"/);
				const cellContent = cell.match(/<td[^>]*>([\s\S]*?)<\/td>/)?.[1] || "";

				return {
					id: generateUniqueId(),
					content: cleanHtmlContent(cellContent),
					isBold: isStrongContent(cellContent),
					isCenter: isCenterAligned(styleMatch?.[1]),
				};
			});
		});
	}, [html]);

	const columnCount = useMemo(() => {
		return Math.max(...tableData.map((row) => row.length), 1);
	}, [tableData]);

	const columnWidth = 150; // Fixed width for each column

	if (tableData.length === 0) {
		return null;
	}

	return (
		<View className="my-4">
			<ScrollView horizontal showsHorizontalScrollIndicator={true}>
				<View className="border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden">
					{tableData.map((row, rowIndex) => (
						<View
							key={row.map((cell) => cell.id).join("-")}
							className={`flex-row bg-white dark:bg-zinc-800 ${
								rowIndex !== 0
									? "border-t border-zinc-200 dark:border-zinc-700"
									: ""
							}`}
						>
							{row.map((cell, cellIndex) => (
								<View
									key={cell.id}
									className={`p-3 border-r border-zinc-200 dark:border-zinc-700 ${
										cellIndex === row.length - 1 ? "border-r-0" : ""
									}`}
									style={{
										width: columnWidth,
										minWidth: columnWidth,
									}}
								>
									<Text
										className={`${cell.isBold ? "font-bold" : "font-normal"} 
                          ${cell.isCenter ? "text-center" : "text-left"}
                          text-base text-zinc-900 dark:text-zinc-100`}
									>
										{cell.content}
									</Text>
								</View>
							))}
						</View>
					))}
				</View>
			</ScrollView>
		</View>
	);
};

export default TableComponent;
