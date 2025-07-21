const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function makeSuperAdmin(email) {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const user = await User.findOneAndUpdate(
      { email: email },
      { role: 'super_admin' },
      { new: true }
    );
    
    if (user) {
      console.log(`🚀 User ${email} is now a SUPER ADMIN!`);
      console.log(`User details:`, {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      });
      console.log(`\n⚡ Super Admin Privileges:`);
      console.log(`   ✅ Full admin capabilities`);
      console.log(`   ✅ Delete other admins`);
      console.log(`   ✅ System-wide content management`);
      console.log(`   ✅ Access to /super-admin routes`);
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
  console.log('Usage: node make-superadmin.js <email>');
  console.log('Example: node make-superadmin.js owner@example.com');
  process.exit(1);
}

makeSuperAdmin(email);
