// Mock data for the PharmaOS pharmacy application

export interface Product {
  id: string;
  name: string;
  genericName: string;
  category: string;
  subcategory: string;
  sku: string;
  barcode: string;
  batchNumber: string;
  manufacturer: string;
  supplier: string;
  wholesalePrice: number;
  retailPrice: number;
  quantity: number;
  reorderLevel: number;
  expiryDate: string;
  location: string;
  status: "in-stock" | "low-stock" | "out-of-stock" | "expired";
  requiresPrescription: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerType: "retail" | "wholesale";
  items: { productName: string; quantity: number; unitPrice: number }[];
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "paid" | "unpaid" | "partial";
  paymentMethod: string;
  orderDate: string;
  deliveryDate?: string;
  store: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: "retail" | "wholesale";
  loyaltyPoints: number;
  totalSpent: number;
  totalOrders: number;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  joinDate: string;
  lastVisit: string;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: "admin" | "pharmacist" | "cashier" | "manager" | "warehouse";
  store: string;
  avatar: string;
  status: "online" | "offline" | "busy";
}

export interface Message {
  id: string;
  from: string;
  fromAvatar: string;
  subject: string;
  preview: string;
  timestamp: string;
  read: boolean;
  urgent: boolean;
}

export interface Store {
  id: string;
  name: string;
  address: string;
  phone: string;
  manager: string;
  status: "active" | "inactive";
}

export interface InsuranceClaim {
  id: string;
  patientName: string;
  provider: string;
  policyNumber: string;
  claimAmount: number;
  status: "submitted" | "processing" | "approved" | "denied";
  submittedDate: string;
  medicationName: string;
}

export interface Prescription {
  id: string;
  patientName: string;
  doctorName: string;
  medications: { name: string; dosage: string; quantity: number; instructions: string }[];
  status: "pending" | "dispensed" | "partially-dispensed" | "on-hold";
  prescriptionDate: string;
  insuranceCovered: boolean;
}

export const stores: Store[] = [
  { id: "s1", name: "PharmaOS Central", address: "123 Rue de la Liberté, Alger", phone: "+213 21 123 456", manager: "Dr. Amina Juma", status: "active" },
  { id: "s2", name: "PharmaOS Didouche", address: "45 Rue Didouche Mourad, Alger", phone: "+213 21 234 567", manager: "Dr. Hassan Mwinyi", status: "active" },
  { id: "s3", name: "PharmaOS Kouba", address: "78 Avenue de Kouba, Alger", phone: "+213 21 345 678", manager: "Dr. Fatma Ali", status: "active" },
];

export const products: Product[] = [
  { id: "p1", name: "Amoxicillin 500mg", genericName: "Amoxicillin", category: "Antibiotics", subcategory: "Penicillins", sku: "AMX500", barcode: "8901234567890", batchNumber: "BT2024-001", manufacturer: "Cipla", supplier: "MedSupply Co", wholesalePrice: 2500, retailPrice: 4500, quantity: 250, reorderLevel: 50, expiryDate: "2026-06-15", location: "Shelf A1", status: "in-stock", requiresPrescription: true },
  { id: "p2", name: "Paracetamol 500mg", genericName: "Acetaminophen", category: "Pain Relief", subcategory: "Analgesics", sku: "PAR500", barcode: "8901234567891", batchNumber: "BT2024-002", manufacturer: "GSK", supplier: "PharmaDist", wholesalePrice: 500, retailPrice: 1000, quantity: 500, reorderLevel: 100, expiryDate: "2027-03-20", location: "Shelf B2", status: "in-stock", requiresPrescription: false },
  { id: "p3", name: "Metformin 850mg", genericName: "Metformin HCL", category: "Diabetes", subcategory: "Biguanides", sku: "MET850", barcode: "8901234567892", batchNumber: "BT2024-003", manufacturer: "Merck", supplier: "MedSupply Co", wholesalePrice: 3000, retailPrice: 5500, quantity: 30, reorderLevel: 40, expiryDate: "2026-09-10", location: "Shelf C3", status: "low-stock", requiresPrescription: true },
  { id: "p4", name: "Omeprazole 20mg", genericName: "Omeprazole", category: "Gastrointestinal", subcategory: "PPIs", sku: "OMP020", barcode: "8901234567893", batchNumber: "BT2024-004", manufacturer: "AstraZeneca", supplier: "GlobalPharma", wholesalePrice: 4000, retailPrice: 7000, quantity: 120, reorderLevel: 30, expiryDate: "2026-12-01", location: "Shelf D4", status: "in-stock", requiresPrescription: true },
  { id: "p5", name: "Vitamin C 1000mg", genericName: "Ascorbic Acid", category: "Vitamins", subcategory: "Supplements", sku: "VTC100", barcode: "8901234567894", batchNumber: "BT2024-005", manufacturer: "Nature's Best", supplier: "WellnessSupply", wholesalePrice: 1500, retailPrice: 3000, quantity: 300, reorderLevel: 60, expiryDate: "2027-08-15", location: "Shelf E5", status: "in-stock", requiresPrescription: false },
  { id: "p6", name: "Ibuprofen 400mg", genericName: "Ibuprofen", category: "Pain Relief", subcategory: "NSAIDs", sku: "IBU400", barcode: "8901234567895", batchNumber: "BT2024-006", manufacturer: "Pfizer", supplier: "PharmaDist", wholesalePrice: 800, retailPrice: 1500, quantity: 0, reorderLevel: 80, expiryDate: "2026-05-30", location: "Shelf B3", status: "out-of-stock", requiresPrescription: false },
  { id: "p7", name: "Ciprofloxacin 500mg", genericName: "Ciprofloxacin", category: "Antibiotics", subcategory: "Fluoroquinolones", sku: "CIP500", barcode: "8901234567896", batchNumber: "BT2024-007", manufacturer: "Bayer", supplier: "MedSupply Co", wholesalePrice: 3500, retailPrice: 6000, quantity: 85, reorderLevel: 25, expiryDate: "2025-02-01", location: "Shelf A2", status: "expired", requiresPrescription: true },
  { id: "p8", name: "Losartan 50mg", genericName: "Losartan Potassium", category: "Cardiovascular", subcategory: "ARBs", sku: "LOS050", barcode: "8901234567897", batchNumber: "BT2024-008", manufacturer: "Teva", supplier: "GlobalPharma", wholesalePrice: 5000, retailPrice: 8500, quantity: 150, reorderLevel: 35, expiryDate: "2027-01-20", location: "Shelf F6", status: "in-stock", requiresPrescription: true },
  { id: "p9", name: "Cetirizine 10mg", genericName: "Cetirizine HCL", category: "Allergy", subcategory: "Antihistamines", sku: "CET010", barcode: "8901234567898", batchNumber: "BT2024-009", manufacturer: "UCB", supplier: "PharmaDist", wholesalePrice: 600, retailPrice: 1200, quantity: 45, reorderLevel: 50, expiryDate: "2026-11-05", location: "Shelf G7", status: "low-stock", requiresPrescription: false },
  { id: "p10", name: "Insulin Glargine", genericName: "Insulin Glargine", category: "Diabetes", subcategory: "Insulins", sku: "INS001", barcode: "8901234567899", batchNumber: "BT2024-010", manufacturer: "Sanofi", supplier: "MedSupply Co", wholesalePrice: 25000, retailPrice: 40000, quantity: 20, reorderLevel: 10, expiryDate: "2026-04-15", location: "Cold Storage", status: "in-stock", requiresPrescription: true },
];

export const orders: Order[] = [
  { id: "o1", orderNumber: "ORD-2024-001", customerName: "John Mwamba", customerType: "retail", items: [{ productName: "Amoxicillin 500mg", quantity: 2, unitPrice: 4500 }, { productName: "Paracetamol 500mg", quantity: 1, unitPrice: 1000 }], total: 10000, status: "delivered", paymentStatus: "paid", paymentMethod: "M-Pesa", orderDate: "2024-12-01", deliveryDate: "2024-12-01", store: "PharmaOS Central" },
  { id: "o2", orderNumber: "ORD-2024-002", customerName: "Kariakoo Pharmacy Ltd", customerType: "wholesale", items: [{ productName: "Paracetamol 500mg", quantity: 100, unitPrice: 500 }, { productName: "Vitamin C 1000mg", quantity: 50, unitPrice: 1500 }], total: 125000, status: "processing", paymentStatus: "partial", paymentMethod: "Bank Transfer", orderDate: "2024-12-10", store: "PharmaOS Central" },
  { id: "o3", orderNumber: "ORD-2024-003", customerName: "Mariam Salim", customerType: "retail", items: [{ productName: "Metformin 850mg", quantity: 1, unitPrice: 5500 }], total: 5500, status: "pending", paymentStatus: "unpaid", paymentMethod: "Cash", orderDate: "2024-12-14", store: "Pata Dawa Kariakoo" },
  { id: "o4", orderNumber: "ORD-2024-004", customerName: "HealthPlus Distributors", customerType: "wholesale", items: [{ productName: "Omeprazole 20mg", quantity: 200, unitPrice: 4000 }, { productName: "Losartan 50mg", quantity: 150, unitPrice: 5000 }], total: 1550000, status: "shipped", paymentStatus: "paid", paymentMethod: "Bank Transfer", orderDate: "2024-12-12", deliveryDate: "2024-12-15", store: "PharmaOS Central" },
  { id: "o5", orderNumber: "ORD-2024-005", customerName: "Said Bakari", customerType: "retail", items: [{ productName: "Cetirizine 10mg", quantity: 1, unitPrice: 1200 }, { productName: "Vitamin C 1000mg", quantity: 1, unitPrice: 3000 }], total: 4200, status: "delivered", paymentStatus: "paid", paymentMethod: "Cash", orderDate: "2024-12-13", deliveryDate: "2024-12-13", store: "Pata Dawa Mikocheni" },
  { id: "o6", orderNumber: "ORD-2024-006", customerName: "Dar Pharma Group", customerType: "wholesale", items: [{ productName: "Insulin Glargine", quantity: 50, unitPrice: 25000 }], total: 1250000, status: "pending", paymentStatus: "unpaid", paymentMethod: "Bank Transfer", orderDate: "2024-12-14", store: "PharmaOS Central" },
];

export const customers: Customer[] = [
  { id: "c1", name: "John Mwamba", email: "john@email.com", phone: "+255 712 345 678", type: "retail", loyaltyPoints: 450, totalSpent: 125000, totalOrders: 12, insuranceProvider: "NHIF", insurancePolicyNumber: "NHIF-2024-001", joinDate: "2024-01-15", lastVisit: "2024-12-14" },
  { id: "c2", name: "Kariakoo Pharmacy Ltd", email: "orders@kariakoopharma.co.tz", phone: "+255 22 456 7890", type: "wholesale", loyaltyPoints: 2500, totalSpent: 8500000, totalOrders: 45, joinDate: "2023-06-10", lastVisit: "2024-12-10" },
  { id: "c3", name: "Mariam Salim", email: "mariam.s@email.com", phone: "+255 768 901 234", type: "retail", loyaltyPoints: 120, totalSpent: 45000, totalOrders: 5, insuranceProvider: "AAR", insurancePolicyNumber: "AAR-2024-089", joinDate: "2024-08-20", lastVisit: "2024-12-14" },
  { id: "c4", name: "HealthPlus Distributors", email: "procurement@healthplus.co.tz", phone: "+255 22 567 8901", type: "wholesale", loyaltyPoints: 5000, totalSpent: 25000000, totalOrders: 120, joinDate: "2022-01-05", lastVisit: "2024-12-12" },
  { id: "c5", name: "Said Bakari", email: "said.b@email.com", phone: "+255 754 567 890", type: "retail", loyaltyPoints: 80, totalSpent: 28000, totalOrders: 3, joinDate: "2024-10-01", lastVisit: "2024-12-13" },
];

export const staff: StaffMember[] = [
  { id: "st1", name: "Dr. Amina Juma", email: "amina@pharmaos.dz", role: "admin", store: "PharmaOS Central", avatar: "AJ", status: "online" },
  { id: "st2", name: "Dr. Hassan Mwinyi", email: "hassan@patadawa.co.tz", role: "pharmacist", store: "Pata Dawa Kariakoo", avatar: "HM", status: "online" },
  { id: "st3", name: "Fatma Ali", email: "fatma@patadawa.co.tz", role: "cashier", store: "Pata Dawa Central", avatar: "FA", status: "busy" },
  { id: "st4", name: "James Ndugu", email: "james@patadawa.co.tz", role: "warehouse", store: "Pata Dawa Central", avatar: "JN", status: "offline" },
  { id: "st5", name: "Dr. Fatma Ali", email: "drfatma@patadawa.co.tz", role: "manager", store: "Pata Dawa Mikocheni", avatar: "DA", status: "online" },
];

export const messages: Message[] = [
  { id: "m1", from: "Dr. Hassan Mwinyi", fromAvatar: "HM", subject: "Stock Alert: Metformin Running Low", preview: "We need to reorder Metformin 850mg urgently. Current stock is below the reorder level...", timestamp: "2024-12-14T10:30:00", read: false, urgent: true },
  { id: "m2", from: "Fatma Ali", fromAvatar: "FA", subject: "Cash Register Reconciliation", preview: "Today's cash register has been reconciled. Total sales: TZS 850,000...", timestamp: "2024-12-14T09:15:00", read: false, urgent: false },
  { id: "m3", from: "James Ndugu", fromAvatar: "JN", subject: "New Shipment Arrived", preview: "The shipment from MedSupply Co has arrived. 15 boxes of assorted medications...", timestamp: "2024-12-13T16:45:00", read: true, urgent: false },
  { id: "m4", from: "Dr. Fatma Ali", fromAvatar: "DA", subject: "Expired Product Alert", preview: "Ciprofloxacin batch BT2024-007 has expired. Please remove from shelves immediately...", timestamp: "2024-12-13T14:20:00", read: true, urgent: true },
  { id: "m5", from: "System", fromAvatar: "SY", subject: "Monthly Report Ready", preview: "The monthly sales and inventory report for November 2024 is now available for review...", timestamp: "2024-12-12T08:00:00", read: true, urgent: false },
];

export const prescriptions: Prescription[] = [
  { id: "rx1", patientName: "John Mwamba", doctorName: "Dr. K. Mbeki", medications: [{ name: "Amoxicillin 500mg", dosage: "500mg", quantity: 21, instructions: "Take 1 capsule 3 times daily for 7 days" }], status: "dispensed", prescriptionDate: "2024-12-01", insuranceCovered: true },
  { id: "rx2", patientName: "Mariam Salim", doctorName: "Dr. L. Nyerere", medications: [{ name: "Metformin 850mg", dosage: "850mg", quantity: 60, instructions: "Take 1 tablet twice daily with meals" }, { name: "Losartan 50mg", dosage: "50mg", quantity: 30, instructions: "Take 1 tablet once daily" }], status: "pending", prescriptionDate: "2024-12-14", insuranceCovered: true },
  { id: "rx3", patientName: "Ahmed Juma", doctorName: "Dr. S. Mkapa", medications: [{ name: "Omeprazole 20mg", dosage: "20mg", quantity: 14, instructions: "Take 1 capsule before breakfast" }], status: "partially-dispensed", prescriptionDate: "2024-12-12", insuranceCovered: false },
  { id: "rx4", patientName: "Grace Mushi", doctorName: "Dr. K. Mbeki", medications: [{ name: "Ciprofloxacin 500mg", dosage: "500mg", quantity: 14, instructions: "Take 1 tablet twice daily" }], status: "on-hold", prescriptionDate: "2024-12-13", insuranceCovered: false },
];

export const insuranceClaims: InsuranceClaim[] = [
  { id: "ic1", patientName: "John Mwamba", provider: "NHIF", policyNumber: "NHIF-2024-001", claimAmount: 10000, status: "approved", submittedDate: "2024-12-01", medicationName: "Amoxicillin 500mg" },
  { id: "ic2", patientName: "Mariam Salim", provider: "AAR", policyNumber: "AAR-2024-089", claimAmount: 14000, status: "processing", submittedDate: "2024-12-14", medicationName: "Metformin 850mg + Losartan 50mg" },
  { id: "ic3", patientName: "Peter Kimaro", provider: "NHIF", policyNumber: "NHIF-2024-055", claimAmount: 7000, status: "submitted", submittedDate: "2024-12-13", medicationName: "Omeprazole 20mg" },
  { id: "ic4", patientName: "Lisa Mwakasege", provider: "Jubilee", policyNumber: "JUB-2024-112", claimAmount: 40000, status: "denied", submittedDate: "2024-12-10", medicationName: "Insulin Glargine" },
];

export const salesData = [
  { month: "Jul", sales: 4200000, orders: 180 },
  { month: "Aug", sales: 3800000, orders: 165 },
  { month: "Sep", sales: 5100000, orders: 210 },
  { month: "Oct", sales: 4700000, orders: 195 },
  { month: "Nov", sales: 5600000, orders: 230 },
  { month: "Dec", sales: 6200000, orders: 255 },
];

export const categoryData = [
  { name: "Antibiotics", value: 28 },
  { name: "Pain Relief", value: 22 },
  { name: "Diabetes", value: 15 },
  { name: "Cardiovascular", value: 12 },
  { name: "Vitamins", value: 18 },
  { name: "Other", value: 5 },
];

export const calendarEvents = [
  { id: "e1", title: "Stock Audit", date: "2024-12-16", time: "09:00", type: "task" as const },
  { id: "e2", title: "Supplier Meeting - MedSupply", date: "2024-12-17", time: "14:00", type: "meeting" as const },
  { id: "e3", title: "Staff Training", date: "2024-12-18", time: "10:00", type: "training" as const },
  { id: "e4", title: "Monthly Inventory Count", date: "2024-12-20", time: "08:00", type: "task" as const },
  { id: "e5", title: "NHIF Claims Review", date: "2024-12-19", time: "11:00", type: "meeting" as const },
];

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-TZ", {
    style: "currency",
    currency: "TZS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};
