const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const migrateStudentFields = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const result = await User.updateMany(
      { role: 'STUDENT' },
      { 
        $set: { 
          studentSkills: [],
          studentDomain: ''
        } 
      }
    );

    console.log(`Updated ${result.modifiedCount} student documents`);
    console.log('Migration completed successfully!');
    
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
};

migrateStudentFields();
