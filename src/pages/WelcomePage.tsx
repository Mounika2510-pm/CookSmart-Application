import "../styles/WelcomePage.css";

export default function WelcomePage() {
    return (
        <div className="welcome-container">
            <div className="welcome-overlay">
                <div className="welcome-content">
                    <h1 className="animate-title">
                        Welcome to <span>CookSmart</span>
                    </h1>
                    <p className="animate-subtext">
                        Your AI-powered kitchen companion that makes cooking effortless,
                        exciting, and truly delicious. Discover smart recipes and cook with precision.
                    </p>
                </div>
            </div>
        </div>
    );
}
