const express = require('express');
const session = require('express-session');
const path = require('path');
const mongoose = require('mongoose');

const app = express();

// Set the path for static files (CSS, images, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Enable parsing of URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Configure the session middleware
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
}));

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/test')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// Define the user schema
const userSchema = new mongoose.Schema({
  username: String,
  password: String
});

const User = mongoose.model('User', userSchema);

// Define a route to serve the login page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Handle the login form submission
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find the user in the database
    const user = await User.findOne({ username });

    if (user) {
      // Check if the password matches
      if (user.password === password) {
        // Successful login
        req.session.isLoggedIn = true; // Set the session property
        res.redirect('/products'); // Redirect to the protected route
      } else {
        // Incorrect password
        res.send('Invalid credentials');
      }
    } else {
      // User not found
      res.send('User not found');
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.send('An error occurred during login');
  }
});

// Define a route to serve the sign-up page
app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

// Handle the sign-up form submission
app.post('/signup', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.send('User already exists');
    }

    // Create a new user
    const newUser = new User({ username, password });
    await newUser.save();

    // Redirect to the login page
    res.redirect('/login');
  } catch (error) {
    console.error('Error during sign-up:', error);
    res.send('An error occurred during sign-up');
  }
});


// Add a new route for the protected page (products)
app.get('/products', (req, res) => {
  if (req.session.isLoggedIn) {
    res.sendFile(path.join(__dirname, 'public', 'products.html')); // Serve the products.html file
  } else {
    res.redirect('/login'); // Redirect to the login page if not logged in
  }
});

// Define a route to serve the cart page
app.get('/cart', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'cart.html'));
});

// Add a new route for logout
app.get('/logout', (req, res) => {
  // Clear the session and redirect to the login page
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    res.redirect('/login');
  });
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
