import useAuth from "../hooks/useAuth";
import { FaImdb } from "react-icons/fa";
import { SiRottentomatoes } from "react-icons/si";
import { TbClockMinus } from "react-icons/tb";
import useWatchlist from "../hooks/useWatchlist";
import { Link } from "react-router-dom";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../config/firebase";

function Watchlist() {
    const { user, loading } = useAuth();
    const { watchlist } = useWatchlist();

    const removeWatchlist = async (titleId) => {
        const watchlistRef = doc(db, "users", user.uid, "watchlist", titleId);

        try {
            await deleteDoc(watchlistRef);
            console.log("Title removed from the watchlist!");
        }
        catch(error) {
            console.log(error);
        }
    }
    
    return(
        user && !loading ?
            <div className="w-full p-4 md:p-6 lg:p-8
                          flex flex-col gap-4 md:gap-6">
                <h1 className="text-2xl md:text-3xl text-white font-bold">Your Watchlist</h1>
                {watchlist.map((title) => (
                    <div key={title.id} className="w-full h-44 md:h-60 p-3 md:p-4 space-x-4 border-b-2 text-white flex">
                        <img className="h-full aspect-2/3 rounded-xl md:rounded-2xl" src={title.poster} alt="" />
                        <div className="flex flex-col justify-evenly">
                            <Link className="hover:borber-b-2" to={`/title/${title.id}`}>
                                <h2 className="text-xl md:text-2xl font-semibold">{title.title} </h2>
                            </Link>
                            <p className="hidden md:block lg:text-lg">{title.plot} </p>
                            <div className="flex flex-wrap gap-4">
                                <p className="flex items-center gap-2 font-semibold md:text-lg"><FaImdb className="text-xl md:text-2xl lg:text-3xl text-yellow-400" />{title.imdbScore} </p>
                                {title.rottenTomatoesScore && <p className="flex items-center gap-2 font-semibold md:text-lg"><SiRottentomatoes className="text-xl md:text-2xl lg:text-3xl text-red-500" />{title.rottenTomatoesScore} </p>}
                            </div>
                            <TbClockMinus onClick={() => removeWatchlist(title.id)} className="text-2xl lg:text-3xl text-blue-900 cursor-pointer hover:scale-110 transition-all" />
                        </div>
                    </div>
                ))}
                {watchlist.length === 0 && <p className="text-xl md:text-3xl lg:text-4xl font-semibold text-white absolute top-1/2 left-1/2 transform -translate-1/2 whitespace-nowrap">No titles in your watchlist!</p>}
            </div>
        : null
    )
}

export default Watchlist