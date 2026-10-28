import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().trim().email('Adresse email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const RegisterSchema = z.object({
  pseudo: z
    .string()
    .trim()
    .min(2, 'Le pseudo doit contenir au moins 2 caractères')
    .max(30, 'Le pseudo ne peut pas dépasser 30 caractères')
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Le pseudo ne peut contenir que des lettres, chiffres, tirets et underscores'
    ),
  email: z.string().trim().email('Adresse email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;

export const ProfileUpdateSchema = z.object({
  pseudo: z
    .string()
    .trim()
    .min(2, 'Le pseudo doit contenir au moins 2 caractères')
    .max(30, 'Le pseudo ne peut pas dépasser 30 caractères')
    .optional(),
  reduce_motion: z.boolean().optional(),
});

export type ProfileUpdateInput = z.infer<typeof ProfileUpdateSchema>;
