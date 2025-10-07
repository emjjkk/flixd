import { useState, useRef } from "react";
import {
  FaDiscord,
  FaGoogle,
  FaBars,
  FaXmark,
  FaUser,
  FaHeart,
  FaList,
  FaStar,
  FaC,
  FaSignal,
} from "react-icons/fa6";
import { useUserProfile } from "../hooks/useUserProfile";

export default function Header() {
  const { user, profile, loading, supabase } = useUserProfile();
  const [isOpen, setIsOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const signInWithProvider = async (provider: "discord" | "google") => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setDropdownOpen(false);
  };

  return (
    <>
      <header className="px-6 md:px-8 fixed w-full z-[40] backdrop-blur-xs">
        <div className="w-full flex items-center justify-between py-3 border-b border-neutral-700">
          {/* Logo + Nav */}
          <div className="flex items-center gap-5">
            <img src="/assets/flixd.png" alt="Flixd" className="w-8 h-auto relative bottom-[1.8px]" />
            <nav className="hidden md:flex items-center gap-5">
              <a href="#" className="text-sm hover:text-white/80">Movies</a>
              <a href="#" className="text-sm hover:text-white/80">TV Shows</a>
              <a href="#" className="text-sm hover:text-white/80">Lists</a>
              <a href="#" className="text-sm hover:text-white/80">News</a>
            </nav>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3 relative">
            {!user ? (
              <button onClick={() => setIsOpen(true)} className="hidden sm:inline px-4 py-2 bg-white text-black text-sm rounded-sm hover:bg-gray-200">
                Sign in
              </button>
            ) : loading ? (
              // Loading skeleton
              <div className="flex items-center gap-2 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-neutral-700" />
              </div>
            ) : (
              <div ref={dropdownRef} className="relative">
                <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-neutral-800">
                  <img src={profile?.avatar_url || "/assets/default-avatar.png"} alt={profile?.display_name || "User"} className="w-8 h-8 rounded-full border" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-neutral-900 border border-neutral-800 rounded-lg shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    <a href="/profile" className="flex items-center gap-2 px-4 py-4 text-sm bg-neutral-700 hover:bg-neutral-800">{profile?.display_name || profile?.username || "User"} </a>
                    <a href="/watchlist" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-neutral-800"><FaList /> Watchlist</a>
                    <a href="/reviews" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-neutral-800"><FaStar /> Reviews</a>
                    <a href="/favorites" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-neutral-800"><FaHeart /> Favorites</a>
                    <a href="/settings" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-neutral-800"><FaC /> Settings</a>
                    <button onClick={signOut} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm hover:bg-neutral-800 text-red-400"><FaSignal /> Sign Out</button>
                  </div>
                )}
              </div>
            )}

            <button onClick={() => setShowMenu(!showMenu)} className="md:hidden text-xl focus:outline-none">
              {showMenu ? <FaXmark /> : <FaBars />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMenu && (
          <nav className="flex flex-col gap-3 py-4 border-b border-neutral-700 md:hidden">
            <a href="#" className="text-sm hover:text-white/80 px-2">Movies</a>
            <a href="#" className="text-sm hover:text-white/80 px-2">TV Shows</a>
            <a href="#" className="text-sm hover:text-white/80 px-2">Lists</a>
            <a href="#" className="text-sm hover:text-white/80 px-2">News</a>
            {!user ? (
              <button onClick={() => { setIsOpen(true); setShowMenu(false); }} className="mt-2 px-4 py-2 bg-white text-black text-sm rounded-sm hover:bg-gray-200">Sign in</button>
            ) : (
              <button onClick={() => { signOut(); setShowMenu(false); }} className="mt-2 px-4 py-2 bg-neutral-800 border border-neutral-700 text-sm rounded-md hover:bg-neutral-700">Sign out</button>
            )}
          </nav>
        )}
      </header>

      {/* Auth Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setIsOpen(false)}>
          <div className="bg-neutral-900 text-white rounded-lg w-full max-w-sm shadow-xl" onClick={(e) => e.stopPropagation()}>
            <img src="/assets/knocking.png" alt="Auth illustration" className="w-full h-auto rounded-t-lg" />
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-5 text-center">Sign in to discover 1000+ movies and TV shows on Flixd</h2>
              <div className="flex flex-col gap-3 mb-2">
                <button onClick={() => signInWithProvider("discord")} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#5865F2] hover:bg-[#4752c4] rounded-md text-sm font-medium"><FaDiscord className="text-lg" /> Continue with Discord</button>
                <button onClick={() => signInWithProvider("google")} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#DB4437] hover:bg-[#a63428] rounded-md text-sm font-medium"><FaGoogle className="text-lg" /> Continue with Google</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
