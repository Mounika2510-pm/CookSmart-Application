import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Provider } from "react-redux";
import { store } from "./app/store";
import { BrowserRouter } from "react-router-dom";
import { SessionProvider } from "./features/session/SessionProvider";
import MiniPlayer from "./components/MiniPlayer";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <SessionProvider>
        <BrowserRouter>
          <App />
          <MiniPlayer />
        </BrowserRouter>
      </SessionProvider>
    </Provider>
  </React.StrictMode>
);
