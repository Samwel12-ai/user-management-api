const errorHandler = (err, req, res, next) => {
  // Prisma: unique constraint (email already exists)
  if (err.code === "P2002") {
    return res.status(409).json({ message: "Email already exists" });
  }

  // Prisma: record not found (update / delete)
  if (err.code === "P2025") {
    return res.status(404).json({ message: "User not found" });
  }

  // Broken JSON body
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Invalid JSON body" });
  }

  const status = err.status || err.statusCode || 500;

  if (status >= 500) {
    console.error(err); // the full error stays in the server logs only
  }

  res.status(status).json({
    message: status >= 500 ? "Something went wrong" : err.message,
  });
};

module.exports = errorHandler;
