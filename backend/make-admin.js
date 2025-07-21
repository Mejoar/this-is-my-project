const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function makeUserAdmin(email) {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const user = await User.findOneAndUpdate(
      { email: email },
      { role: 'admin' },
      { new: true }
    );
    
    if (user) {
      console.log(`✅ User ${email} is now an admin!`);
      console.log(`User details:`, {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      });
    } else {
      console.log(`❌ User with email ${email} not found`);
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    await mongoose.disconnect();
  }
}

// Get email from command line argument
const email = process.argv[2];
if (!email) {
  console.log('Usage: node make-admin.js <email>');
  console.log('Example: node make-admin.js user@example.com');
  process.exit(1);
}

makeUserAdmin(email);
