import { createContext, useContext, useState } from "react";
import { z, ZodBoolean, ZodRawShape, ZodString } from "zod";

export function createSimpleForm(props: ZodRawShape) {
  const zodProps = z.object(props);
  let formProps: {
    [key: string]: { name: string; type: string; required: boolean };
  } = {};

  for (const key in props) {
    const row = zodProps.shape[key];
    formProps[key] = {
      name: key,
      type:
        row instanceof ZodString
          ? (row.isEmail && "email") || "string"
          : row instanceof ZodBoolean
            ? "checkbox"
            : "number",
      required: !row.isOptional(),
    };
  }

  function validate(name: string, data: string) {
    return zodProps.shape[name].safeParse(data);
  }

  return { formProps, validate };
}

export function createFormAction<T>(url: string) {
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<T | unknown>(undefined);
  const [errorFields, setErrorFields] = useState<string[]>([]);

  async function action(formData: FormData) {
    setLoading(true);
    try {
      const response = (await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(Object.fromEntries(formData.entries())),
      }).then((e) => e.json())) as {
        status: number;
        error?: string | string[];
        data?: unknown;
      };
      if (response.status === 400) {
        return setErrorFields(response.error as string[]);
      }
      if (response.status !== 200) return setError(response.error?.toString());
      setData(data);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }

  return { action, error, loading, data, errorFields };
}

type validatorType = ReturnType<typeof createSimpleForm>;

function createFormContext(validator: validatorType, errorFields: string[]) {
  const [context, setContext] = useState({
    validator,
    errorFields: errorFields || [],
  });

  return {
    context,
    setContext,
  };
}

const FormContext = createContext<
  ReturnType<typeof createFormContext> | undefined
>(undefined);

function useFormContext() {
  const context = useContext(FormContext);
  if (context === undefined)
    throw new Error("useFormContext must be used within a FormProvider");
  return context;
}

export function Form({
  validator,
  children,
  errorFields,
  action,
  ...formProps
}: {
  children: React.ReactNode;
  validator: validatorType;
  errorFields?: string[];
  action?: (formData: FormData) => void;
} & React.HTMLAttributes<HTMLFormElement>) {
  const context = createFormContext(validator, errorFields || []);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    for (let [name, value] of formData.entries()) {
      const k = context.context.validator.validate(name, value as string);
      if (k.success) continue;
      context.setContext((prev) => {
        return {
          ...prev,
          errorFields: [...prev.errorFields, name],
        };
      });
      return;
    }
    if (action) action(formData);
  }

  return (
    <FormContext.Provider value={context}>
      <form {...formProps} onSubmit={handleSubmit}>
        {children}
      </form>
    </FormContext.Provider>
  );
}

export function Input({ name }: { name: string }) {
  const { context, setContext } = useFormContext();

  const [hasError, setError] = useState(
    context.errorFields.includes(name) || false
  );

  return (
    <div className="space-y-2">
      <label htmlFor={name} className="text-gray-500 capitalize">
        {name}
      </label>
      <input
        {...context.validator.formProps[name]}
        placeholder={`Enter ${name}`}
        id={name}
        className="w-full p-4 border border-gray-500 outline-none bg-zinc-950"
        onBlur={(e) => {
          let value = (e.target as HTMLInputElement).value;
          if (value.trim() == "") return;
          if (!value) {
            return;
          }
          const k = context.validator.validate(name, value);
          if (k.success) {
            setError(false);
            setContext((prev) => ({
              ...prev,
              errorFields: prev.errorFields.filter((e) => e !== name),
            }));
            return;
          }

          setError(true);
          setContext((prev) => {
            return {
              ...prev,
              errorFields: [...prev.errorFields, name],
            };
          });
        }}
        onInput={(e) => {
          if (!hasError) return;
          let value = (e.target as HTMLInputElement).value;
          if (value.trim() == "") return;
          if (!value) {
            return;
          }
          const k = context.validator.validate(name, value);
          if (k.success) {
            setError(false);
            setContext((prev) => ({
              ...prev,
              errorFields: prev.errorFields.filter((e) => e !== name),
            }));
            return;
          }
          setContext((prev) => {
            return {
              ...prev,
              errorFields: [...prev.errorFields, name],
            };
          });
        }}
      />
      <div className="text-sm text-red-400">
        {hasError && `Enter a valid ${name}`}
      </div>
    </div>
  );
}

export function SubmitButton({
  children,
  ...props
}: React.HTMLProps<HTMLButtonElement>) {
  const { context } = useFormContext();
  return (
    <button {...props} type="submit" disabled={context.errorFields.length > 0}>
      {children}
    </button>
  );
}
