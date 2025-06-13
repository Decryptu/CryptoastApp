// app/_layout.tsx
import { Stack } from 'expo-router';
import { useColorScheme, Platform } from 'react-native';
import colors from 'tailwindcss/colors';
import '../global.css';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: isDark ? colors.zinc[900] : colors.white,
        },
        headerTitleStyle: {
          color: isDark ? colors.white : colors.zinc[800],
          fontSize: 18,
          fontWeight: '500',
        },
        headerTitleAlign: Platform.OS === 'android' ? 'center' : 'left',
        headerTintColor: colors.amber[500],
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      
      <Stack.Screen 
        name="search" 
        options={{
          headerShown: false,
          presentation: Platform.OS === 'ios' && Platform.isPad ? 'fullScreenModal' : 'modal',
        }} 
      />
      
      <Stack.Screen 
        name="article/[id]" 
        options={{
          title: 'Article',
          headerShown: true,
          presentation: 'card',
          headerBackTitle: Platform.OS === 'ios' ? 'Retour' : undefined,
        }} 
      />
    </Stack>
  );
}