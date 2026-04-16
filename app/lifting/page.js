'use client';
import React, { useEffect, useState } from 'react';
import { HardHat, CheckCircle2, ChevronRight, Scale, ShieldCheck } from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

const APP_ID = 'volthoist-africa';

export default function Lifting() {
    const [catalogItems, setCatalogItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // Determine which categories map to the Lifting division
    const liftingCategories = ['Lifting Gear', 'Yellow Machine'];

    useEffect(() => {
        const unsubShowroom = onSnapshot(collection(db, 'artifacts', APP_ID, 'public', 'data', 'showroom'), (snapshot) => {
            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Filter items so only lifting/heavy machinery shows on this page
            setCatalogItems(items.filter(item => liftingCategories.includes(item.category)));
            setLoading(false);
        });

        return () => unsubShowroom();
    }, []);

    return (
        <div className="bg-slate-50 min-h-screen pb-32">
            {/* Hero Section */}
            <section className="bg-slate-900 pt-40 pb-24 px-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-emerald-600/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/3 pointer-events-none"></div>
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row-reverse gap-16 items-center relative z-10">
                    <div className="md:w-1/2">
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-emerald-500 text-emerald-400 mb-6 inline-block">
                            Certified Heavy Engineering
                        </span>
                        <h2 className="text-5xl md:text-7xl font-black mb-8 leading-[1.1] text-white tracking-tighter">
                            LIFTING GEAR & <br /><span className="text-emerald-500">COMPLIANCE</span>
                        </h2>
                        <p className="text-xl text-slate-400 mb-10 leading-relaxed font-medium">
                            We supply globally recognized chain blocks, electric hoists, and yellow machines. Every unit is backed by statutory load testing and international safety certification.
                        </p>
                        <ul className="space-y-5 font-bold text-slate-300">
                            <li className="flex items-center space-x-4"><CheckCircle2 className="text-emerald-500 w-6 h-6" /><span>Statutory 6 & 12-Month Inspections</span></li>
                            <li className="flex items-center space-x-4"><CheckCircle2 className="text-emerald-500 w-6 h-6" /><span>Certified Third-Party Load Testing</span></li>
                            <li className="flex items-center space-x-4"><CheckCircle2 className="text-emerald-500 w-6 h-6" /><span>Heavy Machinery Operator Training</span></li>
                        </ul>
                    </div>

                    {/* Custom CSS Graphic */}
                    <div className="md:w-1/2 w-full">
                        <div className="bg-slate-900 rounded-[3rem] p-8 md:p-12 h-full min-h-[400px] shadow-2xl overflow-hidden group relative flex items-center justify-center border border-slate-800">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/20 rounded-full blur-3xl -mr-10 -mt-10 transition-all duration-700 group-hover:bg-emerald-500/30"></div>
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-600/20 rounded-full blur-3xl -ml-10 -mb-10 transition-all duration-700 group-hover:bg-teal-500/30"></div>

                            <div className="relative z-10 flex flex-col items-center justify-center w-full">
                                <div className="relative mb-8">
                                    <div className="absolute inset-0 bg-emerald-500 blur-xl opacity-40 rounded-full group-hover:opacity-60 transition-opacity"></div>
                                    <div className="bg-slate-800 p-8 rounded-full border border-slate-700 relative">
                                        <HardHat className="w-16 h-16 text-emerald-400" />
                                    </div>
                                </div>
                                <h4 className="text-2xl font-black text-white tracking-widest uppercase mb-2 text-center">Certified Safe</h4>
                                <p className="text-emerald-400 font-bold tracking-widest text-[10px] uppercase mb-8">Inspect • Test • Certify</p>

                                <div className="w-full max-w-[250px] bg-slate-800/80 p-5 rounded-2xl border border-slate-700 group-hover:border-slate-600 transition-colors">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-slate-300 font-bold text-xs tracking-widest uppercase">Load Test</span>
                                        <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded border border-emerald-500/30 text-[9px] font-black tracking-widest uppercase">Passed</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-400 w-full shadow-[0_0_10px_rgba(52,211,153,0.8)]"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* Dynamic Showroom Catalog */}
            <section className="py-24 px-6 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h3 className="text-4xl font-black uppercase tracking-tighter text-slate-900">Heavy Equipment Catalog</h3>
                    <p className="text-slate-500 mt-4 font-medium">View our agency hardware available for direct indent ordering.</p>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                    </div>
                ) : catalogItems.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
                        <Scale className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h4 className="text-xl font-bold text-slate-900 mb-2">Agency Portfolio Expanding</h4>
                        <p className="text-slate-500 text-sm">We are currently finalizing digital agreements with global lifting principals. New inventory will appear here.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {catalogItems.map(item => (
                            <div key={item.id} className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden hover:shadow-xl transition-all group flex flex-col h-full">
                                <div className="h-64 bg-slate-100 relative overflow-hidden flex items-center justify-center p-6">
                                    {item.imageUrl ? (
                                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <HardHat className="w-16 h-16 text-slate-300" />
                                    )}
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-sm border border-slate-200">
                                        {item.category}
                                    </div>
                                </div>
                                <div className="p-8 flex-grow flex flex-col">
                                    <h4 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-3">{item.title}</h4>
                                    <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8 flex-grow">
                                        {item.description}
                                    </p>
                                    <button className="w-full bg-slate-50 text-slate-900 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition flex justify-center items-center gap-2 group/btn">
                                        <ShieldCheck size={16} /> Request Compliance Spec <ChevronRight size={16} className="text-transparent group-hover/btn:text-white transition-colors" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}