"use client";
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/authContext";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Router from "next/router";
export default function Page() {
    const { isAuthenticated, loading, userId } = useAuth();
    const [results, setResults] = useState<{ uuid1: string; users: { id: string; username: string; avatar_url: string } }[]>([]);
    useEffect(() => {
        const fetchResults = async () => {
            const { data,error } = await supabase
                .from("friends")
                .select("uuid1, users:users!friends_uuid1_fkey(id, username, avatar_url)")
                .eq("uuid2", userId)
                .eq("status", "pending");
            if (error) {
                console.error("Error fetching friend requests:", error);
            }
            const results = data as unknown as { uuid1: string; users: { id: string; username: string; avatar_url: string } }[]
            const actualResults = results.map(item => {
                const { data } = supabase.storage.from("avatars").getPublicUrl(item.users.avatar_url);
                return {
                    uuid1: item.uuid1,
                    users: {
                        id: item.users.id,
                        username: item.users.username,
                        avatar_url: data.publicUrl
                    }
                };
            });
            setResults(actualResults || []);
        };
        fetchResults();
    }, [userId]);
    useEffect(() => {
}, [results])
    const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const userId = e.currentTarget.parentElement?.id;
        await supabase.from("friends").update({ status: "accepted" }).eq("uuid1", userId);
        setResults((prev) => prev.filter((item) => {
            return item.uuid1 !== userId;
        }));
    };
    if (!isAuthenticated && loading) {
        return null; // Redirect handled in useAuth
    }
    if (!isAuthenticated) {
        Router.push("/login");
        return null; // Redirect to login
    }
    return (
    <div className="flex flex-col min-h-screen">
            <Navbar />
            <div className="w-screen flex flex-col p-6 flex-1">
                <h1 className="text-2xl font-bold"> Friend Requests</h1>
                <div>
                    {results.map(user => {
                        return (
                        <div key={user.uuid1} id={user.uuid1} className="flex items-center justify-between p-4 border-b border-darkBrown">
                            <div className="flex items-start space-x-4">
                                <img src={user.users.avatar_url} alt={user.users.username} className="w-10 h-10 rounded-full" />
                                <p className="text-lg font-semibold">{user.users.username}</p>
                            </div>
                            <button className="bg-darkBrown rounded-sm px-4 py-2 hover:bg-darkBrown/90 text-amber-50 cursor-pointer" onClick={handleClick} >Accept Request</button>
                        </div>
                        );
                    })}
                    {results.length === 0 && (
                        <p className="text-center text-darkBrown">No friend requests.</p>
                    )}
                </div>
            </div>
            <Footer />
        </div>
        )
}
