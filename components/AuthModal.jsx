'use client';
import { useState } from 'react';
import { X, Lock, Mail, Key, UserPlus, LogIn, Building2, User, Phone, Globe, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose }) {
    const [isRegister, setIsRegister] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        username: '',
        companyName: '',
        companyReg: '',
        phoneNumber: '',
        country: 'Zimbabwe'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, signUp } = useAuth();

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isRegister) {
                await signUp(formData.email, formData.password, {
                    username: formData.username,
                    companyName: formData.companyName,
                    companyReg: formData.companyReg,
                    phoneNumber: formData.phoneNumber,
                    country: formData.country
                });
            } else {
                await login(formData.email, formData.password);
            }
            onClose();
        } catch (err) {
            setError(err.message.replace('Firebase:', ''));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-slate-900/95 backdrop-blur-xl text-slate-900 overflow-y-auto py-10">
            <div className="bg-white w-full max-w-xl rounded-[3rem] p-8 md:p-12 relative shadow-2xl my-auto">
                <button onClick={onClose} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900">
                    <X className="w-6 h-6" />
                </button>

                <div className="text-center mb-8">
                    <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        {isRegister ? <UserPlus className="text-blue-600" /> : <Lock className="text-blue-600" />}
                    </div>
                    <h3 className="text-3xl font-black tracking-tighter uppercase">
                        {isRegister ? 'Client Registration' : 'Client Access'}
                    </h3>
                    <p className="text-slate-500 text-sm mt-2">
                        {isRegister ? 'Join our industrial network in Zim & Zam.' : 'Sign in to your VoltHoist portal.'}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold mb-6 border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative md:col-span-2">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input required name="email" type="email" placeholder="Email Address"
                                className="w-full bg-slate-50 border border-slate-200 pl-12 pr-4 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                value={formData.email} onChange={handleChange} />
                        </div>

                        <div className="relative md:col-span-2">
                            <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input required name="password" type="password" placeholder="Password"
                                className="w-full bg-slate-50 border border-slate-200 pl-12 pr-4 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                value={formData.password} onChange={handleChange} />
                        </div>

                        {isRegister && (
                            <>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input required name="username" type="text" placeholder="Contact Person Name"
                                        className="w-full bg-slate-50 border border-slate-200 pl-12 pr-4 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                        value={formData.username} onChange={handleChange} />
                                </div>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input required name="phoneNumber" type="text" placeholder="Phone / WhatsApp Number"
                                        className="w-full bg-slate-50 border border-slate-200 pl-12 pr-4 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                        value={formData.phoneNumber} onChange={handleChange} />
                                </div>
                                <div className="relative">
                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input required name="companyName" type="text" placeholder="Company / Mine Name"
                                        className="w-full bg-slate-50 border border-slate-200 pl-12 pr-4 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                        value={formData.companyName} onChange={handleChange} />
                                </div>
                                <div className="relative">
                                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    {/* Note: companyReg is NOT required here */}
                                    <input name="companyReg" type="text" placeholder="Company Reg (Optional)"
                                        className="w-full bg-slate-50 border border-slate-200 pl-12 pr-4 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                        value={formData.companyReg} onChange={handleChange} />
                                </div>
                                <div className="relative md:col-span-2">
                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <select name="country"
                                        className="w-full bg-slate-50 border border-slate-200 pl-12 pr-4 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 appearance-none transition-all"
                                        value={formData.country} onChange={handleChange}>
                                        <option value="Zimbabwe">Zimbabwe Operations</option>
                                        <option value="Zambia">Zambia Operations</option>
                                    </select>
                                </div>
                            </>
                        )}
                    </div>

                    <button
                        type="submit" disabled={loading}
                        className="w-full bg-slate-900 text-white font-bold py-5 rounded-2xl hover:bg-slate-800 transition shadow-xl flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : (isRegister ? 'Create Profile' : 'Sign In')}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                    <button
                        onClick={() => setIsRegister(!isRegister)}
                        className="text-sm font-bold text-blue-600 hover:underline"
                    >
                        {isRegister ? 'Already registered? Sign In' : 'New Client? Register Company'}
                    </button>
                </div>
            </div>
        </div>
    );
}