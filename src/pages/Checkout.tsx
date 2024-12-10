import { Button } from "@/components/ui/button";
import { LoadableProductAtom } from "@/lib/store";
import { atom, useAtom, useAtomValue } from "jotai";
import { redirect, useLoaderData } from "react-router-dom";

const deliveryPriceAtom = atom(0);

type ProductType = {
  product_id: string;
  title: string;
  price: number;
  image_urls: string[];
  quantity: string;
  variant: string;
  description: string;
};

export async function loader() {
  const resp = await fetch(`${import.meta.env.VITE_BACKEND}/api/user`, {
    credentials: "include",
  });
  if (resp.status !== 200)
    return redirect(`${import.meta.env.VITE_BACKEND}/auth/signin`);
  return resp.json();
}

function ProductList({ product_list }: { product_list: ProductType[] }) {
  return product_list.map((product, index) => {
    return (
      <div key={index} className="flex items-center p-4 ">
        <img
          src={product.image_urls[0]}
          alt={`${product.title} Image`}
          className="w-16 h-16 mr-4"
        />
        <div>
          <h3 className="font-medium text-lg">
            {product.title} - Rs {product.price} x {product.quantity}
          </h3>
          <p className="text-gray-500 line-clamp-2 text-sm">
            {product.description}
          </p>
          <span className="text-gray-500">{product.variant}</span>
        </div>
      </div>
    );
  });
}

function CheckoutPayout({ products }: { products: ProductType[] }) {
  const deliveryPrice = useAtomValue(deliveryPriceAtom);

  const total = products.reduce((acc, curr) => {
    return acc + Number(curr.price) * Number(curr.quantity);
  }, 0);

  return (
    <>
      <div className="flex justify-between">
        <span className="text-gray-600">Sub Total</span>
        <span className="font-medium">Rs {total}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Tax (18%)</span>
        <span className="font-medium">Rs {(total * 0.18).toFixed(2)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Delivery</span>
        <span className="font-medium">Rs {deliveryPrice}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Total</span>
        <span className="font-medium">
          Rs {(total * 1.18 + deliveryPrice).toFixed(2)}
        </span>
      </div>
    </>
  );
}

function DeilverySelector() {
  const [deliveryPrice, setDeliveryPrice] = useAtom(deliveryPriceAtom);

  return (
    <div className="space-y-4">
      <div
        aria-checked={deliveryPrice === 420 ? "true" : "false"}
        className="cursor-pointer flex items-center justify-between p-4 shadow-lg border-[4px] border-transparent aria-checked:border-white"
        onClick={() => setDeliveryPrice(420)}
      >
        <div>
          <p className="font-medium">
            Rs. 4.99 - Fast Delivery{" "}
            <span className="text-green-500 ml-2">Recommend</span>
          </p>
          <p className="text-gray-500">Get it by Tomorrow, 12 Oct 23</p>
        </div>
        <img src="https://placehold.co/60x30" alt="FedEx" className="w-16" />
      </div>
      <div
        aria-checked={deliveryPrice === 0 ? "true" : "false"}
        className="cursor-pointer flex items-center justify-between p-4 shadow-lg border-[4px] border-transparent aria-checked:border-white"
        onClick={() => setDeliveryPrice(0)}
      >
        <div>
          <p className="font-medium">Free Delivery</p>
          <p className="text-gray-500">Get it by Friday, 17 - 18 Oct 23</p>
        </div>
        <img src="https://placehold.co/60x30" alt="DHL" className="w-16" />
      </div>
    </div>
  );
}

function Page() {
  const user = useLoaderData() as { user_id: string; email: string };
  const products = useAtomValue(LoadableProductAtom);

  const deliveryPrice = useAtomValue(deliveryPriceAtom);

  if (products.state === "loading") return <div>Loading...</div>;
  if (products.state === "hasError") return <div>Error</div>;

  const total =
    products.data.reduce((acc, curr) => {
      return acc + Number(curr.price) * Number(curr.quantity);
    }, 0) + deliveryPrice;

  const product_list = products.data;

  async function createOrder() {
    const { status, data } = await fetch(
      `${import.meta.env.VITE_BACKEND}/api/order`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          products: product_list,
          user_id: user.user_id,
          total_amount: total,
          items: product_list,
        }),
      }
    ).then((res) => res.json());

    if (status !== 200) {
      return;
    }

    const options = {
      key: data.keyId, // Replace with your Razorpay key_id
      amount: "50000", // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
      currency: "INR",
      name: "Acme Corp",
      description: "Test Transaction",
      order_id: data.orderId, // This is the order_id created in the backend
      callback_url: `${import.meta.env.VITE_BACKEND}/handle_success`, // Your success URL
      prefill: {
        name: "Gaurav Kumar",
        email: "gaurav.kumar@example.com",
        contact: "9999999999",
      },
      theme: {
        color: "#222222",
      },
    };

    // @ts-ignore
    const rzp = new Razorpay(options);
    rzp.open();
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full md:mx-8 lg:mx-16 xl:mx-32 flex flex-col md:flex-row">
        <div className="w-full p-8">
          <button className="flex items-center text-gray-600 mb-6">
            <i className="fas fa-arrow-left mr-2"></i> Back to cart
          </button>
          <h2 className="text-xl font-semibold mb-4">
            Product Information & Review
          </h2>
          <p className="text-gray-500 mb-6">
            By placing your order, you agree to Tea & We in's{" "}
            <a href="#" className="text-blue-500">
              Privacy
            </a>{" "}
            and{" "}
            <a href="#" className="text-blue-500">
              Policy
            </a>
            .
          </p>
          <div className="space-y-4">
            <ProductList product_list={products.data} />
          </div>
          <h2 className="text-xl font-semibold mt-8 mb-4">Delivery Shipping</h2>
          <DeilverySelector />
        </div>
        <div className="w-full md:w-1/2 p-8 bg-zinc-950">
          <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
          <p className="text-gray-500 mb-6">
            Complete your purchase by providing your payment details.
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-slate-100 mb-2">Email address</label>
              <input
                type="email"
                className="w-full p-3 border bg-zinc-900"
                placeholder="Email address"
              />
            </div>
          </div>
          <div className="mt-8 space-y-2">
            <CheckoutPayout products={products.data} />
          </div>
          <Button
            onClick={createOrder}
            className="w-full mt-6 p-3 py-5 rounded-none bg-black text-white  flex items-center justify-center space-x-2"
          >
            <span>Pay Now</span>
            <i className="fas fa-arrow-right"></i>
          </Button>
        </div>
      </div>
    </div>
  );
}

export const element = <Page />;
