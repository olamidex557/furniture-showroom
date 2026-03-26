import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AdminLandingClient from "../components/admin-landing-client";

export default async function HomePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return <AdminLandingClient />;
}