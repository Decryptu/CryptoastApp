// components/CTAButton.tsx
import type React from "react";
import {
	TouchableOpacity,
	Text,
	StyleSheet,
	Linking,
	View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface CTAButtonProps {
	gradientColors: readonly [string, string, ...string[]];
	text: string;
	href: string;
}

export const CTAButton: React.FC<CTAButtonProps> = ({
	gradientColors,
	text,
	href,
}) => {
	const onPress = async () => {
		await Linking.openURL(href);
	};

	return (
		<View style={styles.container}>
			<TouchableOpacity onPress={onPress} activeOpacity={0.8}>
				<LinearGradient
					colors={gradientColors}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 0 }}
					style={styles.button}
				>
					<Text style={styles.buttonText}>{text}</Text>
				</LinearGradient>
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		marginVertical: 8,
		alignSelf: "center",
	},
	button: {
		paddingVertical: 12,
		paddingHorizontal: 20,
		borderRadius: 8,
	},
	buttonText: {
		color: "#fff",
		fontSize: 16,
		textAlign: "center",
		fontWeight: "bold",
	},
});
