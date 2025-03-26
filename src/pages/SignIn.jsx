import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, db, provider } from "../config/firebase";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { FaGoogle } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";

function SignIn() {
    const [ user, setUser ] = useState();
    const emailRef = useRef();
    const passwordRef = useRef();
    const [loading, setLoading] = useState(false);
    const [errorDisplay, setErrorDisplay] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setUser(user);
            setLoading(false);
            if(user) {
                navigate("/");
            }
        })

        return () => unsubscribe();
    }, [])

    // fetches a random username for users who sign in using google for the first time
    const fetchUsername = async () => {
        try {
            const response = await fetch("https://usernameapiv1.vercel.app/api/random-usernames");

            if(!response.ok) {
                throw new Error("Something went wrong with username API");
            }

            return response.json();
        }
        catch(error) {
            console.log(error);
        }
    }

    const { data } = useQuery({
        queryKey: ['username'],
        queryFn: fetchUsername
    })

    const handleSignIn = async () => {
        const email = emailRef.current.value;
        const password = passwordRef.current.value;

        try {
            setErrorDisplay("");
            await signInWithEmailAndPassword(auth, email, password);
            setLoading(true);
            navigate("/profile");
        }
        catch(error) {
            console.log(error);
            if(error.code === "auth/invalid-credential") {
                setErrorDisplay("Make sure your e-mail and password are correct!")
            }
        }
        setLoading(false);
    }

    const handleSignInWithGoogle = async () => {
        try {
            setLoading(true);
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            console.log(user);

            const userDocRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(userDocRef);
            const usernameDocRef = doc(db, "usernames", data.usernames[0]);

            if(!docSnap.exists()) {
                await setDoc(userDocRef, {
                    username: data.usernames[0],
                    email: user.email,
                    createdAt: serverTimestamp()
                })

                await setDoc(usernameDocRef, {
                    uid: auth.currentUser.uid,
                    createdAt: serverTimestamp()
                })

                console.log("User added to the database with uid: ", user.uid);
            }
            else {
                console.log("User already in the database!");
            }
            navigate("/profile");
        }
        catch(error) {
            console.log(error);
        }
        setLoading(false);
    }

    return(
        !user ?
        <>
            <header className="text-3xl md:text-4xl 
                               font-bold font-logo text-white
                               text-center p-8">
                <Link to="/">
                    WATCHSTACK
                </Link>
            </header>
            <div className="w-9/10 md:w-3/4 lg:w-1/2 h-2/3 p-8 md:p-12
                            text-gray-100 border-2 rounded-4xl
                            flex flex-col items-center justify-around
                            absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 top-1/2">
                <h1 className="text-2xl md:text-3xl font-semibold">Sign In</h1>
                {errorDisplay && <p className="text-xl md:text-2xl text-red-500 text-center">{errorDisplay}</p>}
                <input ref={emailRef} type="text" className="input" placeholder="Enter your e-mail"/>
                <input ref={passwordRef} type="password" className="input" placeholder="Enter your password" />
                <button onClick={handleSignIn} disabled={loading} className="btn">Sign In</button>
                <button onClick={handleSignInWithGoogle} disabled={loading} className="btn flex items-center justify-center gap-2 md:gap-3">
                    Continue with Google <FaGoogle/>
                </button>
                <p className="md:text-xl text-center">
                    Don't have an account? Sign up <Link to="/signup" className="hover:border-b-2 font-bold">here.</Link>
                </p>
            </div>       
        </> 
        : null
    )
}

export default SignIn