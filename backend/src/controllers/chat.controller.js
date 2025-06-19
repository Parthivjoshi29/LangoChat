import { generateStreamToken, generateVideoToken } from "../lib/stream.js";

export async function getStreanToken(req, res) {
  try {
    const token = generateStreamToken(req.user.id);

    res.status(200).json({ token });
  } catch (error) {
    console.log("Error in getStreanToken", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getVideoToken(req, res) {
  try {
    const token = generateVideoToken(req.user.id);

    res.status(200).json({ token });
  } catch (error) {
    console.log("Error in getVideoToken", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
