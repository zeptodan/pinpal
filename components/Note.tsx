import { Notes } from "@/utils/types";
import { useState,useRef,useEffect } from "react";
export default function Note({ note, updateMarker, deleteMarker }: { note: Notes, updateMarker: (id: number, message: string) => void, deleteMarker: (id: number) => Promise<void> }) {
    const [message, setMessage] = useState(note.message || "");
    const [editing, setEditing] = useState(false);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const handleUpdate = async () => {
        if (editing) {
            await updateMarker(note.id, message);
        }
        setEditing(!editing);
    };
    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this note?")) {
            await deleteMarker(note.id);
        }
    };
    useEffect(() => {
        if (textAreaRef.current) {
            textAreaRef.current.style.height = "auto"; // Reset height
            textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`; // Set to scroll height
        }
    }, [message]);
    return (
        <div id={`${note.id}`} className="border border-darkBrown rounded p-4 mb-2 w-full flex justify-between">
            <div className="w-full">
                <p>Created At: {new Date(note.created_at).toLocaleString()}</p>
                <p>Location: ({note.lat}, {note.lon})</p>
                <div className="flex items-start w-full gap-0.5">
                    <p className="pt-0.5">Note:</p>
                    <textarea ref={textAreaRef} className={`w-1/2 resize-none overflow-hidden border-2 rounded px-1 pb-1 ${editing ? "border-darkBrown" : "border-transparent"} `} value={message} onChange={(e) => setMessage(e.target.value)} disabled={!editing} />
                </div>
            </div>
            <div className="flex flex-col justify-center pr-4 gap-4">
                <button className="bg-darkBrown rounded px-4 py-2 text-white cursor-pointer hover:bg-darkBrown/90" onClick={handleUpdate}>{editing ? "Save" : "Edit"}</button>
                <button className="bg-darkBrown rounded px-4 py-2 text-white cursor-pointer hover:bg-darkBrown/90" onClick={handleDelete}>Delete</button>
            </div>
        </div>
    );
}