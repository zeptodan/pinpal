"use client"
import { supabase } from "@/lib/supabase";
import { createContext, useContext,useState,useEffect } from "react";
import {User} from "@/utils/types";
const AuthContext = createContext<{ username: string | null; isAuthenticated: boolean; loading: boolean; error: string | null; login: (user: User) => void; logout: () => void; register: (username: string, email: string, password: string) => void }>({
  username: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  login: () => {},
  logout: () => {},
  register: () => {}
});

export const AuthProvider = ({ children } : { children : React.ReactNode }) => {
    const [username, setUsername] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        const checkAuthentication = async () => {
            setLoading(true);
            setError(null);
            const session = (await supabase.auth.getSession()).data.session;
            if (session) {
                const {data}  = await supabase.from("users").select("username").eq("id", session.user.id).single();
                setUsername(data?.username || null);
                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false);
            }
            setLoading(false);
        };
    checkAuthentication();
    }, []);
    const login = async(user: User) => {
        setLoading(true);
        setError(null);
        const {data,error} = await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.password,
        });
        if (error) {
            setError(error.message);
        } else {
            const {data: userData} = await supabase.from("users").select("username").eq("id", data.user.id).single();
            setUsername(userData?.username || null);
            setIsAuthenticated(true);
        }
        setLoading(false);
    };

    const logout = async() => {
        setLoading(true);
        setError(null);
        const { error } = await supabase.auth.signOut();
        if (error) {
            setError(error.message);
        } else {
            setUsername(null);
            setIsAuthenticated(false);
        }
        setLoading(false);
    };
    const register = async(username: string, email: string, password: string) => {
        setLoading(true)
        setError(null);
        const { data,error } = await supabase.auth.signUp({
        email: email,
        password: password,
        });
        if (error) {
            setError(error.message);
        }
        else{
            await supabase.from("users").insert({id: data.user?.id, name: username })
        }
        setLoading(false);
    };
    return (
        <AuthContext.Provider value={{ username, isAuthenticated, loading, error, login, logout, register }}>
        {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
