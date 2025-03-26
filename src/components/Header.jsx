import { Link } from "react-router-dom"
import { GiHamburgerMenu } from "react-icons/gi";
import { IoSearch } from "react-icons/io5";
import { CgProfile } from "react-icons/cg";
import { useState } from "react";

function Header() {
    const [ navbarOpen, setNavbarOpen ] = useState(false);

    return(
        <>
            {/*desktop header */}
            <header className="px-8 py-4 rounded-3xl absolute top-6 left-1/2 transform -translate-x-1/2 z-[1000] w-39/40
                               hover:bg-gray-200 text-white hover:text-black 
                               transition-all duration-200 ease-in
                               hidden lg:flex items-center justify-between">
                <div className="flex gap-2">
                    <Link className="link" to="/favorites">
                        Favorites
                    </Link>
                    <Link className="link" to="/watchlist">
                        Watchlist
                    </Link>
                </div>
                <div className="text-3xl font-bold absolute left-1/2 transform -translate-x-1/2 font-logo">
                    <Link to="/">
                        WATCHSTACK
                    </Link>
                </div>
                <div className="text-4xl font-bold flex gap-4 items-center">
                    <Link className="link" to="/about">
                        About
                    </Link>
                    <Link className="link" to="/search">
                        <IoSearch />
                    </Link>
                    <Link to="/profile">
                        <CgProfile className="hover:scale-110 transition-all" />
                    </Link>
                </div>
            </header>

            {/*mobile header */}
            <header className="flex justify-between items-center lg:hidden text-gray-100 absolute top-6 md:top-8 left-1/2 transform -translate-x-1/2 z-[998] w-9/10">
                <Link to="/profile" className="text-gray-100 text-3xl md:text-4xl">
                    <CgProfile />
                </Link>
                <div className="text-2xl md:text-3xl font-bold absolute left-1/2 transform -translate-x-1/2 font-logo">
                    <Link to="/">
                        WATCHSTACK
                    </Link>
                </div>
                <button onClick={() => {
                    document.getElementById("navbar").classList.toggle("navbarOn");
                    document.getElementById("hamburger").classList.toggle("hamburgerBtnOn");
                    setNavbarOpen((n) => !n);
                }} className="text-gray-100 text-3xl md:text-4xl z-[1001] cursor-pointer">
                    <GiHamburgerMenu />
                </button>
            </header>
            <button id="hamburger" onClick={() => {
                document.getElementById("navbar").classList.toggle("navbarOn");
                document.getElementById("hamburger").classList.toggle("hamburgerBtnOn");
                setNavbarOpen((n) => !n);
            }} className="text-gray-100 text-3xl md:text-4xl cursor-pointer fixed right-1/20 top-6 md:top-8 z-[1000] hidden">
                <GiHamburgerMenu />
            </button>

            {navbarOpen && <div onClick={() => document.getElementById("hamburger").click()} className="fixed inset-0 z-[998]"></div>}

            {/*navbar for mobile */}
            <div id="navbar" className="fixed top-0 right-[-100%] 
                                        w-1/2 md:w-1/3 h-full bg-black text-white z-[999] 
                                        transition-all duration-200 ease-in
                                        flex flex-col pt-20 shadow-2xl">
                <Link className="navbarLink border-t-2" to="/favorites">
                    Favorites
                </Link>
                <Link className="navbarLink" to="/watchlist">
                    Watchlist
                </Link>
                <Link className="navbarLink" to="/search">
                    Search
                </Link>
                <Link className="navbarLink" to="/about">
                    About
                </Link>
            </div>
        </>
    )
}

export default Header