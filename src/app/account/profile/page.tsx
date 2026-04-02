import { getCurrentCustomerSession } from "@/lib/customer-session";
import ProfileForm from "@/components/account/ProfileForm";

export default async function AccountProfilePage() {
  const session = await getCurrentCustomerSession();
  const user = session?.user;

  return (
    <section className="rounded-2xl border border-white/80 bg-white/70 p-6 shadow-sm backdrop-blur">
      <h1 className="mb-2 text-2xl font-semibold">Profile</h1>
      <p className="mb-6 text-sm text-slate-600">Update your personal details and saved address.</p>
      <ProfileForm
        name={user?.name ?? null}
        phone={user?.phone ?? null}
        email={user?.email ?? null}
        address={null}
      />
    </section>
  );
}
