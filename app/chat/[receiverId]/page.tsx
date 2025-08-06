"use client"
import { useParams } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import Navbar from "@/components/Navbar"
import { useAuth } from "@/contexts/authContext"
import { supabase } from "@/lib/supabase"
import { LuMapPin } from "react-icons/lu"
import { Notes } from "@/utils/types"
import Map from "@/components/Map"
export default function Chat() {
    const { isAuthenticated, loading, userId } = useAuth();
    const { receiverId } = useParams()
    const [receiver, setReceiver] = useState<{ id: string; username: string; avatar_url: string } | null>(null);
    const messageEndRef = useRef<HTMLDivElement | null>(null);
    const [messages, setMessages] = useState<{ id: string; sender_id: string; receiver_id: string; message: string; created_at: string; lat: number; lon: number }[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isMapOpen, setIsMapOpen] = useState(false);
    const [markers, setMarkers] = useState<Notes[]>([]);
    useEffect(() => {
        if (isMapOpen) {
            const timer = setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isMapOpen]);
    useEffect(() => {
        if (messageEndRef.current) {
            messageEndRef.current.scrollTop = messageEndRef.current.scrollHeight;
        }
    }, [messages]);
    useEffect(() => {
        const fetchReceiver = async () => {
            const { data, error } = await supabase
                .from("users")
                .select("id, username, avatar_url")
                .eq("id", receiverId)
                .single();
            if (error) {
                console.error("Error fetching receiver:", error);
            } else {
                const { data: avatarData } = supabase.storage.from("avatars").getPublicUrl(data.avatar_url);
                setReceiver({
                    id: data.id,
                    username: data.username,
                    avatar_url: avatarData.publicUrl
                });
            }
        };
        fetchReceiver();
    }, [receiverId]);
    useEffect(() => {
        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from("messages")
                .select("id, sender_id, receiver_id, message, created_at, lat, lon")
                .or(`and(sender_id.eq.${userId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${userId})`)
                .order("created_at", { ascending: true });
            if (error) {
                console.error("Error fetching messages:", error);
            } else {
                setMessages(data);
                const notes = data.filter(msg => msg.lat && msg.lon).map(msg => ({
                    id: msg.id,
                    lat: msg.lat,
                    lon: msg.lon,
                    message: msg.message,
                    created_at: msg.created_at
                }));
                setMarkers(notes);
            }
        };
        fetchMessages();
        const sender = supabase.channel(`sender:${userId}`)
            .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `receiver_id=eq.${receiverId}`}, payload => {
                const newMessage = payload.new as { id: string; sender_id: string; receiver_id: string; message: string; created_at: string; lat: number; lon: number };
                setMessages(prev => [...prev, newMessage]);
                if (newMessage.lat && newMessage.lon) {
                    setMarkers(prev => [...prev, { id: Number(newMessage.id), lat: newMessage.lat, lon: newMessage.lon, message: newMessage.message, created_at: newMessage.created_at }]);
                }
            })
            .subscribe((status) => {
                console.log("Subscription status:", status);
            });
        const receiver = supabase.channel(`receiver:${userId}`)
            .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `sender_id=eq.${receiverId}`}, payload => {
                const newMessage = payload.new as { id: string; sender_id: string; receiver_id: string; message: string; created_at: string; lat: number; lon: number };
                setMessages(prev => [...prev, newMessage]);
                if (newMessage.lat && newMessage.lon) {
                    setMarkers(prev => [...prev, { id: Number(newMessage.id), lat: newMessage.lat, lon: newMessage.lon, message: newMessage.message, created_at: newMessage.created_at }]);
                }
            })
            .subscribe((status) => {
                console.log("Subscription status:", status);
            });
        return () => {
            supabase.removeChannel(sender);
            supabase.removeChannel(receiver);
        };
    }, [receiverId, userId]);
    const handleSubmit = async (lat: number | null = null, lon: number | null = null, message: string = "") => {
        const actualMessage = message || newMessage;
        if (actualMessage.trim() === "") return;
        const { error } = await supabase.from("messages").insert([{ sender_id: userId, receiver_id: receiverId, message: actualMessage, lat, lon }]);
        if (error) {
            console.error("Error sending message:", error);
        } else {
            setNewMessage("");
        }
    };
    if (!isAuthenticated && loading) {
        return null; // Redirect handled in useAuth
    }
    if (!isAuthenticated) {
        window.location.href = "/login"; // Redirect to login
        return null;
    }
    return (
        <div className="flex flex-col h-screen">
            <Navbar />
            <div className="w-screen flex flex-col p-6 flex-1 overflow-hidden">
                <div className="flex items-center space-x-4">
                    <img src={receiver?.avatar_url} alt={receiver?.username} className="w-10 h-10 rounded-full" />
                    <h1 className="text-2xl font-bold">{receiver?.username}</h1>
                </div>
                <div ref={messageEndRef} className="overflow-y-auto scrollbar-hide">
                    {messages.map(message => (
                        <div key={message.id} className={`flex ${message.sender_id === userId ? "justify-end" : "justify-start"} mb-4`}>
                            <div className={`p-3 rounded-lg text-white ${message.sender_id === userId ? "bg-darkBrown" : "bg-darkBrown/80"}  ${message.lat ? "cursor-pointer hover:bg-darkBrown/60" : ""}`}  onClick={message.lat ? () => setIsMapOpen(true) : undefined}>
                                <p>{message.lat ? <LuMapPin className="inline mr-1" /> : null}{message.message}</p>
                                <span className="text-xs text-white">{new Date(message.created_at).toLocaleTimeString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-auto flex w-full">
                    <button className="bg-darkBrown text-white rounded-md p-2 px-4 m-2 hover:bg-darkBrown/90 cursor-pointer" onClick={() => setIsMapOpen(!isMapOpen)}>
                        <LuMapPin />
                    </button>
                    <form className="flex w-full" action="" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                        <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Type your message..." className="border border-gray-300 rounded-md m-2 pl-2 w-full" />
                        <button type="submit" className="bg-darkBrown text-white rounded-md p-2 m-2 hover:bg-darkBrown/90 cursor-pointer">Send</button>
                    </form>
                </div>
            </div>
            <div className={`fixed top-1/2 left-1/2 sm:w-md w-xs aspect-square -translate-x-1/2 -translate-y-1/2 ${isMapOpen ? "" : "hidden"} z-40`}>
                <Map markers={markers} addMarker={handleSubmit} />
            </div>
        </div>
    );
}
