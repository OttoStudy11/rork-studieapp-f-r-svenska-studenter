import { Tabs, useRouter, useSegments } from "expo-router";
import React, { useRef } from "react";
import { Home, BookOpen, Timer, Users, MessageCircle, UsersRound } from "lucide-react-native";
import { Platform, PanResponder, Dimensions, View } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";

const { width: screenWidth } = Dimensions.get('window');

const TAB_ROUTES = ['home', 'courses', 'timer', 'groups', 'friends', 'ai-chat'];

export default function TabLayout() {
  const { theme, isDark } = useTheme();
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
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          paddingTop: 12,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
          paddingHorizontal: 20,
          height: Platform.OS === 'ios' ? 95 : 85,
          shadowColor: theme.colors.shadow,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: isDark ? 0.3 : 0.1,
          shadowRadius: 12,
          elevation: 12,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
          letterSpacing: 0.5,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Hem",
          tabBarIcon: ({ color, size, focused }) => (
            <Home 
              color={color} 
              size={focused ? 26 : 24} 
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="courses"
        options={{
          title: "Kurser",
          tabBarIcon: ({ color, size, focused }) => (
            <BookOpen 
              color={color} 
              size={focused ? 26 : 24} 
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="timer"
        options={{
          title: "Fokus",
          tabBarIcon: ({ color, size, focused }) => (
            <Timer 
              color={color} 
              size={focused ? 26 : 24} 
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          title: "Grupper",
          tabBarIcon: ({ color, size, focused }) => (
            <UsersRound 
              color={color} 
              size={focused ? 26 : 24} 
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: "Vänner",
          tabBarIcon: ({ color, size, focused }) => (
            <Users 
              color={color} 
              size={focused ? 26 : 24} 
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="ai-chat"
        options={{
          title: "StudieStugan AI",
          tabBarIcon: ({ color, size, focused }) => (
            <MessageCircle 
              color={color} 
              size={focused ? 26 : 24} 
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
    </Tabs>
    </View>
  );
}