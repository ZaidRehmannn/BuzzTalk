import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import './PreLoader.css';

const PreLoader = () => {
    const [isComplete, setIsComplete] = useState(false);
    const [progress, setProgress] = useState(0);
    const companyName = "BuzzTalk";
    const loaderDuration = 3000;

    useEffect(() => {
        const timer = setInterval(() => {
            setProgress(prev => {
                const newProgress = prev + 1;
                if (newProgress >= 100) {
                    clearInterval(timer);
                    setTimeout(() => {
                        setIsComplete(true);
                    }, 500);
                    return 100;
                }
                return newProgress;
            });
        }, 30);

        const timeout = setTimeout(() => {
            setIsComplete(true);
        }, loaderDuration);

        return () => {
            clearInterval(timer);
            clearTimeout(timeout);
        };
    }, []);

    const letters = companyName.split('');

    return (
        <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: isComplete ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="preloader-wrapper"
            style={{
                pointerEvents: isComplete ? "none" : "all"
            }}
        >
            {/* Floating background dots */}
            {[...Array(5)].map((_, i) => (
                <div
                    key={i}
                    className={`floating-dot float${i}`}
                    style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`
                    }}
                />
            ))}

            {/* Logo pulse */}
            <div className="mb-8 relative z-10">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-white flex items-center justify-center shadow-lg">
                    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-purple-600"></div>
                    </div>
                </div>
            </div>

            {/* Company Name Animation */}
            <div className="flex justify-center mb-8 z-10">
                {letters.map((letter, index) => (
                    <motion.span
                        key={index}
                        initial={{ y: 40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{
                            duration: 0.6,
                            delay: 0.5 + index * 0.08,
                            ease: "easeOut"
                        }}
                        className="text-4xl md:text-5xl font-bold inline-block mx-1"
                        style={{
                            color: '#ffffff',
                            fontFamily: "'Montserrat', sans-serif"
                        }}
                    >
                        {letter}
                    </motion.span>
                ))}
            </div>

            {/* Progress Bar */}
            <div className="w-64 md:w-80 h-1 bg-white rounded-full overflow-hidden relative z-10">
                <motion.div
                    className="h-full bg-purple-600 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.1, ease: "linear" }}
                />
            </div>

            <motion.p
                className="mt-4 text-white font-medium z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                {progress}%
            </motion.p>
        </motion.div>
    );
};

export default PreLoader;
