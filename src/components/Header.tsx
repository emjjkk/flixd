import { useState } from "react";
import { FaDiscord, FaGoogle, FaBars, FaXmark } from "react-icons/fa6";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  return (
    <>
      <header className="px-6 md:px-8 fixed w-full z-[999]">
        <div className="w-full flex items-center justify-between py-4 border-b border-neutral-600">
          {/* Left side: Logo + Nav */}
          <div className="flex items-center gap-5">
            <img
              src="/assets/flixd.png"
              alt="Flixd"
              className="w-8 h-auto relative bottom-[1.8px]"
            />

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-5">
              <a href="#" className="text-sm hover:text-white/80">
                Movies
              </a>
              <a href="#" className="text-sm hover:text-white/80">
                TV Shows
              </a>
              <a href="#" className="text-sm hover:text-white/80">
                Lists
              </a>
              <a href="#" className="text-sm hover:text-white/80">
                News
              </a>
            </nav>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOpen(true)}
              className="hidden sm:inline px-4 py-2 bg-white text-black text-sm rounded-sm hover:bg-gray-200"
            >
              Sign in
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="md:hidden text-xl focus:outline-none"
            >
              {showMenu ? <FaXmark /> : <FaBars />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMenu && (
          <nav className="flex flex-col gap-3 py-4 border-b border-neutral-700 md:hidden">
            <a href="#" className="text-sm hover:text-white/80 px-2">
              Movies
            </a>
            <a href="#" className="text-sm hover:text-white/80 px-2">
              TV Shows
            </a>
            <a href="#" className="text-sm hover:text-white/80 px-2">
              Lists
            </a>
            <a href="#" className="text-sm hover:text-white/80 px-2">
              News
            </a>
            <button
              onClick={() => {
                setIsOpen(true);
                setShowMenu(false);
              }}
              className="mt-2 px-4 py-2 bg-white text-black text-sm rounded-sm hover:bg-gray-200"
            >
              Sign in
            </button>
          </nav>
        )}
      </header>

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-neutral-900 text-white p-6 rounded-lg w-full max-w-sm shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-5 text-center">
              Sign in to discover 1000+ movies and TV shows on Flixd
            </h2>
            <div className="flex flex-col gap-3 mb-2">
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#5865F2] hover:bg-[#4752c4] rounded-md text-sm font-medium">
                <FaDiscord className="text-lg" /> Continue with Discord
              </button>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#DB4437] hover:bg-[#a63428] rounded-md text-sm font-medium">
                <FaGoogle className="text-lg" /> Continue with Google
              </button>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="mt-4 text-sm text-gray-400 hover:text-gray-200 w-full text-center"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
