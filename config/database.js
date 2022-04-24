const mongoose = require("mongoose")
//Connect to DB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_CONNECT, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    })
    console.log("Successfully connected to database")
  } catch (error) {
    console.log("database connection failed. exiting now...")
    console.log(error)
    process.exit(1)
  }
}
exports.connectDB = connectDB
