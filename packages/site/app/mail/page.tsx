"use client";

import { Toaster } from "react-hot-toast";
import MailApp from "../../components/MailApp";

export default function MailPage() {
  return (
    <div>
      <Toaster position="bottom-center" toastOptions={{ className: "toast" }} />
      <MailApp />
    </div>
  );
}
