import { useTranslations } from "next-intl";
import { AIChatInterface } from "@/components/chat/AIChatInterface";

export default function ChatPage() {
  const t = useTranslations("chatPage");

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      <AIChatInterface />
    </div>
  );
}
