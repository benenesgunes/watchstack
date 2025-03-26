import { IoMdHeart } from "react-icons/io";
import { IoMdHeartDislike } from "react-icons/io";
import { TbClock } from "react-icons/tb";
import { TbClockMinus } from "react-icons/tb";
import { FaComment } from "react-icons/fa";
import { FaImdb } from "react-icons/fa";
import { SiRottentomatoes } from "react-icons/si";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { auth, db } from "../config/firebase";
import { Link } from "react-router-dom";
import { doc, setDoc, serverTimestamp, deleteDoc, getDoc, collection, addDoc, query, orderBy, onSnapshot } from "firebase/firestore";

function TitlePage() {
    const [ moreOpen, setMoreOpen ] = useState(false);
    const [ user, setUser ] = useState();
    const [ loading, setLoading ] = useState(true);
    const [ inWatchlist, setInWatchlist] = useState(false);
    const [ inFavorites, setInFavorites ] = useState(false);
    const [ comments, setComments ] = useState([]);
    const { id } = useParams();
    const commentRef = useRef();

    const fetchMedia = async () => {
        try {
            const response = await fetch(`https://www.omdbapi.com/?i=${id}&apikey=450c5272`);

            if(!response.ok) {
                throw new Error("Something wrong with OMDb API")
            }

            return response.json();
        }
        catch(error) {
            console.log(error);
        }
    }

    const { data, isFetching, error } = useQuery({
        queryKey: ['media', id],
        queryFn: fetchMedia
    })

    useEffect(() => {
        const unsubscribeAuth = auth.onAuthStateChanged((user) => {
            setUser(user);
        })
        
        let unsubscribeComments;

        if(data) {
            const commentsQuery = query(collection(db, "commentedMovies", data?.imdbID, "comments"), orderBy("createdAt", "desc"));
            unsubscribeComments = onSnapshot(commentsQuery, (snapshot) => {
                let updatedComments = [];

                snapshot.forEach((doc) => {
                    updatedComments.push(doc.data());
                })
                setComments(updatedComments);
                setLoading(false);
            })
        }
        return () => {
            unsubscribeAuth();
            if(unsubscribeComments) {
                unsubscribeComments();
            }
        }
    }, [data])

    const addToFavorites = async () => {
        const favoriteRef = doc(db, "users", user.uid, "favorites", data.imdbID);

        try {
            await setDoc(favoriteRef, {
                title: data.Title,
                poster: data.Poster,
                plot: data.Plot,
                imdbScore: data.imdbRating,
                id: data.imdbID,
                createdAt: serverTimestamp()
            })
            // adds rotten tomatoes score if it exists
            if(data.Ratings[1] && data.Ratings[1].Source === "Rotten Tomatoes") {
                await setDoc(favoriteRef, {
                    rottenTomatoesScore: data.Ratings[1].Value
                }, { merge: true })
            }
            setInFavorites(true);
            console.log("Title added to the favorites: ", data.Title);
        }
        catch(error) {
            console.log(error);
        }
    }

    const removeFavorites = async () => {
        const favoritesRef = doc(db, "users", user.uid, "favorites", data.imdbID);

        try {
            await deleteDoc(favoritesRef);
            setInFavorites(false);
            console.log("Title removed from the favorites!");
        }
        catch(error) {
            console.log(error);
        }
    }

    const addToWatchlist = async () => {
        const watchlistRef = doc(db, "users", user.uid, "watchlist", data.imdbID);

        try {
            await setDoc(watchlistRef, {
                title: data.Title,
                poster: data.Poster,
                plot: data.Plot,
                imdbScore: data.imdbRating,
                id: data.imdbID,
                createdAt: serverTimestamp()
            })
            // adds rotten tomatoes rating if it exists
            if(data.Ratings[1] && data.Ratings[1].Source === "Rotten Tomatoes") {
                await setDoc(watchlistRef, {
                    rottenTomatoesScore: data.Ratings[1].Value
                }, { merge: true })
            }
            setInWatchlist(true);
            console.log("Title added to the watchlist!", data.Title);
        }
        catch(error) {
            console.log(error);
        }
    }
    
    const removeWatchlist = async () => {
        const watchlistRef = doc(db, "users", user.uid, "watchlist", data.imdbID);

        try {
            await deleteDoc(watchlistRef);
            setInWatchlist(false);
            console.log("Title removed from the watchlist!");
        }
        catch(error) {
            console.log(error);
        }
    }

    useEffect(() => {
        const titleFavoritesStatus = async () => {
            if(user && user.uid && data && data.imdbID) {
                setLoading(true);
                const result = await checkFavorites();
                setInFavorites(result);
                setLoading(false);
            }
            else {
                setLoading(false);
            }
        }

        titleFavoritesStatus();
    }, [data?.imdbID, user?.uid, db]);

    useEffect(() => {
        const titleWatchlistStatus = async () => {
            if(user && user.uid && data && data.imdbID) {
                setLoading(true);
                const result = await checkWatchlist();
                setInWatchlist(result);
                setLoading(false);
            }
            else {
                setLoading(false);
            }
        }

        titleWatchlistStatus();
    }, [data?.imdbID, user?.uid, db]);

    const checkFavorites = async () => {
        const favoritesRef = doc(db, "users", user.uid, "favorites", data.imdbID);
        const docSnap = await getDoc(favoritesRef);

        if(docSnap.exists()) {
            return true;
        }
        else {
            return false;
        }
    }

    const checkWatchlist = async () => {
        const watchlistRef = doc(db, "users", user.uid, "watchlist", data.imdbID);
        const docSnap = await getDoc(watchlistRef);

        if(docSnap.exists()) {
            return true;
        }
        else {
            return false;
        }
    }

    const addComment = async () => {
        const commentedMovieRef = collection(db, "commentedMovies", data.imdbID, "comments");
        const userCommentsRef = collection(db, "users", user.uid, "usersComments");
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.data();
        
        await addDoc(commentedMovieRef, {
            idCommentedBy: user.uid,
            nameCommentedBy: userData.username,
            comment: commentRef.current.value,
            createdAt: serverTimestamp()
        })

        await addDoc(userCommentsRef, {
            commentedToName: data.Title,
            commentedToId: data.imdbID,
            comment: commentRef.current.value,
            createdAt: serverTimestamp()
        })

        console.log("Comment added to the database!");
        commentRef.current.value = "";
    }

    if(isFetching || loading) return <p className="text-4xl text-white absolute top-1/2 left-1/2 transform -translate-1/2">Loading...</p>

    return(
        !loading ?
        <>
            <div className="w-full flex flex-col lg:flex-row gap-4 md:gap-8 items-center text-white p-4 md:p-8">
                <img className="aspect-22/30 h-52 md:h-56 lg:h-72 rounded-2xl" src={data.Poster} alt={data.Title} />
                <div className="flex flex-col items-center lg:items-start gap-4 md:gap-8">
                    <div className="flex flex-col items-center lg:items-start gap-4 md:gap-8">
                        <div className="flex flex-col gap-1 md:gap-2 lg:gap-6 lg:flex-row lg:flex-wrap items-center lg:items-end">
                            <h2 className="text-2xl md:text-3xl font-bold">{data.Title}</h2>
                            <p className="text-white/30 md:text-xl">{data.Genre} </p>
                            <p className="text-white/30 md:text-xl">{data.Year} </p>
                        </div>
                        <div className="flex gap-4 md:gap-6 ">
                            <p className="flex items-center gap-2 font-semibold md:text-2xl"><FaImdb className="text-2xl md:text-4xl text-yellow-400" />{data.imdbRating} </p>
                            {data.Ratings[1] && data.Ratings[1].Source === "Rotten Tomatoes" && <p className="flex items-center gap-2 font-semibold md:text-2xl"><SiRottentomatoes className="text-2xl md:text-4xl text-red-500" />{data.Ratings[1].Value} </p>}
                        </div>
                    </div>
                    <p className="text-center lg:text-start md:text-xl">
                        {data.Plot}
                    </p>
                </div>
            </div>
            <div className="text-white flex flex-col lg:flex-row lg:mx-auto lg:w-fit">
                <div className="flex flex-col gap-4 md:gap-8 p-4 md:p-8"> 
                    <h2 className="text-2xl md:text-3xl font-semibold text-center lg:text-start">Cast and Crew</h2>
                    <p className="md:text-xl"><span className="font-semibold">Director:</span> {data.Director} </p>
                    <p className="md:text-xl"><span className="font-semibold">Writer:</span> {data.Writer} </p>
                    <p className="md:text-xl"><span className="font-semibold">Stars:</span> {data.Actors} </p>
                </div>
                <div className="text-white grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 p-4 md:p-8"> 
                    <h2 className="text-2xl md:text-3xl font-semibold text-center lg:text-start lg:col-start-1 lg:col-end-3">More Information</h2>
                    <p className="md:text-xl"><span className="font-semibold">Awards:</span> {data.Awards} </p>
                    <p className="md:text-xl"><span className="font-semibold">Rated:</span> {data.Rated} </p>
                    <p className="md:text-xl"><span className="font-semibold">Released:</span> {data.Released} </p>
                    <p className="md:text-xl"><span className="font-semibold">Runtime:</span> {data.Runtime} </p>
                    <p className="md:text-xl"><span className="font-semibold">Language:</span> {data.Language} </p>
                    <p className="md:text-xl"><span className="font-semibold">Country:</span> {data.Country} </p>
                </div>
            </div>
            {user && 
                <div id="more" className="m-4 md:m-8 
                                          fixed bottom-0 right-0
                                          flex flex-col gap-4 z-[999]">
                    <div id="moreBtn" className="flex flex-col gap-4 opacity-0 invisible transition-all ease-linear">
                        {!inWatchlist ?
                            <button onClick={addToWatchlist} className="btnInTitlePage bg-gray-100 text-blue-900 hover:bg-gray-300">
                                <TbClock />
                            </button> 
                            :
                            <button onClick={removeWatchlist} className="btnInTitlePage bg-blue-900 text-white hover:bg-blue-950">
                                <TbClockMinus />
                            </button>
                        }
                        {!inFavorites ? 
                            <button onClick={addToFavorites} className="btnInTitlePage bg-gray-100 text-red-700 hover:bg-gray-300">
                                <IoMdHeart />
                            </button>
                            :
                            <button onClick={removeFavorites} className="btnInTitlePage bg-red-700 text-white hover:bg-red-800">
                                <IoMdHeartDislike />
                            </button>       
                        }
                    </div>
                    <button id="threeDots" className="btnInTitlePage bg-gray-100" onClick={() => {document.getElementById("moreBtn").classList.toggle("showMore"); setMoreOpen((m) => !m)}}>
                        <HiOutlineDotsVertical />
                    </button>
                </div>
            }
            {moreOpen && <div onClick={() => document.getElementById("threeDots").click()} className="fixed inset-0"></div>}
            <div className="flex flex-col gap-2 md:gap-4 p-4 md:p-8">
                <h2 className="text-2xl md:text-3xl font-semibold text-center lg:text-start text-white">Comments</h2>
                {user &&
                    <div className="flex items-center justify-center lg:justify-start gap-2 md:gap-4">
                        <textarea ref={commentRef} name="comment" 
                                  className="bg-white md:text-xl p-2 md:p-3 rounded-2xl md:rounded-3xl w-4/5" 
                                  placeholder="Enter your comment here!"
                                  onKeyDown={(e) => e.key === "Enter" && addComment()}>
                        </textarea>
                        <button className="flex items-center justify-center 
                                            size-12 md:size-20  
                                            rounded-[50%]
                                            text-2xl md:text-4xl
                                            cursor-pointer bg-gray-100 hover:bg-gray-300" onClick={addComment}>
                            <FaComment />
                        </button>
                    </div>
                }
                {comments.length !== 0 ? 
                    comments.map((comment, index) => (
                        <div key={index} className="flex flex-col gap-2 md:gap-4 py-2 md:py-4 border-b-2 border-white">
                            <div className="flex flex-wrap gap-x-2 md:gap-x-4 items-baseline">
                                <Link to={`/user/${comment.idCommentedBy}`}>
                                    <h3 className="text-white text-xl md:text-2xl font-semibold">{comment.nameCommentedBy} </h3>
                                </Link>
                                <p className="text-white/30 md:text-xl">{comment.createdAt?.toDate().toLocaleDateString("en-US", {day: "numeric", month: "long", year: "numeric"})} </p>
                            </div>
                            <p className="text-white md:text-xl">{comment.comment} </p>
                        </div>
                    ))
                    :
                    <p className="text-xl md:text-2xl text-white">No comments yet!</p>
                }
            </div>
        </> : null
    )
}

export default TitlePage