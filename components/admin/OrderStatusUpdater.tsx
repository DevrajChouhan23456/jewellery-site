"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "react-hot-toast";

interface OrderStatusUpdaterProps {
  orderId: string;
  currentStatus: string;
}

export function OrderStatusUpdater({ orderId, currentStatus }: OrderStatusUpdaterProps) {
  const [status, setStatus] = useState(currentStatus);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  const statusOptions = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === status) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      setStatus(newStatus);
      toast.success("Order status updated successfully");
      router.refresh();
    } catch (error) {
      toast.error("Failed to update order status");
      console.error("Error updating status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div>
      <label className="text-sm font-medium text-stone-700">Order Status</label>
      <Select value={status} onValueChange={handleStatusChange} disabled={isUpdating}>
        <SelectTrigger className="mt-1">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((statusOption) => (
            <SelectItem key={statusOption} value={statusOption}>
              {statusOption}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}