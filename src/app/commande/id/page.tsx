import { supabase } from '@/lib/supabase';
import { CheckCircle, XCircle, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export default async function CommandePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const { data: order } = await supabase
    .from('orders')
    .select('*, customers(*), order_items(*)')
    .eq('id', id)
    .single();

  if (!order) {
    return (
      <div className="pt-24 text-center">
        <p className="text-gray-400">Commande introuvable.</p>
      </div>
    );
  }

  const isPaid = order.status === 'paid';
  const whatsappNumber = '237651536287';

  const whatsappMessage = isPaid
    ? encodeURIComponent(
        `✅ *Confirmation de commande MF Premium*\n\n` +
        `📋 Commande: #${order.id.slice(0, 8).toUpperCase()}\n` +
        `👤 Nom: ${order.customers?.name}\n` +
        `📱 Téléphone: ${order.customers?.phone}\n` +
        `📧 Email: ${order.customers?.email}\n\n` +
        `💰 Total payé: ${order.total_amount?.toLocaleString()} FCFA\n` +
        `📅 Date: ${new Date(order.created_at).toLocaleDateString('fr-FR')}\n\n` +
        `Merci de m'envoyer mes accès svp ! 🙏`
      )
    : '';

  return (
    <div className="pt-24 pb-20 px-4 max-w-2xl mx-auto">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
        {isPaid ? (
          <>
            <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-2">Paiement confirmé !</h1>
            <p className="text-gray-400 mb-8">Merci {order.customers?.name}. Votre commande a été enregistrée.</p>
            <div className="bg-white/5 rounded-xl p-4 mb-6 text-left space-y-2">
              <p className="text-sm text-gray-400">Commande <span className="text-white font-mono">#{order.id.slice(0, 8).toUpperCase()}</span></p>
              <p className="text-sm text-gray-400">Total: <span className="text-white font-bold">{order.total_amount?.toLocaleString()} FCFA</span></p>
            </div>
            
              href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-xl font-bold text-lg transition-all w-full mb-4"
            >
              <MessageCircle className="w-6 h-6" />
              Contacter sur WhatsApp
            </a>
          </>
        ) : (
          <>
            <XCircle className="w-20 h-20 text-red-400 mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-2">Paiement en attente</h1>
            <p className="text-gray-400 mb-8">Votre paiement n'a pas encore été confirmé.</p>
          </>
        )}
        <Link href="/boutique" className="text-blue-400 hover:text-blue-300 transition-colors">
          ← Retour à la boutique
        </Link>
      </div>
    </div>
  );
}
