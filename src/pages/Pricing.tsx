import { motion } from "framer-motion";
import { DollarSign, TrendingUp, Percent, ArrowUpDown } from "lucide-react";
import { products, formatCurrency } from "@/data/mockData";
import { useState } from "react";
import { usePendingActions } from "@/hooks/usePendingActions";
import ActionModal from "@/components/ActionModal";

const Pricing = () => {
  const [adjustmentType, setAdjustmentType] = useState<"percent" | "fixed">("percent");
  const [adjustmentValue, setAdjustmentValue] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [newPrice, setNewPrice] = useState("");
  const { submitAction } = usePendingActions();

  const toggleProduct = (id: string) => {
    setSelectedProducts(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const avgMargin = products.reduce((s, p) => s + ((p.retailPrice - p.wholesalePrice) / p.wholesalePrice * 100), 0) / products.length;

  const handleBulkAdjust = async () => {
    if (!adjustmentValue || selectedProducts.length === 0) return;
    const selectedNames = products.filter(p => selectedProducts.includes(p.id)).map(p => p.name).join(", ");
    await submitAction("pricing_change", `Ajustement en masse: ${selectedProducts.length} produits`, `Ajustement de ${adjustmentValue}${adjustmentType === "percent" ? "%" : " TZS"} sur: ${selectedNames}`, { productIds: selectedProducts, adjustmentType, adjustmentValue } as any);
    setSelectedProducts([]);
    setAdjustmentValue("");
  };

  const handleSingleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find(p => p.id === editingProduct);
    if (product) {
      await submitAction("pricing_change", `Modification prix: ${product.name}`, `Nouveau prix détail: ${newPrice} TZS (ancien: ${product.retailPrice} TZS)`, { productId: product.id, oldPrice: product.retailPrice, newPrice: Number(newPrice) } as any);
      setEditingProduct(null);
      setNewPrice("");
    }
  };

  const editProduct = products.find(p => p.id === editingProduct);

  return (
    <div className="space-y-6">
      <div className="page-header"><h1 className="page-title">Gestion des Tarifs</h1><p className="page-subtitle">Prix de gros, prix de détail, et ajustements</p></div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="stat-card"><div className="flex items-center gap-2 mb-1"><DollarSign size={16} className="text-primary" /><span className="text-xs text-muted-foreground">Marge moyenne</span></div><p className="text-2xl font-bold font-display">{avgMargin.toFixed(1)}%</p></div>
        <div className="stat-card"><div className="flex items-center gap-2 mb-1"><TrendingUp size={16} className="text-success" /><span className="text-xs text-muted-foreground">Produits sélectionnés</span></div><p className="text-2xl font-bold font-display">{selectedProducts.length}</p></div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-1"><ArrowUpDown size={16} className="text-info" /><span className="text-xs text-muted-foreground">Ajustement en masse</span></div>
          <div className="flex items-center gap-2 mt-1">
            <select value={adjustmentType} onChange={(e) => setAdjustmentType(e.target.value as "percent" | "fixed")} className="h-8 px-2 rounded border border-input bg-background text-xs"><option value="percent">Pourcentage (%)</option><option value="fixed">Montant fixe (TZS)</option></select>
            <input type="number" placeholder="0" value={adjustmentValue} onChange={(e) => setAdjustmentValue(e.target.value)} className="h-8 w-20 px-2 rounded border border-input bg-background text-xs" />
            <button onClick={handleBulkAdjust} className="h-8 px-3 rounded bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity" disabled={selectedProducts.length === 0}>Appliquer</button>
          </div>
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-border"><th className="table-header p-4 w-10"><input type="checkbox" className="rounded" checked={selectedProducts.length === products.length} onChange={() => setSelectedProducts(selectedProducts.length === products.length ? [] : products.map(p => p.id))} /></th><th className="table-header text-left p-4">Produit</th><th className="table-header text-right p-4">Prix Gros</th><th className="table-header text-right p-4">Prix Détail</th><th className="table-header text-right p-4">Marge</th><th className="table-header text-right p-4">Marge %</th><th className="table-header text-center p-4">Ajuster</th></tr></thead>
            <tbody>
              {products.map((p) => {
                const margin = p.retailPrice - p.wholesalePrice;
                const marginPct = (margin / p.wholesalePrice * 100);
                return (
                  <tr key={p.id} className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${selectedProducts.includes(p.id) ? "bg-primary/5" : ""}`}>
                    <td className="p-4"><input type="checkbox" className="rounded" checked={selectedProducts.includes(p.id)} onChange={() => toggleProduct(p.id)} /></td>
                    <td className="p-4"><p className="text-sm font-medium">{p.name}</p><p className="text-xs text-muted-foreground">{p.category}</p></td>
                    <td className="p-4 text-sm text-right text-muted-foreground">{formatCurrency(p.wholesalePrice)}</td>
                    <td className="p-4 text-sm text-right font-semibold">{formatCurrency(p.retailPrice)}</td>
                    <td className="p-4 text-sm text-right text-success">{formatCurrency(margin)}</td>
                    <td className="p-4 text-sm text-right"><span className={marginPct >= 60 ? "text-success" : marginPct >= 30 ? "text-primary" : "text-warning"}>{marginPct.toFixed(1)}%</span></td>
                    <td className="p-4 text-center"><button onClick={() => { setEditingProduct(p.id); setNewPrice(String(p.retailPrice)); }} className="text-xs px-3 py-1 rounded border border-border hover:bg-muted transition-colors">Modifier</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      <ActionModal isOpen={!!editingProduct} onClose={() => setEditingProduct(null)} title={`Modifier le prix: ${editProduct?.name || ""}`}>
        {editProduct && (
          <form onSubmit={handleSingleEdit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-muted-foreground text-xs">Prix gros actuel</p><p className="font-medium">{formatCurrency(editProduct.wholesalePrice)}</p></div>
              <div><p className="text-muted-foreground text-xs">Prix détail actuel</p><p className="font-bold">{formatCurrency(editProduct.retailPrice)}</p></div>
            </div>
            <div><label className="text-sm font-medium block mb-1">Nouveau prix détail (TZS)</label><input type="number" required value={newPrice} onChange={(e) => setNewPrice(e.target.value)} className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" /></div>
            {newPrice && (
              <div className="p-3 rounded-lg bg-muted/50 text-sm">
                <p>Nouvelle marge: <span className="font-bold text-success">{formatCurrency(Number(newPrice) - editProduct.wholesalePrice)}</span> ({((Number(newPrice) - editProduct.wholesalePrice) / editProduct.wholesalePrice * 100).toFixed(1)}%)</p>
              </div>
            )}
            <button type="submit" className="w-full h-9 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">Soumettre pour validation</button>
          </form>
        )}
      </ActionModal>
    </div>
  );
};

export default Pricing;
