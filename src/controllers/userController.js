const prisma = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const publicFields = { id: true, name: true, email: true };

const getUsers = async (req, res) => {
  const users = await prisma.user.findMany({ select: publicFields });
  res.json(users);
};

const getUserById = async (req, res) => {
  const id = parseInt(req.params.id, 10);

  const user = await prisma.user.findUnique({
    where: { id },
    select: publicFields,
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(user);
};

// Register
const createUser = async (req, res) => {
  const { name, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  // If the email already exists, Prisma throws P2002 -> errorHandler returns 409
  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword },
    select: publicFields,
  });

  res.status(201).json({ message: "User created successfully", user });
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  const passwordMatch = user
    ? await bcrypt.compare(password, user.password)
    : false;

  // Same message for both cases, so nobody can find out which emails exist
  if (!user || !passwordMatch) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );

  res.json({ message: "Login successful", token });
};

const updateUser = async (req, res) => {
  const id = parseInt(req.params.id, 10);

  // A user can update only his own account. ADMIN can update anyone.
  if (req.user.id !== id && req.user.role !== "ADMIN") {
    return res
      .status(403)
      .json({ message: "You can only update your own account" });
  }

  const { name, email } = req.body;

  // Missing id -> P2025 (404), duplicate email -> P2002 (409), handled in errorHandler
  const user = await prisma.user.update({
    where: { id },
    data: { name, email },
    select: publicFields,
  });

  res.json({ message: "User updated successfully", user });
};

const deleteUser = async (req, res) => {
  const id = parseInt(req.params.id, 10);

  await prisma.user.delete({ where: { id } });

  res.json({ message: "User deleted successfully" });
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  loginUser,
};
