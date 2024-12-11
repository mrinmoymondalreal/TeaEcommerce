import { Footer } from "@/components/Footer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cartAtom } from "@/lib/store";
import axios from "axios";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { MinusIcon, PlusIcon, Star, StarHalf } from "lucide-react";
import { useEffect, useState } from "react";
import { LoaderFunctionArgs, useLoaderData } from "react-router-dom";

import { motion } from "motion/react";

export async function loader(props: LoaderFunctionArgs) {
  const { params } = props;
  return (
    await axios.get(
      `${import.meta.env.VITE_BACKEND}/api/product/name/${params.name}`
    )
  ).data;
}

interface ItemType {
  id: string;
  variant: string;
  quantity: number;
}

const ItemAtom = atom<ItemType>({
  id: "",
  variant: "0",
  quantity: 1,
});

export function ItemQuantity() {
  const [item, setItem] = useAtom(ItemAtom);
  function setQuantity(q: number) {
    setItem((prev: ItemType) => {
      if (item.quantity + q > 0)
        return { ...prev, quantity: prev.quantity + q };
      return prev;
    });
  }

  return (
    <>
      <button
        onClick={() => setQuantity(-1)}
        className="border border-gray-300 h-12 aspect-square"
      >
        <MinusIcon size={20} className="mx-auto" />
      </button>
      <span className="mx-4">{item.quantity}</span>
      <button
        onClick={() => setQuantity(1)}
        className="border border-gray-300 h-12 aspect-square"
      >
        <PlusIcon size={20} className="mx-auto" />
      </button>
    </>
  );
}

function AddToCart() {
  const item = useAtomValue(ItemAtom);

  const setCartItem = useSetAtom(cartAtom);

  const [isAnimate, setAnimate] = useState(false);

  function handleAdd2Cart() {
    if (item.id === null || item.variant === null || item.quantity <= 0) return;
    setCartItem((prev) => {
      const index = prev.findIndex(
        (e) => e.id === item.id && e.variant === item.variant
      );
      if (index === -1) return [...prev, { ...item }];
      prev[index].quantity += item.quantity;
      return [...prev];
    });
  }

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isAnimate) {
      timeout = setTimeout(() => {
        setAnimate(false);
      }, 2000);
    }
    return () => {
      timeout && clearTimeout(timeout);
    };
  }, [isAnimate]);

  const variant = {
    c1: {
      initial: { scale: 0.8, opacity: 0 },
      animate: { opacity: 1 },
    },
    c2: {
      initial: { opacity: 1 },
      animate: { scale: 0.8, opacity: 0 },
    },
  };

  return (
    <motion.button
      onClick={() => {
        setAnimate(true);
        handleAdd2Cart();
      }}
      className="relative h-12 flex justify-center items-center w-full bg-black text-white py-3 font-bold"
      animate={isAnimate ? "animate" : "initial"}
    >
      <motion.div className="absolute" variants={variant.c1}>
        Added to cart
      </motion.div>
      <motion.div className="absolute" variants={variant.c2}>
        Add to cart
      </motion.div>
    </motion.button>
  );
}

type ProductType = {
  title: string;
  price: number;
  product_id: string;
  description: string;
  variant: string;
  image_urls: string[];
  rating: number;
  count: number;
};

function ProductFirst() {
  let product = useLoaderData() as ProductType;
  const setItem = useSetAtom(ItemAtom);

  useEffect(() => {
    setItem({
      id: product.product_id,
      variant: "0",
      quantity: 1,
    });
  }, []);

  return (
    <div className="flex flex-col md:flex-row mt-16 min-h-[calc(100vh-4.5rem)]">
      <div className="flex-[2]">
        <img
          src={product.image_urls[0]}
          alt="Product packaging with abstract design"
          className="w-full h-auto col-span-2"
        />
      </div>
      <div className="flex-1 p-8 sticky top-16 h-fit">
        <h1 className="text-4xl font-bold mb-2">{product.title}</h1>
        <p className="text-lg italic mb-4">
          Rick, Tasty, and Mountains in Every Sip
        </p>
        <p className="text-2xl font-bold mb-4">Rs. {product.price}</p>
        <div className="flex items-end justify-evenly">
          <div className="mb-4 w-full flex-[1]">
            <label className="block text-sm font-bold mb-2">Size (in g)</label>
            <Select
              onValueChange={(value) =>
                setItem((prev) => ({ ...prev, variant: value }))
              }
              defaultValue="100"
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="100">100g</SelectItem>
                <SelectItem value="200">200g</SelectItem>
                <SelectItem value="300">300g</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 flex justify-center items-center h-full mb-4">
            <ItemQuantity />
          </div>
        </div>
        <AddToCart />
        <div className="mt-4 text-sm">
          <p>CERTIFIED B-CORP</p>
          <p>FAST DELIVERY</p>
          <p>HIGH-END SELECTION</p>
          <p>100% SECURE PAYMENT</p>
        </div>
        <hr className="my-4" />
        <div className="text-sm">
          <div className="flex justify-between mb-2">
            <span className="font-bold">ORIGIN</span>
            <span>India</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold">VARIETY</span>
            <span>100g, 200g, 300g</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Reviews() {
  const product = useLoaderData() as ProductType;

  return (
    <div className="w-full flex flex-col justify-evenly items-center">
      <div className="w-full max-w-max px-7 italic text-2xl md:text-4xl h-[30vh]">
        Rated the best coffee by the New York Times
      </div>
      <div className="flex flex-col items-center gap-y-2 h-[30vh]">
        <span className="flex">
          {product.rating &&
            new Array(Math.floor(product.rating))
              .fill(0)
              .map((_, i) => <Star key={i} size={30} />)}
          {product.rating &&
            product.rating - Math.floor(product.rating) > 0 && (
              <StarHalf size={30} />
            )}
        </span>
        <span className="text-xl">{product.rating} out of 5</span>
        <span className="text-gray-400">Based on {product.count} reviews</span>
      </div>
      <div className="h-[20vh] space-y-4 flex flex-col items-center">
        <p>Rate the product</p>
        <div className="flex items-center gap-2">
          <StarSystem product_id={product.product_id} />
        </div>
      </div>
    </div>
  );
}

function StarSystem({ product_id }: { product_id: string }) {
  const [rating, setRating] = useState<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const totalStars = 5;

  useEffect(() => {
    fetch(
      `${import.meta.env.VITE_BACKEND}/api/checkRating?product_id=${product_id}`,
      { credentials: "include" }
    )
      .then((res) => res.json())
      .then((response) => {
        if (response.status !== 200) return;
        if (response.data.rating) {
          return setRating(response.data.rating);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (rating == null || rating <= 0) return;
    fetch(`${import.meta.env.VITE_BACKEND}/api/rating`, {
      credentials: "include",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ product_id, rating }),
    });
  }, [rating]);

  return [...Array(totalStars)].map((star, index) => {
    const currentRating = index + 1;

    return (
      <label key={index}>
        <input
          key={star}
          type="radio"
          name="rating"
          value={currentRating}
          className="hidden"
          onChange={() => setRating(currentRating)}
        />
        <span
          style={{
            color: currentRating <= (hover || rating!) ? "#ffc107" : "#e4e5e9",
          }}
          className="cursor-pointer text-[3rem]"
          onMouseEnter={() => setHover(currentRating)}
          onMouseLeave={() => setHover(null)}
        >
          &#9733;
        </span>
      </label>
    );
  });
}

function Description() {
  const products = useLoaderData() as ProductType;
  return (
    <div className="max-w-5xl mx-auto flex flex-col justify-center py-8 px-7 mt-10 space-y-4 text-center h-[60vh]">
      <p className="font-bold text-3xl mx-auto">Description</p>
      <p>{products.description}</p>
    </div>
  );
}

function MoreProducts() {
  const [products, setProducts] = useState<ProductType[]>([]);
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND}/api/hero_products?limit=3`)
      .then((res) => res.json())
      .then((response) => {
        if (response.status === 200) {
          setProducts(response.data);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <>
      <div className="mx-auto text-center text-3xl font-bold uppercase italic mb-8">
        More Products
      </div>
      <div className="mx-auto max-w-5xl grid grid-cols-2 lg:grid-cols-3 flex-[0.7] px-4 py-6 gap-4 gap-y-6 pb-64">
        {products.map((product, i) => (
          <div className="w-full" key={i}>
            <div className="bg-zinc-950 border border-gray-500 aspect-square w-full">
              <img src={product.image_urls[0]} alt="" />
            </div>
            <div className="text-2xl text-center mt-2">{product.title}</div>
          </div>
        ))}
      </div>
    </>
  );
}

function Page() {
  return (
    <>
      <ProductFirst />
      <Description />
      <Reviews />
      <MoreProducts />
      <Footer />
    </>
  );
}

export const element = <Page />;
