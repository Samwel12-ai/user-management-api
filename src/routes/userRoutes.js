const express = require("express");

const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  loginUser,
} = require("../controllers/userController");

const authenticateToken = require("../middleware/authMiddleware");
const authorizeRole = require("../middleware/roleMiddleware");
const validate = require("../middleware/validationMiddleware");

const {
  registerValidation,
  updateValidation,
  loginValidation,
  idValidation,
} = require("../validators/userValidator");

const router = express.Router();

// Public routes
router.post("/login", loginValidation, validate, loginUser);
router.post("/", registerValidation, validate, createUser);

// Protected routes
router.get("/", authenticateToken, getUsers);
router.get("/:id", authenticateToken, idValidation, validate, getUserById);

router.put(
  "/:id",
  authenticateToken,
  idValidation,
  updateValidation,
  validate,
  updateUser,
);

router.delete(
  "/:id",
  authenticateToken,
  authorizeRole("ADMIN"),
  idValidation,
  validate,
  deleteUser,
);

module.exports = router;
