import FaqGrid from "@/components/faq/faqGrid";
import FaqQuestions from "@/components/faq/faqQuestions";

async function Page() {
  return (
    <div>
      <FaqGrid/>
      <FaqQuestions />
    </div>
  );
}

export default Page;