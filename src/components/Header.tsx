import { cn } from "@/lib/utils";
import { useAtomValue, useSetAtom } from "jotai";
import { cartVisibilityAtom } from "./Cart";
import { cartAtom } from "@/lib/store";
import { Link, useLoaderData } from "react-router-dom";

export function Header() {
  return <MainPageHeader className="top-0 to-zinc-900" />;
}

export function NLink({
  href,
  children,
  onClick,
}: {
  href?: string;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <Link
      to={href || "#"}
      className="relative group cursor-pointer"
      onClick={onClick}
    >
      {children}
      <div className="absolute w-0 h-px bg-slate-100 group-hover:w-full transition-all"></div>
    </Link>
  );
}

export function MainPageHeader({ className }: { className?: string }) {
  const setCartVisible = useSetAtom(cartVisibilityAtom);

  const cart = useAtomValue(cartAtom);

  const isUserAuth = useLoaderData() as { ok: boolean };

  return (
    <header
      className={cn(
        "fixed z-[99] w-full text-slate-100 bg-gradient-to-t from-zinc-950/0 to-zinc-950",
        className
      )}
    >
      <div className="flex justify-between items-center max-w-5xl mx-auto w-full px-5 py-4">
        <div className="flex">
          <span className="text-2xl font-black">
            <Link to="/">TEA & WE</Link>
          </span>
        </div>
        <div className="hidden md:block">
          <ul className="*:inline-block space-x-4">
            <NLink href="/">Home</NLink>
            <NLink href="/products">Product</NLink>
            <NLink href="/about">About</NLink>
            <NLink href="/orders">Orders</NLink>
          </ul>
        </div>
        <div>
          <ul className="h-min flex items-center space-x-4">
            <NLink
              onClick={(e) => {
                e.preventDefault();
                setCartVisible(true);
              }}
            >
              cart ({cart.reduce((acc, cur) => cur.quantity + acc, 0)})
            </NLink>
            <li>
              {isUserAuth ? (
                <NLink href={`${import.meta.env.VITE_BACKEND}/auth/signout`}>
                  signout
                </NLink>
              ) : (
                <NLink href={`${import.meta.env.VITE_BACKEND}/auth/signin`}>
                  signin
                </NLink>
              )}
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
