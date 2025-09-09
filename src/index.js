import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import StarRating from "./starRating";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
    {/* <StarRating maxRating={10} />
    <StarRating maxRating={15} color="red" size={20} />
    <StarRating
      color="gold"
      size={25}
      message={["horible", "bad", "good", "average", "incredible"]}
      defaultRating={3}
    /> */}
  </React.StrictMode>
);
