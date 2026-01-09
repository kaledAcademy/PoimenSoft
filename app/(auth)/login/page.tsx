"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, Eye, EyeOff, Lock, Mail, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { loginSchema } from "@/lib/validations/auth-schemas";
import { z } from "zod";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, checkAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  // Inicializar React Hook Form con Zod resolver
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur", // Validar al perder foco
  });

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    // Toast de loading
    const loadingToast = toast.loading("Iniciando sesión...", {
      description: "Verificando tus credenciales",
    });

    const result = await login(data);

    // Dismiss loading toast
    toast.dismiss(loadingToast);

    if (result.success) {
      // Actualizar el store de autenticación para que el Header detecte la sesión
      await checkAuth();

      // Obtener usuario del store para verificar estado de compra
      const { user } = useAuthStore.getState();
      const hasCompletedPurchase = user?.hasCompletedPurchase || false;

      // Toast de éxito
      toast.success("¡Bienvenido de nuevo!", {
        description: hasCompletedPurchase
          ? "Ingresando al dashboard..."
          : "Redirigiendo a la página principal...",
        duration: 2000,
      });

      setTimeout(() => {
        // Redirigir al dashboard después del login
        router.push("/dashboard");
      }, 1000);
    } else {
      // Si el backend retorna errores por campo, establecerlos en el formulario
      if ((result as any).details?.fieldErrors) {
        Object.entries((result as any).details.fieldErrors).forEach(([field, message]) => {
          form.setError(field as any, {
            type: "server",
            message: message as string,
          });
        });
      } else {
        // Error general
        form.setError("root", {
          message: result.error || "Credenciales inválidas",
        });
        toast.error("Error al iniciar sesión", {
          description: result.error || "Credenciales inválidas",
          duration: 5000,
        });
      }
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient - igual que landing page */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50" />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20" />

      {/* Decorative elements - círculos difuminados */}
      <div className="absolute top-1/4 left-10 w-32 h-32 bg-blue-200 rounded-full opacity-20 blur-3xl animate-pulse" />
      <div
        className="absolute top-1/3 right-10 w-40 h-40 bg-purple-200 rounded-full opacity-20 blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      />
      <div
        className="absolute bottom-1/4 left-1/3 w-36 h-36 bg-pink-200 rounded-full opacity-20 blur-3xl animate-pulse"
        style={{ animationDelay: "2s" }}
      />


      {/* Content container */}
      <div className="container relative z-10 mx-auto px-4 py-12">
        <div className="flex flex-col items-center">
          {/* Logo y título - Área transparente para mostrar pieza de fondo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8 relative z-10"
          >
            {/* Título con fondo semi-transparente para mejor legibilidad */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-lg">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                Iniciar Sesión
              </h1>
              <p className="text-gray-600">
                Accede a tu cuenta
              </p>
            </div>
          </motion.div>

          {/* Form card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full max-w-md"
          >
            <Card className="border-[3px] border-slate-300 rounded-2xl shadow-2xl bg-white/90 backdrop-blur-md hover:border-amaxoft-blue/70 transition-all duration-300 group">
              <CardContent className="pt-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} method="post" className="space-y-5">
                    {/* Error general del formulario */}
                    {form.formState.errors.root && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        <Alert variant="destructive" className="border-red-200">
                          <AlertDescription>{form.formState.errors.root.message}</AlertDescription>
                        </Alert>
                      </motion.div>
                    )}

                    {/* Email */}
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">
                            Correo electrónico
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail
                                className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                                  fieldState.error ? "text-red-500" : "text-gray-400"
                                }`}
                              />
                              <Input
                                {...field}
                                type="email"
                                placeholder="tu@email.com"
                                className={`pl-10 h-12 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${
                                  fieldState.error
                                    ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20"
                                    : ""
                                }`}
                                disabled={isLoading}
                              />
                              {fieldState.error && (
                                <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500" />
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Contraseña */}
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">Contraseña</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock
                                className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                                  fieldState.error ? "text-red-500" : "text-gray-400"
                                }`}
                              />
                              <Input
                                {...field}
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className={`pl-10 pr-12 h-12 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${
                                  fieldState.error
                                    ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20"
                                    : ""
                                }`}
                                disabled={isLoading}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={isLoading}
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4 text-gray-400" />
                                ) : (
                                  <Eye className="h-4 w-4 text-gray-400" />
                                )}
                              </Button>
                              {fieldState.error && (
                                <AlertCircle className="absolute right-12 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500" />
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full h-12 text-base bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200"
                      disabled={isLoading || form.formState.isSubmitting}
                    >
                      {isLoading || form.formState.isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Iniciando sesión...
                        </>
                      ) : (
                        "Iniciar Sesión"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 text-center"
          >
            <p className="text-xs text-gray-500">
              🔒 Conexión segura y cifrada • Protegemos tus datos
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
