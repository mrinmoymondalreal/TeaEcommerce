export async function loader() {
  return true;
}

function Page() {
  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center">
      <h1 className="text-4xl font-bold">About</h1>
      <p className="text-lg mt-4">
        This is a demo project for a fullstack e-commerce app.
      </p>
      <p className="text-lg mt-4 text-center">
        The frontend is built with React, Express, PostgreSQL, Jotai,
        TypeScript, and Vite.
      </p>
      <p className="text-lg mt-4">
        This website is built by{" "}
        <a href="https://github.com/mrinmoymondalreal" className="underline">
          Mrinmoy Mondal
        </a>
        .
      </p>
      <p className="text-lg mt-4">
        Source code is available on{" "}
        <a
          href="https://github.com/mrinmoymondalreal/TeaEcommerce"
          className="underline"
        >
          GitHub
        </a>
        .
      </p>
    </div>
  );
}

export const element = <Page />;
