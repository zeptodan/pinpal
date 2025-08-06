"use client"
import { useAuth } from "@/contexts/authContext";
import { useRouter } from "next/navigation";
import { useEffect,useState } from "react";
import { Notes } from "@/utils/types";
import { supabase } from "@/lib/supabase";
import dynamic from "next/dynamic";
import Note from "@/components/Note";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
const Map = dynamic(() => import("@/components/Map"), { ssr: false });
export default function Home() {
  const { isAuthenticated,loading } = useAuth();
  const router = useRouter();
  const [markers, setMarkers] = useState<Notes[]>([]);
  const addMarker = async (lat: number, lon: number,message: string) => {
    const { data, error } = await supabase.from("notes").insert([{ lat, lon, message }]).select();
    if (error) {
        console.error("Error adding marker:", error);
    } else {
        setMarkers((prev) => [...prev, { id: data[0].id, lat, lon, message, created_at: data[0].created_at }]);
    }
  };
  const deleteMarker = async (id: number) => {
    const { error } = await supabase.from("notes").delete().eq("id", id);
    if (error) {
        console.error("Error deleting marker:", error);
    } else {
        setMarkers((prev) => prev.filter((marker) => marker.id !== id));
    }
  };
  const updateMarker = async (id: number, message: string) => {
    const { error } = await supabase.from("notes").update({ message }).eq("id", id);
    if (error) {
        console.error("Error updating marker:", error);
    } else {
        setMarkers((prev) => prev.map((marker) => (marker.id === id ? { ...marker, message } : marker)));
    }
  };
  useEffect(() => {
    if (!isAuthenticated && !loading) {
      router.push("/login");
    }
    const fetchMarkers = async () => {
      const { data,error } = await supabase.from("notes").select("*");
      if (!error) {
        const markersData = data.map((note) => ({
            id: note.id,
            lat : note.lat,
            lon: note.lon,
            message: note.message,
            created_at: note.created_at
        }));
        setMarkers(markersData);
      }
    };
    fetchMarkers();
  }, [isAuthenticated, loading, router]);
  if (!isAuthenticated && loading) {
    return <div>Loading...</div>;
  }
  if (!isAuthenticated) {
    return null; // Redirect handled in useEffect
  }
  return (
    <>
      <Navbar />
      <h1 className="mt-8 text-3xl font-bold text-center w-full">Your Journal</h1>
      <div className="w-full p-6 flex flex-col items-center">
        <div className="relative aspect-square sm:w-1/2 w-full mt-4 z-0">
          <Map markers={markers} addMarker={addMarker} />
        </div>
        <div className="mt-4 w-full">
          <h2 className="font-bold text-2xl my-2 ml-2">Your Pins</h2>
          <div className="flex flex-col">
            {markers.map((marker) => (
              <Note key={marker.id} note={marker} updateMarker={updateMarker} deleteMarker={deleteMarker} />
            ))}
            {markers.length === 0 && (
              <p className="text-center text-darkBrown">No notes available. Click on the map to add a new note.</p>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
