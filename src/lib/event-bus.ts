import type { OrderStatus } from "@prisma/client";
import { EventEmitter } from "events";

export type AppEvents = {
  "order.created": { orderId: string; userId: string; totalAmount: number };
  "order.paid": { orderId: string; userId: string; paymentMethod: string };
  "order.statusChanged": {
    orderId: string;
    previousStatus: OrderStatus;
    newStatus: OrderStatus;
  };
  "cart.updated": { cartId: string; userId?: string };
  "user.logged_in": { userId: string; method: string };
};

// Simple typed event bus wrapper
class TypedEventEmitter extends EventEmitter {
  emit<E extends keyof AppEvents>(event: E, data: AppEvents[E]) {
    return super.emit(event as string, data);
  }
  on<E extends keyof AppEvents>(event: E, listener: (data: AppEvents[E]) => void) {
    return super.on(event as string, listener as (...args: any[]) => void);
  }
}

const eventBus = new TypedEventEmitter();

export default eventBus;
