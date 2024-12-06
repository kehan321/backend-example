import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();

// Middleware to parse incoming JSON requests
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

// Enable Cross-Origin Resource Sharing (CORS)
app.use(cors({ origin: "https://frontend-crud-xd40kpls6-kehan321s-projects.vercel.app" }));

// MongoDB connection setup
const connectToDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("Could not connect to MongoDB:", error);
  }
};

connectToDB();

// Define a User model for MongoDB
const User = mongoose.model("User", {
  name: String,
  age: Number,
  email: String,
  phone: String,
});

// Create - Add a new user
app.post("/users", async (req, res) => {
  try {
    const { name, age, email, phone } = req.body;

    // Create and save the new user to the database
    const newUser = new User({ name, age, email, phone });
    await newUser.save();
    res.status(201).json(newUser); // Respond with the newly created user
  } catch (err) {
    console.error("Error adding user:", err);
    res.status(500).send("Error adding user");
  }
});

// Read - Get all users
app.get("/users", async (req, res) => {
  try {
    const users = await User.find(); // Fetch all users from the database
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).send("Error fetching users");
  }
});

// Update - Update a user's details
app.put("/users/:id", async (req, res) => {
  try {
    const { name, age, email, phone } = req.body;

    // Update user details
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, age, email, phone },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).send("User not found");
    }
    res.json(updatedUser); // Respond with updated user
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).send("Error updating user");
  }
});

// Delete - Remove a user by ID
app.delete("/users/:id", async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).send("User not found");
    }
    res.json({ message: "User deleted successfully", deletedUser });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).send("Error deleting user");
  }
});

// Export the app for serverless deployment
export default app;
