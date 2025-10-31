import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Ange en token",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.userId;

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Ogiltig token" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token har gått ut" });
    }
    return res.status(401).json({ error: "Auth failed" });
  }
};
export { authMiddleware };
