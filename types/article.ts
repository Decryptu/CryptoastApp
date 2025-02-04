export interface Author {
	name: string;
	description?: string;
	avatar_urls?: Record<string, string>;
}

export interface Article {
	id: number;
	date: string;
	title: {
		rendered: string;
	};
	excerpt: {
		rendered: string;
	};
	content: {
		rendered: string;
		protected: boolean;
	};
	link: string;
	_embedded?: {
		"wp:featuredmedia"?: [
			{
				source_url: string;
				media_details?: {
					sizes?: {
						medium_large?: {
							source_url: string;
						};
					};
				};
			},
		];
		author?: Author[];
	};
	yoast_head_json?: {
		twitter_misc?: {
			"Durée de lecture estimée"?: string;
		};
		author?: string;
		og_image?: Array<{
			url: string;
			width: number;
			height: number;
			type: string;
		}>;
	};
	schema?: {
		"@graph": Array<{
			thumbnailUrl?: string;
			description?: string;
		}>;
	};
}
