"use client";

import { useAuthStore } from "@/store/authStore";
import dynamic from "next/dynamic";

const ChatWidget = dynamic(() => import("./ChatWidget"), { ssr: false });

export default function BuyerChatWrapper() {
  const { user } = useAuthStore();
  // Show for guests (not logged in) and buyers — hide only for admins
  if (user?.role === "ADMIN") return null;
  return <ChatWidget />;
}
