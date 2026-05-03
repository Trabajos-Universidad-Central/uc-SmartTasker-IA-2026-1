'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoginForm } from './login-form';
import { RegisterForm } from './register-form';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 p-6">
      <div className="bg-white rounded-3xl shadow-xl flex overflow-hidden w-full max-w-5xl">
        {/* Panel izquierdo: marca + tabs + forms */}
        <div className="flex-1 p-8 md:p-10 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-bold rounded-xl w-10 h-10 flex items-center justify-center">
              ST
            </div>
            <h1 className="text-2xl font-semibold text-gray-800">
              SmartTasker
            </h1>
          </div>

          <Tabs defaultValue="login" className="w-full max-w-sm">
            <TabsList className="bg-gray-100 rounded-full p-1 h-auto w-fit mb-6 gap-1">
              <TabsTrigger
                value="login"
                className="rounded-full px-5 py-2 text-sm font-medium text-gray-500 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow"
              >
                Iniciar sesión
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="rounded-full px-5 py-2 text-sm font-medium text-gray-500 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow"
              >
                Crear cuenta
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-0">
              <LoginForm />
            </TabsContent>
            <TabsContent value="register" className="mt-0">
              <RegisterForm />
            </TabsContent>
          </Tabs>
        </div>

        {/* Panel derecho decorativo (se esconde en mobile) */}
        <div className="hidden md:flex flex-1 bg-gradient-to-br from-gray-900 via-indigo-900 to-indigo-700 text-white p-10 flex-col justify-between">
          <div>
            <h2 className="text-4xl font-bold mb-4">
              Tu agenda más inteligente
            </h2>
            <p className="text-indigo-200 text-lg">
              Agenda reuniones, tareas y recordatorios con sugerencias
              automáticas basadas en tus hábitos diarios.
            </p>
          </div>

          <div className="mt-10 bg-white/10 rounded-2xl p-6 backdrop-blur-md text-center">
            <div className="grid grid-cols-7 gap-2 text-sm text-white/90">
              {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d) => (
                <div key={d} className="font-semibold text-indigo-300">
                  {d}
                </div>
              ))}
              {Array.from({ length: 30 }, (_, i) => (
                <div
                  key={i}
                  className={`p-2 rounded-lg ${
                    i === 13
                      ? 'bg-indigo-600 font-bold'
                      : 'hover:bg-white/20 transition'
                  }`}
                >
                  {i + 1}
                </div>
              ))}
            </div>
            <p className="text-white/70 text-xs mt-4">Abril 2026</p>
          </div>

          <p className="text-sm text-indigo-300 mt-6 text-center">
            © 2026 SmartTasker
          </p>
        </div>
      </div>
    </div>
  );
}
