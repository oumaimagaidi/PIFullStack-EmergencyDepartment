import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const authenticateToken = (req, res, next) => {
  // Try to get the token from cookies first, then check Authorization header
  const token = req.cookies?.token || req.header("Authorization")?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Accès refusé, aucun token fourni" });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; // Attach user data to request object
    next();
  } catch (error) {
    return res.status(403).json({ message: "Token invalide", error });
  }
};
export const authorize = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Accès interdit : rôle non autorisé" });
    }
    next();
  };
};
