"use client";
import { supabase } from "@/lib/supabase";
import { useEffect,useState } from "react";
import { useSearchParams } from "next/navigation";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/authContext";
import {useRouter} from "next/navigation";
export default function SearchPage() {
    const [results, setResults] = useState<{ id: string; username: string; avatarUrl: string; status: string }[]>([]);
    const searchParams = useSearchParams();
    const router = useRouter();
    const query = searchParams.get("query");
    const { userId, isAuthenticated, loading } = useAuth()
    const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const userId = e.currentTarget.parentElement?.id;
        e.currentTarget.disabled = true;
        e.currentTarget.textContent = "Request Sent";
        if (userId) {
            await supabase.from("friends").insert([{ uuid2: userId, status: "pending" }])
        }
    }
    useEffect(() => {
        const fetchResults = async () => {
            const { data, error } = await supabase
                .from("users")
                .select(`
                    id,
                    username,
                    avatar_url,
                    sent:friends!friends_uuid1_fkey(id, uuid1, uuid2, status),
                    received:friends!friends_uuid2_fkey(id, uuid1, uuid2, status)
                `)
                .ilike("username", `%${query}%`)
                .neq("id", userId);
            if (error) {
                console.error("Error fetching search results:", error);
            } else {
                const result = data.map(user => {
                    const { data } = supabase.storage.from("avatars").getPublicUrl(user.avatar_url);
                    return {
                        id: user.id,
                        username: user.username,
                        avatarUrl: data.publicUrl,
                        status: user.sent[0]?.status || user.received[0]?.status || "not_friends"
                    };
                });
                setResults(result);
            }
        };
        if (query) {
            fetchResults();
        }
    }, []);
    if (!isAuthenticated && loading) {
        return null; // Redirect handled in useAuth
    }
    if (!isAuthenticated) {
        router.push("/login");
        return null; // Redirect to login
    }
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <div className="w-screen flex flex-col p-6 flex-1">
                <h1 className="text-2xl font-bold">Search</h1>
                <div>
                    {results.map(user => (
                        <div key={user.id} id={user.id} className="flex items-center justify-between p-4 border-b border-darkBrown">
                            <div className="flex items-start space-x-4">
                                <img src={user.avatarUrl} alt={user.username} className="w-10 h-10 rounded-full" />
                                <p className="text-lg font-semibold">{user.username}</p>
                            </div>
                            <button className="bg-darkBrown rounded-sm px-4 py-2 hover:bg-darkBrown/90 text-amber-50 cursor-pointer" onClick={handleClick} disabled={user.status !== "not_friends"}>{user.status === "accepted" ? "Friends" : user.status === "pending" ? "Request Sent" : "Send Request"}</button>
                        </div>
                    ))}
                    {results.length === 0 && (
                        <p className="text-center text-darkBrown">No results found for "{query}".</p>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
}
