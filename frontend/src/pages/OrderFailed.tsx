import { useEffect } from "react";

export async function loader() {
  return true;
}

function Page() {
  useEffect(() => {
    setTimeout(() => {
      window.location.href = "/orders";
    }, 1000);
  }, []);
  return (
    <div className="w-full min-h-screen space-y-4 flex flex-col justify-center items-center">
      <p className="text-3xl font-bold">Order Failed !!!</p>
      <p className="text-sm text-gray-400">Redirecting to Home...</p>
    </div>
  );
}

export const element = <Page />;
