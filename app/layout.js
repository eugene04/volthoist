import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import Navigation from '../components/Navigation';

export const metadata = {
    title: 'VoltHoist Africa',
    description: 'Precision Power Control and Lifting Solutions',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            {/* We are using a system font stack to bypass the Turbopack font bug */}
            <body className="antialiased bg-slate-50 selection:bg-blue-100 selection:text-blue-900 font-sans">
                <AuthProvider>
                    <Navigation />
                    <main className="min-h-screen">
                        {children}
                    </main>
                </AuthProvider>
            </body>
        </html>
    );
}