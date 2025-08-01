"use client";
import { useAuth } from "@/contexts/authContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
export default function Login() {
    const { login,error,isAuthenticated } = useAuth();
    const router = useRouter();
    const handleSubmit = async (e : React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const email = e.currentTarget.email.value;
        const password = e.currentTarget.password.value;
        await login({ email, password });
        if (error) {
            console.error("Login failed:", error);
        } else if (isAuthenticated) {
            console.log("Login successful");
            router.push("/");  // Redirect to home or another page after successful login
            // Redirect or perform other actions after successful login
        }
    };
    return (
        <div className="w-screen h-screen flex items-center justify-center">
            <div className="w-full h-full sm:w-md sm:h-auto p-6 rounded-lg shadow-2xl flex flex-col items-center border border-darkBrown">
                <h1 className="font-bold text-xl mb-4">Login Page</h1>
                <form className="flex flex-col w-full" onSubmit={handleSubmit}>
                    <label className="my-2 font-medium" htmlFor="email">Email:</label>
                    <input className="h-8 bg-white border border-darkBrown rounded" type="email" id="email" name="email" required />
                    <label className="my-2 font-medium" htmlFor="password">Password:</label>
                    <input className="h-8 bg-white border border-darkBrown rounded" type="password" id="password" name="password" required />
                    <button className="mt-6 bg-darkBrown text-white py-2 px-4 rounded cursor-pointer" type="submit">Login</button>
                    <p className="mt-4 text-center">Dont have an account? <Link href="/register" className="hover:underline font-medium">Register</Link></p>
                </form>
            </div>
        </div>
    );
}
