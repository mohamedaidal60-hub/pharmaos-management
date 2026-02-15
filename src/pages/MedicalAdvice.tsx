import { motion } from "framer-motion";
import { Stethoscope, Pill, AlertTriangle, Calculator, BookOpen, MessageCircle, Heart, Star, Search, ChevronRight, CheckCircle } from "lucide-react";
import { useState } from "react";
import ActionModal from "@/components/ActionModal";
import { usePendingActions } from "@/hooks/usePendingActions";

const features = [
  { icon: Pill, title: "Base de données médicaments", description: "Informations complètes sur les médicaments : indications, posologie, effets secondaires, contre-indications.", color: "bg-primary/10 text-primary" },
  { icon: AlertTriangle, title: "Vérificateur d'interactions", description: "Évaluez les interactions potentielles entre médicaments pour une délivrance sécurisée.", color: "bg-warning/10 text-warning" },
  { icon: Calculator, title: "Calculateur de dosage", description: "Calcul des posologies adaptées selon l'âge, le poids et la condition médicale du patient.", color: "bg-info/10 text-info" },
  { icon: AlertTriangle, title: "Alertes de sécurité", description: "Notifications sur les rappels, avertissements FDA et alertes de sécurité médicamenteuse.", color: "bg-destructive/10 text-destructive" },
  { icon: MessageCircle, title: "Demander au pharmacien", description: "Les patients peuvent soumettre leurs questions directement à un pharmacien pour des conseils personnalisés.", color: "bg-success/10 text-success" },
  { icon: Heart, title: "Rappels de médicaments", description: "Rappels de prise, de renouvellement d'ordonnance et de suivi santé pour les patients.", color: "bg-primary/10 text-primary" },
  { icon: BookOpen, title: "Éducation patient", description: "Accès aux notices, brochures et vidéos éducatives sur les médicaments.", color: "bg-info/10 text-info" },
  { icon: Star, title: "Avis et évaluations", description: "Les patients peuvent laisser des avis sur les médicaments pour aider les autres patients.", color: "bg-warning/10 text-warning" },
];

const healthTips = [
  { title: "Adhérence au traitement", content: "Prenez vos médicaments à heures fixes pour maximiser leur efficacité." },
  { title: "Conservation des médicaments", content: "Stockez vos médicaments dans un endroit frais et sec, à l'abri de la lumière." },
  { title: "Interactions alimentaires", content: "Certains aliments peuvent interagir avec vos médicaments. Consultez votre pharmacien." },
  { title: "Signalement d'effets indésirables", content: "Si vous ressentez des effets secondaires inhabituels, contactez immédiatement votre pharmacien." },
];

const drugDatabase = [
  { name: "Paracétamol", category: "Analgésique", dosage: "500mg-1g toutes les 4-6h", maxDose: "4g/jour", interactions: ["Warfarine", "Alcool"], contraindications: ["Insuffisance hépatique sévère"], sideEffects: ["Rares: réactions allergiques, hépatotoxicité à forte dose"] },
  { name: "Amoxicilline", category: "Antibiotique", dosage: "250-500mg toutes les 8h", maxDose: "3g/jour", interactions: ["Méthotrexate", "Warfarine"], contraindications: ["Allergie aux pénicillines"], sideEffects: ["Diarrhée", "Nausées", "Éruption cutanée"] },
  { name: "Ibuprofène", category: "AINS", dosage: "200-400mg toutes les 4-6h", maxDose: "1.2g/jour (OTC)", interactions: ["Aspirine", "Lithium", "Méthotrexate"], contraindications: ["Ulcère gastrique", "Insuffisance rénale", "3e trimestre grossesse"], sideEffects: ["Douleurs gastriques", "Nausées", "Vertiges"] },
  { name: "Metformine", category: "Antidiabétique", dosage: "500mg 2-3x/jour", maxDose: "3g/jour", interactions: ["Alcool", "Produits de contraste iodés"], contraindications: ["Insuffisance rénale sévère", "Acidose métabolique"], sideEffects: ["Troubles digestifs", "Acidose lactique (rare)"] },
  { name: "Oméprazole", category: "IPP", dosage: "20-40mg/jour", maxDose: "40mg/jour", interactions: ["Clopidogrel", "Méthotrexate"], contraindications: ["Hypersensibilité"], sideEffects: ["Céphalées", "Diarrhée", "Douleurs abdominales"] },
];

const MedicalAdvice = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [showDrugDetail, setShowDrugDetail] = useState<string | null>(null);
  const [interactionDrugs, setInteractionDrugs] = useState({ drug1: "", drug2: "" });
  const [showInteractionResult, setShowInteractionResult] = useState(false);
  const [dosageCalc, setDosageCalc] = useState({ drug: "", weight: "", age: "" });
  const [reportData, setReportData] = useState({ medication: "", effect: "" });
  const { submitAction } = usePendingActions();

  const filteredDrugs = drugDatabase.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()) || d.category.toLowerCase().includes(searchTerm.toLowerCase()));

  const selectedDrug = drugDatabase.find(d => d.name === showDrugDetail);

  const checkInteraction = () => {
    setShowInteractionResult(true);
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitAction("medical_advice_create", `Signalement: ${reportData.medication}`, `Effet indésirable signalé pour ${reportData.medication}`, reportData as any);
    setShowReport(false);
    setReportData({ medication: "", effect: "" });
  };

  return (
    <div className="space-y-6">
      <div className="page-header"><h1 className="page-title">Conseils Médicaux</h1><p className="page-subtitle">Information médicamenteuse, outils de sécurité et éducation patient</p></div>

      {/* Search */}
      <div className="relative w-full max-w-lg">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input type="text" placeholder="Rechercher un médicament, une interaction..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full h-10 pl-9 pr-4 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
      </div>

      {/* Drug Search Results */}
      {searchTerm && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-4">
          <h3 className="font-display font-semibold text-sm mb-3">Résultats de recherche</h3>
          {filteredDrugs.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun médicament trouvé</p>
          ) : (
            <div className="space-y-2">
              {filteredDrugs.map((drug) => (
                <button key={drug.name} onClick={() => setShowDrugDetail(drug.name)} className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left">
                  <div><p className="text-sm font-medium">{drug.name}</p><p className="text-xs text-muted-foreground">{drug.category}</p></div>
                  <ChevronRight size={14} className="text-muted-foreground" />
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((feature, i) => (
          <motion.div key={feature.title} className="glass-card p-5 cursor-pointer hover:shadow-md transition-all group" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            onClick={() => {
              if (feature.title === "Vérificateur d'interactions") setActiveFeature("interactions");
              else if (feature.title === "Calculateur de dosage") setActiveFeature("dosage");
              else if (feature.title === "Base de données médicaments") setSearchTerm("a");
              else if (feature.title === "Demander au pharmacien") setShowReport(true);
              else setActiveFeature(feature.title);
            }}>
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${feature.color} mb-3`}><feature.icon size={20} /></div>
            <h3 className="font-display font-semibold text-sm mb-1">{feature.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
            <div className="mt-3 flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">Accéder <ChevronRight size={12} /></div>
          </motion.div>
        ))}
      </div>

      {/* Health Tips */}
      <div className="glass-card p-5">
        <h3 className="font-display font-semibold mb-4">Conseils Santé</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {healthTips.map((tip) => (
            <div key={tip.title} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Heart size={14} className="text-primary mt-0.5 shrink-0" />
              <div><p className="text-sm font-medium">{tip.title}</p><p className="text-xs text-muted-foreground mt-0.5">{tip.content}</p></div>
            </div>
          ))}
        </div>
      </div>

      {/* Report */}
      <div className="glass-card p-5">
        <h3 className="font-display font-semibold mb-2">Signaler un effet indésirable</h3>
        <p className="text-xs text-muted-foreground mb-4">Aidez-nous à améliorer la sécurité médicamenteuse en signalant tout effet secondaire inattendu.</p>
        <form onSubmit={handleReport} className="space-y-3">
          <input type="text" placeholder="Nom du médicament" required value={reportData.medication} onChange={(e) => setReportData({...reportData, medication: e.target.value})} className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
          <textarea placeholder="Décrivez l'effet indésirable..." rows={3} required value={reportData.effect} onChange={(e) => setReportData({...reportData, effect: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 resize-none" />
          <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">Soumettre le signalement</button>
        </form>
      </div>

      {/* Drug Detail Modal */}
      <ActionModal isOpen={!!showDrugDetail} onClose={() => setShowDrugDetail(null)} title={selectedDrug?.name || ""}>
        {selectedDrug && (
          <div className="space-y-4 text-sm">
            <div><p className="text-muted-foreground text-xs">Catégorie</p><p className="font-medium">{selectedDrug.category}</p></div>
            <div><p className="text-muted-foreground text-xs">Posologie</p><p className="font-medium">{selectedDrug.dosage}</p></div>
            <div><p className="text-muted-foreground text-xs">Dose maximale</p><p className="font-bold text-warning">{selectedDrug.maxDose}</p></div>
            <div><p className="text-muted-foreground text-xs mb-1">Interactions</p><div className="flex flex-wrap gap-1">{selectedDrug.interactions.map(i => <span key={i} className="badge-warning text-xs">{i}</span>)}</div></div>
            <div><p className="text-muted-foreground text-xs mb-1">Contre-indications</p><div className="flex flex-wrap gap-1">{selectedDrug.contraindications.map(c => <span key={c} className="badge-danger text-xs">{c}</span>)}</div></div>
            <div><p className="text-muted-foreground text-xs mb-1">Effets secondaires</p><ul className="list-disc list-inside text-xs text-muted-foreground">{selectedDrug.sideEffects.map(s => <li key={s}>{s}</li>)}</ul></div>
          </div>
        )}
      </ActionModal>

      {/* Interaction Checker Modal */}
      <ActionModal isOpen={activeFeature === "interactions"} onClose={() => { setActiveFeature(null); setShowInteractionResult(false); }} title="Vérificateur d'interactions">
        <div className="space-y-4">
          <div><label className="text-sm font-medium block mb-1">Médicament 1</label><select value={interactionDrugs.drug1} onChange={(e) => setInteractionDrugs({...interactionDrugs, drug1: e.target.value})} className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm"><option value="">Sélectionner...</option>{drugDatabase.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}</select></div>
          <div><label className="text-sm font-medium block mb-1">Médicament 2</label><select value={interactionDrugs.drug2} onChange={(e) => setInteractionDrugs({...interactionDrugs, drug2: e.target.value})} className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm"><option value="">Sélectionner...</option>{drugDatabase.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}</select></div>
          <button onClick={checkInteraction} disabled={!interactionDrugs.drug1 || !interactionDrugs.drug2} className="w-full h-9 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50">Vérifier les interactions</button>
          {showInteractionResult && interactionDrugs.drug1 && interactionDrugs.drug2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-lg bg-muted/50">
              {(() => {
                const d1 = drugDatabase.find(d => d.name === interactionDrugs.drug1);
                const d2 = drugDatabase.find(d => d.name === interactionDrugs.drug2);
                const hasInteraction = d1?.interactions.includes(interactionDrugs.drug2) || d2?.interactions.includes(interactionDrugs.drug1);
                return hasInteraction ? (
                  <div className="flex items-start gap-2"><AlertTriangle size={16} className="text-warning shrink-0 mt-0.5" /><div><p className="text-sm font-medium text-warning">Interaction détectée !</p><p className="text-xs text-muted-foreground mt-1">{interactionDrugs.drug1} et {interactionDrugs.drug2} présentent une interaction potentielle. Consultez un pharmacien avant de les combiner.</p></div></div>
                ) : (
                  <div className="flex items-start gap-2"><CheckCircle size={16} className="text-success shrink-0 mt-0.5" /><div><p className="text-sm font-medium text-success">Aucune interaction connue</p><p className="text-xs text-muted-foreground mt-1">{interactionDrugs.drug1} et {interactionDrugs.drug2} ne présentent pas d'interaction connue dans notre base.</p></div></div>
                );
              })()}
            </motion.div>
          )}
        </div>
      </ActionModal>

      {/* Dosage Calculator Modal */}
      <ActionModal isOpen={activeFeature === "dosage"} onClose={() => setActiveFeature(null)} title="Calculateur de dosage">
        <div className="space-y-4">
          <div><label className="text-sm font-medium block mb-1">Médicament</label><select value={dosageCalc.drug} onChange={(e) => setDosageCalc({...dosageCalc, drug: e.target.value})} className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm"><option value="">Sélectionner...</option>{drugDatabase.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}</select></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium block mb-1">Poids (kg)</label><input type="number" value={dosageCalc.weight} onChange={(e) => setDosageCalc({...dosageCalc, weight: e.target.value})} className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" /></div>
            <div><label className="text-sm font-medium block mb-1">Âge (ans)</label><input type="number" value={dosageCalc.age} onChange={(e) => setDosageCalc({...dosageCalc, age: e.target.value})} className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" /></div>
          </div>
          {dosageCalc.drug && dosageCalc.weight && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-lg bg-muted/50 space-y-2">
              <p className="text-sm font-medium">Recommandation pour {dosageCalc.drug}</p>
              <p className="text-xs text-muted-foreground">Posologie standard: {drugDatabase.find(d => d.name === dosageCalc.drug)?.dosage}</p>
              <p className="text-xs text-muted-foreground">Dose max: {drugDatabase.find(d => d.name === dosageCalc.drug)?.maxDose}</p>
              {Number(dosageCalc.age) < 12 && <p className="text-xs text-warning font-medium">⚠️ Patient pédiatrique — adapter la posologie selon le poids</p>}
              {Number(dosageCalc.age) > 65 && <p className="text-xs text-warning font-medium">⚠️ Patient âgé — envisager une réduction de dose</p>}
            </motion.div>
          )}
        </div>
      </ActionModal>
    </div>
  );
};

export default MedicalAdvice;
