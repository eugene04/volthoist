'use client';
import React, { useEffect, useState } from 'react';
import { Bolt, CheckCircle2, ChevronRight, PackageOpen, Info } from 'lucide-react';

// --- PRODUCTION IMPORTS: Uncomment these lines in your local project ---
// import { db } from '../../lib/firebase';
// import { collection, onSnapshot } from 'firebase/firestore';

// --- CANVAS PREVIEW MOCKS: Delete these lines in your local project ---
// These mocks are strictly to prevent the preview environment from crashing due to missing local files.
const db = {};
const collection = () => { };
const onSnapshot = (ref, callback) => {
    setTimeout(() => {
        callback({
            docs: [
                { id: '1', data: () => ({ title: 'ABB Tmax XT5 630A MCCB', category: 'Switchgear', description: 'High-performance molded case circuit breaker designed for advanced industrial power distribution.', imageUrl: 'https://images.unsplash.com/photo-1581092334651-ddf704bfa4d8?auto=format&fit=crop&q=80' }) },
                { id: '2', data: () => ({ title: 'Intelligent MCC Panel 525V', category: 'MCC Board', description: 'Custom engineered Motor Control Center featuring smart monitoring and Tier-1 ABB component architecture.', imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc51?auto=format&fit=crop&q=80' }) }
            ]
        });
    }, 500);
    return () => { };
};
// --- END CANVAS PREVIEW MOCKS ---

const APP_ID = 'volthoist-africa';

export default function Electrical() {
    const [catalogItems, setCatalogItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // Define the categories relevant to this specific division
    const electricalCategories = ['MCC Board', 'Switchgear', 'VSD / Soft Starter'];

    useEffect(() => {
        // Real-time listener for the public showroom data
        const unsubShowroom = onSnapshot(
            collection(db, 'artifacts', APP_ID, 'public', 'data', 'showroom'),
            (snapshot) => {
                const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                // Filter for electrical hardware
                setCatalogItems(items.filter(item => electricalCategories.includes(item.category)));
                setLoading(false);
            },
            (error) => {
                console.error("Firestore Error:", error);
                setLoading(false);
            }
        );

        return () => unsubShowroom();
    }, []);

    return (
        <div className="bg-slate-50 min-h-screen pb-32">
            {/* Hero Section */}
            <section className="bg-slate-900 pt-40 pb-24 px-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-16 items-center relative z-10">
                    <div className="md:w-1/2">
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-blue-500 text-blue-400 mb-6 inline-block">
                            Premium Control Solutions
                        </span>
                        <h2 className="text-5xl md:text-7xl font-black mb-8 leading-[1.1] text-white tracking-tighter">
                            CUSTOM MCC & <br /><span className="text-blue-500">SWITCHGEAR</span>
                        </h2>
                        <p className="text-xl text-slate-400 mb-10 leading-relaxed font-medium">
                            Locally designed by Eugene Jemwa and Ryan Tshuma. We engineer and supply world-class panels utilizing Tier-1 ABB components to ensure maximum operational uptime for your mining operations.
                        </p>
                        <ul className="space-y-5 font-bold text-slate-300">
                            <li className="flex items-center space-x-4">
                                <CheckCircle2 className="text-blue-500 w-6 h-6" />
                                <span>ABB Integrated Architectures</span>
                            </li>
                            <li className="flex items-center space-x-4">
                                <CheckCircle2 className="text-blue-500 w-6 h-6" />
                                <span>Intelligent Power Factor Correction (PFC)</span>
                            </li>
                            <li className="flex items-center space-x-4">
                                <CheckCircle2 className="text-blue-500 w-6 h-6" />
                                <span>South African Manufacturing Precision</span>
                            </li>
                        </ul>
                    </div>

                    {/* Custom High-End CSS Graphic */}
                    <div className="md:w-1/2 w-full">
                        <div className="bg-slate-900 rounded-[3rem] p-8 md:p-12 h-full min-h-[400px] shadow-2xl overflow-hidden group relative flex items-center justify-center border border-slate-800">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -mr-10 -mt-10 transition-all duration-700 group-hover:bg-blue-500/30"></div>
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl -ml-10 -mb-10 transition-all duration-700 group-hover:bg-indigo-500/30"></div>

                            <div className="relative z-10 flex flex-col items-center justify-center w-full">
                                <div className="relative mb-8">
                                    <div className="absolute inset-0 bg-blue-500 blur-xl opacity-40 rounded-full group-hover:opacity-60 transition-opacity"></div>
                                    <div className="bg-slate-800 p-8 rounded-full border border-slate-700 relative">
                                        <Bolt className="w-16 h-16 text-blue-400" />
                                    </div>
                                </div>
                                <h4 className="text-2xl font-black text-white tracking-widest uppercase mb-2 text-center">ABB Integration</h4>
                                <p className="text-blue-400 font-bold tracking-widest text-[10px] uppercase mb-8">Design • Manufacture • Commission</p>

                                <div className="grid grid-cols-3 gap-3 w-full max-w-[250px] opacity-80">
                                    {[...Array(6)].map((_, i) => (
                                        <div key={i} className="bg-slate-800 h-12 rounded-xl border border-slate-700 flex items-center justify-center group-hover:border-slate-600 transition-colors">
                                            <div className={`w-2 h-2 rounded-full ${i === 1 || i === 4 ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]' : 'bg-blue-400'}`}></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Dynamic Showroom Catalog */}
            <section className="py-24 px-6 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h3 className="text-4xl font-black uppercase tracking-tighter text-slate-900">Digital Supplier Catalog</h3>
                    <p className="text-slate-500 mt-4 font-medium">Browse our available ABB inventory and completed custom board designs.</p>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : catalogItems.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
                        <PackageOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h4 className="text-xl font-bold text-slate-900 mb-2">Catalog is Currently Updating</h4>
                        <p className="text-slate-500 text-sm">Our engineers are finalizing the technical specifications for our newest inventory. Please check back shortly.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {catalogItems.map(item => (
                            <div key={item.id} className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden hover:shadow-xl transition-all group flex flex-col h-full">
                                <div className="h-64 bg-slate-100 relative overflow-hidden flex items-center justify-center p-6">
                                    {item.imageUrl ? (
                                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <Bolt className="w-16 h-16 text-slate-300" />
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
                                    <button
                                        className="w-full bg-slate-50 text-slate-900 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition flex justify-center items-center gap-2 group/btn"
                                        onClick={() => window.location.href = `mailto:info@volthoist.com?subject=Inquiry: ${item.title}`}
                                    >
                                        <Info size={16} /> Request Datasheet & Quote
                                        <ChevronRight size={16} className="text-transparent group-hover/btn:text-white transition-colors" />
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