import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "321@uob_lyV";

// Generate JWT token
export function generateToken(payload) {
  try {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
  } catch (error) {
    console.error("Error generating token:", error);
    return null;
  }
}

// Verify JWT token
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error("Error verifying token:", error);
    return null;
  }
}

// Hash password dengan bcrypt
export async function hashPassword(password) {
  try {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    console.error("Error hashing password:", error);
    return null;
  }
}

// Compare password dengan hash
export async function comparePassword(password, hash) {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.error("Error comparing password:", error);
    return false;
  }
}
