export interface Category {
	name: string;
	id: number;
	children?: Category[];
}

export const categories: Category[] = [
	{
		name: "Actu de la crypto",
		id: 62,
		children: [
			{
				name: "Bitcoin",
				id: 90,
			},
			{
				name: "Ethereum",
				id: 92,
			},
			{
				name: "Blockchain",
				id: 89,
			},
			{
				name: "DeFi",
				id: 1878,
			},
			{
				name: "Altcoins",
				id: 91,
			},
			{
				name: "Exchanges",
				id: 95,
			},
			{
				name: "NFT",
				id: 1877,
			},
			{
				name: "Metaverse",
				id: 4327,
			},
			{
				name: "Minage",
				id: 521,
			},
			{
				name: "Ripple",
				id: 93,
			},
			{
				name: "Économie et Finance",
				id: 4300,
			},
			{
				name: "Régulation",
				id: 94,
			},
			{
				name: "Airdrops",
				id: 5558,
			},
			{
				name: "GameFi",
				id: 3890,
			},
			{
				name: "Analyses",
				id: 67,
			},
			{
				name: "On-Chain",
				id: 2858,
			},
			{
				name: "Dossiers",
				id: 4301,
			},
			{
				name: "Tribunes",
				id: 5815,
			},
			{
				name: "Zone Innovation",
				id: 3205,
			},
		],
	},
	{
		name: "Airdrop",
		id: 112,
	},
	{
		name: "Fiches",
		id: 5,
	},
	{
		name: "Crypto Brunch",
		id: 77,
	},
	{
		name: "Cryptoast",
		id: 154,
	},
	{
		name: "Développement Blockchain",
		id: 79,
	},
	{
		name: "Guides",
		id: 4,
		children: [
			{
				name: "Autre",
				id: 3887,
			},
			{
				name: "Bitcoin",
				id: 3885,
			},
			{
				name: "Ethereum",
				id: 3886,
			},
			{
				name: "Blockchain",
				id: 111,
			},
			{
				name: "Bourse",
				id: 5172,
			},
			{
				name: "DeFi",
				id: 108,
			},
			{
				name: "Droit",
				id: 69,
			},
			{
				name: "Exchanges",
				id: 115,
			},
			{
				name: "Trading",
				id: 66,
			},
			{
				name: "POW & POS",
				id: 99,
			},
			{
				name: "NFT",
				id: 2756,
			},
			{
				name: "Personnalités",
				id: 78,
			},
			{
				name: "Sécurité",
				id: 71,
			},
		],
	},
	{
		name: "Hide Home",
		id: 419,
	},
	{
		name: "Investissement",
		id: 70,
	},
	{
		name: "Le Récap' Crypto",
		id: 3177,
	},
	{
		name: "Non classé",
		id: 1,
	},
	{
		name: "Page Link",
		id: 75,
	},
	{
		name: "Podcast crypto-monnaies",
		id: 501,
	},
	{
		name: "RSS",
		id: 46,
	},
	{
		name: "Tutos Cryptos",
		id: 3,
	},
	{
		name: "Vidéos cryptos",
		id: 76,
	},
];

// Create category mappings for each section
export const CATEGORY_MAPPINGS = {
	NEWS: [67, 89, 90, 91, 92, 93, 94, 95, 521, 1877, 1878, 3890, 4300, 4327],
	GUIDES: [66, 69, 71, 99, 108, 111, 115, 2756, 3885, 3886, 3887, 5172],
	REPORTS: [4301, 5815],
	SHEETS: [5],
} as const;
