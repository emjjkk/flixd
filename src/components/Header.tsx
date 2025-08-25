import { Button } from './ui/button';
import { Input } from './ui/input';

export default function Header() {
    return (
        <header className="w-full px-15 py-5 flex bg-transparent justify-between items-center fixed top-0 z-30 bg-gradient-to-b from-black/70 to-transparent">
            <div className="flex items-center gap-5">
                <div className="flex items-center gap-2">
                    <img src="/assets/logo.png" className="w-9 h-auto rounded-md relative bottom-[0.7px]" alt="xd" />
                    <span className="font-bold text-sm">Flixd</span>
                </div>
                <nav className="flex items-center gap-3">
                    <a href="#" className="text-sm hover:underline underline-offset-4 decoration-2 decoration-blue-600">Home</a>
                    <a href="#" className="text-sm hover:underline underline-offset-4 decoration-2 decoration-blue-600">Movies</a>
                    <a href="#" className="text-sm hover:underline underline-offset-4 decoration-2 decoration-blue-600">TV Shows</a>
                    <a href="#" className="text-sm hover:underline underline-offset-4 decoration-2 decoration-blue-600">News</a>
                </nav>
            </div>
            <div className="flex items-center gap-5">
                <div className="flex w-full max-w-sm items-center gap-2">
                    <Input type="search" placeholder="Search..."/>
                    <Button type="submit" variant="outline">
                        Search
                    </Button>
                </div>
            </div>
        </header>
    )
}