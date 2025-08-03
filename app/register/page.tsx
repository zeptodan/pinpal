"use client";
import { useAuth } from "@/contexts/authContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
export default function Register() {
    const { register,error } = useAuth();
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
            <div className="w-full h-full sm:w-md sm:h-auto p-6 rounded-lg shadow-2xl flex flex-col items-center border border-darkBrown">
                <h1 className="font-bold text-xl mb-4">Register Page</h1>
                <form className="flex flex-col w-full" onSubmit={handleSubmit}>
                    <label className="my-2 font-medium" htmlFor="username">Name:</label>
                    <input className="h-8 bg-white border border-darkBrown rounded" type="text" id="username" name="username" required />
                    <label className="my-2 font-medium" htmlFor="email">Email:</label>
                    <input className="h-8 bg-white border border-darkBrown rounded" type="email" id="email" name="email" required />
                    <label className="my-2 font-medium" htmlFor="password">Password:</label>
                    <input className="h-8 bg-white border border-darkBrown rounded" type="password" id="password" name="password" required />
                    <button className="mt-6 bg-darkBrown text-white py-2 px-4 rounded cursor-pointer" type="submit">Register</button>
                    <p className="mt-4 text-center">Already have an account? <Link href="/login" className="hover:underline font-medium">Login</Link></p>
                </form>
            </div>
        </div>
    );
}
