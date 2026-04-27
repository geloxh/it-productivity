import { createContext, useContext, useEffect, useState } from "react";
import { authApi } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(undefined) // undefined = loading

    useEffect(() => {
        authApi.me()
            .then(data => setUser(data.user ?? null))
            .catch(() => setUser(null))
    }, [])

    const login = async (credentials) => {
        const data = await authApi.login(credentials)
        if (data.user) setUser(data.user)
        return data
    }

    const logout = async () => {
        await authApi.logout()
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)