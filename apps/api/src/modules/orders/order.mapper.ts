export type OrderRow = {
  id: string;
  status: string;
  total_amount: string;
  delivery_address: {
    fullName: string;
    phone: string;
    city: string;
    address: string;
    postalCode?: string | null;
  };
  created_at: Date;
  updated_at: Date;
  payment_id: string | null;
  payment_status: string | null;
  payment_provider: string | null;
  card_last4: string | null;
  paid_at: Date | null;
};

export type OrderItemRow = {
  id: number;
  order_id?: string;
  product_id: number;
  product_name: string;
  unit_price: string;
  quantity: number;
  subtotal: string;
};

export function mapOrder(row: OrderRow, items: OrderItemRow[] = []) {
  return {
    id: row.id,
    status: row.status,
    totalAmount: Number(row.total_amount),
    deliveryAddress: row.delivery_address,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    payment: row.payment_id
      ? {
          id: row.payment_id,
          status: row.payment_status,
          provider: row.payment_provider,
          cardLast4: row.card_last4,
          paidAt: row.paid_at
        }
      : null,
    items: items.map((item) => ({
      id: item.id,
      productId: item.product_id,
      productName: item.product_name,
      unitPrice: Number(item.unit_price),
      quantity: item.quantity,
      subtotal: Number(item.subtotal)
    }))
  };
}
