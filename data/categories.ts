// data/categories.ts

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
				name: "Actualité de l'Ethereum (ETH)",
				id: 92,
			},
			{
				name: "Actualité de la Blockchain",
				id: 89,
			},
			{
				name: "Actualité de la DeFi",
				id: 1878,
			},
			{
				name: "Actualité des Altcoins",
				id: 91,
			},
			{
				name: "Actualité des Exchanges",
				id: 95,
			},
			{
				name: "Actualité des NFT",
				id: 1877,
			},
			{
				name: "Actualité du Bitcoin (BTC)",
				id: 90,
			},
			{
				name: "Actualité du Metaverse",
				id: 4327,
			},
			{
				name: "Actualité du Minage",
				id: 521,
			},
			{
				name: "Actualité du Ripple (XRP)",
				id: 93,
			},
			{
				name: "Actualité Économie et Finance",
				id: 4300,
			},
			{
				name: "Actualité Régulation Crypto",
				id: 94,
			},
			{
				name: "Actualités des airdrops",
				id: 5558,
			},
			{
				name: "Actualités GameFi",
				id: 3890,
			},
			{
				name: "Analyse du prix du Bitcoin et des crypto-monnaies",
				id: 67,
			},
			{
				name: "Analyse On-Chain",
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
		name: "Analyses de cryptomonnaies",
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
				name: "Blockchain",
				id: 111,
			},
			{
				name: "Bourse",
				id: 5172,
			},
			{
				name: "DeFi : finance décentralisée",
				id: 108,
			},
			{
				name: "Droit et Fiscalité",
				id: 69,
			},
			{
				name: "Exchanges crypto",
				id: 115,
			},
			{
				name: "Formation Bitcoin",
				id: 3885,
			},
			{
				name: "Formation Ethereum",
				id: 3886,
			},
			{
				name: "Guide sur le Trading",
				id: 66,
			},
			{
				name: "Minage, Masternodes et Staking",
				id: 99,
			},
			{
				name: "NFT : Tokens non fongibles",
				id: 2756,
			},
			{
				name: "Personnalités cryptos",
				id: 78,
			},
			{
				name: "Sécurité et Stockage",
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
	NEWS: [
		89, // Actualité de la Blockchain
		90, // Actualité du Bitcoin
		91, // Actualité des Altcoins
		92, // Actualité de l'Ethereum
		93, // Actualité du Ripple
		94, // Actualité Régulation Crypto
		95, // Actualité des Exchanges
		521, // Actualité du Minage
		1877, // Actualité des NFT
		1878, // Actualité de la DeFi
		3890, // Actualités GameFi
		4327, // Actualité du Metaverse
	],
	GUIDES: [
		66, // Guide sur le Trading
		69, // Droit et Fiscalité
		71, // Sécurité et Stockage
		99, // Minage, Masternodes et Staking
		108, // DeFi : finance décentralisée
		111, // Blockchain
		115, // Exchanges crypto
		2756, // NFT : Tokens non fongibles
		3885, // Formation Bitcoin
		3886, // Formation Ethereum
		5172, // Bourse
	],
	REPORTS: [
		4301, // Dossiers
		5815, // Tribunes
	],
	SHEETS: [
		5, // Analyses de cryptomonnaies
	],
} as const;
