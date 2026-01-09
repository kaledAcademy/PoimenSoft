import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  MembershipPlan,
  ContractPlan,
  Product,
  QuotationModalState,
  ClientData,
  ServiceItem,
} from "@/types/membership";
// Función de cálculo de pricing movida aquí para evitar problemas de resolución de módulos
function calculateQuotationPricing(
  products: Product[],
  membership: MembershipPlan | null,
  contractPlan: ContractPlan | null,
  services: ServiceItem[]
) {
  const productSubtotal = products.reduce((sum, p) => sum + (p.basePrice || 0), 0)
  const serviceSubtotal = services.reduce(
    (sum, s) => sum + (s.price || 0) * (s.quantity || 1),
    0
  )
  const membershipPrice = membership?.price || 0
  const subtotal = productSubtotal + serviceSubtotal + membershipPrice

  const membershipDiscount = 0
  const contractDiscount = 0
  const totalDiscount = membershipDiscount + contractDiscount
  const finalTotal = subtotal - totalDiscount

  const taxRate = 0.19
  const taxes = finalTotal * taxRate
  const subtotalWithTaxes = finalTotal + taxes
  const grandTotal = subtotalWithTaxes

  return {
    subtotal,
    productSubtotal,
    serviceSubtotal,
    membershipDiscount,
    contractDiscount,
    totalDiscount,
    finalTotal,
    taxes,
    subtotalWithTaxes,
    grandTotal,
  }
}
import { hybridStorageService } from "@/services/hybridStorageService";
import type { QuotationPricing } from "@/types/membership";

interface QuotationStore extends QuotationModalState {
  // Cache de pricing
  cachedPricing: QuotationPricing | null;
  pricingCacheKey: string | null;

  // Actions
  openModal: (membership: MembershipPlan) => void;
  openServicesModal: (showBanner?: boolean, categoryId?: string) => void;
  closeModal: () => void;
  setActiveTab: (tab: QuotationModalState["activeTab"]) => void;
  setSelectedMembership: (membership: MembershipPlan) => void;
  setSelectedContractPlan: (plan: ContractPlan | null) => void;
  setSelectedProducts: (products: Product[]) => void;
  toggleProduct: (product: Product) => void;
  setSelectedServices: (services: ServiceItem[]) => void;
  toggleService: (service: ServiceItem) => void;
  setAuthenticated: (isAuth: boolean) => void;
  setClientData: (client: ClientData | null) => void;
  resetQuotation: () => void;
  setPreselectedCategoryId: (categoryId: string | null) => void;

  // Hybrid Storage Actions
  saveCurrentMembershipData: () => void;
  debouncedSaveCurrentMembershipData: () => void;
  loadMembershipData: (membershipId: string) => void;
  clearMembershipData: (membershipId: string) => void;
  switchMembership: (membership: MembershipPlan) => void;
  selectNewMembership: (membership: MembershipPlan) => void;

  // Computed values
  getPricing: () => QuotationPricing;
  canProceedToNext: () => boolean;
  getTotalSelectedProducts: () => number;
  getTotalSelectedServices: () => number;
}

const initialState: QuotationModalState = {
  isOpen: false, // Siempre empezar con el modal cerrado
  activeTab: "membership",
  selectedMembership: null,
  selectedContractPlan: null,
  selectedProducts: [],
  selectedServices: [],
  isAuthenticated: false,
  clientData: null,
  showCustomServiceBanner: false,
  preselectedCategoryId: null,
};

// Estado inicial extendido con cache
const initialStoreState = {
  ...initialState,
  cachedPricing: null,
  pricingCacheKey: null,
};

export const useQuotationStore = create<QuotationStore>()(
  persist(
    (set, get) => ({
      ...initialStoreState,

      // Actions
      openModal: (membership: MembershipPlan) => {
        set({
          isOpen: true,
          activeTab: "membership", // Siempre empezar en la primera pestaña
          selectedMembership: membership,
          selectedContractPlan: null,
          selectedProducts: [],
          selectedServices: [],
          isAuthenticated: false,
          clientData: null,
          showCustomServiceBanner: false,
        });
      },

      openServicesModal: (showBanner: boolean = false, categoryId?: string) => {
        set({
          isOpen: true,
          activeTab: "services", // Abrir directamente en pestaña de servicios
          selectedMembership: null, // Sin membresía
          selectedContractPlan: null, // Sin plan de contrato
          selectedProducts: [],
          selectedServices: [],
          isAuthenticated: false,
          clientData: null,
          showCustomServiceBanner: showBanner,
          preselectedCategoryId: categoryId || null,
        });
      },

      closeModal: () => {
        set({
          ...initialState,
          showCustomServiceBanner: false,
        });
      },

      setPreselectedCategoryId: (categoryId: string | null) => {
        set({ preselectedCategoryId: categoryId });
      },

      setActiveTab: (tab: QuotationModalState["activeTab"]) => {
        set({
          activeTab: tab,
          // Mantener el banner solo si estamos en la pestaña de servicios
          showCustomServiceBanner: tab === "services" ? get().showCustomServiceBanner : false,
        });
      },

      setSelectedMembership: (membership: MembershipPlan) => {
        set({
          selectedMembership: membership,
          cachedPricing: null,
          pricingCacheKey: null,
        });
      },

      setSelectedContractPlan: (plan: ContractPlan | null) => {
        set({
          selectedContractPlan: plan,
          cachedPricing: null,
          pricingCacheKey: null,
        });
      },

      setSelectedProducts: (products: Product[]) => {
        set({
          selectedProducts: products,
          cachedPricing: null,
          pricingCacheKey: null,
        });
      },

      toggleProduct: (product: Product) => {
        const { selectedProducts } = get();
        const isSelected = selectedProducts.some((p) => p.id === product.id);

        if (isSelected) {
          set({
            selectedProducts: selectedProducts.filter((p) => p.id !== product.id),
            cachedPricing: null,
            pricingCacheKey: null,
          });
        } else {
          set({
            selectedProducts: [...selectedProducts, product],
            cachedPricing: null,
            pricingCacheKey: null,
          });
        }
      },

      setSelectedServices: (services: ServiceItem[]) => {
        set({
          selectedServices: services,
          cachedPricing: null,
          pricingCacheKey: null,
        });
      },

      toggleService: (service: ServiceItem) => {
        const { selectedServices } = get();
        const isSelected = selectedServices.some((s) => s.id === service.id);

        if (isSelected) {
          set({
            selectedServices: selectedServices.filter((s) => s.id !== service.id),
            cachedPricing: null,
            pricingCacheKey: null,
          });
        } else {
          set({
            selectedServices: [...selectedServices, service],
            cachedPricing: null,
            pricingCacheKey: null,
          });
        }
      },

      setAuthenticated: (isAuth: boolean) => {
        set({ isAuthenticated: isAuth });
      },

      setClientData: (client: ClientData | null) => {
        set({ clientData: client });
      },

      resetQuotation: () => {
        // Limpiar el estado del store
        set({
          ...initialState,
          showCustomServiceBanner: false,
        });
        // Limpiar el almacenamiento híbrido
        if (typeof window !== "undefined") {
          // Limpiar todos los datos de cotización del LocalStorage
          Object.keys(localStorage).forEach((key) => {
            if (key.startsWith("quotation_membership_")) {
              localStorage.removeItem(key);
            }
          });
        }
      },

      // Computed values
      getPricing: () => {
        const state = get();
        const {
          selectedMembership,
          selectedContractPlan,
          selectedProducts,
          selectedServices,
          cachedPricing,
          pricingCacheKey,
        } = state;

        // Generar cache key basado en el estado actual
        const currentCacheKey = JSON.stringify({
          membership: selectedMembership?.id || null,
          plan: selectedContractPlan?.id || null,
          products: selectedProducts.map((p) => p.id).sort(),
          services: selectedServices.map((s) => ({ id: s.id, qty: s.quantity || 1 })),
        });

        // Si el cache es válido, devolverlo
        if (cachedPricing && pricingCacheKey === currentCacheKey) {
          return cachedPricing;
        }

        // Calcular pricing
        let pricing: QuotationPricing;

        // Si no hay membresía, calcular solo precios de servicios
        if (!selectedMembership) {
          const serviceSubtotal = selectedServices.reduce((sum, service) => {
            const quantity = service.quantity || 1;
            return sum + service.price * quantity;
          }, 0);

          const taxRate = 0.19;
          const taxes = serviceSubtotal * taxRate;
          const grandTotal = serviceSubtotal + taxes;

          pricing = {
            subtotal: serviceSubtotal,
            subtotalProducts: 0,
            subtotalServices: serviceSubtotal,
            membershipPrice: 0,
            membershipDiscount: 0,
            contractDiscount: 0,
            totalDiscount: 0,
            finalTotal: serviceSubtotal,
            totalBaseImpuesto: serviceSubtotal,
            taxes,
            subtotalWithTaxes: grandTotal,
            grandTotal,
          };
        } else {
          const legacyPricing = calculateQuotationPricing(
            selectedProducts,
            selectedMembership,
            selectedContractPlan,
            selectedServices
          );

          // Adaptar al formato QuotationPricing del servicio
          pricing = {
            subtotal: legacyPricing.subtotal,
            subtotalProducts: legacyPricing.productSubtotal,
            subtotalServices: legacyPricing.serviceSubtotal,
            membershipPrice: selectedMembership.price,
            membershipDiscount: legacyPricing.membershipDiscount,
            contractDiscount: legacyPricing.contractDiscount,
            totalDiscount: legacyPricing.totalDiscount,
            finalTotal: legacyPricing.finalTotal,
            totalBaseImpuesto: legacyPricing.finalTotal,
            taxes: legacyPricing.taxes,
            subtotalWithTaxes: legacyPricing.subtotalWithTaxes,
            grandTotal: legacyPricing.grandTotal,
          };
        }

        // Cachear el resultado
        set({
          cachedPricing: pricing,
          pricingCacheKey: currentCacheKey,
        });

        return pricing;
      },

      canProceedToNext: () => {
        const {
          activeTab,
          selectedMembership,
          selectedContractPlan,
          selectedProducts,
          selectedServices,
          isAuthenticated,
        } = get();

        // Permitir navegación libre entre pestañas
        // Solo validar al intentar generar cotización
        switch (activeTab) {
          case "membership":
            return !!selectedMembership;
          case "contract":
            return !!selectedContractPlan;
          case "products":
            return selectedProducts.length > 0;
          case "services":
            // Con membresía: servicios son opcionales, siempre se puede continuar
            // Sin membresía: requiere al menos un servicio
            if (selectedMembership) {
              return true; // Servicios opcionales cuando hay membresía
            }
            return selectedServices.length > 0; // Sin membresía: requiere servicios
          case "quotation":
            // Si no hay membresía, solo requiere servicios y autenticación
            if (!selectedMembership) {
              return isAuthenticated && selectedServices.length > 0;
            }
            // Si hay membresía, requiere contrato, productos y autenticación
            // Servicios son opcionales
            return (
              isAuthenticated &&
              !!selectedMembership &&
              !!selectedContractPlan &&
              selectedProducts.length > 0
            );
          default:
            return false;
        }
      },

      getTotalSelectedProducts: () => {
        const { selectedProducts } = get();
        return selectedProducts.length;
      },

      // Hybrid Storage Actions
      saveCurrentMembershipData: () => {
        const state = get();
        if (state.selectedMembership) {
          hybridStorageService.saveMembershipData(state.selectedMembership.id, {
            selectedProducts: state.selectedProducts,
            selectedContractPlan: state.selectedContractPlan,
            clientData: state.clientData,
          });
        }
      },

      // Debounced save para evitar escrituras excesivas a LocalStorage
      debouncedSaveCurrentMembershipData: (() => {
        let timeoutId: NodeJS.Timeout | null = null;
        return () => {
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
          timeoutId = setTimeout(() => {
            get().saveCurrentMembershipData();
            timeoutId = null;
          }, 500); // 500ms debounce
        };
      })(),

      loadMembershipData: (membershipId: string) => {
        const savedData = hybridStorageService.getMembershipData(membershipId);
        if (savedData) {
          set({
            selectedProducts: savedData.selectedProducts,
            selectedContractPlan: savedData.selectedContractPlan,
            clientData: savedData.clientData,
          });
        }
      },

      clearMembershipData: (membershipId: string) => {
        hybridStorageService.clearMembershipData(membershipId);
      },

      switchMembership: (membership: MembershipPlan) => {
        const state = get();

        // Guardar datos de la membresía actual antes de cambiar
        if (state.selectedMembership) {
          state.saveCurrentMembershipData();
        }

        // Cambiar a la nueva membresía y resetear a la primera pestaña
        set({
          selectedMembership: membership,
          activeTab: "membership",
        });

        // Cargar datos guardados de la nueva membresía
        state.loadMembershipData(membership.id);
      },

      selectNewMembership: (membership: MembershipPlan) => {
        // Limpiar todos los datos antes de seleccionar nueva membresía
        set({
          selectedMembership: membership,
          selectedContractPlan: null,
          selectedProducts: [],
          selectedServices: [],
          activeTab: "membership",
          showCustomServiceBanner: false,
          preselectedCategoryId: null,
        });

        // Limpiar el almacenamiento híbrido
        if (typeof window !== "undefined") {
          Object.keys(localStorage).forEach((key) => {
            if (key.startsWith("quotation_membership_")) {
              localStorage.removeItem(key);
            }
          });
        }
      },

      getTotalSelectedServices: () => {
        const { selectedServices } = get();
        return selectedServices.length;
      },
    }),
    {
      name: "quotation-store",
      partialize: (state) => ({
        // Solo persistir datos del cliente, no el estado del modal
        clientData: state.clientData,
        isAuthenticated: state.isAuthenticated,
      }),
      skipHydration: true,
      // Asegurar que el modal esté cerrado al inicializar/rehidratar
      onRehydrateStorage: () => (state) => {
        if (state && state.isOpen) {
          // Solo cerrar el modal, mantener otros datos si existen
          state.isOpen = false;
        }
      },
    }
  )
);
