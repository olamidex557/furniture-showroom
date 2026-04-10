"use client";

import { SignOutButton } from "@clerk/nextjs";

export default function AdminLogoutButton() {
  return (
    <SignOutButton redirectUrl="/sign-in">
      <button type="button" className="admin-btn-secondary">
        Logout
      </button>
    </SignOutButton>
  );
}