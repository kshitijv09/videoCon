import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Lobby from "./Screen/Lobby";
import Room from "./Screen/Room";
import Room2 from "./Screen/Room2";
function App() {
  const router = createBrowserRouter([
    { index: true, element: <Lobby /> },
    { path: "/rooms/:room", element: <Room /> },
    {},
  ]);
  return <RouterProvider router={router} />;
}

export default App;
