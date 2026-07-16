import DashboardNav from "./dashboardNav";
export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-[#F5F6FA]">
      <DashboardNav />
      <main className="flex-1 lg:p-8 p-4">
        {children}
      </main>
    </div>
  );
}