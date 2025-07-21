const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// User schema (simplified version of what you have)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'super_admin'], default: 'admin' },
  profileImage: { type: String, default: '' }
});

const User = mongoose.model('User', userSchema);

async function resetPassword() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // The email of the user whose password you want to reset
    const email = 'mejoarwachira@gmail.com';
    
    // The new password you want to set
    const newPassword = 'newpassword123'; // Change this to your desired password

    // Find the user
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found');
      return;
    }

    console.log('User found:', { id: user._id, name: user.name, email: user.email, role: user.role });

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the user's password
    await User.findByIdAndUpdate(user._id, { password: hashedPassword });

    console.log('Password updated successfully!');
    console.log('New password:', newPassword);
    console.log('You can now log in with this password.');

  } catch (error) {
    console.error('Error resetting password:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

resetPassword();
