import LoginForm from "@/components/auth/LoginForm";

export const metadata = {
  title: "Login",
  description: "Access your account",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <LoginForm />
    </main>
  );
}
