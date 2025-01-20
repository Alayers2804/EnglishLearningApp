import { Button, Text, View, StyleSheet, TextInput, Alert } from "react-native";
import React from "react";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { Link } from "expo-router";

const Index = () => {
  const [text, onChangeText] = React.useState("");
  const [number, onChangeNumber] = React.useState("");

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <Text style={styles.label}>Register to English Quiz App</Text>
        <TextInput
          style={styles.input}
          onChangeText={onChangeText}
          placeholder="Name"
          value={text}
        />
        <TextInput
          style={styles.input}
          onChangeText={onChangeText}
          placeholder="Email"
          value={text}
        />
        <TextInput
          style={styles.input}
          onChangeText={onChangeNumber}
          value={number}
          placeholder="Password"
        />

        <Button
          title="Register"
          onPress={() => Alert.alert("Simple Button pressed")}
        />

        <Link href="/" style={styles.label}>
          Already Have an Account? Login here
        </Link>


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
});

export default Index;
