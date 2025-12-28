import { Tabs, useRouter, useSegments } from "expo-router";
import React, { useRef } from "react";
import { Home, BookOpen, Timer, Users, MessageCircle } from "lucide-react-native";
import { Platform, PanResponder, Dimensions, View } from "react-native";
import { COLORS, SPACING, ICON_SIZES } from "@/constants/design-system";
import { t } from "@/constants/translations";

const { width: screenWidth } = Dimensions.get('window');

const TAB_ROUTES = ['home', 'courses', 'timer', 'friends', 'ai-chat'];

export default function TabLayout() {
  const router = useRouter();
  const segments = useSegments();
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 20;
      },
      onPanResponderMove: (evt, gestureState) => {
        // Optional: Add visual feedback during swipe
      },
      onPanResponderRelease: (evt, gestureState) => {
        const { dx, vx } = gestureState;
        const swipeThreshold = screenWidth * 0.25;
        const velocityThreshold = 0.5;
        
        // Get current tab index
        const currentSegment = segments[segments.length - 1];
        const currentIndex = TAB_ROUTES.indexOf(currentSegment);
        
        if (currentIndex === -1) return;
        
        let targetIndex = currentIndex;
        
        // Determine swipe direction and target
        if ((dx > swipeThreshold || vx > velocityThreshold) && currentIndex > 0) {
          // Swipe right - go to previous tab
          targetIndex = currentIndex - 1;
        } else if ((dx < -swipeThreshold || vx < -velocityThreshold) && currentIndex < TAB_ROUTES.length - 1) {
          // Swipe left - go to next tab
          targetIndex = currentIndex + 1;
        }
        
        if (targetIndex !== currentIndex) {
          router.push(`/(tabs)/${TAB_ROUTES[targetIndex]}` as any);
        }
      },
    })
  ).current;
  
  return (
    <View style={{ flex: 1 }} {...panResponder.panHandlers}>
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.backgroundLight,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          paddingTop: SPACING.md,
          paddingBottom: Platform.OS === 'ios' ? 28 : SPACING.md,
          paddingHorizontal: SPACING.xl,
          height: Platform.OS === 'ios' ? 88 : 68,
          shadowColor: COLORS.black,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 12,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600' as const,
          marginTop: 4,
          letterSpacing: 0.3,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t('navigation.home'),
          tabBarIcon: ({ color, size, focused }) => (
            <Home 
              color={color} 
              size={ICON_SIZES.lg} 
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="courses"
        options={{
          title: t('navigation.courses'),
          tabBarIcon: ({ color, size, focused }) => (
            <BookOpen 
              color={color} 
              size={ICON_SIZES.lg} 
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="timer"
        options={{
          title: t('timer.focus'),
          tabBarIcon: ({ color, size, focused }) => (
            <Timer 
              color={color} 
              size={ICON_SIZES.lg} 
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: t('navigation.friends'),
          tabBarIcon: ({ color, size, focused }) => (
            <Users 
              color={color} 
              size={ICON_SIZES.lg} 
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="ai-chat"
        options={{
          title: t('navigation.aiChat'),
          tabBarIcon: ({ color, size, focused }) => (
            <MessageCircle 
              color={color} 
              size={ICON_SIZES.lg} 
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
    </Tabs>
    </View>
  );
}