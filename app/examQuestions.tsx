import React, { useEffect, useState } from "react";  
import {  
  View,  
  Text,  
  StyleSheet,  
  TextInput,  
  FlatList,  
  ActivityIndicator,  
  Alert,  
  TouchableOpacity,  
} from "react-native";  
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";  
import { useRoute } from "@react-navigation/native";  
import AsyncStorage from "@react-native-async-storage/async-storage";  
import { useRouter } from "expo-router";  
import config from "./config";  
  
interface Question {  
  id: number;  
  examQuestion: string;  
  examAnswer: string;  
  examGrade: number;  
  userAnswer: string;  
}  
  
const ExamQuestions = () => {  
  const route = useRoute();  
  const { examId, duration } = route.params as { examId: number; duration: number };  
  const [questions, setQuestions] = useState<Question[]>([]);  
  const [loading, setLoading] = useState<boolean>(true);  
  const [error, setError] = useState<string | null>(null);  
  const [timeRemaining, setTimeRemaining] = useState<number>(duration * 60); // duration in seconds  
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null); // To manage the interval  
  const router = useRouter(); // Initialize router for navigation  
  
  useEffect(() => {  
    const fetchQuestions = async () => {  
      try {  
        const response = await fetch(  
          config.EVALUATION_API_URL + `getQuestionsByExamId/${examId}`  
        );  
        if (!response.ok) {  
          throw new Error("Failed to fetch questions");  
        }  
        const data = await response.json();  
        const formattedQuestions = data.map((question: any) => ({  
          id: question.id,  
          examQuestion: question.examQuestion,  
          examAnswer: question.examAnswer,  
          examGrade: question.examGrade,  
          userAnswer: "", // Initialize userAnswer  
        }));  
        setQuestions(formattedQuestions);  
      } catch (err) {  
        setError("Error fetching questions");  
      } finally {  
        setLoading(false);  
      }  
    };  
  
    fetchQuestions();  
  
    // Set up the timer to count down every second  
    const interval = setInterval(() => {  
      setTimeRemaining((prevTime) => {  
        if (prevTime <= 1) {  
          clearInterval(interval);  
          handleSubmit(); // Automatically submit the answers when time is up  
        }  
        return prevTime - 1;  
      });  
    }, 1000);  
  
    setTimer(interval);  
  
    // Cleanup interval on component unmount  
    return () => clearInterval(interval);  
  }, [examId, duration]);  
  
  const handleAnswerChange = (id: number, answer: string) => {  
    setQuestions((prevQuestions) =>  
      prevQuestions.map((question) =>  
        question.id === id ? { ...question, userAnswer: answer } : question  
      )  
    );  
  };  
  
  const validateAnswers = () => {  
    return questions.every((question) => question.userAnswer.trim() !== "");  
  };  
  
  const submitAnswers = async () => {  
    const token = await AsyncStorage.getItem("token");  
    if (!token) {  
      Alert.alert("Error", "Authorization token not found.");  
      return;  
    }  
  
    try {  
      // Iterate over each question and submit the answer  
      for (const question of questions) {  
        const response = await fetch(  
          config.EVALUATION_API_URL + "addAnswer",  
          {  
            method: "POST",  
            headers: {  
              "Content-Type": "application/json",  
              Authorization: `Bearer ${token}`,  
            },  
            body: JSON.stringify({  
              answer: question.userAnswer || "0", // Use the user's answer or "0" by default  
              examQuestion: { id: question.id },  
            }),  
          }  
        );  
  
        if (!response.ok) {  
          const errorData = await response.json();  
          console.error(`Error for question ID ${question.id}:`, errorData);  
          continue;  
        }  
  
        console.log(  
          `Successfully submitted answer for question ID: ${question.id}`  
        );  
      }  
  
      Alert.alert("Success", "Your answers have been submitted.");  
      router.push("/home"); // Navigate to home after submission  
    } catch (error) {  
      console.error("Submission error:", error);  
      Alert.alert("An error occurred while submitting answers.");  
    }  
  };  
  
  const handleSubmit = async () => {  
    if (!validateAnswers()) {  
      Alert.alert(  
        "Validation Error",  
        "Please answer all questions before submitting."  
      );  
      return;  
    }  
    await submitAnswers(); // Submit actual answers  
  };  
  
  const handleCancel = async () => {  
    await submitAnswers(); // Submit "0" for all questions on cancel  
  };  
  
  const formatTime = (timeInSeconds: number) => {  
    const minutes = Math.floor(timeInSeconds / 60);  
    const seconds = timeInSeconds % 60;  
    return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;  
  };  
  
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
        <FlatList  
          data={questions}  
          keyExtractor={(item) => item.id.toString()}  
          renderItem={({ item }) => (  
            <View style={styles.questionContainer}>  
              <Text style={styles.questionText}>{item.examQuestion}</Text>  
              <TextInput  
                style={styles.answerInput}  
                placeholder="Your answer here"  
                value={item.userAnswer}  
                onChangeText={(answer) => handleAnswerChange(item.id, answer)}  
              />  
            </View>  
          )}  
          contentContainerStyle={styles.listContainer}  
        />  
        <Text style={styles.timerText}>Time Remaining: {formatTime(timeRemaining)}</Text>  
        <TouchableOpacity  
          style={styles.submitButton}  
          onPress={() =>  
            Alert.alert(  
              "Submit Answers",  
              "Are you sure you want to submit your answers?",  
              [  
                {  
                  text: "Cancel",  
                  style: "cancel",  
                },  
                {  
                  text: "Submit",  
                  onPress: handleSubmit,  
                },  
              ]  
            )  
          }  
        >  
          <Text style={styles.submitButtonText}>Submit Answers</Text>  
        </TouchableOpacity>  
        <TouchableOpacity  
          style={styles.cancelButton}  
          onPress={() =>  
            Alert.alert(  
              "Cancel Exam",  
              "Are you sure you want to cancel? Your answers will be submitted as '0'.",  
              [  
                {  
                  text: "No",  
                  style: "cancel",  
                },  
                {  
                  text: "Yes",  
                  onPress: handleCancel,  
                },  
              ]  
            )  
          }  
        >  
          <Text style={styles.cancelButtonText}>Cancel Exam</Text>  
        </TouchableOpacity>  
      </SafeAreaView>  
    </SafeAreaProvider>  
  );  
};  
  
const styles = StyleSheet.create({  
  container: {  
    flex: 1,  
    padding: 16,  
  },  
  listContainer: {  
    paddingBottom: 16,  
  },  
  questionContainer: {  
    backgroundColor: "#f0f0f0",  
    borderRadius: 8,  
    padding: 16,  
    marginVertical: 8,  
    marginHorizontal: 10,  
    shadowColor: "#000",  
    shadowOffset: { width: 0, height: 2 },  
    shadowOpacity: 0.2,  
    shadowRadius: 4,  
    elevation: 3,  
  },  
  questionText: {  
    fontSize: 16,  
    fontWeight: "bold",  
    marginBottom: 8,  
  },  
  answerInput: {  
    height: 40,  
    borderColor: "#ccc",  
    borderWidth: 1,  
    borderRadius: 4,  
    paddingHorizontal: 8,  
  },  
  errorText: {  
    fontSize: 18,  
    color: "red",  
    marginBottom: 16,  
  },  
  submitButton: {  
    backgroundColor: "#007BFF",  
    padding: 12,  
    borderRadius: 8,  
    alignItems: "center",  
    justifyContent: "center",  
    marginTop: 20,  
  },  
  submitButtonText: {  
    color: "#FFFFFF",  
    fontSize: 16,  
    fontWeight: "bold",  
  },  
  cancelButton: {  
    backgroundColor: "#FF6347",  
    padding: 12,  
    borderRadius: 8,  
    alignItems: "center",  
    justifyContent: "center",  
    marginTop: 10,  
  },  
  cancelButtonText: {  
    color: "#FFFFFF",  
    fontSize: 16,  
    fontWeight: "bold",  
  },  
  timerText: {  
    fontSize: 18,  
    textAlign: "center",  
    marginTop: 10,  
    fontWeight: "bold",  
  },  
});  
  
export default ExamQuestions;  
