import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const app = express();

// Middleware to parse JSON requests
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

// Enable Cross-Origin Resource Sharing (CORS)
app.use(cors());

// MongoDB connection setup with pooling
const connectToDB = async () => {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        poolSize: 5, // MongoDB connection pool size
        serverSelectionTimeoutMS: 5000, // Timeout for MongoDB server selection
        connectTimeoutMS: 10000, // Timeout for establishing a connection
      });
      console.log("MongoDB connected successfully");
    } catch (error) {
      console.error("Could not connect to MongoDB:", error);
    }
  };
  

connectToDB();

// Define a simple To-Do model for MongoDB
const Todo = mongoose.model("Todo", {
  title: String,
  completed: Boolean,
});

// Create - Add a new To-Do item
app.post("/todos", async (req, res) => {
  try {
    const { title, completed } = req.body;
    const newTodo = new Todo({ title, completed: false });
    await newTodo.save();
    res.status(201).json(newTodo);
  } catch (err) {
    console.error("Error adding To-Do item:", err);
    res.status(500).send("Error adding To-Do item");
  }
});

// Read - Get all To-Do items
app.get("/todos", async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;  // Default to page 1
      const limit = parseInt(req.query.limit) || 10; // Default to 10 results per page
      const todos = await Todo.find()
        .skip((page - 1) * limit)  // Skip the results of previous pages
        .limit(limit);  // Limit the number of results per page
  
      res.json(todos);
    } catch (err) {
      console.error("Error fetching To-Do items:", err);
      res.status(500).send("Error fetching To-Do items");
    }
  });
  

// Update - Update a To-Do item
app.put("/todos/:id", async (req, res) => {
  try {
    const { title, completed } = req.body;
    const updatedTodo = await Todo.findByIdAndUpdate(
      req.params.id,
      { title, completed },
      { new: true }
    );
    if (!updatedTodo) {
      return res.status(404).send("To-Do item not found");
    }
    res.json(updatedTodo);
  } catch (err) {
    console.error("Error updating To-Do item:", err);
    res.status(500).send("Error updating To-Do item");
  }
});

// Delete - Remove a To-Do item by ID
app.delete("/todos/:id", async (req, res) => {
  try {
    const deletedTodo = await Todo.findByIdAndDelete(req.params.id);
    if (!deletedTodo) {
      return res.status(404).send("To-Do item not found");
    }
    res.json({ message: "To-Do item deleted successfully", deletedTodo });
  } catch (err) {
    console.error("Error deleting To-Do item:", err);
    res.status(500).send("Error deleting To-Do item");
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
