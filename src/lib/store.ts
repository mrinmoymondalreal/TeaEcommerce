import axios from "axios";
import { atom } from "jotai";
import { atomWithStorage, loadable } from "jotai/utils";


type CartItem = { id: string; quantity: number, variant: string };

export const cartAtom = atomWithStorage<CartItem[]>("cart", []);

type ProductType = {
  product_id: string;
  title: string;
  price: number;
  image_urls: string[];
  quantity: string;
  variant: string;
  description: string;
};

async function fetchDetails({ id, quantity, variant }: CartItem): Promise<ProductType> {
  return axios
    .get(`${import.meta.env.VITE_BACKEND}/product/${id}`)
    .then((res) => ({ ...res.data, quantity, variant }));
}

const productsAtom = atom(async (get) => {
  const ps = get(cartAtom);
  const g = await Promise.all(ps.map(fetchDetails));
  return g;
});

export const LoadableProductAtom = loadable(productsAtom);