// Simple test to see if the contact controller can be properly required
const contactController = require('./controllers/contactController');

console.log('Contact Controller:', contactController);
console.log('submitContactForm:', contactController.submitContactForm);
console.log('submitUserContactForm:', contactController.submitUserContactForm);