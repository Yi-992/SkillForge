const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5143";

const API_ENDPOINTS = {
  auth: `${API_BASE}/auth`,
  learning: `${API_BASE}/api/learning`,
  gaming: `${API_BASE}/api/gaming`,
  sports: `${API_BASE}/api/sports`,
  usersDashboard: `${API_BASE}/users/dashboard-stats`,
  usersProfile: `${API_BASE}/users/profile`,
  lessons: `${API_BASE}/api/lessons`,
  aiGenerateCourse: `${API_BASE}/api/ai/generate-course`,
  aiExtendCourse: `${API_BASE}/api/ai/extend-course`,
  aiGenerateText: `${API_BASE}/api/ai/generate`,
};

export { API_BASE, API_ENDPOINTS };
