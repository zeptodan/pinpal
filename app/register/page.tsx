"use client";
import { useAuth } from "@/contexts/authContext";
import { useRouter } from "next/navigation";
export default function Register() {
    const { register,error,isAuthenticated } = useAuth();
    const router = useRouter();
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const username = e.currentTarget.username.value;
        const email = e.currentTarget.email.value;
        const password = e.currentTarget.password.value;
        await register(username, email, password);
        if (error) {
            console.error("Registration failed:", error);
        } else {
            router.push("/login");  // Redirect to login page after successful registration
            // Redirect or perform other actions after successful registration
        }
    };
    return (
        <div className="w-screen h-screen flex items-center justify-center">
            <div className="w-full h-full sm:w-md sm:h-auto p-6 rounded-lg shadow-lg flex flex-col items-center">
                <h1 className="font-bold text-xl mb-4">Register Page</h1>
                <form className="flex flex-col w-full" onSubmit={handleSubmit}>
                    <label className="my-2" htmlFor="username">Name:</label>
                    <input className="h-8" type="text" id="username" name="username" required />
                    <label className="my-2" htmlFor="email">Email:</label>
                    <input className="h-8" type="email" id="email" name="email" required />
                    <label className="my-2" htmlFor="password">Password:</label>
                    <input className="h-8" type="password" id="password" name="password" required />
                    <button type="submit">Register</button>
                </form>
            </div>
        </div>
    );
}
