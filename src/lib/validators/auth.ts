import { z } from "zod/v4";

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const SignUpSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(6),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const ResetPasswordSchema = z.object({
  email: z.string().email(),
});

export const NewPasswordSchema = z
  .object({
    password: z.string().min(6),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof LoginSchema>;
export type SignUpInput = z.infer<typeof SignUpSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
export type NewPasswordInput = z.infer<typeof NewPasswordSchema>;
