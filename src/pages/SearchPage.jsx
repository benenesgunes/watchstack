import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { IoSearch } from "react-icons/io5";

function SearchPage() {
    const [ page, setPage ] = useState(1);
    const [ title, setTitle ] = useState("");
    const [ type, setType ] = useState("");

    const fetchSearch = async () => {
        try{    
            const response = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(title)}&type=${type}&page=${page}&apikey=450c5272`);
            
            if(!response.ok) {
                throw new Error("Something went wrong!")
            }

            return response.json();
        }
        catch(error) {
            console.log(error);
        }
    }
    
    const { data, isFetching, error } = useQuery({
        queryKey: ['search', page, title, type],
        queryFn: fetchSearch
    })

    const handleTitle = () => {
        const titleValue = document.getElementById("titleInput").value;
        setTitle(titleValue);
        setPage(1);
    }

    const handleFilter = (filter) => {
        setType(filter);
    }

    if(isFetching) return <p className="text-4xl text-white absolute top-1/2 left-1/2 transform -translate-1/2">Loading...</p>;

    return(
        !isFetching ?
            <div className="w-full p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 lg:space-y-8">
                <div className="w-full flex items-center gap-2">
                    <input id="titleInput" type="text" className="bg-white w-full
                                                md:text-xl lg:text-2xl
                                                p-2 md:p-3 lg:p-4 rounded-3xl md:rounded-4xl" placeholder="Search a title" onKeyDown={(e) => e.key === "Enter" && handleTitle()}/>
                    <button className="bg-white h-max aspect-square
                                       md:text-xl lg:text-2xl
                                       p-3 md:p-4 lg:p-5
                                       flex items-center justify-center
                                       rounded-[50%] cursor-pointer
                                       hover:bg-gray-200" onClick={handleTitle}>
                        <IoSearch />
                    </button>
                </div>
                <div className="flex gap-2">
                    <input className="hidden filterRadio" type="radio" name="filter" id="all" defaultChecked={type === ""} onChange={() => handleFilter("")}/>
                    <label className="filterBtn" htmlFor="all">all</label>
                    <input className="hidden filterRadio" type="radio" name="filter" id="movies" defaultChecked={type === "movie"} onChange={() => handleFilter("movie")}/>
                    <label className="filterBtn" htmlFor="movies">movies</label>
                    <input className="hidden filterRadio" type="radio" name="filter" id="series" defaultChecked={type === "series"} onChange={() => handleFilter("series")}/>
                    <label className="filterBtn" htmlFor="series">series</label>
                    <input className="hidden filterRadio" type="radio" name="filter" id="episodes" defaultChecked={type === "episode"} onChange={() => handleFilter("episode")}/>
                    <label className="filterBtn" htmlFor="episodes">episodes</label>
                </div>
                {data.Response === "True" ? 
                    <>
                        <h1 className="text-2xl md:text-3xl text-white font-bold">Results</h1>
                        <div className="flex flex-col gap-4 md:gap-6 md:grid md:grid-cols-2">
                            {data.Search.map((result) => (
                                <div key={result.imdbID} className="w-full h-48 md:h-64 p-3 md:p-4 border-b-2 text-white flex items-center gap-4">
                                    <img className="h-full aspect-2/3 rounded-xl md:rounded-2xl" src={result.Poster} alt={result.Title} />
                                    <div className="flex flex-col gap-1 flex-wrap">
                                        <Link className="hover:borber-b-2" to={`/title/${result.imdbID}`}>
                                            <h2 className="text-xl md:text-2xl font-semibold">{result.Title} </h2>
                                        </Link>
                                        <p className="text-white/30 md:text-2xl">{result.Year} </p>
                                        <p className="text-white/30 md:text-2xl">{result.Type} </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-4 md:gap-6 lg:gap-8 w-full justify-center">
                            {page !== 1 && <button onClick={() => setPage((p) => p-1)} className="text-xl md:text-2xl lg:text-3xl text-white cursor-pointer hover:text-gray-300">prev</button>}
                            <p className="text-xl md:text-2xl lg:text-3xl text-white font-bold">page {page} of {Math.ceil(data.totalResults/10)} </p>
                            {page !== Math.ceil(data.totalResults/10) && <button onClick={() => setPage((p) => p+1)} className="text-xl md:text-2xl lg:text-3xl text-white cursor-pointer hover:text-gray-300">next</button>}
                        </div>
                    </> 
                    :   
                    <p className="text-2xl md:text-3xl lg:text-4xl text-white 
                                  absolute top-1/2 left-1/2 transform -translate-1/2 
                                  whitespace-nowrap">
                        Nothing is here!
                    </p>
                }
            </div>
        : null
    )
}

export default SearchPage