// import DashboardPage from "./pages/DashboardPage";

// export default function App() {
//   return (
//     <DashboardPage />
//   )
// }

import { useEffect } from "react";
import { getStates } from "./services/homeAssistantApi";

export default function App() {
  useEffect(() => {
    getStates()
      .then(states => {
        console.log("Home Assistant states:", states);
      })
      .catch(error => {
        console.error(error);
      });
  },[]);
  return <h1>Smart Home</h1>
}