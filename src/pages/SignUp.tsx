import {
  createFormAction,
  createSimpleForm,
  Form,
  Input,
  SubmitButton,
} from "@/components/Form";
import { Link } from "react-router-dom";
import { z } from "zod";

export async function loader() {
  return false;
}

const signup = createSimpleForm({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
});

function SignUp() {
  const { error, action, data } = createFormAction(
    "http://localhost:3000/api/signup"
  );

  console.log(data, error);

  return (
    <div className="flex justify-center items-center min-h-screen dark ">
      <div className="max-w-[500px] w-full py-8 px-6 space-y-4">
        <div className="text-2xl font-bold uppercase">Sign Up</div>
        <div className="text-slate-400">Signup through email and password!</div>
        {error && (
          <div className="text-red-200 bg-red-500/60 px-4 py-2">
            Error: {error}
          </div>
        )}
        <div>
          <Form validator={signup} action={action} className="space-y-4">
            <Input name="name" />
            <Input name="email" />
            <Input name="password" />
            <div>
              Existing User?{" "}
              <Link className="underline" to="/login">
                Login
              </Link>
            </div>
            <SubmitButton className="bg-zinc-950 w-full py-4 cursor-pointer disabled:cursor-not-allowed">
              Sign Up
            </SubmitButton>
          </Form>
        </div>
      </div>
    </div>
  );
}

export const element = <SignUp />;
