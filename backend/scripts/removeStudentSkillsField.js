const mongoose = require("../lib/mongoose");
const User = require('../models/User');
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

const removeStudentSkillsField = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const result = await User.updateMany(
      { role: 'STUDENT' },
      { 
        $unset: { 
          skills: ""
        } 
      }
    );

    console.log(`Updated ${result.modifiedCount} student documents`);
    console.log('Removed skills field from all students');
    console.log('Migration completed successfully!');
    
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
};

removeStudentSkillsField();
