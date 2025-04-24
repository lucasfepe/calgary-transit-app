import { StyleSheet } from 'react-native';
export const styles = StyleSheet.create({
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 24,
        marginBottom: 16,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: '#f2f2f2',
        marginRight: 8,
    },
    submitButton: {
        backgroundColor: '#007AFF',
        marginLeft: 8,
    },
    disabledButton: {
        opacity: 0.6,
    },
    cancelButtonText: {
        color: '#333',
        fontWeight: '600',
    },
    submitButtonText: {
        color: 'white',
        fontWeight: '600',
    },
});
