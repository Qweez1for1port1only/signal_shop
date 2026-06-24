export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  city: string | null;
  address: string | null;
  postalCode: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Category = {
  id: number;
  name: string;
  slug: string;
  description: string;
};

export type Product = {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  oldPrice: number | null;
  stock: number;
  imageUrl: string;
  specs: Record<string, string>;
  featured: boolean;
  category: {
    id?: number;
    name: string;
    slug: string;
  };
  createdAt: string;
  updatedAt: string;
};

export type CartItem = {
  productId: number;
  name: string;
  slug: string;
  price: number;
  oldPrice: number | null;
  stock: number;
  imageUrl: string;
  quantity: number;
  subtotal: number;
  category: {
    name: string;
    slug: string;
  };
};

export type Cart = {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
};

export type DeliveryAddress = {
  fullName: string;
  phone: string;
  city: string;
  address: string;
  postalCode?: string | null;
};

export type PaymentCard = {
  number: string;
  holder: string;
  expMonth: string;
  expYear: string;
  cvc: string;
};

export type OrderItem = {
  id: number;
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
};

export type Order = {
  id: string;
  status: "pending" | "paid" | "shipped" | "completed" | "cancelled";
  totalAmount: number;
  deliveryAddress: DeliveryAddress;
  createdAt: string;
  updatedAt: string;
  payment: {
    id: string;
    status: "pending" | "succeeded" | "failed";
    provider: string;
    cardLast4: string | null;
    paidAt: string | null;
  } | null;
  items: OrderItem[];
};

