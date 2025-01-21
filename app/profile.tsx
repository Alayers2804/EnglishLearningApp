import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import config from "./config";

const Profile = () => {
  const [profile, setProfile] = useState<{
    id: string;
    name: string;
    email: string;
    role: string;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Retrieve the token from AsyncStorage
        const token = await AsyncStorage.getItem("token");
        console.log("Retrieved token in Profile:", token); // Log the token

        if (!token) {
          throw new Error("No token found. Please log in again.");
        }

        // Fetch profile data from the API
        const response = await fetch(
          config.EVALUATION_API_URL + "users/profile",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch profile data");
        }

        const data = await response.json();
        setProfile(data);
      } catch (err) {
        setError("An error occurred while fetching profile data.");
        Alert.alert("An error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <ActivityIndicator size="large" color="#0000ff" />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  if (error) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <Text style={styles.errorText}>{error}</Text>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        {profile ? (
          <View style={styles.profileContainer}>
            <Text style={styles.label}>ID:</Text>
            <Text style={styles.value}>{profile.id}</Text>

            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{profile.name}</Text>

            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{profile.email}</Text>

            <Text style={styles.label}>Role:</Text>
            <Text style={styles.value}>{profile.role}</Text>
          </View>
        ) : (
          <Text style={styles.errorText}>No profile data available.</Text>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  profileContainer: {
    width: "100%",
    maxWidth: 300,
    padding: 20,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
  },
  value: {
    fontSize: 16,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 18,
    color: "red",
    marginBottom: 16,
  },
});

export default Profile;
