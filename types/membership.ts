// Tipos para el sistema de membresías y cotizaciones

export interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  discount: number; // Porcentaje de descuento en productos
  features: string[];
  color: string;
  bgGradient: string;
  popular?: boolean;
  detailedSpecs: {
    title: string;
    description: string;
    features: string[];
    image: string;
    benefits: string[];
  };
}

export interface ContractPlan {
  id: string;
  name: string;
  duration: number; // Duración en meses
  discount: number; // Porcentaje de descuento
  description: string;
  isActive: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  category:
    | "contable"
    | "pos-restaurante"
    | "gestion-adm"
    | "pos-almacen"
    | "pos-hostal"
    | "pos-comandero"
    | string;
  features: string[];
  isActive: boolean;
  image: string;
  color: string;
  bgColor: string;
  detailedSpecs: {
    title: string;
    description: string;
    features: string[];
    benefits: string[];
    image: string;
  };
  // Galería de imágenes del modal
  modalImageGallery?: string[];
  // Campos para PDF dinámico
  pdfEnabled?: boolean;
  pdfType?: string;
  pdfCanvaPages?: string;
  pdfSections?: string;
}

export interface QuotationItem {
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface QuotationPricing {
  subtotal: number;
  subtotalProducts?: number;
  subtotalServices?: number;
  membershipPrice?: number;
  membershipDiscount: number;
  contractDiscount: number;
  totalDiscount: number;
  finalTotal: number;
  totalBaseImpuesto?: number;
  taxes: number;
  subtotalWithTaxes: number;
  grandTotal: number;
}

export interface Quotation {
  id: string;
  userId: string;
  membershipId: string;
  contractPlanId: string;
  products: QuotationItem[];
  pricing: QuotationPricing;
  status: "pending" | "sent" | "viewed" | "contacted" | "accepted" | "rejected";
  validity: Date; // Fecha de vencimiento (30 días)
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientData {
  name: string;
  email: string;
  phone: string;
  company: string;
  position?: string;
}

export interface CompleteQuotation extends Quotation {
  client: ClientData;
  membership: MembershipPlan;
  contractPlan: ContractPlan;
}

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  price: number;
  pricingType: "FIXED" | "PER_HOUR" | "PER_MONTH" | "PER_MODULE";
  quantity?: number; // Para servicios con cantidades (horas, etc)
  minQuantity?: number;
  maxQuantity?: number;
}

export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  image: string;
  color: string;
  icon: string; // Icon name from lucide-react
  items: ServiceItem[];
}

// Estados del modal de cotización
export interface QuotationModalState {
  isOpen: boolean;
  activeTab: "membership" | "contract" | "products" | "services" | "quotation";
  selectedMembership: MembershipPlan | null;
  selectedContractPlan: ContractPlan | null;
  selectedProducts: Product[];
  selectedServices: ServiceItem[];
  isAuthenticated: boolean;
  clientData: ClientData | null;
  showCustomServiceBanner: boolean;
  preselectedCategoryId: string | null;
}

// Props para componentes
export interface QuotationModalProps {
  selectedMembership: MembershipPlan;
  isOpen: boolean;
  onClose: () => void;
}

export interface ProductCatalogProps {
  selectedProducts: Product[];
  onToggleProduct: (product: Product) => void;
  membership: MembershipPlan;
  contractPlan: ContractPlan | null;
}

export interface ContractPlanSelectorProps {
  selectedPlan: ContractPlan | null;
  onSelectPlan: (plan: ContractPlan) => void;
}

export interface QuotationSummaryProps {
  quotation: CompleteQuotation;
  onGeneratePDF: () => void;
  onSendEmail: () => void;
}
