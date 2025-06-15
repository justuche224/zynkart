import { serverAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import React from "react";

const AdminPage = async () => {
  const session = await serverAuth();

  if (!session) {
    return redirect("/sign-in");
  }

  if (session.user.role !== "ADMIN") {
    return redirect("/");
  }

  return <div>Admin</div>;
};

export default AdminPage;
