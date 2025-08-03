"use client";
import {useState,useEffect, use} from 'react';
import {FaSearch} from 'react-icons/fa';
import { FaUser,FaBars } from 'react-icons/fa';
import { HiX } from 'react-icons/hi';
import { useAuth } from '@/contexts/authContext';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [userImage, setUserImage] = useState<string | undefined>(undefined); // Default avatar image
    const [isImageOpen, setIsImageOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { logout,username, userId } = useAuth();
    useEffect(() => {
        if (isMobileMenuOpen) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            document.body.classList.add('overflow-hidden');
        } else {
            document.body.classList.remove('overflow-hidden');
        }
    }, [isMobileMenuOpen]);
    useEffect(() => {
        const fetchUserImage = async () => {
            if (userId) {
                const { data } = await supabase
                    .from('users')
                    .select('avatar_url')
                    .eq('id', userId)
                    .single();
                if (data) {
                    const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(data.avatar_url);
                    setUserImage(publicUrlData.publicUrl);
                }
            }
        };
        fetchUserImage();
    }, []);
    const handleLogout = async() => {
        await logout();
        window.location.href = '/';
    };
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setFile(file || null);
    };
    const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const query = e.currentTarget.query.value;
        if (query) {
            window.location.href = `/search?query=${query}`;
        }
    };
    const handleSubmit = async () => {
        console.log("Submitting image:", file);
        if (file) {
            const { data } = await supabase.auth.getSession()
            console.log("Current session:", data.session?.user.id)

            const ext = file.name.split(".").pop();
            console.log(userId, ext);
            await supabase.storage.from('avatars').upload(`${userId}/profile.${ext}`, file, {
                cacheControl: '3600',
                upsert: true,
            });
            await supabase
                .from('users')
                .update({ avatar_url: `${userId}/profile.${ext}` })
                .eq('id', userId);
            
            setFile(null);
            setIsImageOpen(false);
        }
    };
    return (
        <nav className='relative w-screen h-16 bg-darkBrown text-white flex items-center justify-between px-4 shadow-2xl z-10'>
            <a href='/' className='text-2xl md:text-3xl ml-4'>PinPal</a>
            <form onSubmit={handleSearchSubmit} className='h-8 flex items-center bg-white rounded-full overflow-hidden w-1/3 lg:translate-x-1/3'>
                <input className=" pl-4 h-full border-r-2 border-gray-700 text-darkBrown w-full" type="text" name="query" placeholder="Search" />
                <button className='h-full w-12 flex justify-center items-center'><FaSearch className='cursor-pointer' color='black' /></button>
            </form>
            <div className='flex space-x-4 items-center'>
                <Link href="/" className='text-lg hidden md:block hover:underline underline-offset-8 lg:px-2'>Home</Link>
                <Link href="/requests" className='text-lg hidden md:block hover:underline underline-offset-8 lg:px-2'>Requests</Link>
                <Link href="/chat" className='text-lg hidden md:block hover:underline underline-offset-8 lg:px-2'>Chat</Link>
                <div className='relative mr-4 md:mr-12' onMouseEnter={()=> window.innerWidth > 768 && setIsOpen(true)} onMouseLeave={()=> window.innerWidth > 768 && setIsOpen(false)}>
                    <button className='w-10 aspect-square rounded-full' onClick={() => setIsOpen(!isOpen)}>
                        <img src={userImage} alt="User" className='w-10 h-10 rounded-full' />
                    </button>
                    {isOpen && <div className='absolute flex flex-col items-center bg-darkBrown rounded-b-sm p-4 right-1/2 translate-x-1/2 space-y-2 shadow-lg z-50 border border-amber-50 border-t-0'>
                        <p className='font-bold'>{username}</p>
                        <button className='bg-amber-50 rounded-sm px-4 py-2 hover:bg-amber-50/90 text-darkBrown cursor-pointer' onClick={()=> setIsImageOpen(true)}>Add Image</button>
                        <button className='bg-amber-50 rounded-sm px-4 py-2 hover:bg-amber-50/90 text-darkBrown cursor-pointer' onClick={handleLogout}>Logout</button>
                    </div>}
                </div>
                <button className='w-8 h-8 block md:hidden' onClick={()=> setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    <FaBars className='w-8 h-8 text-white' />
                </button>
            </div>
            <div className='fixed h-screen w-1/2 overflow-hidden bg-darkBrown top-16 right-0 z-20 transition-transform duration-300 ease-in-out' style={{transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(100%)'}}>
                <div className='flex flex-col items-center h-full space-y-4 p-4'>
                    <a href="/movielist/popular" className='text-2xl lg:text-3xl font-bold my-4 hover:text-crimsonRed'>Popular</a>
                    <a href="/movielist/top_rated" className='text-2xl lg:text-3xl font-bold my-4 hover:text-crimsonRed'>Top Rated</a>
                    <h2 className='text-xl lg:text-2xl font-bold my-4'>Genres</h2>
                    <ul className='lg:text-xl gap-4 grid grid-cols-2 my-2'>
                        <li><Link href="" className=''>thing</Link></li>
                    </ul>
                </div>
            </div>
            {isImageOpen && (
                <div className='fixed inset-0 flex items-center justify-center z-50'>
                    <div className='bg-darkBrown p-4 rounded'>
                        <div className='flex items-center justify-between mb-4'>
                            <h2 className='text-lg font-bold mb-2'>Add Image</h2>
                            <button onClick={() => setIsImageOpen(false)}><HiX /></button>
                        </div>
                        <label htmlFor='image-upload' className='cursor-pointer hover:underline underline-offset-8'>
                            {file ? (
                                <span className='w-40 overflow-hidden mr-4'>{file.name}</span>
                            ) : (
                                <span className='w-40 overflow-hidden text-amber-50 mr-4'>Choose Image</span>
                            )}
                        </label>
                        <input id='image-upload' type='file' className='hidden' accept='image/*' onChange={handleImageUpload} />
                        <button className='mt-2 bg-amber-50 rounded-sm px-4 py-2 hover:bg-amber-50/90 text-darkBrown cursor-pointer' onClick={handleSubmit}>Submit</button>
                    </div>
                </div>
            )}
        </nav>
    );
}
export default Navbar;