import { Button, Text, View, StyleSheet, TextInput, Alert } from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { Link, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import config from "./config";

const Index = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  useEffect(() => {
    console.log("Username updated:", username);
  }, [username]);

  useEffect(() => {
    console.log("Password updated:", password);
  }, [password]);

  const handleLogin = async () => {
    try {
      console.log("Final Username:", username);
      console.log("Final Password:", password);

      if (!username.trim() || !password.trim()) {
        Alert.alert("Input Error", "Please enter both username and password.");
        return;
      }

      const requestBody = JSON.stringify({
        email: username.trim(),
        password: password.trim(),
      });
      console.log("Request Body Sent:", requestBody);

      const response = await fetch(`${config.USER_API_URL}auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: requestBody,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response data:", errorData);
        throw new Error(errorData.message || "Invalid username or password");
      }

      const data = await response.json();
      console.log("Login response data:", data);

      if (!data.token) {
        throw new Error("Token not found in response");
      }

      const { token, refreshToken, role } = data;

      if (role !== "STUDENT") {
        Alert.alert(
          "Access Denied",
          "Only students are allowed to access this app."
        );
        return; // Prevent navigation
      }

      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("refreshToken", refreshToken);
      await AsyncStorage.setItem("role", role);

      Alert.alert("Login Successful", `Welcome, ${role}!`);
      router.push("/home");
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Login Failed");
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <Text style={styles.label}>Welcome to English Quiz App</Text>
        <TextInput
          style={styles.input}
          onChangeText={(text) => {
            console.log("Username Input:", text);
            setUsername(text);
          }}
          placeholder="Username"
          value={username}
        />
        <TextInput
          style={styles.input}
          onChangeText={(text) => {
            console.log("Password Input:", text);
            setPassword(text);
          }}
          value={password}
          placeholder="Password"
          secureTextEntry
        />
        <Button title="Login" onPress={handleLogin} />
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    width: 300,
  },
  label: {
    fontSize: 20,
    height: 40,
    margin: 12,
    padding: 10,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  link: {
    fontSize: 16,
  },
});

export default Index;
