import { Routes, Route, Link } from "react-router-dom";
import RecipesList from "./pages/RecipesList";
import RecipeBuilder from "./pages/RecipeBuilder";
import CookingPage from "./pages/CookingPage";
import WelcomePage from "./pages/WelcomePage";
import "./App.css";

function App() {
  return (
    <div className="app-container">
      <nav className="navbar">
        <Link to="/" className="logo-link">
          <h1 className="logo">🥘CookSmart</h1>
        </Link>
        <div className="nav-links">
          <Link to="/recipes" className="nav-link">
            Recipes
          </Link>
          <Link to="/create" className="nav-link">
            Create Recipe
          </Link>
        </div>
      </nav>
      <main className="main-content">
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/recipes" element={<RecipesList />} />
          <Route path="/create" element={<RecipeBuilder />} />
          <Route path="/cook/:id" element={<CookingPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
