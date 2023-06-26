import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Lobby from "./Screen/Lobby";
import Room from "./Screen/Room";
function App() {
  const router = createBrowserRouter([
    { index: true, element: <Lobby /> },
    { path: "/rooms/:room", element: <Room /> },
    {},
  ]);
  return <RouterProvider router={router} />;
}

export default App;
