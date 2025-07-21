const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

async function createSuperAdmin(email, password, name = 'Super Admin') {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Check if user already exists
    let user = await User.findOne({ email });
    
    if (user) {
      // User exists, just promote to super admin
      user.role = 'super_admin';
      await user.save();
      console.log(`✅ Existing user ${email} promoted to SUPER ADMIN!`);
    } else {
      // Create new user as super admin
      // Don't hash password here - let the pre-save hook handle it
      user = new User({
        name,
        email,
        password: password,
        role: 'super_admin',
        isActive: true
      });
      
      await user.save();
      console.log(`🚀 New SUPER ADMIN created: ${email}`);
    }
    
    console.log(`\nSuper Admin Details:`);
    console.log(`   ID: ${user._id}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Active: ${user.isActive}`);
    
    console.log(`\n⚡ Super Admin Privileges:`);
    console.log(`   ✅ All admin capabilities`);
    console.log(`   ✅ Delete other admins`);
    console.log(`   ✅ System-wide content management`);
    console.log(`   ✅ Access to /api/superadmin/* routes`);
    console.log(`   ✅ System cleanup and metrics`);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    await mongoose.disconnect();
  }
}

// Get arguments from command line
const email = process.argv[2];
const password = process.argv[3];
const name = process.argv[4];

if (!email || !password) {
  console.log('Usage: node create-superadmin.js <email> <password> [name]');
  console.log('Example: node create-superadmin.js owner@example.com mypassword "Site Owner"');
  process.exit(1);
}

createSuperAdmin(email, password, name);
