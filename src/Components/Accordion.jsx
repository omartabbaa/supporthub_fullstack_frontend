// Accordion.js
import React, { useState, useRef, useEffect } from 'react';
import './Accordion.css';

const Accordion = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const contentRef = useRef(null);
    const [height, setHeight] = useState('0px');

    const toggleAccordion = () => {
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        const contentEl = contentRef.current;

        if (!contentEl) return;

        const updateHeight = () => {
            if (isOpen) {
                const scrollHeight = contentEl.scrollHeight;
                setHeight(`${scrollHeight}px`);
            } else {
                setHeight('0px');
            }
        };

        updateHeight();

        // Initialize ResizeObserver to watch for content changes
        const resizeObserver = new ResizeObserver(() => {
            updateHeight();
        });

        resizeObserver.observe(contentEl);

        return () => {
            resizeObserver.disconnect();
        };
    }, [isOpen, children]);

    return (
        <div className="accordion">
            <div className="accordion-header" onClick={toggleAccordion}>
                <h2>{title}</h2>
                <button className="accordion-toggle">
                    {isOpen ? '-' : '+'}
                </button>
            </div>
            <div
                ref={contentRef}
                style={{ maxHeight: `${height}` }}
                className={`accordion-content ${isOpen ? 'open' : ''}`}
            >
                {children}
            </div>
        </div>
    );
};

export default Accordion;
