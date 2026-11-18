// one place that turns a thrown error into a response
const handleError = (res, error) => {
  if (error.name === "ValidationError") {
    return res.status(400).json({ error: Object.values(error.errors)[0]?.message || "Invalid data" });
  }
  if (error.name === "CastError") {
    return res.status(400).json({ error: "Invalid id" });
  }
  console.error("Controller error:", error.message);
  return res.status(500).json({ error: "Internal server error" });
};

module.exports = handleError;