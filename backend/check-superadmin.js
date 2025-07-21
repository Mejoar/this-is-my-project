require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function checkSuperAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const email = 'mejoarwachira@gmail.com';
    console.log(`\nLooking for user with email: ${email}`);
    
    const user = await User.findOne({ email });
    
    if (user) {
      console.log('✅ User found!');
      console.log(`ID: ${user._id}`);
      console.log(`Name: ${user.name}`);
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);
      console.log(`Created: ${user.createdAt}`);
      console.log(`Email Verified: ${user.emailVerified}`);
    } else {
      console.log('❌ User not found');
      
      // Let's check if there are any users at all
      const totalUsers = await User.countDocuments();
      console.log(`\nTotal users in database: ${totalUsers}`);
      
      if (totalUsers > 0) {
        console.log('\nFirst few users:');
        const users = await User.find().limit(3).select('email name role');
        users.forEach(u => {
          console.log(`- ${u.email} (${u.name}) - ${u.role}`);
        });
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

checkSuperAdmin();
