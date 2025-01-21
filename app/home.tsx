import React, { useEffect, useState, useCallback } from "react";    
import {    
  View,    
  Text,    
  StyleSheet,    
  TouchableOpacity,    
  FlatList,    
  ActivityIndicator,    
  RefreshControl,    
  Alert,    
  BackHandler,    
} from "react-native";    
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";    
import { useRouter } from "expo-router";    
import AsyncStorage from "@react-native-async-storage/async-storage";    
import config from "./config";    
    
interface Exam {    
  id: number;    
  examName: string;    
  date: string;    
  duration: number;    
  totalMarks: number;    
}    
    
const Home = () => {    
  const [exams, setExams] = useState<Exam[]>([]);    
  const [loading, setLoading] = useState<boolean>(true);    
  const [refreshing, setRefreshing] = useState<boolean>(false);    
  const [error, setError] = useState<string | null>(null);    
    
  const router = useRouter();    
    
  const handleExamPress = (examId: number, duration: number) => {    
    router.push(`/examQuestions?examId=${examId}&duration=${duration}`);    
  };    
    
  const fetchExams = async () => {    
    try {    
      setLoading(true);    
      const response = await fetch(config.EVALUATION_API_URL + "getAllExams");    
      if (!response.ok) {    
        throw new Error("Failed to fetch exams");    
      }    
      const data = await response.json();    
      const formattedExams = data.map((exam: any) => ({    
        id: exam.id,    
        examName: exam.examName,    
        date: exam.date,    
        duration: exam.duration,    
        totalMarks: exam.totalMarks,    
      }));    
      setExams(formattedExams);    
    } catch (err) {    
      console.error(err);    
      setError("Error fetching exams");    
    } finally {    
      setLoading(false);    
    }    
  };    
    
  const onRefresh = useCallback(async () => {    
    setRefreshing(true);    
    await fetchExams();    
    setRefreshing(false);    
  }, []);    
    
  useEffect(() => {    
    fetchExams();    
  }, []);    
    
  const handleLogout = async () => {    
    try {    
      await AsyncStorage.removeItem("token");    
      await AsyncStorage.removeItem("refreshToken");    
      await AsyncStorage.removeItem("role");    
      console.log("Tokens and role removed successfully");    
      router.replace("/");    
    } catch (error) {    
      console.error("Logout error:", error);    
      Alert.alert("Logout Failed", "Failed to log out. Please try again.");    
    }    
  };    
    
  // Handle hardware back button    
  useEffect(() => {    
    const onBackPress = () => {    
      // Custom logic for hardware back button if needed    
      Alert.alert("Back Button Pressed", "You cannot go back from this screen.");    
      return true; // Prevent default behavior    
    };    
    
    const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);    
    
    return () => {    
      backHandler.remove(); // Clean up the event listener on unmount    
    };    
  }, []);    
    
  if (loading && !refreshing) {    
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
          <TouchableOpacity style={styles.refreshButton} onPress={fetchExams}>    
            <Text style={styles.refreshButtonText}>Retry</Text>    
          </TouchableOpacity>    
        </SafeAreaView>    
      </SafeAreaProvider>    
    );    
  }    
    
  return (    
    <SafeAreaProvider>    
      <SafeAreaView style={styles.container}>    
        <View style={styles.header}>    
          <TouchableOpacity    
            style={styles.profileButton}    
            onPress={() => router.push("/profile")}    
          >    
            <Text style={styles.profileButtonText}>Profile</Text>    
          </TouchableOpacity>    
          <TouchableOpacity    
            style={styles.logoutButton}    
            onPress={handleLogout}    
          >    
            <Text style={styles.logoutButtonText}>Logout</Text>    
          </TouchableOpacity>    
        </View>    
        <FlatList    
          data={exams}    
          keyExtractor={(item) => item.id.toString()}    
          renderItem={({ item }) => (    
            <TouchableOpacity    
              style={styles.examBox}    
              onPress={() => handleExamPress(item.id, item.duration)}    
            >    
              <Text style={styles.examName}>{item.examName}</Text>    
              <Text style={styles.examDetails}>    
                Date: {new Date(item.date).toLocaleDateString()}    
              </Text>    
              <Text style={styles.examDetails}>    
                Duration: {item.duration} mins    
              </Text>    
              <Text style={styles.examDetails}>    
                Total Marks: {item.totalMarks}    
              </Text>    
            </TouchableOpacity>    
          )}    
          numColumns={2}    
          columnWrapperStyle={styles.columnWrapper}    
          refreshControl={    
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />    
          }    
        />    
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
  header: {    
    flexDirection: "row",    
    justifyContent: "space-between",    
    width: "100%",    
    marginBottom: 20,    
  },    
  profileButton: {    
    backgroundColor: "#6200ee",    
    borderRadius: 25,    
    paddingVertical: 10,    
    paddingHorizontal: 20,    
    shadowColor: "#000",    
    shadowOffset: { width: 0, height: 2 },    
    shadowOpacity: 0.2,    
    shadowRadius: 4,    
    elevation: 3,    
  },    
  profileButtonText: {    
    color: "#fff",    
    fontSize: 18,    
    fontWeight: "bold",    
  },    
  logoutButton: {    
    backgroundColor: "#ff0000",    
    borderRadius: 25,    
    paddingVertical: 10,    
    paddingHorizontal: 20,    
    shadowColor: "#000",    
    shadowOffset: { width: 0, height: 2 },    
    shadowOpacity: 0.2,    
    shadowRadius: 4,    
    elevation: 3,    
  },    
  logoutButtonText: {    
    color: "#fff",    
    fontSize: 18,    
    fontWeight: "bold",    
  },    
  examBox: {    
    backgroundColor: "#f8f8f8",    
    borderRadius: 12,    
    padding: 16,    
    marginVertical: 12,    
    marginHorizontal: 16,    
    width: "90%",    
    minHeight: 150,    
    justifyContent: "center",    
    alignItems: "center",    
    shadowColor: "#000",    
    shadowOffset: { width: 0, height: 2 },    
    shadowOpacity: 0.15,    
    shadowRadius: 4,    
    elevation: 3,    
  },    
  examName: {    
    fontSize: 18,    
    fontWeight: "bold",    
    textAlign: "center",    
  },    
  examDetails: {    
    fontSize: 14,    
    textAlign: "center",    
  },    
  errorText: {    
    fontSize: 18,    
    color: "red",    
    marginBottom: 16,    
  },    
  columnWrapper: {    
    justifyContent: "space-between",    
  },    
  refreshButton: {    
    backgroundColor: "#6200ee",    
    borderRadius: 25,    
    paddingVertical: 10,    
    paddingHorizontal: 20,    
    shadowColor: "#000",    
    shadowOffset: { width: 0, height: 2 },    
    shadowOpacity: 0.2,    
    shadowRadius: 4,    
    elevation: 3,    
  },    
  refreshButtonText: {    
    color: "#fff",    
    fontSize: 18,    
    fontWeight: "bold",    
  },    
});    
    
export default Home;  
