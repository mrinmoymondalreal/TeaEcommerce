import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import "./App.css";
import NotFound from "./pages/NotFound";
import Cart from "./components/Cart";
import { Header } from "./components/Header";

const router = createBrowserRouter([
  {
    path: "/",
    element: <IndexWrapper />,
    loader: async () =>
      (
        await fetch("http://localhost:3000/api/user", {
          credentials: "include",
        })
      ).ok,
    children: [
      {
        path: "/",
        index: true,
        lazy: () => import("./pages/Home"),
      },
      {
        path: "/products",
        lazy: () => import("./pages/Products"),
      },
      {
        path: "/p/:name",
        lazy: () => import("./pages/ProductPage"),
      },
    ],
  },
  // {
  //   path: "/signin",
  //   lazy: () => import("./pages/SignIn"),
  // },
  // {
  //   path: "/signup",
  //   lazy: () => import("./pages/SignUp"),
  // },
  {
    path: "/checkout",
    lazy: () => import("./pages/Checkout"),
  },
  {
    path: "/orders",
    lazy: () => import("./pages/Orders"),
  },
  {
    path: "/order_success",
    lazy: () => import("./pages/OrderSuccess"),
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

function IndexWrapper() {
  return (
    <>
      <Header />
      <Outlet />
      <Cart />
    </>
  );
}

function App() {
  return <RouterProvider router={router} />;
}

export default App;
