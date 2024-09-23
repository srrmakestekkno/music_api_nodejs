const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
// const corsOptions = {
//     origin: 'http://localhost:3000', // Only allow requests from this origin
//     methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
//     allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
//        credentials: true
//   };

// allow multiple domains
// const allowedOrigins = ['http://localhost:3000', 'http://example.com'];
// const corsOptions = {
//   origin: function (origin, callback) {
//     if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   }
// };
// app.use(cors(corsOptions));

const app = express();

// using cores middleware
app.use(cors());

// middleware
app.use(express.json());

const JWT_SECRET_KEY = "secret123"; // must come from env variable

app.get("/", (req, res) => {
  res.send("Welcome to my node js API");
});

let users = [];

let music = [
  { id: 1, title: "The Machine", composer: "inconstantem", genre: "ambient" },
];

// Authentication middleware to authenticate JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authentication"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.sendStatus(401); //Unauthorized when no token

  jwt.verify(token, JWT_SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403); // Forbidden when token is invalid
    req.user = user; // Attach user data to the request object
    next(); // continue to the next middleware/route handler
  });
};

// api register
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;

  // does user already exist
  const existingUser = users.find((user) => user.username === username);
  if (existingUser)
    return res.status(400).json({ message: "User already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = { username, password: hashedPassword };
  users.push(newUser);

  res.status(201).json({ message: "User is registered successfully." });
});

// api login
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  const user = users.find((user) => user.username === username);
  if (!user) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid)
    return res.statys(400).json({ message: "Invalid credentials" });

  const token = jwt.sign({ username: user.username }, JWT_SECRET_KEY, {
    expire: "1h",
  });
  req.json({ token });
});

app.get("/music", authenticateToken, (req, res) => {
  res.json(music[0]);
});

app.post("/music", (req, res) => {
  const newMusic = req.body;
  newMusic.id = music.length + 1; //Generating a simple ID
  music.push(newMusic);
  res.status(201).json(newMusic);
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
