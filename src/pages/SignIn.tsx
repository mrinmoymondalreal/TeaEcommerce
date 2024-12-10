import {
  createFormAction,
  createSimpleForm,
  Form,
  Input,
  SubmitButton,
} from "@/components/Form";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { z } from "zod";

export async function loader() {
  return false;
}

const login = createSimpleForm({
  email: z.string().email(),
  password: z.string().min(4),
});

function SignIn() {
  const { error, action } = createFormAction(
    `${import.meta.env.VITE_BACKEND}/api/signin`
  );

  return (
    <div className="flex justify-center items-center min-h-screen dark ">
      <div className="max-w-[500px] w-full py-8 px-6 space-y-4">
        <div className="text-2xl font-bold uppercase">Login</div>
        <div className="text-slate-400">
          Enter your email and password to sign in!
        </div>
        <div className="w-full">
          <Button className="w-full rounded-none py-6 text-lg">
            Login With Google
          </Button>
        </div>
        {error && (
          <div className="text-red-200 bg-red-500/60 px-4 py-2">
            Error: {error}
          </div>
        )}
        <div>
          <Form validator={login} action={action} className="space-y-4">
            <Input name="email" />
            <Input name="password" />
            <div>
              New User?{" "}
              <Link className="underline" to="/signup">
                Sign Up
              </Link>
            </div>
            <SubmitButton className="bg-zinc-950 w-full py-4 cursor-pointer disabled:cursor-not-allowed">
              Login
            </SubmitButton>
          </Form>
        </div>
      </div>
    </div>
  );
}

export const element = <SignIn />;
