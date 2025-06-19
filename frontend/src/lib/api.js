import { axiosInstacne } from "./axios.js";
export const signup = async (signupData) => {
  const response = await axiosInstacne.post("/auth/signup", signupData);
  return response.data;
};
export const login = async (loginData) => {
  const response = await axiosInstacne.post("/auth/login", loginData);
  return response.data;
};
export const logout = async () => {
  const response = await axiosInstacne.post("/auth/logout");
  return response.data;
};

export const getAuthUser = async () => {
  try {
    const res = await axiosInstacne.get("/auth/me");
    return res.data;
  } catch (error) {
    console.log("Error fetching auth user:", error);
    return null;
  }
};

export const completeOnboarding = async (userData) => {
  const response = await axiosInstacne.post("/auth/onboarding", userData);
  return response.data;
};

export async function getUserFriends() {
  const response = await axiosInstacne.get("/users/friends");
  return response.data;
}

export async function getRecommandedUsers() {
  const response = await axiosInstacne.get("/users");
  return response.data;
}

export async function getOutgoingFriendReqs() {
  const response = await axiosInstacne.get("/users/outgoing-friend-request");
  return response.data;
}

export async function sendFriendRequest(userId) {
  const response = await axiosInstacne.post(`/users/friend-request/${userId}`);
  return response.data;
}

export async function getFriendRequests() {
  const response = await axiosInstacne.get("/users/friend-request");
  return response.data;
}

export async function acceptFriendRequest(requestId) {
  const response = await axiosInstacne.put(
    `/users/friend-request/${requestId}/accept`
  );
  return response.data;
}

export async function getStreanToken() {
  const response = await axiosInstacne.get("/chat/token");
  return response.data;
}

export async function getVideoToken() {
  try {
    console.log("Fetching video token...");
    const response = await axiosInstacne.get("/chat/video-token");
    console.log("Video token response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching video token:", error);
    throw error;
  }
}
