"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import Link from "next/link";
import { useAuthActions } from "@convex-dev/auth/react";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export const signUpSchema = z
  .object({
    name: z.string({ message: "Nome é obrigatório" }).min(1, {
      message: "Nome é obrigatório",
    }),
    matricula: z
      .string({ message: "Matrícula é obrigatória" })
      .regex(/^\d{6}$/, {
        message: "Matrícula deve conter exatamente 6 números",
      }),
    email: z.string({ message: "Email é obrigatório" }).email({
      message: "Email inválido",
    }),
    password: z.string({ message: "Senha é obrigatória" }).min(8, {
      message: "Senha deve ter no mínimo 8 caracteres",
    }),
    passwordConfirmation: z.string({
      message: "Confirmação de senha é obrigatória",
    }),
  })
  .refine(data => data.password === data.passwordConfirmation, {
    message: "Senhas não coincidem",
    path: ["passwordConfirmation"], // Attach the error to passwordConfirmation
  });

export type SignUpFormData = z.infer<typeof signUpSchema>;

export default function SignUpForm() {
  const { signIn } = useAuthActions();
  const { toast } = useToast();
  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      matricula: "",
      email: "",
      password: "",
      passwordConfirmation: "",
    },
  });

  const checkEmailAlreadyExists = useMutation(api.users.getUserByEmail);
  const checkMatriculaAlreadyExists = useMutation(
    api.users.getUserByMatricula
  );

  const handleSubmit = async (values: SignUpFormData) => {
    const user = await checkEmailAlreadyExists({
      email: values.email,
    });

    if (user) {
      toast({
        variant: "destructive",
        title: "Erro ao registrar",
        description: "O email informado já está em uso",
      });
      return;
    }

    const userWithMatricula = await checkMatriculaAlreadyExists({
      matricula: values.matricula,
    });

    if (userWithMatricula) {
      toast({
        variant: "destructive",
        title: "Erro ao registrar",
        description: "A matrícula informada já está em uso",
      });
      return;
    }

    try {
      await signIn("password", {
        flow: "signUp",
        email: values.email,
        password: values.password,
        name: values.name,
        matricula: values.matricula,
      });
    } catch (error) {
      console.error("Failed to sign up", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Registrar</CardTitle>
        <CardDescription>Crie uma conta para acessar o CG.lab</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="matricula"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Matrícula</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      inputMode="numeric"
                      maxLength={6}
                      onChange={e =>
                        field.onChange(
                          e.target.value.replace(/\D/g, "").slice(0, 6)
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="passwordConfirmation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar senha</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              className="w-full"
              type="submit"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting && (
                <Loader2 className="animate-spin" />
              )}
              Registrar
            </Button>
            <div className="mt-4 text-center text-sm">
              Já possui uma conta?{" "}
              <Link href="/login" className="underline underline-offset-4">
                Entrar
              </Link>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
