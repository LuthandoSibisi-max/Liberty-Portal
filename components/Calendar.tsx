
import React, { useState } from 'react';
import { MOCK_EVENTS } from '../constants';

export const Calendar: React.FC = () => {
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

    const prevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const nextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const renderCalendarCells = () => {
        const daysInMonth = getDaysInMonth(currentMonth, currentYear);
        const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
        const cells = [];

        // Empty cells for previous month
        for (let i = 0; i < firstDay; i++) {
            cells.push(<div key={`empty-${i}`} className="bg-slate-50 dark:bg-slate-800 min-h-[100px] border border-slate-100 dark:border-slate-700"></div>);
        }

        // Days
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayEvents = MOCK_EVENTS.filter(e => e.date === dateStr);
            const isToday = new Date().toDateString() === new Date(currentYear, currentMonth, day).toDateString();

            cells.push(
                <div key={day} className={`bg-white dark:bg-slate-900 min-h-[100px] border border-slate-100 dark:border-slate-700 p-2 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors group relative ${isToday ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''}`}>
                    <div className={`font-semibold text-sm mb-2 w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-liberty-blue text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                        {day}
                    </div>
                    <div className="space-y-1">
                        {dayEvents.map(event => (
                            <div key={event.id} className={`text-[10px] p-1.5 rounded truncate cursor-pointer shadow-sm border-l-2 ${
                                event.type === 'interview' ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-500 hover:bg-purple-100 dark:hover:bg-purple-900/50' :
                                event.type === 'meeting' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/50' :
                                'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-500 hover:bg-red-100 dark:hover:bg-red-900/50'
                            }`}>
                                <span className="font-bold mr-1">{event.time}</span>
                                {event.title}
                            </div>
                        ))}
                    </div>
                    {/* Add button on hover */}
                    <button className="absolute bottom-2 right-2 w-6 h-6 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-400 dark:text-slate-500 hover:bg-liberty-blue dark:hover:bg-blue-500 hover:text-white dark:hover:text-white items-center justify-center hidden group-hover:flex transition-colors">
                        <i className="fas fa-plus text-xs"></i>
                    </button>
                </div>
            );
        }

        return cells;
    };

    return (
        <div className="p-6 h-full flex flex-col animate-fade-in">
            <div className="flex justify-between items-center mb-6 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-liberty-blue to-liberty-light dark:from-blue-400 dark:to-blue-200">
                        Interview Calendar
                    </h2>
                    <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                        <button className="px-3 py-1 bg-white dark:bg-slate-600 rounded shadow-sm text-xs font-semibold text-slate-700 dark:text-slate-200">Month</button>
                        <button className="px-3 py-1 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">Week</button>
                        <button className="px-3 py-1 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">Day</button>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 transition-colors" onClick={prevMonth}>
                        <i className="fas fa-chevron-left"></i>
                    </button>
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-white w-48 text-center">
                        {monthNames[currentMonth]} {currentYear}
                    </h3>
                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 transition-colors" onClick={nextMonth}>
                        <i className="fas fa-chevron-right"></i>
                    </button>
                    <button onClick={() => alert('Scheduler coming soon!')} className="ml-4 bg-liberty-blue text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-liberty-light transition-colors shadow-sm flex items-center gap-2">
                        <i className="fas fa-plus"></i> Schedule
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex-1 flex flex-col">
                <div className="grid grid-cols-7 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                    {dayNames.map(day => (
                        <div key={day} className="py-3 text-center text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            {day}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 auto-rows-fr bg-slate-200 dark:bg-slate-700 gap-px flex-1">
                    {renderCalendarCells()}
                </div>
            </div>
        </div>
    );
};
