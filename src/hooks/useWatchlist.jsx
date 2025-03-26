import { useEffect, useState } from "react";
import { auth, db} from "../config/firebase";
import { onSnapshot, orderBy, query, collection } from "firebase/firestore";

export default function useWatchlist() {
    const [ user, setUser ] = useState();
    const [ loading, setLoading ] = useState(true);
    const [ watchlist, setWatchlist ] = useState([]);
    
    useEffect(() => {
        const unsubscribeAuth = auth.onAuthStateChanged((user) => {
            setUser(user);
            setLoading(false);
        })

        let unsubscribeWatchlist;

        if(user) {
            const watchlistQuery = query(collection(db, "users", user.uid, "watchlist"), orderBy("createdAt", "desc"));

            unsubscribeWatchlist = onSnapshot(watchlistQuery, (snapshot) => {
                let updatedWatchlist = [];
                snapshot.forEach((doc) => {
                    updatedWatchlist.push(doc.data())
                })
                setWatchlist(updatedWatchlist);
                setLoading(false);
            })
        }

        return () => {
            unsubscribeAuth();
            if(unsubscribeWatchlist) {
                unsubscribeWatchlist();
            }
        };
    }, [user, watchlist])

    return { user, loading, watchlist };
}