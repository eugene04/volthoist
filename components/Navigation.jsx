'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bolt, LayoutDashboard, LogOut, Menu, X, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import AuthModal from './AuthModal';

export default function Navigation() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, profile } = useAuth();
    const [showModal, setShowModal] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handlePortalClick = (e) => {
        e.preventDefault();
        if (!user || user.isAnonymous) {
            setShowModal(true);
        } else {
            router.push('/portal');
        }
    };

    const navLinks = [
        { name: 'Home', href: '/' },
        { name: 'Electrical', href: '/electrical' },
        { name: 'Lifting', href: '/lifting' },
    ];

    return (
        <>
            <nav className="fixed top-0 w-full z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white">
                <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
                    <Link href="/" className="flex items-center space-x-3">
                        <div className="bg-blue-600 p-2 rounded-xl">
                            <Bolt className="w-6 h-6" />
                        </div>
                        <span className="text-2xl font-black tracking-tighter uppercase">VOLTHOIST <span className="text-blue-500">AFRICA</span></span>
                    </Link>

                    <div className="hidden md:flex space-x-8 text-xs font-bold uppercase tracking-widest items-center">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={pathname === link.href ? 'text-blue-400' : 'text-slate-400 hover:text-white transition'}
                            >
                                {link.name}
                            </Link>
                        ))}

                        <button onClick={handlePortalClick} className={`flex items-center space-x-2 ${pathname === '/portal' ? 'text-blue-400' : 'text-slate-400 hover:text-white transition'}`}>
                            <LayoutDashboard className="w-4 h-4" />
                            <span>Client Portal</span>
                        </button>

                        {user && !user.isAnonymous ? (
                            <div className="flex items-center space-x-4 border-l border-slate-700 pl-6">
                                <div className="flex flex-col items-end">
                                    <span className="text-white text-xs font-bold">{profile?.username || 'Loading...'}</span>
                                    <span className="text-[10px] text-slate-500 uppercase tracking-tighter">{profile?.companyName || 'Corporate Client'}</span>
                                </div>
                                <button onClick={() => { signOut(auth); router.push('/'); }} className="text-slate-400 hover:text-red-400 transition">
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <button onClick={() => setShowModal(true)} className="bg-blue-600 px-6 py-2.5 rounded-full font-bold hover:bg-blue-700 transition">
                                Sign In
                            </button>
                        )}
                    </div>

                    <button className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </nav>

            <AuthModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
            />
        </>
    );
}
