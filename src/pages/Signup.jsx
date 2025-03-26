import { useRef, useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom";
import { doc, serverTimestamp, setDoc, getDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth" 
import { auth, db } from "../config/firebase";

function Signup() {
    const [ user, setUser ] = useState();
    const emailRef = useRef();
    const usernameRef = useRef();
    const passwordRef = useRef();
    const passwordConfirmRef = useRef();
    const [errorDisplay, setErrorDisplay] = useState("");
    const [loading, setLoading] = useState();
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
    
    const handleSignUp = async (e) => {
        e.preventDefault();
        
        const email = emailRef.current.value;
        const username = usernameRef.current.value;
        const password = passwordRef.current.value;
        const passwordConfirm = passwordConfirmRef.current.value;

        if(password !== passwordConfirm) {
            return setErrorDisplay("Passwords do not match!");
        }

        if(!email && !username && !password && !passwordConfirm) {
            return setErrorDisplay("Make sure to fill everything!");
        }

        const usernameDocRef = doc(db, "usernames", username);
        const docSnap = await getDoc(usernameDocRef);

        if(docSnap.exists()) {
            return setErrorDisplay("Username taken!");
        }

        try {
            setErrorDisplay("");
            setLoading(true);
            await createUserWithEmailAndPassword(auth, email, password);
            console.log("User signed up with uid: ", auth.currentUser.uid);

            try {
                const usersDocRef = doc(db, "users", auth.currentUser.uid);
                await setDoc(usersDocRef, {
                    username: username,
                    email: auth.currentUser.email,
                    createdAt: serverTimestamp()
                })
                await setDoc(usernameDocRef, {
                    uid: auth.currentUser.uid,
                    createdAt: serverTimestamp()
                })
                console.log("Added user to the database: ", auth.currentUser.email);
                navigate("/profile");
            }
            catch(dbError) {
                console.log(dbError);
            }
        }
        catch(authError) {
            console.log(authError);
            switch(authError.code) {
                case "auth/email-already-in-use":
                    setErrorDisplay("E-mail already in use!");
                    break;
                case "auth/weak-password":
                    setErrorDisplay("Password should be at least 6 characters!");
                    break;
                case "auth/invalid-email":
                    setErrorDisplay("Make sure you enter a valid e-mail!");
                    break;
                case "auth/missing-password":
                    setErrorDisplay("Missing password!");
                    break;
                case "auth/missing-email":
                    setErrorDisplay("Missing e-mail!");
                    break;
                default:
                    setErrorDisplay("Something went wrong!", {authError});
            }
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
            <div className="w-9/10 md:w-3/4 lg:w-1/2 h-22/30 p-6 md:p-10
                            text-gray-100 border-2 rounded-4xl
                            flex flex-col items-center justify-around
                            absolute left-1/2 transform -translate-x-1/2 -translate-y-3/5 top-3/5 ">
                <h1 className="text-2xl md:text-3xl font-semibold">Sign Up</h1>
                {errorDisplay && <p className="text-xl md:text-2xl text-red-500 text-center">{errorDisplay}</p>}
                <input ref={emailRef} type="text" className="input" placeholder="Enter your e-mail"/>
                <input ref={usernameRef} type="text" className="input" placeholder="Enter your username" />
                <input ref={passwordRef} type="password" className="input" placeholder="Enter your password" />
                <input ref={passwordConfirmRef} type="password" className="input" placeholder="Confirm password" />
                <button onClick={handleSignUp} disabled={loading} className="btn">Sign Up</button>
                <p className="md:text-xl text-center">
                    Already have an account? Sign in <Link to="/signin" className="hover:border-b-2 font-bold">here.</Link>
                </p>
            </div>       
        </>
        : null
    )
}

export default Signup