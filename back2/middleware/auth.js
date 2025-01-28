const jwt = require("jsonwebtoken");
const env = require("dotenv");
env.config();

const isLoggedIn = (req, res, next) => {
  const token = req.headers.authorization;
  
  // Debug log: Check if the token is being received correctly
  console.log("Token received:", token);

  if (token) {
    // Remove the 'Bearer ' prefix if it's present
    const actualToken = token.split(" ")[1]; // This assumes the token starts with "Bearer "
    
    // Debug log: Verify the token being used
    console.log("Token being verified:", actualToken);

    jwt.verify(actualToken, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.log("Error verifying token:", err);
        return res.status(401).json({ message: "Invalid token" });
      } else {
        // Debug log: Log the decoded token
        console.log("Decoded token:", decoded);
        req.user = decoded; // Add decoded data to the request
        next();
      }
    });
  } else {
    console.log("No token provided");
    res.status(401).json({ message: "No token provided" });
  }
};

module.exports = isLoggedIn;
