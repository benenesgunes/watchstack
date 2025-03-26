import { Link } from "react-router-dom"
import { useState, useEffect } from "react"
import { auth } from "../config/firebase";
import { useQuery } from "@tanstack/react-query"
import Batman from "../assets/batman.jpg";
import Joker from "../assets/joker.jpg";
import Venom from "../assets/venom.jpg";
import JohnWick from "../assets/johnwick.jpg";
import Daredevil from "../assets/daredevil.jpg"

// filmlere yorum yapma eklenecek
// yorum yapilan filmleri eklemek icin firebasede db altinda commentedTitles diye collection olustur
// filmin imdbID'sini yorumu yapan kisinin kullanici adini kaydet commentedTitles'a rastgele bi doc id olusturarak (addDoc kullan yani)
// TitlePage'de de yorumlar diye listeleyip goruntule 

// su da koyulsa guzel olur:
// 10 uzerinden rating. yorum eklerken bi input daha verilir en fazla 10 girilecek sekilde TitlePage'deki yorumlarda o da gozukur commentedMovies'e userRating diye de eklersin
// hatta userRatinglerin ortalamasi alinabilir watchstack rating diye de istatistik eklenebilir

// bi ozellik daha:
// kullanici profili goruntuleme eklenebilir
// her kullanicinin favorileri ve yorumlari goruntulenebilir
// bunun icin username ile kullanici arama ozelligi de getirilmesi lazim tabi

function Home() {
    const [user, setUser] = useState();
    const [loading, setLoading] = useState(true);
    const backgrounds = [Batman, Joker, Venom, JohnWick, Daredevil];
    const randomBackground = backgrounds[Math.floor(Math.random() * backgrounds.length)];

    const movieTitles = ["Drive", "Inception", "Django Unchained", "The Dark Knight", "Spider-Man 2", "Interstellar", "Superbad", "Pulp Fiction", "Cars", "American Psycho", "Zodiac", "The Hangover", "The Nice Guys"];
    const showTitles = ["Archer", "The Office", "Invincible", "South Park", "Suits", "Family Guy", "Parks and Recreation", "Rick and Morty", "Leyla and Mecnun", "Fleabag", "Better Call Saul", "Dexter", "Ted Lasso", "Peep Show"]
    
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setUser(user);
            setLoading(false);
        })

        return () => unsubscribe();
    }, [])

    const fetchTitle = async (title) => {
        try {
            const response = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=450c5272`)

            if(!response.ok) {
                throw new Error("Something wrong with the OMDb API");
            }

            return response.json();
        }
        catch(error) {
            console.log(error);
        }
    }

    const fetchMovies = async () => {
        return Promise.all(movieTitles.map((movie) => fetchTitle(movie)));
    }

    const fetchShows = async () => {
        return Promise.all(showTitles.map((show) => fetchTitle(show)));
    }

    const { data: movies, isFetching: fetchingMovie, error: errorMovie} = useQuery({
        queryKey: ['popularMovies'],
        queryFn: fetchMovies
    })

    const { data: shows, isFetching: fetchingShow, error: errorShow } = useQuery({
        queryKey: ['popularShows'],
        queryFn: fetchShows
    })

    if(errorMovie || errorShow) return "Something went wrong!";
    if(loading || fetchingMovie || fetchingShow) return <p className="text-4xl text-white absolute top-1/2 left-1/2 transform -translate-1/2">Loading...</p>

    return(
        <>
            <div className="w-full h-full absolute top-0 left-0 z-[-1] bg-center bg-cover" style={{ backgroundImage: `url(${randomBackground})` }}></div>
            <div className="absolute top-[100%] w-full">
                <h1 className="text-2xl md:text-3xl text-white font-bold m-4 md:m-8">Popular Movies</h1>
                <div className="popular w-full mx-auto h-56 md:h-64 lg:h-72 p-4 flex gap-4 md:gap-6 lg:gap-8 overflow-x-auto ">
                    {movies.map((movie) => (
                        <Link key={movie.imdbID} className="h-full aspect-2/3" to={`/title/${movie.imdbID}`}>
                            <img className="aspect-2/3 rounded-2xl md:rounded-3xl hover:scale-105 transition-all" key={movie.imdbID} src={movie.Poster} alt={movie.Title} />
                        </Link>
                    ))}
                </div>
                <h1 className="text-2xl md:text-3xl text-white font-bold m-4 md:m-8">Popular TV Shows</h1>
                <div className="popular w-full mx-auto h-56 md:h-64 lg:h-72 p-4 flex gap-4 md:gap-6 lg:gap-8 overflow-x-auto ">
                    {shows.map((show) => (
                        <Link key={show.imdbID} className="h-full aspect-2/3" to={`/title/${show.imdbID}`}>
                            <img className="aspect-2/3 rounded-2xl md:rounded-3xl hover:scale-105 transition-all" key={show.imdbID} src={show.Poster} alt={show.Title} />
                        </Link>
                    ))}
                </div>
            </div>
            <div className='p-8 md:p-12
                            absolute left-1/2 top-4/5 transform -translate-x-1/2 -translate-y-4/5 
                            rounded-4xl w-19/20 md:w-4/5 lg:w-7/10
                            bg-black/80
                            flex flex-col gap-4'>
                <h1 className='text-gray-100 font-bold text-2xl md:text-3xl'>Simple and to the point</h1>
                <div className='flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8'>
                    <p className='text-gray-100 md:text-xl'>Stack up your favorite movies and tv shows or add them to your watchlist to watch them later</p>
                    {!user && 
                        <Link to="/signup">
                            <button className='btn whitespace-nowrap'>
                                Sign up here
                            </button>
                        </Link>
                    }
                </div>    
            </div>
        </>
    )
}

export default Home