// app/(tabs)/video.tsx
import React from 'react';
import { View, Text, SafeAreaView, useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import colors from 'tailwindcss/colors';

export default function VideoScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-zinc-900">
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View className="flex-1 justify-center items-center px-8">
        <View className="items-center space-y-6">
          {/* Video Icon */}
          <View className="w-24 h-24 rounded-full bg-amber-100 dark:bg-amber-900/30 justify-center items-center">
            <Feather 
              name="play-circle" 
              size={48} 
              color={isDark ? colors.amber[400] : colors.amber[600]} 
            />
          </View>
          
          {/* Title */}
          <Text className="text-2xl font-bold text-zinc-800 dark:text-white text-center">
            Vidéos Crypto
          </Text>
          
          {/* Description */}
          <Text className="text-base text-zinc-600 dark:text-zinc-300 text-center leading-relaxed">
            Cette section est en cours de développement.{'\n'}
            Bientôt disponible avec du contenu vidéo exclusif !
          </Text>
          
          {/* Coming Soon Badge */}
          <View className="bg-amber-500/10 dark:bg-amber-400/10 px-4 py-2 rounded-full">
            <Text className="text-amber-600 dark:text-amber-400 font-medium">
              Bientôt disponible
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}