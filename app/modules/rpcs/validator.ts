import { ZodSchema, type z } from "zod";

export function zodValidator<T extends z.AnyZodObject>(schema: T) {
  return (data: z.infer<T>) => {
    return schema.parse(data) as z.infer<T>;
  };
}
