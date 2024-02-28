const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: ['http://localhost:5173'], credentials: true }));
app.use(express.json());

// MongoDB Connection URL
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    // Connect to MongoDB
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('l2assignment7');
    const userCollection = db.collection('users');
    const clothesCollection = db.collection('clothes');
    const donatesCollection = db.collection('donates');
    const aboutUsCollection = db.collection('aboutUs');

    // User Registration
    app.post('/api/v1/register', async (req, res) => {
      const { name, email, password } = req.body;

      // Check if email already exists
      const existingUser = await userCollection.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User already exists',
        });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      const date = new Date();

      const userData = {
        name,
        email,
        password: hashedPassword,
        timestamp: date,
        isDeleted: false,
      };
      //   Insert user into the database
      const result = await userCollection.insertOne(userData);

      // Generate JWT token
      const token = jwt.sign({ email }, process.env.JWT_SECRET, {
        expiresIn: process.env.EXPIRES_IN,
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result,
        token,
      });
    });

    // User Login
    app.post('/api/v1/login', async (req, res) => {
      const { email, password } = req.body;

      // Find user by email
      const user = await userCollection.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Compare hashed password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Generate JWT token
      const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
        expiresIn: process.env.EXPIRES_IN,
      });

      res.json({
        success: true,
        message: 'Login successful',
        token,
      });
    });

    // Add new clothes to Clothes collection
    app.post('/api/v1/create-clothes', async (req, res) => {
      // console.log(req.body);
      const user = await userCollection.findOne({ email: req.body.email });
      // check if user is already existing or not
      if (!user || user.isDeleted === true) {
        return res.status(401).json({
          message: `This User ${req.body.email} is not exists in db`,
        });
      }
      // Split sizes string into an array
      const sizes = req.body.data.size
        .split(',')
        .map((size) => size.trim().toLowerCase());

      const clothesData = {
        ...req.body.data,
        size: sizes,
        userId: user._id,
      };

      // Insert clothes data into the database
      const result = await clothesCollection.insertOne(clothesData);

      res.json({
        success: true,
        status: 201,
        message: 'Data created successfully',
        data: result,
      });
    });

    // get All Clothes
    app.get('/api/v1/clothes', async (req, res) => {
      const result = await clothesCollection.find().toArray();
      res.json({
        success: true,
        status: 200,
        message: 'All Data Retrieved successfully',
        data: result,
      });
    });
    // get All Clothes by user Id
    app.get('/api/v1/clothes-by-user/:email', async (req, res) => {
      const { email } = req.params;
      // Check if email already exists
      try {
        const existingUser = await userCollection.findOne({ email });
        if (!existingUser) {
          return res.status(400).json({
            success: false,
            message: 'This user not exists',
          });
        }
        const result = await clothesCollection
          .find({ userId: existingUser._id })
          .toArray();
        res.json({
          success: true,
          status: 200,
          message: 'All Data Retrieved successfully',
          data: result,
        });
      } catch (error) {
        console.error('Error fetching clothes data:', error);
        res.status(500).json({
          success: false,
          status: 500,
          message: 'Internal Server Error',
        });
      }
    });

    //get single Clothes Data
    app.get('/api/v1/clothes/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const result = await clothesCollection.findOne({
          _id: new ObjectId(id),
        });

        if (!result) {
          return res.status(404).json({
            success: false,
            status: 404,
            message: 'Clothes data not found',
          });
        }

        res.json({
          success: true,
          status: 200,
          message: 'Data Retrieved successfully',
          data: result,
        });
      } catch (error) {
        console.error('Error fetching clothes data:', error);
        res.status(500).json({
          success: false,
          status: 500,
          message: 'Internal Server Error',
        });
      }
    });
    // update clothes data
    app.put('/api/v1/update-clothes/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const newSize = req.body.size
          .split(',')
          .map((size) => size.trim().toLowerCase());

        // Retrieve the existing clothes data
        const existingClothes = await clothesCollection.findOne({
          _id: new ObjectId(id),
        });
        if (!existingClothes) {
          return res.status(404).json({
            success: false,
            status: 404,
            message: 'Clothes data not found',
          });
        }
        // Filter out duplicate sizes from the new sizes array
        const uniqueNewSizes = newSize.filter(
          (size) => !existingClothes.size.includes(size)
        );

        // Update clothes data with the new values
        const updatedClothesData = {
          image: req.body.image,
          category: req.body.category,
          title: req.body.title,
          description: req.body.description,
          size: [...existingClothes.size, ...uniqueNewSizes],
        };
        console.log(updatedClothesData);
        // Update clothes data in the database
        const result = await clothesCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedClothesData },
          { upsert: true }
        );

        res.json({
          success: true,
          status: 200,
          message: 'Clothes data updated successfully',
          data: result,
        });
      } catch (error) {
        console.error('Error updating clothes data:', error);
        res.status(500).json({
          success: false,
          status: 500,
          message: 'Internal Server Error',
        });
      }
    });

    // Delete clothes data
    app.delete('/api/v1/delete-clothes/:id', async (req, res) => {
      try {
        const { id } = req.params;

        // Check if the clothes item exists
        const existingClothes = await clothesCollection.findOne({
          _id: new ObjectId(id),
        });
        if (!existingClothes) {
          return res.status(404).json({
            success: false,
            status: 404,
            message: 'Clothes data not found',
          });
        }

        // Delete the clothes item from the database
        const result = await clothesCollection.deleteOne({
          _id: new ObjectId(id),
        });

        res.json({
          success: true,
          status: 200,
          message: 'Clothes data deleted successfully',
          data: result,
        });
      } catch (error) {
        console.error('Error deleting clothes data:', error);
        res.status(500).json({
          success: false,
          status: 500,
          message: 'Internal Server Error',
        });
      }
    });

    // get all about us data
    app.get('/api/v1/aboutUs', async (req, res) => {
      const result = await aboutUsCollection.find().toArray();
      res.json({
        success: true,
        status: 200,
        message: 'All Data Retrieved successfully',
        data: result,
      });
    });

    // Add new Donate to Donates collection
    app.post('/api/v1/add-donate', async (req, res) => {
      // console.log(req.body);
      const email = req.body.email;
      const user = await userCollection.findOne({ email });
      // check if user is already existing or not
      if (!user || user.isDeleted === true) {
        return res.status(401).json({
          message: `This User ${req.body.email} is not exists in db`,
        });
      }
      const donateData = {
        email,
        amount: req.body.amount,
        userId: user._id,
      };

      // Insert clothes data into the database
      const result = await donatesCollection.insertOne(donateData);

      res.json({
        success: true,
        status: 201,
        message: 'Data created successfully',
        data: result,
      });
    });

    // Start the server
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } finally {
  }
}

run().catch(console.dir);

// Test route
app.get('/', (req, res) => {
  const serverStatus = {
    message: 'Server is running smoothly',
    timestamp: new Date(),
  };
  res.json(serverStatus);
});
