import { Tabs } from "expo-router";
import React from "react";
import { Home, BookOpen, Timer, Users } from "lucide-react-native";
import { Platform } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";

export default function TabLayout() {
  const { theme, isDark } = useTheme();
  
  return (
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
    </Tabs>
  );
}