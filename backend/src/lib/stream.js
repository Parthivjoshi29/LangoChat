import { StreamChat } from "stream-chat";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

if (!apiKey || !apiSecret) {
  console.error("Stream API or Secret key is missing");
  process.exit(1);
}

const streamClient = StreamChat.getInstance(apiKey, apiSecret);

export const upsertStreamUser = async (userData) => {
  try {
    await streamClient.upsertUsers([userData]);
    return userData;
  } catch (error) {
    console.log("Error creating Stream user", error);
    throw error;
  }
};

export const generateStreamToken = (userId) => {
  try {
    const userIdStr = userId.toString();
    return streamClient.createToken(userIdStr);
  } catch (error) {
    console.error("Error generating Stream token", error);
    throw error;
  }
};

// Generate video token - Stream Video uses the same token format as Stream Chat
export const generateVideoToken = (userId) => {
  try {
    const userIdStr = userId.toString();

    // Stream Video uses the same token generation as Stream Chat
    // The token is valid for both chat and video functionality
    return streamClient.createToken(userIdStr);
  } catch (error) {
    console.error("Error generating video token", error);
    throw error;
  }
};
