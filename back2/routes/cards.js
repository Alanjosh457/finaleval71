const express=require("express")
const router=express.Router()
const Card=require("../Schemas/cards.schema")
const jwt=require("jsonwebtoken")
const env=require("dotenv")
env.config()


const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Authorization token required" });
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      res.status(403).json({ message: "Invalid token" });
    }
  };
  
  // Add a new card
  router.post("/add-card", authenticate, async (req, res) => {
    try {
      const { name, number, branch } = req.body;
      const newCard = new Card({
        name,
        number,
        branch,
        userId: req.user.id, // Link the card to the authenticated user
      });
      await newCard.save();
      res.status(200).json({ message: "Card added successfully", card: newCard });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Get all cards for the authenticated user
  router.get("/cards", authenticate, async (req, res) => {
    try {
      const cards = await Card.find({ userId: req.user.id });
      res.status(200).json(cards);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
module.exports = router; 