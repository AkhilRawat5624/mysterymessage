"use client"
import { useSession, signOut } from 'next-auth/react'
import React from 'react'
import { User } from "next-auth"
import Link from 'next/link'

const Navbar = () => {
    const { data: session } = useSession()
    const user: User = session?.user as User;
    return (
        <nav className='p-4 md:p-6 shadow-md bg-gray-900 text-white'>
            <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
                <a href="#" className="text-xl font-bold mb-4 md:mb-0">Mystery Message</a>
                {
                    session ? (
                        <>
                            <span>Welcome {user?.username || user?.email}</span>
                            <button onClick={() => signOut()} className="w-full md:w-auto bg-slate-100 text-black" >Logout</button>
                        </>
                    ) : (
                        <>
                            <Link href="/sign-in" className="w-full md:w-auto bg-slate-100 text-black p-2 rounded-lg"><button className='w-24 cursor-pointer'>Login</button></Link></>
                    )
                }
            </div>
        </nav>
    )
}

export default Navbar