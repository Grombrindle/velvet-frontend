import RegisterForm from "@/components/auth/RegisterForm";

export const metadata = {
  title: "Create an Account",
  description: "Join us by creating a new account.",
};

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <RegisterForm />
    </main>
  );
}
