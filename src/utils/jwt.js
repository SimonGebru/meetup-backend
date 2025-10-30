import jwt from "jsonwebtoken";

const generateToken = (userId) => {
  return jwt.sign({ userId: userId.toString() }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error("Invalid token");
  }
};

export { generateToken, verifyToken };
