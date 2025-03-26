import { signOut } from "firebase/auth";
import useAuth from "../hooks/useAuth";
import { auth, db } from "../config/firebase";
import { useNavigate, Link } from "react-router-dom";
import useFavorites from "../hooks/useFavorites"
import { useEffect, useState } from "react";
import { collection, doc, onSnapshot, orderBy, query, getDoc } from "firebase/firestore";
import { BiSolidUserRectangle } from "react-icons/bi";

function Profile() {
    const { user, loading } = useAuth();
    const [ username, setUsername ] = useState();
    const { favoritesList } = useFavorites();
    const [ userComments, setUserComments ] = useState([]); 
    const navigate = useNavigate();

    useEffect(() => {
        let unsubscribe; 

        if(user) {
            console.log(user);
            const userCommentsQuery = query(collection(db, "users", user?.uid, "usersComments"), orderBy("createdAt", "desc"));

            unsubscribe = onSnapshot(userCommentsQuery, (snapshot) => {
                let updatedComments = [];

                snapshot.forEach((doc) => {
                    updatedComments.push(doc.data());
                })
                setUserComments(updatedComments);
            })
        }
        return () => unsubscribe && unsubscribe();
    }, [user])

    useEffect(() => {
        const getUsername = async () => {
            if(user) {
                try {
                    const userDocRef = doc(db, "users", user?.uid);
                    const userDoc = await getDoc(userDocRef);
                    if(userDoc.exists()) {
                        setUsername(userDoc.data().username);
                    }
                    else {
                        console.error("User not found?")
                    }
                }
                catch(error) {
                    console.log(error);
                }
            }
        }

        getUsername();
    }, [user])
    
    const handleLogOut = async () => {
        try {
            await signOut(auth);
            console.log("User signed out")
            navigate("/");
        }
        catch(error) {
            console.log(error);
        }
    }

    return(
        user && !loading ?
        <div className="px-4 py-2 md:px-10 md:py-4 lg:px-16 lg:py-8 space-y-6 md:space-y-10 lg:space-y-12">
            <div className="w-full text-white flex flex-col gap-2 md:gap-4">
                <div className="flex gap-2 md:gap-4 items-center">
                    <BiSolidUserRectangle className="text-3xl md:text-4xl font-semibold" />
                    <h1 className="text-2xl md:text-3xl font-semibold">{username} </h1>
                </div>
                <h3 className="md:text-xl">{user.email} </h3>
                <p className="md:text-xl">Created at: {user.metadata.creationTime.match(/\d{2} \w{3} \d{4}/)[0]}</p>
                <button onClick={handleLogOut} className="btn">Log Out</button>
            </div>
            <div className="w-full text-white flex flex-col gap-2 md:gap-4">
                <h2 className="text-2xl md:text-3xl font-semibold">Recent Favorites</h2>
                <div className="popular w-full h-48 md:h-56 lg:h-68 py-3 md:py-4 text-white flex items-center gap-4 overflow-x-auto">
                    {favoritesList.length !== 0 ?
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
                    {userComments.length !== 0 ? 
                        userComments.map((comment, index) => (
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

export default Profile