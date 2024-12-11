import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Search, Star, StarHalf } from "lucide-react";
import { motion, useInView } from "motion/react";
import { Suspense, useEffect, useRef, useState } from "react";

import axios from "axios";
import { Link, useLoaderData } from "react-router-dom";
import { atom, useAtom, useSetAtom } from "jotai";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const productsAtom = atom<Product[]>([]);

type Product = {
  title: string;
  price: number;
  stock?: number;
  image_urls: string[];
  count: number;
  rating: number;
  in_stock?: boolean;
};

let totalFetched = 0,
  enableFetch = true;

export async function loader() {
  return (await axios.get(`${import.meta.env.VITE_BACKEND}/api/products`)).data;
}

function Title() {
  return <span className="block text-center mt-20 text-3xl">All Products</span>;
}

function SideBar() {
  const [price, setPrice] = useState("");
  const [rating, setRating] = useState("");
  const [filters, setFilters] = useState("");
  const setProducts = useSetAtom(productsAtom);

  function changeField(field: string) {
    return (value: string) => {
      switch (field) {
        case "price":
          setPrice(value);
          return;
        case "rating":
          setRating(value);
          return;
        case "filters":
          setFilters(value);
          return;
        default:
          return;
      }
    };
  }

  useEffect(() => {
    if (price)
      setProducts((products) => [
        ...products.sort((a, b) => {
          if (price) {
            return parseInt(price) * (a.price - b.price);
          }
          return 0;
        }),
      ]);
  }, [price]);

  useEffect(() => {
    if (rating) {
      setProducts((products) => [
        ...products.sort((a, b) => {
          if (rating) {
            return parseInt(rating) * (a.rating - b.rating);
          }
          return 0;
        }),
      ]);
    }
  }, [rating]);

  useEffect(() => {
    if (filters) {
      setProducts((products) => [
        ...products.filter(
          (product) => product.stock! > 0 || product.in_stock == true
        ),
      ]);
    }
  }, [filters]);

  return (
    <>
      <Accordion
        type="single"
        collapsible
        className="md:sticky md:top-5 flex-[0.3] px-4 py-6"
      >
        <AccordionItem value="item-1" className="border-b-zinc-500">
          <AccordionTrigger>Sort by (Price)</AccordionTrigger>
          <AccordionContent>
            <RadioGroup value={price} onValueChange={changeField("price")}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1" id="1" />
                <Label htmlFor="1">Lowest to Highest</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="-1" id="-1" />
                <Label htmlFor="-1">Highest to Lowest</Label>
              </div>
            </RadioGroup>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2" className="border-b-zinc-500">
          <AccordionTrigger>Sort by (Rating)</AccordionTrigger>
          <AccordionContent>
            <RadioGroup value={rating} onValueChange={changeField("rating")}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1" id="1" />
                <Label htmlFor="1">Lowest to Highest</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="-1" id="-1" />
                <Label htmlFor="-1">Highest to Lowest</Label>
              </div>
            </RadioGroup>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3" className="border-b-zinc-500">
          <AccordionTrigger>Filters</AccordionTrigger>
          <AccordionContent>
            <RadioGroup value={filters} onValueChange={changeField("filters")}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="in-stock" id="in-stock" />
                <Label htmlFor="in-stock">In stock</Label>
              </div>
            </RadioGroup>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  );
}

const slideInParent = {
  hidden: { y: 100, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { staggerChildren: 0.1, ease: "easeInOut", duration: 0.55 },
  },
};

const slideInChild = {
  hidden: { y: 100, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { ease: "easeInOut", duration: 0.5 },
  },
};

function Product({
  product,
  shouldObserve,
}: {
  product: Product;
  shouldObserve?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const setProducts = useSetAtom(productsAtom);

  console.log(product);

  useEffect(() => {
    if (shouldObserve && isInView == true && enableFetch) {
      axios(
        `${import.meta.env.VITE_BACKEND}/api/products?limit=5&skip=${++totalFetched * 5}`
      ).then((res) => {
        setProducts((products) => [...products, ...res.data]);
      });
      setProducts((products) => [...products]);
    }
  }, [isInView]);

  return (
    <Link
      to={`/p/${product.title.toLowerCase().replace(/\s/g, "_")}`}
      className="w-full h-fit overflow-hidden"
    >
      <motion.div
        className="w-full"
        variants={slideInParent}
        initial="hidden"
        whileInView="visible"
        ref={ref}
        viewport={{ once: true }}
      >
        <motion.div
          variants={slideInChild}
          className="bg-zinc-950 aspect-square w-full flex items-center justify-center"
        >
          <img
            src={product.image_urls[1]}
            className="max-w-full h-full"
            alt=""
          />
        </motion.div>
        <div className="flex flex-col -space-y-[7px]">
          <motion.span variants={slideInChild} className="md:text-xl">
            {product.title}
          </motion.span>
          <motion.span
            variants={slideInChild}
            className="flex items-center gap-x-1"
          >
            {product.rating &&
              new Array(Math.floor(product.rating))
                .fill(0)
                .map((_, i) => <Star key={i} size={15} />)}
            {product.rating &&
              product.rating - Math.floor(product.rating) > 0 && (
                <StarHalf size={15} />
              )}
            <span>({product.count})</span>
          </motion.span>
          <motion.span variants={slideInChild}>Rs. {product.price}</motion.span>
        </div>
      </motion.div>
    </Link>
  );
}

function Products() {
  const [products, setProducts] = useAtom(productsAtom);
  const initialProducts = useLoaderData() as Product[];

  useEffect(() => {
    if (products.length === 0) {
      setProducts(initialProducts);
    }
  }, []);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 flex-[0.7] px-4 py-6 gap-4 gap-y-6">
      {products.map((product, i, array) => (
        <Product
          key={i}
          shouldObserve={i == array.length - 1}
          product={product}
        />
      ))}

      {products.length === 0 && <div>No result found.</div>}
    </div>
  );
}

function debounce(func: (...args: any[]) => void, wait: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: any[]) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

function FilterHeader() {
  const setProducts = useSetAtom(productsAtom);
  const prevProducts = useRef<Product[]>([]);

  const deboucedSearchHandler = debounce(async function (e) {
    const q = e.target.value;
    enableFetch = false;

    if (prevProducts.current.length === 0) {
      setProducts((products) => {
        prevProducts.current = products;
        return products;
      });
    }

    if (q.trim() === "") {
      enableFetch = true;
      setProducts(prevProducts.current);
      return;
    }

    const products = await axios(
      `${import.meta.env.VITE_BACKEND}/api/search?q=${q.trim()}`
    );
    setProducts(() => products.data);
  }, 1000);

  return (
    <div className="flex justify-between px-4 pt-6 items-center">
      <div className="text-base md:text-xl font-semibold">Filter+</div>
      <div className="flex pl-4 md:pl-0">
        <div className="flex items-center">
          <Search className="absolute ml-2" size={20} />
          <input
            type="text"
            onChange={deboucedSearchHandler}
            className="pl-10 px-5 py-2 rounded-md bg-zinc-950 text-white placeholder:text-white border border-zinc-500"
            placeholder="Search"
          />
        </div>
      </div>
    </div>
  );
}

function Page() {
  return (
    <>
      <Title />
      <FilterHeader />
      <div className="flex flex-col md:flex-row">
        <SideBar />
        <Suspense fallback={"Loading"}>
          <Products />
        </Suspense>
      </div>
    </>
  );
}

export const element = <Page />;
