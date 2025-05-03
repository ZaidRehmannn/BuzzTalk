import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import './LogoutLoader.css';

const LogoutLoader = () => {
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setIsComplete(true);
        }, 2000);

        return () => clearTimeout(timeout);
    }, []);

    const letters = "Logging out...".split('');

    return (
        <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: isComplete ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="logout-wrapper"
            style={{
                pointerEvents: isComplete ? 'none' : 'all',
            }}
        >
            {/* Fading circle animation */}
            <div className="logout-spinner" />

            {/* Animated text */}
            <div className="logout-text">
                {letters.map((char, i) => (
                    <motion.span
                        key={i}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 + i * 0.05 }}
                        className="logout-letter"
                    >
                        {char}
                    </motion.span>
                ))}
            </div>
        </motion.div>
    );
};

export default LogoutLoader;
