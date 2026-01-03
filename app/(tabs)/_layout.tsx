import { Tabs, useRouter, useSegments } from "expo-router";
import React, { useRef } from "react";
import { Home, BookOpen, Timer, Users, MessageCircle } from "lucide-react-native";
import { Platform, PanResponder, Dimensions, View, StyleSheet } from "react-native";
import { COLORS } from "@/constants/design-system";
import { t } from "@/constants/translations";
import { useTheme } from "@/contexts/ThemeContext";

const { width: screenWidth } = Dimensions.get('window');

const TAB_ROUTES = ['home', 'courses', 'timer', 'friends', 'ai-chat'];

export default function TabLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { isDark } = useTheme();
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
        tabBarInactiveTintColor: isDark ? '#6B7280' : '#9CA3AF',
        headerShown: false,
        tabBarStyle: {
          position: 'absolute' as const,
          bottom: Platform.OS === 'ios' ? 24 : 16,
          left: 20,
          right: 20,
          backgroundColor: isDark ? 'rgba(30, 41, 59, 0.92)' : 'rgba(255, 255, 255, 0.92)',
          borderTopWidth: 0,
          borderRadius: 28,
          paddingTop: 0,
          paddingBottom: 0,
          paddingHorizontal: 8,
          height: 64,
          shadowColor: isDark ? '#6366F1' : '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: isDark ? 0.25 : 0.15,
          shadowRadius: 24,
          elevation: 20,
          borderWidth: 1,
          borderColor: isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(0, 0, 0, 0.05)',
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600' as const,
          marginTop: 2,
          marginBottom: Platform.OS === 'ios' ? 0 : 4,
          letterSpacing: 0.2,
        },
        tabBarIconStyle: {
          marginTop: Platform.OS === 'ios' ? 6 : 4,
        },
        tabBarItemStyle: {
          paddingVertical: 6,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t('navigation.home'),
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconContainer : undefined}>
              <Home 
                color={focused ? COLORS.primary : color} 
                size={22} 
                strokeWidth={focused ? 2.5 : 1.8}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="courses"
        options={{
          title: t('navigation.courses'),
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconContainer : undefined}>
              <BookOpen 
                color={focused ? COLORS.primary : color} 
                size={22} 
                strokeWidth={focused ? 2.5 : 1.8}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="timer"
        options={{
          title: t('timer.focus'),
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconContainer : undefined}>
              <Timer 
                color={focused ? COLORS.primary : color} 
                size={22} 
                strokeWidth={focused ? 2.5 : 1.8}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: t('navigation.friends'),
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconContainer : undefined}>
              <Users 
                color={focused ? COLORS.primary : color} 
                size={22} 
                strokeWidth={focused ? 2.5 : 1.8}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="ai-chat"
        options={{
          title: t('navigation.aiChat'),
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconContainer : undefined}>
              <MessageCircle 
                color={focused ? COLORS.primary : color} 
                size={22} 
                strokeWidth={focused ? 2.5 : 1.8}
              />
            </View>
          ),
        }}
      />
    </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  activeIconContainer: {
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    borderRadius: 12,
    padding: 6,
    marginBottom: -4,
  },
});