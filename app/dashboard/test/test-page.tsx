"use client";

import { Button } from "@/components/ui/button";
import { sendOrderSuccessEmail } from "@/lib/email";

export default function DashboardTest() {
  return (
    <div>
      <Button onClick={() => sendOrderSuccessEmail({
        userEmail: "nuzumaki247@gmail.com",
        userName: "Hadi",
        orderId: "ORD-Test",
        productName: "Produk Percobaan"
      })}>Kirim Test Email</Button>
    </div>
  );
}