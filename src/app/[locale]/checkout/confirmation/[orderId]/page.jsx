import OrderConfirmation from "@/components/checkout/OrderConfirmation";

const ConfirmationPage = async ({ params }) => {
  const { orderId } = await params;
  return <OrderConfirmation orderId={orderId} />;
};

export default ConfirmationPage;
