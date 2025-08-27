import { Tabs } from "expo-router";
import React from "react";
import { Home, BookOpen, Timer, Users } from "lucide-react-native";
import { Platform } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#94A3B8',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#334155',
          borderTopWidth: 0,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          height: Platform.OS === 'ios' ? 90 : 80,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Hem",
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="courses"
        options={{
          title: "Kurser",
          tabBarIcon: ({ color, size }) => <BookOpen color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="timer"
        options={{
          title: "Timer",
          tabBarIcon: ({ color, size }) => <Timer color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: "Vänner",
          tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}