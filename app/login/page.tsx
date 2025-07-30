"use client";
import { useAuth } from "@/contexts/authContext";
import { useRouter } from "next/navigation";
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
            <div className="w-full h-full sm:w-md sm:h-auto p-6 rounded-lg shadow-lg flex flex-col items-center">
                <h1 className="font-bold text-xl mb-4">Login Page</h1>
                <form className="flex flex-col w-full" onSubmit={handleSubmit}>
                    <label className="my-2" htmlFor="email">Email:</label>
                    <input className="h-8" type="email" id="email" name="email" required />
                    <label className="my-2" htmlFor="password">Password:</label>
                    <input className="h-8" type="password" id="password" name="password" required />
                    <button type="submit">Login</button>
                </form>
            </div>
        </div>
    );
}
