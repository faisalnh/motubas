'use server';

import { signIn } from '@/auth';
import { db } from '@/lib/db';
import { hash } from 'bcryptjs';
import { AuthError } from 'next-auth';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

export async function register(formData: FormData) {
  try {
    const validatedFields = registerSchema.safeParse({
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
      phone: formData.get('phone'),
    });

    if (!validatedFields.success) {
      return {
        error: validatedFields.error.errors[0].message,
      };
    }

    const { name, email, password, phone } = validatedFields.data;

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return {
        error: 'Email sudah terdaftar',
      };
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create user
    await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
      },
    });

    // Auto login after registration
    await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      error: 'Terjadi kesalahan saat mendaftar',
    };
  }
}

export async function login(formData: FormData) {
  try {
    const validatedFields = loginSchema.safeParse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    if (!validatedFields.success) {
      return {
        error: validatedFields.error.errors[0].message,
      };
    }

    const { email, password } = validatedFields.data;

    await signIn('credentials', {
      email,
      password,
      redirectTo: '/dashboard',
    });

    return {
      success: true,
    };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'Email atau password salah' };
        default:
          return { error: 'Terjadi kesalahan saat login' };
      }
    }
    throw error;
  }
}

export async function loginWithGoogle() {
  await signIn('google', { redirectTo: '/dashboard' });
}
