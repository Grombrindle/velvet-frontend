import OrderDetailsClient from "@/components/orders/orderDetails";

// Server Component (No "use client" directive)
const OrderDetails = async ({ params }) => {
  const { id } = await params; // MUST await params for Next.js 15+

  // You can optionally fetch initial data server-side here
  // const initialOrderData = await fetchOrderData(id);

  return (
    <OrderDetailsClient orderId={id} /> 
  );
};

export default OrderDetails;