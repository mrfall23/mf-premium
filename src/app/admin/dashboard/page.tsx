'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Users, ShoppingBag, TrendingUp, Trash2, Plus, LogOut } from 'lucide-react';

interface Stats {
  totalCustomers: number;
  totalOrders: number;
  totalRevenue: number;
}

interface Order {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  customers: { name: string; email: string; phone: string };
}

interface Product {
  id: string;
  name: string;
  price: number;
  duration: string;
  is_active: boolean;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({ totalCustomers: 0, totalOrders: 0, totalRevenue: 0 });
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', description: '', price: '', duration: '1 mois', category: 'streaming' });

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('mf_admin')) {
      router.push('/admin/login');
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    const [{ count: customersCount }, { count: ordersCount }, { data: revenueData }, { data: ordersData }, { data: productsData }] = await Promise.all([
      supabase.from('customers').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('total_amount').eq('status', 'paid'),
      supabase.from('orders').select('*, customers(name, email, phone)').order('created_at', { ascending: false }).limit(50),
      supabase.from('products').select('*').order('created_at'),
    ]);

    const totalRevenue = revenueData?.reduce((sum, o) => sum + o.total_amount, 0) || 0;
    setStats({ totalCustomers: customersCount || 0, totalOrders: ordersCount || 0, totalRevenue });
    setOrders((ordersData as Order[]) || []);
    setProducts(productsData || []);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Supprimer ce produit ?')) return;
    await supabase.from('products').delete().eq('id', id);
    loadData();
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price) return;
    await supabase.from('products').insert({
      name: newProduct.name,
      description: newProduct.description,
      price: parseFloat(newProduct.price),
      duration: newProduct.duration,
      category: newProduct.category,
    });
    setNewProduct({ name: '', description: '', price: '', duration: '1 mois', category: 'streaming' });
    setShowAddProduct(false);
    loadData();
  };

  const handleLogout = () => {
    localStorage.removeItem('mf_admin');
    router.push('/admin/login');
  };

  const statusColors: Record<string, string> = {
    paid: 'bg-green-500/20 text-green-400',
    pending: 'bg-yellow-500/20 text-yellow-400',
    failed: 'bg-red-500/20 text-red-400',
  };

  return (
    <div className="pt-16 min-h-screen">
      <div className="bg-white/5 border-b border-white/10 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Dashboard Admin</h1>
        <button onClick={handleLogout} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <LogOut className="w-4 h-4" /> Déconnexion
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-2 mb-8 border-b border-white/10">
          {['overview', 'orders', 'products'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium capitalize transition-colors border-b-2 -mb-px ${
                activeTab === tab ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'overview' ? 'Vue générale' : tab === 'orders' ? 'Commandes' : 'Produits'}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <Users className="w-8 h-8 text-blue-400" />, label: 'Clients', value: stats.totalCustomers },
              { icon: <ShoppingBag className="w-8 h-8 text-green-400" />, label: 'Commandes', value: stats.totalOrders },
              { icon: <TrendingUp className="w-8 h-8 text-yellow-400" />, label: "Chiffre d'affaires", value: `${stats.totalRevenue.toLocaleString()} FCFA` },
            ].map((stat, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                {stat.icon}
                <p className="text-gray-400 mt-2 text-sm">{stat.label}</p>
                <p className="text-3xl font-bold mt-1">{stat.value}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 text-sm">
                  <th className="pb-3 pr-4">Commande</th>
                  <th className="pb-3 pr-4">Client</th>
                  <th className="pb-3 pr-4">Montant</th>
                  <th className="pb-3 pr-4">Statut</th>
                  <th className="pb-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.map((order) => (
                  <tr key={order.id} className="text-sm">
                    <td className="py-3 pr-4 font-mono text-blue-400">#{order.id.slice(0, 8).toUpperCase()}</td>
                    <td className="py-3 pr-4">
                      <p className="font-medium">{order.customers?.name}</p>
                      <p className="text-gray-400 text-xs">{order.customers?.email}</p>
                    </td>
                    <td className="py-3 pr-4 font-bold">{order.total_amount?.toLocaleString()} FCFA</td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-gray-500/20 text-gray-400'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 text-gray-400">{new Date(order.created_at).toLocaleDateString('fr-FR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Produits ({products.length})</h2>
              <button
                onClick={() => setShowAddProduct(!showAddProduct)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors"
              >
                <Plus className="w-4 h-4" /> Ajouter
              </button>
            </div>

            {showAddProduct && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <input placeholder="Nom du produit" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} className="bg-white/5 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
                <input placeholder="Prix (FCFA)" type="number" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} className="bg-white/5 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
                <input placeholder="Description" value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} className="bg-white/5 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
                <select value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} className="bg-black border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500">
                  <option value="streaming">Streaming</option>
                  <option value="music">Musique</option>
                  <option value="anime">Anime</option>
                  <option value="design">Design</option>
                </select>
                <select value={newProduct.duration} onChange={(e) => setNewProduct({ ...newProduct, duration: e.target.value })} className="bg-black border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500">
                  <option value="1 mois">1 Mois</option>
                  <option value="3 mois">3 Mois</option>
                  <option value="1 an">1 An</option>
                </select>
                <button onClick={handleAddProduct} className="bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl font-medium transition-colors col-span-1 md:col-span-2">
                  Enregistrer le produit
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <div key={product.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{product.name}</p>
                    <p className="text-blue-400 font-bold">{product.price.toLocaleString()} FCFA</p>
                    <p className="text-gray-400 text-sm">{product.duration}</p>
                  </div>
                  <button onClick={() => handleDeleteProduct(product.id)} className="text-red-400 hover:text-red-300 p-2 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
