import { FaLinkedin } from "react-icons/fa";
import Link from "next/link";
const Footer = () => {
    return (
        <footer className="w-full bg-darkBrown text-white p-8 flex flex-col md:flex-row md:justify-between items-center">
            <Link href="/" className="text-2xl lg:text-3xl justify-center my-4">PinPal</Link>
            <p className="text-sm md:self-end md:order-1 order-3 mt-4">© 2025 PinPal. All rights reserved.</p>
            <div className="flex flex-col items-center my-4 order-2">
                <p className="lg:text-xl">Created by Muhammad Anas</p>
                <p className="lg:text-xl my-2">Contact Me</p>
                <Link href="https://www.linkedin.com/in/muhammad-anas-alam/" target="_blank" rel="noopener noreferrer" className="hover:underline">
                    <FaLinkedin className="inline-block mr-2" />
                    LinkedIn
                </Link>
            </div>
        </footer>
    );
}
export default Footer;