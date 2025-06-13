export const API_CONFIG = {
	// Use the local IP or public IP as 'localhost' doesn't work with Android emulators/devices
	// BASE_URL: "https://cryptoast.dev/api", 
	BASE_URL: "http://192.168.1.30:3000/api",
	ITEMS_PER_PAGE: 10 as number,
} as const;
