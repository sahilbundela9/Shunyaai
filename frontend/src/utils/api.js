const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080"

let isRefreshing = false

export async function apiRequest(endpoint, method = "GET", body = null) {
  let accessToken = localStorage.getItem("accessToken")
  let refreshToken = localStorage.getItem("refreshToken")

  const headers = {
    "Content-Type": "application/json",
  }

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`
  }

  console.log("📤 API Request:", `${API_BASE}${endpoint}`)
  console.log("📤 Method:", method)
  console.log("📤 AccessToken exists:", !!accessToken)

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  })

  console.log("📥 Response status:", response.status)
  console.log("📥 Response ok:", response.ok)

  // =============================
  // AUTH ROUTES (NO REFRESH LOOP)
  // =============================
  if (endpoint.startsWith("/api/auth/")) {
    if (!response.ok) {
      const text = await response.text()
      console.error("❌ AUTH API failed:", text || "<empty string>")
      throw new Error(text || "Request failed")
    }

    return response.json()
  }

  // =============================
  // TOKEN EXPIRED → REFRESH
  // =============================
  if (response.status === 401 && refreshToken && !isRefreshing) {
    isRefreshing = true

    console.log("🔄 Access token expired. Trying refresh...")

    const refreshResponse = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(refreshToken),
    })

    if (refreshResponse.ok) {
      const data = await refreshResponse.json()

      localStorage.setItem("accessToken", data.accessToken)
      localStorage.setItem("refreshToken", data.refreshToken)
      localStorage.setItem("role", data.role)

      isRefreshing = false

      console.log("✅ Token refreshed successfully")

      return apiRequest(endpoint, method, body)
    } else {
      console.error("❌ Refresh token failed. Logging out...")

      localStorage.clear()
      window.location.href = "/"
      throw new Error("Session expired. Please login again.")
    }
  }

  // =============================
  // HANDLE NON-OK RESPONSES
  // =============================
  if (!response.ok) {
    const text = await response.text()
    console.error("❌ API failed response body:", text || "<empty string>")
    throw new Error(text || "Request failed")
  }

  // =============================
  // SAFE JSON PARSE
  // =============================
  const contentType = response.headers.get("content-type")

  if (contentType && contentType.includes("application/json")) {
    return response.json()
  }

  return response.text()
}