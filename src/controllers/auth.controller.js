const { User } = require("../model/auth.model.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

export const register = async (req, res) => {
  try {
    const { username, password, email } = req.body;

    if (!username || !password || !email)
      return res.status(400).json({ error: "Missing fields" });

    const existingUser = await User.findOne({ username });
    if (existingUser)
      return res.status(400).json({ error: "Username already exists" });

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({ username, email, password: passwordHash });
    res.json({ message: "User registered", username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    console.log(req.body);
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "Missing fields" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User doesn't exist!" });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid)
      return res.status(400).json({ error: "Invalid credentials!" });
    console.log("Inal: ", process.env.JWT_SECRET);
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ token, userId: user._id, username: user.username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const userId = req.userId;
    console.log("My user is", userId);
    const users = await User.find({}, "email _id");

    const allUsers = users
      .filter((u) => u._id.toString() !== userId)
      .map((u) => ({
        label: u.email,
        value: u._id,
      }));

    res.json({ users: allUsers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
