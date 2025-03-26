import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../config/firebase";


export default function useAuth() {
    const navigate = useNavigate();
    const [user, setUser] = useState();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setUser(user);
            setLoading(false);
            if(!user) {
                navigate("/signup");
            }
        })

        return () => unsubscribe();
    }, [navigate])

    return { user, loading };
}