"use client";
import Link from 'next/link';
import SearchBox from './SearchBox';

export default function Navbar() {
    return (
        <nav className="w-full border-b border-white/5 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
            <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="text-2xl font-bold text-gradient hover:opacity-80 transition-opacity">
                            Aladdin 2.0
                        </Link>
                        <div className="hidden md:flex space-x-1">
                            <Link href="/" className="px-4 py-2 rounded-full text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all">
                                대시보드
                            </Link>
                            <Link href="/portfolio" className="px-4 py-2 rounded-full text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all">
                                포트폴리오
                            </Link>
                            <Link href="/insights" className="px-4 py-2 rounded-full text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all">
                                인사이트
                            </Link>
                            <Link href="/battle" className="px-4 py-2 rounded-full text-sm font-medium text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 transition-all flex items-center gap-1">
                                <span>⚔️</span> AI 배틀
                            </Link>
                            <Link href="/time-machine" className="px-4 py-2 rounded-full text-sm font-medium text-purple-400 hover:text-purple-300 hover:bg-purple-400/10 transition-all flex items-center gap-1">
                                <span>🕰️</span> 타임머신
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 w-full max-w-md justify-end">
                        <SearchBox />
                    </div>
                </div>
            </div>
        </nav>
    );
}
