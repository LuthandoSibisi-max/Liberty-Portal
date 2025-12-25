
import React, { useState, useEffect } from 'react';

export const TutorialOverlay: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [step, setStep] = useState(0);

    useEffect(() => {
        const hasSeenTutorial = localStorage.getItem('mno_tutorial_completed');
        if (!hasSeenTutorial) {
            // Delay start slightly for better UX
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleNext = () => {
        setStep(prev => prev + 1);
    };

    const handleSkip = () => {
        setIsVisible(false);
        localStorage.setItem('mno_tutorial_completed', 'true');
    };

    const handleComplete = () => {
        setIsVisible(false);
        localStorage.setItem('mno_tutorial_completed', 'true');
    };

    if (!isVisible) return null;

    const tutorialSteps = [
        {
            title: "Welcome to My Next Opportunity",
            desc: "Your intelligent enterprise recruitment portal powered by Liberty FA. Let's take a quick tour.",
            icon: "fa-door-open",
            color: "text-blue-500"
        },
        {
            title: "AI Assistant",
            desc: "Click the floating sparkle button to access Gemini. Ask about candidates, generate emails, or analyze market trends.",
            icon: "fa-robot",
            color: "text-purple-500"
        },
        {
            title: "Smart Matching",
            desc: "Use the 'AI Scan' feature in the Talent Pool to automatically find the best candidates for your open requests.",
            icon: "fa-wand-magic-sparkles",
            color: "text-indigo-500"
        },
        {
            title: "Media Studio",
            desc: "Create personalized recruitment videos and assets instantly using our generative AI tools.",
            icon: "fa-video",
            color: "text-pink-500"
        }
    ];

    const currentStepData = tutorialSteps[step];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full p-8 relative animate-fade-in-up">
                <button 
                    onClick={handleSkip}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                    <i className="fas fa-times"></i>
                </button>

                <div className="flex flex-col items-center text-center">
                    <div className={`w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center mb-6 shadow-lg ${currentStepData.color}`}>
                        <i className={`fas ${currentStepData.icon} text-4xl animate-bounce`}></i>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">
                        {currentStepData.title}
                    </h3>
                    
                    <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                        {currentStepData.desc}
                    </p>

                    <div className="flex gap-2 mb-8">
                        {tutorialSteps.map((_, i) => (
                            <div 
                                key={i} 
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-liberty-blue dark:bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                            ></div>
                        ))}
                    </div>

                    <div className="flex w-full gap-4">
                        <button 
                            onClick={handleSkip}
                            className="flex-1 py-3 px-6 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                        >
                            Skip
                        </button>
                        {step < tutorialSteps.length - 1 ? (
                            <button 
                                onClick={handleNext}
                                className="flex-1 py-3 px-6 rounded-xl bg-liberty-blue text-white font-bold hover:bg-liberty-light transition-all shadow-lg"
                            >
                                Next
                            </button>
                        ) : (
                            <button 
                                onClick={handleComplete}
                                className="flex-1 py-3 px-6 rounded-xl bg-green-500 text-white font-bold hover:bg-green-600 transition-all shadow-lg"
                            >
                                Get Started
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
