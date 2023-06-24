import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LobbyScreen from "./Screen/LobbyScreen";
function App() {
  const router = createBrowserRouter([
    { path: "/lobby", element: <LobbyScreen /> },
    {},
    {},
  ]);
  return <RouterProvider router={router} />;
}

export default App;
