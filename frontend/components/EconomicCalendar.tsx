"use client";
import { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { api } from '@/lib/api';
import LoadingSkeleton from './LoadingSkeleton';

interface CalendarEvent {
    date: string;
    time: string;
    country: string;
    event: string;
    impact: string;
    forecast?: string;
    previous?: string;
    type?: 'macro' | 'expiration' | 'earnings' | 'dividend';
    ticker?: string;
}

export default function EconomicCalendar() {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'my' | 'macro'>('all');

    // Calendar State
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    useEffect(() => {
        api.getSmartCalendar().then(data => {
            setEvents(data);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, []);

    // Filter Logic
    const filteredEvents = events.filter(evt => {
        // 1. Type Filter
        let typeMatch = true;
        if (filter === 'macro') typeMatch = !evt.ticker && evt.type !== 'earnings' && evt.type !== 'dividend';
        if (filter === 'my') typeMatch = !!evt.ticker;

        // 2. Date Filter (if selected)
        let dateMatch = true;
        if (selectedDate) {
            dateMatch = evt.date === selectedDate;
        }

        return typeMatch && dateMatch;
    });

    const getEventColor = (evt: CalendarEvent) => {
        if (evt.type === 'expiration') return 'text-purple-400 border-purple-500/30 bg-purple-500/10';
        if (evt.type === 'earnings') return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
        if (evt.type === 'dividend') return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
        if (evt.impact === 'High') return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
        return 'text-slate-200 border-white/10 bg-white/5';
    };

    // Calendar Grid Generation
    const getDaysInMonth = (year: number, month: number) => {
        const date = new Date(year, month, 1);
        const days = [];
        while (date.getMonth() === month) {
            days.push(new Date(date));
            date.setDate(date.getDate() + 1);
        }
        return days;
    };

    const days = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
    const startDay = days[0].getDay(); // 0 (Sun) - 6 (Sat)
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const hasEvent = (dateStr: string) => {
        return events.some(e => e.date === dateStr);
    };

    const formatDate = (date: Date) => {
        return date.toISOString().split('T')[0];
    };

    return (
        <div className="glass-card p-6 rounded-3xl h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-blue-400" />
                    스마트 캘린더 (Smart Calendar)
                </h3>

                <div className="flex bg-slate-800/50 rounded-lg p-1">
                    <button
                        onClick={() => { setFilter('all'); setSelectedDate(null); }}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${filter === 'all' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        전체
                    </button>
                    <button
                        onClick={() => { setFilter('my'); setSelectedDate(null); }}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${filter === 'my' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        내 종목
                    </button>
                    <button
                        onClick={() => { setFilter('macro'); setSelectedDate(null); }}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${filter === 'macro' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        거시경제
                    </button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 flex-1 min-h-0">
                {/* Left: Visual Calendar */}
                <div className="lg:w-1/2 flex flex-col">
                    {/* Month Nav */}
                    <div className="flex items-center justify-between mb-4 px-2">
                        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-1 hover:bg-white/10 rounded-full text-slate-400 hover:text-white">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className="font-bold text-white">
                            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </div>
                        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-1 hover:bg-white/10 rounded-full text-slate-400 hover:text-white">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                            <div key={d} className="text-slate-500 font-medium">{d}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1 flex-1 content-start">
                        {Array(startDay).fill(null).map((_, i) => <div key={`empty-${i}`} />)}
                        {days.map(date => {
                            const dateStr = formatDate(date);
                            const isSelected = selectedDate === dateStr;
                            const isToday = dateStr === formatDate(new Date());
                            const hasEvt = hasEvent(dateStr);

                            return (
                                <button
                                    key={dateStr}
                                    onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                                    className={`
                                        h-8 sm:h-10 rounded-lg flex flex-col items-center justify-center relative transition-all
                                        ${isSelected ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25' : 'hover:bg-white/5 text-slate-300'}
                                        ${isToday && !isSelected ? 'border border-blue-500/50 text-blue-400' : ''}
                                    `}
                                >
                                    <span className="text-xs sm:text-sm font-medium">{date.getDate()}</span>
                                    {hasEvt && (
                                        <span className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full mt-0.5 sm:mt-1 ${isSelected ? 'bg-white' : 'bg-cyan-400'}`}></span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Right: Event List */}
                <div className="lg:w-1/2 flex flex-col min-h-0 border-l border-white/5 pl-0 lg:pl-8">
                    <div className="text-sm font-bold text-slate-400 mb-4 flex items-center justify-between">
                        <span>
                            {selectedDate ? `${selectedDate} 일정` : '다가오는 일정'}
                        </span>
                        {selectedDate && (
                            <button onClick={() => setSelectedDate(null)} className="text-xs text-blue-400 hover:underline">
                                전체 보기
                            </button>
                        )}
                    </div>

                    <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1 max-h-[400px]">
                        {loading ? (
                            Array(5).fill(0).map((_, i) => <LoadingSkeleton key={i} className="h-16 rounded-xl" />)
                        ) : filteredEvents.length === 0 ? (
                            <div className="text-center text-slate-500 py-10 flex flex-col items-center gap-2">
                                <CalendarIcon className="w-8 h-8 opacity-20" />
                                <span>일정이 없습니다.</span>
                            </div>
                        ) : (
                            filteredEvents.map((evt, idx) => (
                                <div key={idx} className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${getEventColor(evt)}`}>
                                    <div className="flex items-center gap-4">
                                        <div className="text-center min-w-[50px]">
                                            <div className="text-xs opacity-70">{evt.date.substring(5)}</div>
                                            <div className="text-sm font-bold">{evt.time}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold flex items-center gap-2">
                                                {evt.ticker && <span className="bg-white/10 px-1.5 py-0.5 rounded text-[10px]">{evt.ticker}</span>}
                                                {evt.event}
                                            </div>
                                            {(evt.forecast || evt.previous) && (
                                                <div className="text-xs opacity-60 mt-1">
                                                    예상: {evt.forecast || '-'} / 이전: {evt.previous || '-'}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-xs font-bold opacity-50 bg-black/20 px-2 py-1 rounded">
                                        {evt.country}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
