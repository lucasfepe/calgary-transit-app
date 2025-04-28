/**
 * Local development configuration - not checked into version control
 * This file is referenced by config.js for local development environments
 */

// Define an identifier for your current development machine
// This can be any string you want to identify your current computer
const CURRENT_DEV_MACHINE = 'lucas-pc'; // Change this to something that identifies your machine

// Define the IP addresses for all development machines
// The keys should match potential CURRENT_DEV_MACHINE values
const DEV_MACHINE_IPS = {
  'lucas-pc': '1x.x.x.x', // Replace with your actual local IP address
  'my-desktop': 'x.x.x.x', // Add other dev machines if needed
  'work-computer': 'x.x.x.x',
  // Add more machines as needed
};

module.exports = {
  CURRENT_DEV_MACHINE,
  DEV_MACHINE_IPS,
};