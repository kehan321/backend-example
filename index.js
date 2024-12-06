import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
app.use(cors());

// MongoDB connection
const connectToDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("Could not connect to MongoDB:", error);
  }
};

connectToDB();

// User model
const User = mongoose.model("User", {
  name: String,
  age: Number,
  email: String,
  phone: String,
});

// Routes
app.post("/users", async (req, res) => {
  try {
    const { name, age, email, phone } = req.body;
    const newUser = new User({ name, age, email, phone });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).send("Error adding user");
  }
});

app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).send("Error fetching users");
  }
});

app.put("/users/:id", async (req, res) => {
  try {
    const { name, age, email, phone } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, age, email, phone },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).send("User not found");
    }
    res.json(updatedUser);
  } catch (err) {
    res.status(500).send("Error updating user");
  }
});

app.delete("/users/:id", async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).send("User not found");
    }
    res.json({ message: "User deleted successfully", deletedUser });
  } catch (err) {
    res.status(500).send("Error deleting user");
  }
});

// Export the app as a serverless function
export default app;
