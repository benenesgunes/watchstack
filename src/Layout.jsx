import Header from "./components/Header";
import { Outlet } from "react-router-dom";

function Layout() {
    return(
        <>
            <Header />
            <main className="mt-16 md:mt-20 lg:mt-24">
                <Outlet />
            </main>
        </>
    )
}

export default Layout