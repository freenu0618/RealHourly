import { z } from "zod/v4";

export const CreateClientSchema = z.object({
  name: z.string().min(1).max(100),
});

export const UpdateClientSchema = CreateClientSchema.partial();

export type CreateClientInput = z.infer<typeof CreateClientSchema>;
export type UpdateClientInput = z.infer<typeof UpdateClientSchema>;
