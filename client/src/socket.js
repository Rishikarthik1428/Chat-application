import { io } from "socket.io-client";

// Connect to the backend Socket.IO server
// In development: backend runs on port 5000
// In production: update this to your deployed backend URL
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const socket = io(BACKEND_URL);

export default socket;
