import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Furniture Admin</h1>
      <p>Authentication is working and your profile is synced.</p>

      <Link
        href="/admin"
        className="inline-block rounded bg-black px-4 py-2 text-white"
      >
        Open Admin Dashboard
      </Link>
    </main>
  );
}