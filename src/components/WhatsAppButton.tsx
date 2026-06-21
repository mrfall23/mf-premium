'use client';
import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton() {
  const phone = '237651536287';
  const url = 'https://wa.me/' + phone;

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg flex items-center justify-center">
      <MessageCircle className="w-6 h-6" />
    </a>
  );
}