import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

export default function FloatingWidget() {
  return (
    <a
      href="https://wa.me/77776660295"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 right-4 z-50 p-4 bg-[#d4af37] text-black rounded-full shadow-lg hover:bg-[#c0982c] transition-all focus:outline-none focus:ring-4 focus:ring-[#d4af37]/50"
      aria-label="Contact via WhatsApp"
    >
      <ChatBubbleLeftRightIcon className="h-6 w-6" />
    </a>
  );
}
