import { useEffect, useState } from "react";
import { auth, db} from "../config/firebase";
import { onSnapshot, orderBy, query, collection } from "firebase/firestore";

export default function useFavorites() {
    const [ user, setUser ] = useState();
    const [ loading, setLoading ] = useState(true);
    const [ favoritesList, setFavoritesList ] = useState([]);
    
    useEffect(() => {
        const unsubscribeAuth = auth.onAuthStateChanged((user) => {
            setUser(user);
            setLoading(false);
        })

        let unsubscribeFavorites;

        if(user) {
            const favoritesQuery = query(collection(db, "users", user.uid, "favorites"), orderBy("createdAt", "desc"));

            unsubscribeFavorites = onSnapshot(favoritesQuery, (snapshot) => {
                let updatedFavorites = [];
                snapshot.forEach((doc) => {
                    updatedFavorites.push(doc.data())
                })
                setFavoritesList(updatedFavorites);
                setLoading(false);
            })
        }

        return () => {
            unsubscribeAuth();
            if(unsubscribeFavorites) {
                unsubscribeFavorites();
            }
        };
    }, [user, favoritesList])

    return { user, loading, favoritesList };
}