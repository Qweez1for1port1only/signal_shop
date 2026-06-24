export function formatPrice(value: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0
  }).format(value);
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(new Date(value));
}

export function orderStatusText(status: string) {
  const statusMap: Record<string, string> = {
    pending: "Ожидает оплаты",
    paid: "Оплачен",
    shipped: "В доставке",
    completed: "Завершён",
    cancelled: "Отменён"
  };

  return statusMap[status] ?? status;
}

