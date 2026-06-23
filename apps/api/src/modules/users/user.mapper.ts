export type UserRow = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  city: string | null;
  address: string | null;
  postal_code: string | null;
  created_at: Date;
  updated_at: Date;
};

export function mapUser(row: UserRow) {
  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone,
    city: row.city,
    address: row.address,
    postalCode: row.postal_code,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

