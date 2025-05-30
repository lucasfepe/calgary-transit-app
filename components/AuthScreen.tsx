import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "@firebase/auth";
import { auth } from "../firebaseConfig";
import { useAuth } from "../contexts/authContext";
import { makeApiCall } from "@/services/auth";
import notificationService from "@/services/notifications/notificationService";
import { Image } from "react-native";
import { DropLogo } from "./icons/TransitIcons";
import * as RobotoFont from '@expo-google-fonts/roboto';
import { COLORS } from "@/constants";
// Add this import at the top with other imports
import * as Notifications from 'expo-notifications';


// Helper function to get user-friendly error messages
const getFirebaseAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case "auth/invalid-login-credentials":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "Invalid email or password. Please try again.";
    case "auth/email-already-in-use":
      return "This email is already registered. Please use a different email or try logging in.";
    case "auth/weak-password":
      return "Password is too weak. Please use a stronger password.";
    case "auth/invalid-email":
      return "Invalid email address. Please check and try again.";
    case "auth/network-request-failed":
      return "Network error. Please check your internet connection and try again.";
    case "auth/too-many-requests":
      return "Too many unsuccessful attempts. Please try again later.";
    case "auth/user-disabled":
      return "This account has been disabled. Please contact support.";
    default:
      return "An error occurred. Please try again later.";
  }
};

const AuthScreen = () => {
  const { useFonts, Roboto_500Medium } = RobotoFont;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { refreshAdminStatus } = useAuth();
  const [fontsLoaded] = useFonts({
    Roboto_500Medium,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.BLUE} />
      </View>
    );
  }
  // Function to register for push notifications
  const registerForNotifications = async () => {
    try {
      console.log("Registering for push notifications...");
  
      // Add a small delay to ensure authentication is complete
      await new Promise(resolve => setTimeout(resolve, 1000));
  
      // Get the push token
      const token = await notificationService.registerForPushNotifications();
  
      if (token) {
        console.log("Push token registered successfully:", token);
      } else {
        console.log("Push token registration failed or was declined by user");
      }
    } catch (error) {
      console.error("Error registering for push notifications:", error);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert(
        "Missing Information",
        "Please enter both email and password"
      );
      return;
    }

    setIsLoading(true);
    try {
      console.log("Attempting to sign up with:", { email }); // Don't log passwords
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("Sign up successful:", userCredential.user.uid);

      // Check if the user has admin privileges
      await refreshAdminStatus();

      // Register for push notifications after successful signup
      await registerForNotifications();

      Alert.alert("Success", "Your account has been created successfully!");
      // No need to navigate - the AppNavigator will handle this based on auth state
    } catch (error: any) {
      console.error("Sign up error:", error.code, error.message);

      // Use the helper function to get a user-friendly message
      const userMessage = getFirebaseAuthErrorMessage(error.code);
      Alert.alert("Sign Up Failed", userMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(
        "Missing Information",
        "Please enter both email and password"
      );
      return;
    }

    setIsLoading(true);
    try {
      console.log("Attempting to log in with:", { email }); // Don't log passwords
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("Login successful:", userCredential.user.uid);

      // Check if the user has admin privileges
      await refreshAdminStatus();

      // Register for push notifications after successful login
      await registerForNotifications();

      // No need for success alert as the app will navigate to the main screen
      // Alert.alert('Success', 'Welcome back!');
    } catch (error: any) {
      console.error("Login error:", error.code, error.message);

      // Use the helper function to get a user-friendly message
      const userMessage = getFirebaseAuthErrorMessage(error.code);
      Alert.alert("Login Failed", userMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoRow}>
        <DropLogo size={200} color={COLORS.RED} />
        <View style={{ marginLeft: 8, justifyContent: "center" }}>
          <Text style={styles.rideAlertsText}>RideAlerts</Text>
          <Text style={styles.yycText}>- YYC</Text>
        </View>
      </View>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!isLoading}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!isLoading}
      />

      {isLoading ? (
        <ActivityIndicator size="large" color={COLORS.BLUE} style={styles.loader} />
      ) : (
        <View style={styles.buttonContainer}>
          <Button title="Sign Up" color={COLORS.BLUE} onPress={handleSignUp} disabled={isLoading} />
          <Button title="Login" color={COLORS.BLUE} onPress={handleLogin} disabled={isLoading} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Styles remain the same
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 36,
    alignSelf: "center",
    display: "flex",
    justifyContent: "center",
    alignContent: "center",
    marginRight: 40

  },
  rideAlertsText: {
    fontFamily: 'Roboto_500Medium',
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.RED,
    // color: "#E53935",

  },
  yycText: {
    fontFamily: 'Roboto_500Medium',
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.BLUE,
    marginTop: 2,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
    color: "#333",
  },
  input: {
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: "white",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  loader: {
    marginTop: 20,
  },
  button: {
    color: COLORS.BLUE
  }
});

export default AuthScreen;
