import { MinusCircleIcon, PlusCircleIcon, X } from "lucide-react";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { AnimatePresence, motion } from "motion/react";
import { cartAtom, LoadableProductAtom } from "@/lib/store";
import { Link } from "react-router-dom";

export const cartVisibilityAtom = atom(false);

function Product({
  id,
  variant,
  quantity,
}: {
  id: string;
  variant: string;
  quantity: number;
}) {
  const setCart = useSetAtom(cartAtom);

  const state = useAtomValue(LoadableProductAtom);

  if (state.state === "loading") return <div>Loading...</div>;
  if (state.state === "hasError") return <div>Error</div>;

  const product = state.data.find((e) => e.product_id === id);

  function handleItem(quantity: number) {
    setCart((prev) => {
      const index = prev.findIndex((e) => e.id === id && e.variant === variant);
      if (index === -1) return [...prev, { id, variant, quantity }];
      prev[index].quantity += quantity;
      if (prev[index].quantity <= 0)
        return prev.filter((e) => e.id !== id && e.variant !== variant);
      return [...prev];
    });
  }

  return (
    <div className="flex gap-x-4">
      <div className="bg-zinc-400 aspect-square h-24 self-center">
        <img
          src={product?.image_urls[0]}
          alt="product"
          className="object-cover"
        />
      </div>
      <div>
        <h3 className="scroll-m-20 text-lg font-semibold tracking-tight">
          {product?.title}
        </h3>
        <p className="leading-7">{variant}g</p>
        <div className="flex items-center gap-x-4">
          <button className="scroll-m-20" onClick={() => handleItem(-1)}>
            <MinusCircleIcon size={20} />
          </button>
          <span className="text-xl">{quantity}</span>
          <button className="scroll-m-20" onClick={() => handleItem(1)}>
            <PlusCircleIcon size={20} />
          </button>
        </div>
      </div>
      <div className="flex flex-col ml-auto float-rright justify-between content-between">
        <button
          onClick={() => {
            setCart((prev) =>
              prev.filter((e) => !(e.id === id && e.variant === variant))
            );
          }}
        >
          Delete
        </button>
        <span>Rs. {product?.price}</span>
      </div>
    </div>
  );
}

function ProductList() {
  const cart = useAtomValue(cartAtom);

  return (
    <div className="py-5 px-4 space-y-4">
      {cart.map((e, index) => (
        <Product {...e} key={index} />
      ))}
    </div>
  );
}

export default function Cart() {
  const [isCartVisible, setIsCartVisible] = useAtom(cartVisibilityAtom);

  const products = useAtomValue(LoadableProductAtom);

  let sum = 0,
    count = 0;
  if (products.state === "hasData") {
    sum = products.data.reduce(
      (acc, e) => acc + e.price * Number(e.quantity),
      0
    );
    count = products.data.length;
  }

  return (
    <AnimatePresence>
      {isCartVisible && (
        <motion.div
          onClick={() => setIsCartVisible(false)}
          initial={{ opacity: 0.4 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-zinc-900/40"
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ x: "100%" }}
            animate={{ x: "0%" }}
            transition={{ duration: 0.6 }}
            exit={{ x: "100%" }}
            className="fixed right-0 max-w-96 w-full h-screen z-[99] bg-zinc-950 py-6 shadow-md"
          >
            <div className="flex items-center gap-x-4 px-4">
              <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
                Cart
              </h1>
              <p className="leading-7">products ({count})</p>
              <p className="absolute right-0">
                <button
                  onClick={() => setIsCartVisible(false)}
                  className="border-[2px] p-1 bg-slate-800 border-gray-400 rounded-full mr-4"
                >
                  <X />
                </button>
              </p>
            </div>

            <ProductList />

            <div className="bg-gray-900 w-full px-4 py-6 absolute bottom-0">
              <div>
                <div className="uppercase flex justify-between font-extrabold">
                  <div>Estimates total</div>
                  <div>Rs. {sum.toFixed(2)}</div>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Shipping &amp; taxes calculated at checkout
                </div>
                <div className="text-xs text-gray-500">
                  <div className="">
                    By checking out, i agree to the Terms of Use and acknowledge
                    that i have the Privacy Policy
                  </div>
                </div>
                <div className="w-full">
                  <Link to="/checkout">
                    <button className="w-full h-12 mt-4 bg-black">
                      Checkout
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
