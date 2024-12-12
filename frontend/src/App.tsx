import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import "./App.css";
import NotFound from "./pages/NotFound";
import Cart from "./components/Cart";
import { Header } from "./components/Header";
import { GlobalLoading } from "./components/GlobalLoading";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainWrapper />,
    children: [
      {
        path: "",
        loader: async () =>
          (
            await fetch(`${import.meta.env.VITE_BACKEND}/api/user`, {
              credentials: "include",
            })
          ).ok,
        element: <IndexWrapper />,
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
          {
            path: "/about",
            lazy: () => import("./pages/AboutPage"),
          },
        ],
      },
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

function MainWrapper() {
  return (
    <>
      <GlobalLoading />
      <Outlet />
    </>
  );
}

function App() {
  return <RouterProvider router={router} />;
}

export default App;
