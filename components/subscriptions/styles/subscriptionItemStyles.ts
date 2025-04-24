import { StyleSheet } from 'react-native';
export const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        borderRadius: 12,
        marginBottom: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    routeInfo: {
        flex: 1,
    },
    routeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    routeId: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
        marginRight: 8,
    },
    actionButtons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    editButton: {
        padding: 4,
        marginRight: 8,
    },
    deleteButton: {
        padding: 4,
    },
    stopId: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    timesContainer: {
        marginTop: 8,
    },
    timeItem: {
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        padding: 8,
        marginBottom: 4,
    },
    weekdays: {
        fontSize: 14,
        fontWeight: '500',
        color: '#555',
    },
    timeRange: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    inactiveContainer: {
        opacity: 0.7,
        borderColor: '#ccc',
    },
    inactiveText: {
        color: '#888',
    },
    inactiveTimeItem: {
        backgroundColor: '#f0f0f0',
    },
    statusBadge: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        backgroundColor: '#FF9500',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        zIndex: 1,
    },
    statusText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
});