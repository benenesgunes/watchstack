import { collection, doc, getDoc, orderBy, query, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../config/firebase";
import { Link } from "react-router-dom";
import { BiSolidUserRectangle } from "react-icons/bi";

function User() {
    const [ favoritesList, setFavoritesList ] = useState([]);
    const [ commentsList, setCommentsList ] = useState([]);
    const [ loading, setLoading ] = useState(true);
    const [ user, setUser ] = useState();
    const { uid } = useParams();

    useEffect(() => {
        const getUserData = async () => {
            try {
                const userDocRef = doc(db, "users", uid);
                const userSnap = await getDoc(userDocRef);

                if(userSnap.exists()) {
                    setUser(userSnap.data());
                }
                else{
                    console.log("User not found for some reason?");
                }
            }
            catch(error) {
                console.log(error);
            }
        }
        
        getUserData();
    }, [uid])

    useEffect(() => {
        const userDocRef = doc(db, "users", uid);
        const favoritesQuery = query(collection(userDocRef, "favorites"), orderBy("createdAt", "desc"));
        const commentsQuery = query(collection(userDocRef, "usersComments"), orderBy("createdAt", "desc"));

        const unsubscribeFavorites = onSnapshot(favoritesQuery, (snapshot) => {
            let updatedFavorites = [];
            snapshot.forEach((doc) => {
                updatedFavorites.push(doc.data())
            })
            setFavoritesList(updatedFavorites);
        })

        const unsubscribeComments = onSnapshot(commentsQuery, (snapshot) => {
            let updatedComments = [];
            snapshot.forEach((doc) => {
                updatedComments.push(doc.data())
            })
            setCommentsList(updatedComments);
        })
        setLoading(false);

        return () => {
            unsubscribeComments();
            unsubscribeFavorites();
        }
    }, [uid])

    if(loading) return <p className="text-4xl text-white absolute top-1/2 left-1/2 transform -translate-1/2">Loading...</p>
    
    return(
        user ?
            <div className="px-4 py-4 md:px-10 md:py-6 lg:px-16 lg:py-8 space-y-6 md:space-y-10 lg:space-y-12">
                <div className="w-full text-white flex flex-col gap-2 md:gap-4">
                    <div className="flex gap-2 md:gap-4 items-center">
                        <BiSolidUserRectangle className="text-3xl md:text-4xl font-semibold" />
                        <h1 className="text-2xl md:text-3xl font-semibold">{user.username} </h1>
                    </div>
                    <p className="md:text-xl">User since: {user.createdAt?.toDate().toLocaleDateString("en-US", {day: "numeric", month: "long", year: "numeric"})}</p>
                </div>
                <div className="w-full text-white flex flex-col gap-2 md:gap-4">
                    <h2 className="text-2xl md:text-3xl font-semibold">Recent Favorites</h2>
                    <div className="popular w-full h-48 md:h-56 lg:h-68 py-3 md:py-4 text-white flex items-center gap-4 overflow-x-auto">
                        {favoritesList ?
                            favoritesList.map((favorite) => (
                                <Link key={favorite.id} className="h-full aspect-2/3 rounded-xl md:rounded-2xl" to={`/title/${favorite.id}`}>
                                    <img className="h-full aspect-2/3 rounded-xl md:rounded-2xl" src={favorite.poster} alt={favorite.title} />
                                </Link>
                            ))
                            :
                            <p className="text-xl md:text-2xl">No favorites yet!</p>    
                        }
                    </div>
                </div>
                <div className="w-full text-white flex flex-col gap-2 md:gap-4">
                    <h2 className="text-2xl md:text-3xl font-semibold">Recent Comments</h2>
                    <div className="flex flex-col md:grid md:grid-cols-2 gap-2 md:gap-4">
                        {commentsList ? 
                            commentsList.map((comment, index) => (
                                <div key={index} className="flex flex-col gap-2 md:gap-4 py-2 md:py-4 border-b-2 border-white">
                                    <div className="flex flex-wrap gap-2 md:gap-4 items-baseline">
                                        <Link to={`/title/${comment.commentedToId}`}>
                                            <h3 className="text-white text-xl md:text-2xl font-semibold">{comment.commentedToName} </h3>
                                        </Link>
                                        <p className="text-white/30 md:text-xl">{comment.createdAt?.toDate().toLocaleDateString("en-US", {day: "numeric", month: "long", year: "numeric"})} </p>
                                    </div>
                                    <p className="text-white md:text-xl">{comment.comment} </p>
                                </div>
                            ))
                            :
                            <p className="text-xl md:text-2xl">No comments yet!</p>
                        }
                    </div>
                </div>
            </div>
            :
            null
    )
}

export default User