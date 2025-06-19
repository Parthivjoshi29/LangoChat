import axios from "axios";

const BASE_URL =
  import.meta.env.MODE === "development" ? "http://localhost:5000/api" : "/api";

export const axiosInstacne = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send the cookies with the request
});
