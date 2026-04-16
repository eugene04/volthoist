'use client';
import { ChevronRight, Factory, Bolt, HardHat, ShieldCheck, Warehouse } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
    return (
        <div>
            {/* Hero */}
            <section className="bg-slate-900 pt-48 pb-32 px-6 text-center overflow-hidden relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500 via-transparent to-transparent"></div>
                </div>
                <div className="max-w-4xl mx-auto relative z-10">
                    <h1 className="text-5xl md:text-8xl font-black text-white mt-8 mb-8 tracking-tighter leading-[0.9]">
                        PRECISION <span className="text-blue-600 italic">POWER</span> CONTROL
                    </h1>
                    <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto font-medium">
                        Designing premium electrical boards in Zimbabwe, manufacturing in South Africa,
                        and ensuring global safety compliance for regional mining.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link href="/electrical" className="bg-blue-600 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all flex items-center justify-center space-x-3 shadow-xl shadow-blue-500/20">
                            <span>Custom MCC Design</span>
                            <ChevronRight className="w-5 h-5" />
                        </Link>
                        <Link href="/lifting" className="bg-white text-slate-900 px-10 py-5 rounded-2xl font-bold text-lg hover:bg-slate-100 transition-all">
                            Lifting Solutions
                        </Link>
                    </div>
                </div>
            </section>

            {/* Trust Stats */}
            <section className="bg-white py-12 border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center font-bold">
                    <div><p className="text-3xl text-blue-600">ABB</p><p className="text-slate-400 text-[10px] uppercase tracking-widest">Standard</p></div>
                    <div><p className="text-3xl text-blue-600">ZIM/ZAM</p><p className="text-slate-400 text-[10px] uppercase tracking-widest">Regional</p></div>
                    <div><p className="text-3xl text-blue-600">INTL</p><p className="text-slate-400 text-[10px] uppercase tracking-widest">Certified</p></div>
                    <div><p className="text-3xl text-blue-600">SA</p><p className="text-slate-400 text-[10px] uppercase tracking-widest">Built</p></div>
                </div>
            </section>

            {/* Advantage Cards */}
            <section className="py-24 px-6 bg-slate-50">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-slate-900">
                    {[
                        { icon: Factory, title: "SA Manufacturing", text: "Precision assembly in South Africa's world-class industrial hubs." },
                        { icon: Warehouse, title: "Indent Agency", text: "Direct sourcing from global brands with zero inventory risk." },
                        { icon: ShieldCheck, title: "Lifting Safety", text: "Registered safety compliance that opens doors to Tier-1 mines." }
                    ].map((feature, i) => (
                        <div key={i} className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all group">
                            <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-blue-600 transition-colors">
                                <feature.icon className="w-8 h-8 text-blue-600 group-hover:text-white" />
                            </div>
                            <h3 className="text-2xl font-black mb-4 uppercase tracking-tighter">{feature.title}</h3>
                            <p className="text-slate-500 font-medium">{feature.text}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}