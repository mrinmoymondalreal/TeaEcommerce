import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link, useLoaderData } from "react-router-dom";

export async function loader() {
  try {
    const resp = await fetch(`${import.meta.env.VITE_BACKEND}/api/orders`, {
      credentials: "include",
    }).then((e) => e.json());

    return resp.data || null;
  } catch (err) {
    console.log(err);
    return null;
  }
}

type OrderProps = {
  created_at: string;
  total_amount: number;
  status: string;
  order_id: string;
};

function Order({ data }: { data: OrderProps }) {
  return (
    <div className="w-full flex flex-wrap gap-2 md:items-center justify-between px-6 py-2 odd:bg-zinc-500/10">
      <span>Order #{data.order_id}</span>
      <span>{new Date(data.created_at).toDateString()}</span>
      <span>{data.status}</span>
      <span>Rs. {data.total_amount}</span>
      <span>
        {data.status === "WAITING" ? (
          <Button className="rounded-none bg-slate-500">Pay</Button>
        ) : (
          <Button variant={"secondary"} className="rounded-none bg-slate-500">
            View
          </Button>
        )}
      </span>
    </div>
  );
}

function Page() {
  const data = useLoaderData() as OrderProps[];

  if (!data)
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <a
          className="bg-zinc-950 rounded-none px-6 py-4"
          href={`${import.meta.env.VITE_BACKEND}/api/auth/signin`}
        >
          Sign In to view your orders
        </a>
        <Link to="/" className="mt-3 text-gray-300">
          Back to Home
        </Link>
      </div>
    );

  return (
    <div className="md:px-6 py-4 w-full">
      <div className="max-w-[700px] mx-auto space-y-6 mt-8">
        <header className="px-4">
          <Link to="/" className="flex items-center space-x-2 text-slate-400">
            <ArrowLeft size={"20"} />
            <span>Back to Home</span>
          </Link>
        </header>
        <main className="flex flex-col items-center w-full">
          <div className="w-full hidden md:flex max-w-[700px] items-center justify-between px-6 py-2 my-4 ">
            <span>Order Id</span>
            <span>Date</span>
            <span>Status</span>
            <span>Total Amount</span>
            <span>Action</span>
          </div>
          {data.map((e, index) => (
            <Order data={e} key={index} />
          ))}
        </main>
      </div>
    </div>
  );
}

export const element = <Page />;
