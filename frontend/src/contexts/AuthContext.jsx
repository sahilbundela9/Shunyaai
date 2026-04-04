import { createContext, useState, useEffect, useContext } from "react"

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken")
    const refreshToken = localStorage.getItem("refreshToken")
    const role = localStorage.getItem("role")

    if (accessToken) {
      setUser({
        accessToken,
        refreshToken,
        role,
      })
    }
  }, [])

  const login = (data) => {
    localStorage.setItem("accessToken", data.accessToken)
    localStorage.setItem("refreshToken", data.refreshToken)
    localStorage.setItem("role", data.role)

    setUser({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      role: data.role,
    })
  }

  const logout = () => {
    localStorage.clear()
    setUser(null)
    window.location.href = "/"
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

// ✅ THIS IS WHAT SIDEBAR NEEDS
export function useAuth() {
  return useContext(AuthContext)
}