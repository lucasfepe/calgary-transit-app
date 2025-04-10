// components/AuthScreen.tsx
import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Define the navigation types
type RootStackParamList = {
    Auth: undefined;
    Map: undefined;
};

type AuthScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Auth'>;

interface AuthScreenProps {
    navigation: AuthScreenNavigationProp;
}

const AuthScreen = ({ navigation }: AuthScreenProps) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSignUp = async () => {
        if (!email || !password) {
            alert('Please enter both email and password');
            return;
        }

        try {
            console.log('Attempting to sign up with:', { email }); // Don't log passwords
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            console.log('Sign up successful:', userCredential.user.uid);
            alert('User registered successfully!');
            navigation.navigate('Map'); // Changed from replace to navigate
        } catch (error: any) {
            console.error('Sign up error:', error.code, error.message);
            alert(`Sign up error: ${error.code}\n${error.message}`);
        }
    };

    const handleLogin = async () => {
        if (!email || !password) {
            alert('Please enter both email and password');
            return;
        }

        try {
            console.log('Attempting to log in with:', { email }); // Don't log passwords
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log('Login successful:', userCredential.user.uid);
            alert('User logged in successfully!');
            navigation.navigate('Map'); // Changed from replace to navigate
        } catch (error: any) {
            console.error('Login error:', error.code, error.message);
            alert(`Login error: ${error.code}\n${error.message}`);
        }
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <View style={styles.buttonContainer}>
                <Button title="Sign Up" onPress={handleSignUp} />
                <Button title="Login" onPress={handleLogin} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 10,
    },
});

export default AuthScreen;