"use client";
import { useState } from "react";
import Image from "next/image";

const navigationItems = ["Home", "About Me", "Portfolio", "Services"];

export const SiteHeader = () => {
    const [activeItem, setActiveItem] = useState("Home");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleNavigation = (item: string) => {
        setActiveItem(item);
        setIsMobileMenuOpen(false);
    };

    return (
        <header className="relative w-full bg-dark-03 border-b border-dark-12">
            <div className="max-w-[1440px] mx-auto flex items-center justify-between px-6 lg:px-[62px] py-5 border-l border-r border-dark-12">
                {/* Logo */}
                <a href="/" aria-label="Homepage" className="relative flex items-center">
                    <span className="font-bold text-2xl tracking-widest text-absolutewhite uppercase">DAMIEN</span>
                </a>

                {/* Desktop Navigation */}
                <nav className="hidden lg:flex items-center rounded-lg border border-dark-12 overflow-hidden">
                    {navigationItems.map((item, index) => {
                        const isActive = activeItem === item;
                        const isLastItem = index === navigationItems.length - 1;

                        return (
                            <button
                                key={item}
                                type="button"
                                aria-current={isActive ? "page" : undefined}
                                onClick={() => handleNavigation(item)}
                                className={`box-border cursor-pointer flex items-center justify-center h-[54px] ${
                                    index === 0 ? "px-[30px]" : "px-[30px]"
                                } ${
                                    isActive
                                        ? "bg-dark-08"
                                        : "bg-transparent hover:bg-dark-06"
                                } ${!isActive && !isLastItem ? "border-r border-dark-12" : ""} transition-colors`}
                            >
                                <span
                                    className={`font-medium text-sm whitespace-nowrap ${
                                        isActive ? "text-absolutewhite" : "text-grey-70"
                                    } hover:text-absolutewhite transition-colors`}
                                >
                                    {item}
                                </span>
                            </button>
                        );
                    })}
                </nav>

                {/* Contact Button (Desktop) */}
                <a
                    href="#contact"
                    className="hidden lg:inline-flex items-center justify-center px-6 h-[54px] bg-dark-12 rounded-lg cursor-pointer border border-dark-20 hover:bg-dark-20 transition-colors"
                >
                    <span className="font-medium text-absolutewhite text-sm whitespace-nowrap">
                        Contact Me
                    </span>
                </a>

                {/* Hamburger Button (Mobile & Tablet) */}
                <button
                    className="lg:hidden text-absolutewhite p-2"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {isMobileMenuOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>
            </div>

            {/* Mobile Navigation Menu */}
            {isMobileMenuOpen && (
                <div className="lg:hidden absolute top-full left-0 w-full bg-dark-06 border-b border-dark-12 py-6 flex flex-col items-center gap-6 z-50">
                    {navigationItems.map((item) => (
                        <button
                            key={item}
                            onClick={() => handleNavigation(item)}
                            className={`text-lg font-medium ${activeItem === item ? "text-absolutewhite" : "text-grey-70"}`}
                        >
                            {item}
                        </button>
                    ))}
                    <a
                        href="#contact"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="mt-2 px-8 py-3 bg-purple-55 hover:bg-purple-60 transition-colors text-absolutewhite rounded-full font-medium"
                    >
                        Contact Me
                    </a>
                </div>
            )}
        </header>
    );
};
