import { Stack } from "expo-router";    
export default function RootLayout() {  
  return (  
    <Stack>  
      <Stack.Screen name="index" options={{ title: "Login", headerBackVisible: false }} />  
      <Stack.Screen name="home" options={{ title: "Menu", headerBackVisible: false }} />  
      <Stack.Screen name="examQuestions" options={{ title: "Exam Questions", headerBackVisible: false }} />  
      <Stack.Screen name="profile" options={{ title: "Profile" }} /> 
    </Stack>  
  );  
}  
