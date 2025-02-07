// Common properties shared between posts and pages
interface SchemaGraph {
	"@type": string;
	"@id": string;
	isPartOf?: {
		"@id": string;
	};
	author?: {
		name: string;
		"@id": string;
	};
	headline?: string;
	datePublished?: string;
	dateModified?: string;
	mainEntityOfPage?: {
		"@id": string;
	};
	wordCount?: number;
	commentCount?: number;
	publisher?: {
		"@id": string;
	};
	image?: {
		"@id": string;
	};
	thumbnailUrl?: string;
	keywords?: string[];
	articleSection?: string[];
	inLanguage?: string;
	potentialAction?: Array<{
		"@type": string;
		name?: string;
		target?: string[];
	}>;
	copyrightYear?: string;
	copyrightHolder?: {
		"@id": string;
	};
}

interface Schema {
	"@context": string;
	"@graph": SchemaGraph[];
}

interface BaseArticle {
	id: number;
	date: string;
	date_gmt: string;
	guid: {
		rendered: string;
	};
	modified: string;
	modified_gmt: string;
	slug: string;
	status: string;
	type: "post" | "page";
	link: string;
	title: {
		rendered: string;
	};
	excerpt: {
		rendered: string;
		protected: boolean;
	};
	content: {
		rendered: string;
		protected: boolean;
	};
	author: number;
	featured_media: number;
	comment_status: string;
	ping_status: string;
	template: string;
	schema?: Schema;
	meta: {
		yasr_overall_rating: number;
		yasr_post_is_review: string;
		yasr_auto_insert_disabled: string;
		yasr_review_type: string;
		footnotes: string;
		_links_to: string;
		_links_to_target: string;
	};
	categories?: number[];
	tags?: number[];
	yoast_head_json?: {
		title?: string;
		description?: string;
		robots?: {
			index: string;
			follow: string;
			"max-snippet": string;
			"max-image-preview": string;
			"max-video-preview": string;
		};
		canonical?: string;
		og_locale?: string;
		og_type?: string;
		og_title?: string;
		og_description?: string;
		og_url?: string;
		og_site_name?: string;
		article_publisher?: string;
		article_modified_time?: string;
		og_image?: Array<{
			width: number;
			height: number;
			url: string;
			type: string;
		}>;
		twitter_card?: string;
		twitter_site?: string;
		twitter_creator?: string;
		twitter_misc?: {
			"Durée de lecture estimée"?: string;
			"Écrit par"?: string;
		};
		author?: string;
	};
	_embedded?: {
		"wp:featuredmedia"?: Array<{
			source_url: string;
			media_details?: {
				sizes?: {
					medium_large?: {
						source_url: string;
					};
				};
			};
		}>;
		author?: Author[];
	};
	yasr_visitor_votes?: {
		stars_attributes: {
			read_only: boolean;
			span_bottom: boolean;
		};
		number_of_votes: number;
		sum_votes: number;
	};
}

export interface Author {
	name: string;
	description?: string;
	avatar_urls?: Record<string, string>;
	image?: {
		url?: string;
		caption?: string;
	};
}

export interface Post extends BaseArticle {
	type: "post";
	sticky: boolean;
	format: string;
}

export interface Page extends BaseArticle {
	type: "page";
	parent: number;
	menu_order: number;
}

export type Article = Post | Page;

export function isPost(article: Article): article is Post {
	return article.type === "post";
}

export function isPage(article: Article): article is Page {
	return article.type === "page";
}

export interface TextSegment {
	type: "text" | "bold" | "italic" | "link";
	content: string;
	linkData?: {
		url: string;
		className?: string;
	};
}
