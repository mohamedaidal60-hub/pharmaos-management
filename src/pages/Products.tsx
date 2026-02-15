import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Package, AlertTriangle, Eye, Edit } from "lucide-react";
import ActionModal from "@/components/ActionModal";
import { usePendingActions } from "@/hooks/usePendingActions";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const statusLabels: Record<string, string> = {
  "in-stock": "En stock",
  "low-stock": "Stock faible",
  "out-of-stock": "Rupture",
  "expired": "Expiré",
};

const Products = () => {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [showView, setShowView] = useState<string | null>(null);
  const [showEdit, setShowEdit] = useState<string | null>(null);
  const { submitAction } = usePendingActions();

  const [newProduct, setNewProduct] = useState({ name: "", genericName: "", category: "Antibiotiques", sku: "", wholesalePrice: "", retailPrice: "", quantity: "", reorderLevel: "50" });
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any).from("products").select("*").order("name");
    if (error) {
      toast.error("Erreur lors du chargement des produits");
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const categories = [...new Set(products.map((p) => p.category || "Autre"))];

  const filtered = products.filter((p) => {
    const matchesSearch =
      (p.name?.toLowerCase().includes(search.toLowerCase())) ||
      (p.generic_name?.toLowerCase().includes(search.toLowerCase())) ||
      (p.sku?.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const viewProduct = products.find((p) => p.id === showView);
  const editProduct = products.find((p) => p.id === showEdit);

  const formatCurrency = (amount: any) => {
    const val = typeof amount === 'number' ? amount : parseFloat(amount || "0");
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "TZS" }).format(val);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await submitAction("product_create", `Nouveau produit: ${newProduct.name}`, `Ajout de ${newProduct.name} (${newProduct.genericName}) au catalogue`, newProduct as any);
    if (success) {
      setShowAdd(false);
      setNewProduct({ name: "", genericName: "", category: "Antibiotiques", sku: "", wholesalePrice: "", retailPrice: "", quantity: "", reorderLevel: "50" });
      fetchProducts();
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editProduct) {
      const success = await submitAction("product_update", `Modification: ${editProduct.name}`, `Modification du produit ${editProduct.name}`, { productId: editProduct.id } as any);
      if (success) {
        setShowEdit(null);
        fetchProducts();
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Catalogue Produits</h1>
          <p className="page-subtitle">{products.length} produits — Gérez votre inventaire</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus size={16} /> Ajouter un produit
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input type="text" placeholder="Rechercher par nom, générique, SKU..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full h-9 pl-9 pr-4 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none">
          <option value="all">Toutes catégories</option>
          {categories.map((c) => (<option key={c} value={c}>{c}</option>))}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none">
          <option value="all">Tous statuts</option>
          <option value="in-stock">En stock</option>
          <option value="low-stock">Stock faible</option>
          <option value="out-of-stock">Rupture</option>
          <option value="expired">Expiré</option>
        </select>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="table-header text-left p-4">Produit</th>
                <th className="table-header text-left p-4">Catégorie</th>
                <th className="table-header text-left p-4">SKU</th>
                <th className="table-header text-right p-4">Prix Gros</th>
                <th className="table-header text-right p-4">Prix Détail</th>
                <th className="table-header text-right p-4">Quantité</th>
                <th className="table-header text-left p-4">Expiration</th>
                <th className="table-header text-left p-4">Statut</th>
                <th className="table-header text-center p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr key={product.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="p-4"><div><p className="text-sm font-medium">{product.name}</p><p className="text-xs text-muted-foreground">{product.generic_name}</p></div></td>
                  <td className="p-4 text-sm">{product.category}</td>
                  <td className="p-4 text-sm font-mono text-muted-foreground">{product.sku}</td>
                  <td className="p-4 text-sm text-right">{formatCurrency(product.wholesale_price)}</td>
                  <td className="p-4 text-sm text-right font-medium">{formatCurrency(product.retail_price)}</td>
                  <td className="p-4 text-sm text-right">
                    <span className={product.quantity <= (product.reorder_level || 5) ? "text-warning font-medium" : ""}>{product.quantity}</span>
                    {product.quantity <= (product.reorder_level || 5) && product.quantity > 0 && <AlertTriangle size={12} className="inline ml-1 text-warning" />}
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">{product.expiry_date || "N/A"}</td>
                  <td className="p-4">
                    <span className={product.status === "in-stock" ? "badge-success" : product.status === "low-stock" ? "badge-warning" : "badge-danger"}>
                      {statusLabels[product.status] || product.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => setShowView(product.id)} className="p-1.5 rounded hover:bg-muted transition-colors" title="Voir"><Eye size={14} className="text-muted-foreground" /></button>
                      <button onClick={() => setShowEdit(product.id)} className="p-1.5 rounded hover:bg-muted transition-colors" title="Modifier"><Edit size={14} className="text-muted-foreground" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground"><Package size={40} className="mb-3 opacity-30" /><p className="text-sm">Aucun produit trouvé</p></div>
        )}
      </motion.div>

      <ActionModal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Ajouter un produit">
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium block mb-1">Nom</label><input required value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" /></div>
            <div><label className="text-sm font-medium block mb-1">Nom générique</label><input required value={newProduct.genericName} onChange={(e) => setNewProduct({ ...newProduct, genericName: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium block mb-1">Catégorie</label><input required value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" /></div>
            <div><label className="text-sm font-medium block mb-1">SKU</label><input required value={newProduct.sku} onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium block mb-1">Prix gros (TZS)</label><input type="number" required value={newProduct.wholesalePrice} onChange={(e) => setNewProduct({ ...newProduct, wholesalePrice: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" /></div>
            <div><label className="text-sm font-medium block mb-1">Prix détail (TZS)</label><input type="number" required value={newProduct.retailPrice} onChange={(e) => setNewProduct({ ...newProduct, retailPrice: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium block mb-1">Quantité</label><input type="number" required value={newProduct.quantity} onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" /></div>
            <div><label className="text-sm font-medium block mb-1">Seuil réapprovisionnement</label><input type="number" value={newProduct.reorderLevel} onChange={(e) => setNewProduct({ ...newProduct, reorderLevel: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" /></div>
          </div>
          <button type="submit" className="w-full h-9 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">Soumettre pour validation</button>
        </form>
      </ActionModal>

      <ActionModal isOpen={!!showView} onClose={() => setShowView(null)} title={viewProduct?.name || "Détail produit"}>
        {viewProduct && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-muted-foreground text-xs">Nom générique</p><p className="font-medium">{viewProduct.generic_name}</p></div>
              <div><p className="text-muted-foreground text-xs">Catégorie</p><p className="font-medium">{viewProduct.category}</p></div>
              <div><p className="text-muted-foreground text-xs">SKU</p><p className="font-mono">{viewProduct.sku}</p></div>
              <div><p className="text-muted-foreground text-xs">Prix gros</p><p className="font-medium">{formatCurrency(viewProduct.wholesale_price)}</p></div>
              <div><p className="text-muted-foreground text-xs">Prix détail</p><p className="font-bold">{formatCurrency(viewProduct.retail_price)}</p></div>
              <div><p className="text-muted-foreground text-xs">Quantité</p><p className="font-medium">{viewProduct.quantity}</p></div>
              <div><p className="text-muted-foreground text-xs">Seuil réappro.</p><p className="font-medium">{viewProduct.reorder_level}</p></div>
              <div><p className="text-muted-foreground text-xs">Expiration</p><p className="font-medium">{viewProduct.expiry_date || "N/A"}</p></div>
              <div><p className="text-muted-foreground text-xs">Emplacement</p><p className="font-medium">{viewProduct.location || "N/A"}</p></div>
              <div><p className="text-muted-foreground text-xs">Statut</p><span className={viewProduct.status === "in-stock" ? "badge-success" : viewProduct.status === "low-stock" ? "badge-warning" : "badge-danger"}>{statusLabels[viewProduct.status] || viewProduct.status}</span></div>
            </div>
          </div>
        )}
      </ActionModal>

      <ActionModal isOpen={!!showEdit} onClose={() => setShowEdit(null)} title={`Modifier: ${editProduct?.name || ""}`}>
        {editProduct && (
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-medium block mb-1">Nom</label><input defaultValue={editProduct.name} className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" /></div>
              <div><label className="text-sm font-medium block mb-1">Prix détail</label><input type="number" defaultValue={editProduct.retail_price} className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-medium block mb-1">Quantité</label><input type="number" defaultValue={editProduct.quantity} className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" /></div>
              <div><label className="text-sm font-medium block mb-1">Seuil</label><input type="number" defaultValue={editProduct.reorder_level} className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" /></div>
            </div>
            <button type="submit" className="w-full h-9 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">Soumettre la modification</button>
          </form>
        )}
      </ActionModal>
    </div>
  );
};

export default Products;
