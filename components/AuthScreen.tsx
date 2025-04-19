import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from '@firebase/auth';
import { auth } from '../firebaseConfig';
import { useAuth } from '../contexts/authContext';
import { makeApiCall } from '@/services/auth'; 

const AuthScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { refreshAdminStatus } = useAuth();

    const handleSignUp = async () => {
        if (!email || !password) {
            Alert.alert('Please enter both email and password');
            return;
        }

        setIsLoading(true);
        try {
            console.log('Attempting to sign up with:', { email }); // Don't log passwords
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            console.log('Sign up successful:', userCredential.user.uid);
            await makeApiCall<any>(
                '/users/register', 
                'POST', 
                {
                    uid: userCredential.user.uid,
                    email: userCredential.user.email,
                    displayName: userCredential.user.displayName || email.split('@')[0] // Fallback display name
                }
            );
            // Check if the user has admin privileges
            await refreshAdminStatus();
            
            Alert.alert('Success', 'User registered successfully!');
            // No need to navigate - the AppNavigator will handle this based on auth state
        } catch (error: any) {
            console.error('Sign up error:', error.code, error.message);
            Alert.alert('Sign Up Error', `${error.code}\n${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Please enter both email and password');
            return;
        }

        setIsLoading(true);
        try {
            console.log('Attempting to log in with:', { email }); // Don't log passwords
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log('Login successful:', userCredential.user.uid);
            
            // Check if the user has admin privileges
            await refreshAdminStatus();
            
            Alert.alert('Success', 'User logged in successfully!');
            // No need to navigate - the AppNavigator will handle this based on auth state
        } catch (error: any) {
            console.error('Login error:', error.code, error.message);
            Alert.alert('Login Error', `${error.code}\n${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Calgary Transit</Text>
            
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
                <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
            ) : (
                <View style={styles.buttonContainer}>
                    <Button title="Sign Up" onPress={handleSignUp} disabled={isLoading} />
                    <Button title="Login" onPress={handleLogin} disabled={isLoading} />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 30,
        color: '#333',
    },
    input: {
        height: 50,
        borderColor: '#ddd',
        borderWidth: 1,
        marginBottom: 15,
        paddingHorizontal: 15,
        borderRadius: 8,
        backgroundColor: 'white',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
    },
    loader: {
        marginTop: 20,
    },
});

export default AuthScreen;