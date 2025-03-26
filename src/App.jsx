// simple and to the point stack up your favorite movies and tv shows
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Home from "./pages/Home";
import Layout from "./Layout";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import SignIn from "./pages/SignIn";
import Favorites from "./pages/Favorites";
import Watchlist from "./pages/Watchlist";
import TitlePage from "./pages/TitlePage";
import SearchPage from "./pages/SearchPage";
import User from "./pages/User";
import About from "./pages/About";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/title/:id" element={<TitlePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/user/:uid" element={<User />} />
            <Route path="/about" element={<About />} />
          </Route>
            <Route path="/signup" element={<Signup />} />
            <Route path="/signin" element={<SignIn />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  )
}

export default App
