import { COLORS } from '@/constants';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  refreshButtonContainer: {
    marginTop: 10,
    width: 200, 
    padingRight: 30,
    paddingLeft: 10,
    marginRight:10
  },
  
  button: {
    width: '100%', // Ensure all buttons have the same width
  },
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  adminButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 10,
  },
  errorText: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    backgroundColor: COLORS.RED,
    padding: 10,
    color: 'white',
    borderRadius: 5,
  },
  mapControlButton: {
    color: COLORS.BLUE
  },

  // Add to existing styles
  loadingContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -25 }],
    zIndex: 1,
  },
  refreshButton: {
    position: 'absolute',
    top: 100, // Adjust as needed
    right: 10,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 8,
    borderRadius: 5,
  },
  waitingText: {
    color: COLORS.RED,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
  },
  loadingOverlay: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 5,
  },
  loadingText: {
    color: 'white',
    fontSize: 14,
  },
  // Add these to your styles.ts file
  menuButton: {
    position: 'absolute',
    top: 90,
    right: 10,
    zIndex: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    // For iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    // For Android, use a more subtle elevation or none at all
    elevation: 0,
    // Add a subtle border instead of shadow for definition
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    // Match the border radius of your location button
    borderRadius: 2,
  },
  menuButtonBurger: {

    backgroundColor: 'rgba(255, 255, 255, 0)',


  },
  controlsPanel: {
    position: 'absolute',
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    alignItems: 'center',
    top: 60, // Below the menu button
    right: 10,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    zIndex: 9,
    width: 250, // Adjust as needed
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },


});

export const clusterStyles = StyleSheet.create({
  clusterContainer: {
    // backgroundColor: 'rgba(255, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    // padding: 5,
    // borderRadius: '50%',
    // Add shadow for better visibility
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  clusterText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
});
export const radStyles = StyleSheet.create({
  findRoutesButton: {
    marginTop: 5,
    width: '100%', // Make button take full width of container
  },
  
  button: {
    width: '100%', // Ensure all buttons have the same width
  },
  selectorContainer: {
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 5,
    width: 200
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  pickerContainer: {
    marginBottom: 10,
  },
  picker: {
    height: 40,
    width: '100%',
  },
  
  // Keep the rest of the styles the same
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  routeItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  routeName: {
    fontSize: 16,
  },
  noRoutesText: {
    textAlign: 'center',
    marginVertical: 20,
    fontSize: 16,
  },
});
