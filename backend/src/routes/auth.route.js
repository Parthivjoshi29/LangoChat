import express from "express";
import {
  login,
  logout,
  signup,
  onboard,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";


const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

router.post("/onboarding", protectRoute, onboard);


// it is for testing that you are authtenticated
router.get("/me", protectRoute, (req, res) => {
  res.status(200).json({ sucess: true, user: req.user });
}); // it wont show you password becuse in the protecr route we are not sending the password "const user = await User.findById(decoded.userId).select("-password");"

export default router;
