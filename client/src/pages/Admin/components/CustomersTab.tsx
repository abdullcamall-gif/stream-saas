import { useState, useEffect } from 'react';
import { Users, Search, Mail, Phone, Calendar } from 'lucide-react';
import api from '../../../lib/api';

export const CustomersTab = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/customers'); // Certifique-se que esta rota existe no seu backend
      setCustomers(res.data.data?.customers || []);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black italic tracking-tight">CLIENTES</h1>
          <p className="text-xs text-white/40 uppercase tracking-widest font-bold">Gestão de base de utilizadores</p>
        </div>

        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text"
            placeholder="Buscar por nome ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white/[0.03] border border-white/5 rounded-2xl py-3 pl-12 pr-6 text-sm w-full md:w-80 focus:outline-none focus:border-primary/30 focus:bg-primary/5 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-20 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredCustomers.length > 0 ? (
          filteredCustomers.map((customer) => (
            <div key={customer._id} className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 hover:border-primary/20 transition-all group">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black">
                  {customer.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-tight">{customer.name}</h3>
                  <p className="text-[10px] text-white/30 font-mono uppercase">{customer._id.slice(-6)}</p>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-xs text-white/50">
                  <Mail size={14} className="text-primary/50" />
                  <span>{customer.email || 'Sem email'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/50">
                  <Phone size={14} className="text-primary/50" />
                  <span>{customer.phone || 'Sem telefone'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/50">
                  <Calendar size={14} className="text-primary/50" />
                  <span>Desde {new Date(customer.createdAt).toLocaleDateString('pt-PT')}</span>
                </div>
              </div>

              <button className="w-full py-3 bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100">
                Remover Acesso
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center text-white/20">
            <Users size={48} className="mx-auto mb-4 opacity-10" />
            <p className="font-bold">Nenhum cliente encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
};