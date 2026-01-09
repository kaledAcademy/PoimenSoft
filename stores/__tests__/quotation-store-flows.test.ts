/**
 * Tests unitarios para quotation-store.ts
 * Valida flujos de cotizacion con y sin membresia
 */

import { act, renderHook } from "@testing-library/react";

// Mock de hybridStorageService
jest.mock("@/services/hybridStorageService", () => ({
  hybridStorageService: {
    saveMembershipData: jest.fn(),
    getMembershipData: jest.fn(),
    clearMembershipData: jest.fn(),
  },
}));

// Mock de calculateQuotationPricing
jest.mock("@/constants/membership", () => ({
  calculateQuotationPricing: jest.fn(() => ({
    subtotal: 350000,
    productSubtotal: 250000,
    serviceSubtotal: 100000,
    membershipDiscount: 48000,
    contractDiscount: 17500,
    totalDiscount: 65500,
    finalTotal: 332500,
    taxes: 283575,
    subtotalWithTaxes: 1244575,
    grandTotal: 1244575,
  })),
}));

import { useQuotationStore } from "../quotation-store";
import { MembershipPlan, ContractPlan, Product, ServiceItem } from "@/types/membership";

// Datos mock
const mockMembership: MembershipPlan = {
  id: "pro",
  name: "PRO",
  price: 960000,
  period: "COP/ano",
  discount: 5,
  features: ["Feature 1"],
  color: "#cc131c",
  bgGradient: "from-red-500",
  detailedSpecs: {
    title: "Test",
    description: "Test",
    features: [],
    image: "",
    benefits: [],
  },
};

const mockContractPlan: ContractPlan = {
  id: "plan-12",
  name: "Plan 12 Meses",
  duration: 12,
  discount: 5,
  description: "Test",
  isActive: true,
};

const mockProduct: Product = {
  id: "producto-1",
  name: "Producto Test",
  description: "Test",
  basePrice: 150000,
  category: "contable",
  features: [],
  isActive: true,
  image: "",
  color: "blue",
  bgColor: "white",
  detailedSpecs: {
    title: "Test",
    description: "Test",
    features: [],
    benefits: [],
    image: "",
  },
};

const mockService: ServiceItem = {
  id: "servicio-1",
  name: "Servicio Test",
  description: "Test",
  price: 100000,
  pricingType: "FIXED",
  quantity: 1,
};

describe("quotation-store flujos", () => {
  beforeEach(() => {
    // Reset store antes de cada test
    const { result } = renderHook(() => useQuotationStore());
    act(() => {
      result.current.resetQuotation();
    });
    jest.clearAllMocks();
  });

  describe("Estado inicial", () => {
    it("debe tener modal cerrado inicialmente", () => {
      const { result } = renderHook(() => useQuotationStore());
      expect(result.current.isOpen).toBe(false);
    });

    it("debe tener tab en membership inicialmente", () => {
      const { result } = renderHook(() => useQuotationStore());
      expect(result.current.activeTab).toBe("membership");
    });

    it("debe tener arrays vacios inicialmente", () => {
      const { result } = renderHook(() => useQuotationStore());
      expect(result.current.selectedProducts).toEqual([]);
      expect(result.current.selectedServices).toEqual([]);
    });
  });

  describe("openModal (flujo con membresia)", () => {
    it("debe abrir modal con membresia seleccionada", () => {
      const { result } = renderHook(() => useQuotationStore());

      act(() => {
        result.current.openModal(mockMembership);
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.selectedMembership).toEqual(mockMembership);
      expect(result.current.activeTab).toBe("membership");
    });

    it("debe resetear selecciones previas al abrir", () => {
      const { result } = renderHook(() => useQuotationStore());

      // Configurar estado previo
      act(() => {
        result.current.setSelectedProducts([mockProduct]);
        result.current.setSelectedServices([mockService]);
      });

      // Abrir modal
      act(() => {
        result.current.openModal(mockMembership);
      });

      expect(result.current.selectedProducts).toEqual([]);
      expect(result.current.selectedServices).toEqual([]);
    });
  });

  describe("openServicesModal (flujo sin membresia)", () => {
    it("debe abrir modal en tab services sin membresia", () => {
      const { result } = renderHook(() => useQuotationStore());

      act(() => {
        result.current.openServicesModal();
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.selectedMembership).toBeNull();
      expect(result.current.activeTab).toBe("services");
    });

    it("debe establecer banner de servicios personalizados", () => {
      const { result } = renderHook(() => useQuotationStore());

      act(() => {
        result.current.openServicesModal(true);
      });

      expect(result.current.showCustomServiceBanner).toBe(true);
    });

    it("debe establecer categoria preseleccionada", () => {
      const { result } = renderHook(() => useQuotationStore());

      act(() => {
        result.current.openServicesModal(false, "categoria-1");
      });

      expect(result.current.preselectedCategoryId).toBe("categoria-1");
    });
  });

  describe("closeModal", () => {
    it("debe cerrar modal y resetear estado", () => {
      const { result } = renderHook(() => useQuotationStore());

      act(() => {
        result.current.openModal(mockMembership);
        result.current.setSelectedProducts([mockProduct]);
      });

      act(() => {
        result.current.closeModal();
      });

      expect(result.current.isOpen).toBe(false);
      expect(result.current.selectedMembership).toBeNull();
      expect(result.current.selectedProducts).toEqual([]);
    });
  });

  describe("toggleProduct", () => {
    it("debe agregar producto si no esta seleccionado", () => {
      const { result } = renderHook(() => useQuotationStore());

      act(() => {
        result.current.toggleProduct(mockProduct);
      });

      expect(result.current.selectedProducts).toContainEqual(mockProduct);
    });

    it("debe remover producto si ya esta seleccionado", () => {
      const { result } = renderHook(() => useQuotationStore());

      act(() => {
        result.current.toggleProduct(mockProduct);
      });

      act(() => {
        result.current.toggleProduct(mockProduct);
      });

      expect(result.current.selectedProducts).not.toContainEqual(mockProduct);
    });

    it("debe invalidar cache de pricing al cambiar productos", () => {
      const { result } = renderHook(() => useQuotationStore());

      // Calcular pricing primero
      act(() => {
        result.current.openModal(mockMembership);
        result.current.setSelectedContractPlan(mockContractPlan);
        result.current.toggleProduct(mockProduct);
      });

      const pricing1 = result.current.getPricing();

      // Cambiar productos
      act(() => {
        result.current.toggleProduct(mockProduct);
      });

      // El cache debe invalidarse
      expect(result.current.cachedPricing).toBeNull();
    });
  });

  describe("toggleService", () => {
    it("debe agregar servicio si no esta seleccionado", () => {
      const { result } = renderHook(() => useQuotationStore());

      act(() => {
        result.current.toggleService(mockService);
      });

      expect(result.current.selectedServices).toContainEqual(mockService);
    });

    it("debe remover servicio si ya esta seleccionado", () => {
      const { result } = renderHook(() => useQuotationStore());

      act(() => {
        result.current.toggleService(mockService);
      });

      act(() => {
        result.current.toggleService(mockService);
      });

      expect(result.current.selectedServices).not.toContainEqual(mockService);
    });
  });

  describe("canProceedToNext", () => {
    describe("Flujo con membresia", () => {
      it("membership tab: requiere membresia seleccionada", () => {
        const { result } = renderHook(() => useQuotationStore());

        act(() => {
          result.current.setActiveTab("membership");
        });

        expect(result.current.canProceedToNext()).toBe(false);

        act(() => {
          result.current.setSelectedMembership(mockMembership);
        });

        expect(result.current.canProceedToNext()).toBe(true);
      });

      it("contract tab: requiere plan seleccionado", () => {
        const { result } = renderHook(() => useQuotationStore());

        act(() => {
          result.current.setSelectedMembership(mockMembership);
          result.current.setActiveTab("contract");
        });

        expect(result.current.canProceedToNext()).toBe(false);

        act(() => {
          result.current.setSelectedContractPlan(mockContractPlan);
        });

        expect(result.current.canProceedToNext()).toBe(true);
      });

      it("products tab: requiere al menos un producto", () => {
        const { result } = renderHook(() => useQuotationStore());

        act(() => {
          result.current.setSelectedMembership(mockMembership);
          result.current.setActiveTab("products");
        });

        expect(result.current.canProceedToNext()).toBe(false);

        act(() => {
          result.current.toggleProduct(mockProduct);
        });

        expect(result.current.canProceedToNext()).toBe(true);
      });

      it("services tab: servicios son OPCIONALES con membresia", () => {
        const { result } = renderHook(() => useQuotationStore());

        act(() => {
          result.current.setSelectedMembership(mockMembership);
          result.current.setActiveTab("services");
        });

        // REGLA CRITICA: Con membresia, servicios son opcionales
        expect(result.current.canProceedToNext()).toBe(true);
      });

      it("quotation tab: requiere autenticacion, membresia, contrato y productos", () => {
        const { result } = renderHook(() => useQuotationStore());

        act(() => {
          result.current.setSelectedMembership(mockMembership);
          result.current.setSelectedContractPlan(mockContractPlan);
          result.current.toggleProduct(mockProduct);
          result.current.setActiveTab("quotation");
        });

        // Sin autenticacion
        expect(result.current.canProceedToNext()).toBe(false);

        act(() => {
          result.current.setAuthenticated(true);
        });

        expect(result.current.canProceedToNext()).toBe(true);
      });
    });

    describe("Flujo sin membresia (solo servicios)", () => {
      it("services tab: requiere al menos un servicio sin membresia", () => {
        const { result } = renderHook(() => useQuotationStore());

        act(() => {
          result.current.openServicesModal();
        });

        // Sin membresia, requiere servicios
        expect(result.current.canProceedToNext()).toBe(false);

        act(() => {
          result.current.toggleService(mockService);
        });

        expect(result.current.canProceedToNext()).toBe(true);
      });

      it("quotation tab: requiere autenticacion y servicios sin membresia", () => {
        const { result } = renderHook(() => useQuotationStore());

        act(() => {
          result.current.openServicesModal();
          result.current.toggleService(mockService);
          result.current.setActiveTab("quotation");
        });

        // Sin autenticacion
        expect(result.current.canProceedToNext()).toBe(false);

        act(() => {
          result.current.setAuthenticated(true);
        });

        expect(result.current.canProceedToNext()).toBe(true);
      });
    });
  });

  describe("getPricing", () => {
    it("debe calcular pricing para flujo con membresia", () => {
      const { result } = renderHook(() => useQuotationStore());

      act(() => {
        result.current.openModal(mockMembership);
        result.current.setSelectedContractPlan(mockContractPlan);
        result.current.toggleProduct(mockProduct);
      });

      const pricing = result.current.getPricing();

      expect(pricing.membershipPrice).toBe(mockMembership.price);
      expect(pricing.grandTotal).toBeGreaterThan(0);
    });

    it("debe calcular pricing para flujo sin membresia (solo servicios)", () => {
      const { result } = renderHook(() => useQuotationStore());

      act(() => {
        result.current.openServicesModal();
        result.current.toggleService(mockService);
      });

      const pricing = result.current.getPricing();

      expect(pricing.membershipPrice).toBe(0);
      expect(pricing.membershipDiscount).toBe(0);
      expect(pricing.subtotalServices).toBe(mockService.price);
      // IVA 19%
      expect(pricing.taxes).toBe(mockService.price * 0.19);
      expect(pricing.grandTotal).toBe(mockService.price * 1.19);
    });

    it("debe cachear el resultado de pricing", () => {
      const { result } = renderHook(() => useQuotationStore());

      act(() => {
        result.current.openModal(mockMembership);
        result.current.setSelectedContractPlan(mockContractPlan);
        result.current.toggleProduct(mockProduct);
      });

      const pricing1 = result.current.getPricing();
      const pricing2 = result.current.getPricing();

      // Deberia ser el mismo objeto cacheado
      expect(pricing1).toBe(pricing2);
    });
  });

  describe("getTotalSelectedProducts", () => {
    it("debe contar productos seleccionados", () => {
      const { result } = renderHook(() => useQuotationStore());

      expect(result.current.getTotalSelectedProducts()).toBe(0);

      act(() => {
        result.current.toggleProduct(mockProduct);
      });

      expect(result.current.getTotalSelectedProducts()).toBe(1);
    });
  });

  describe("getTotalSelectedServices", () => {
    it("debe contar servicios seleccionados", () => {
      const { result } = renderHook(() => useQuotationStore());

      expect(result.current.getTotalSelectedServices()).toBe(0);

      act(() => {
        result.current.toggleService(mockService);
      });

      expect(result.current.getTotalSelectedServices()).toBe(1);
    });
  });

  describe("resetQuotation", () => {
    it("debe resetear todo el estado", () => {
      const { result } = renderHook(() => useQuotationStore());

      // Configurar estado
      act(() => {
        result.current.openModal(mockMembership);
        result.current.setSelectedContractPlan(mockContractPlan);
        result.current.toggleProduct(mockProduct);
        result.current.toggleService(mockService);
        result.current.setAuthenticated(true);
      });

      // Resetear
      act(() => {
        result.current.resetQuotation();
      });

      expect(result.current.isOpen).toBe(false);
      expect(result.current.selectedMembership).toBeNull();
      expect(result.current.selectedContractPlan).toBeNull();
      expect(result.current.selectedProducts).toEqual([]);
      expect(result.current.selectedServices).toEqual([]);
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe("Navegacion de tabs", () => {
    it("debe cambiar de tab correctamente", () => {
      const { result } = renderHook(() => useQuotationStore());

      act(() => {
        result.current.setActiveTab("contract");
      });

      expect(result.current.activeTab).toBe("contract");

      act(() => {
        result.current.setActiveTab("services");
      });

      expect(result.current.activeTab).toBe("services");
    });

    it("debe mantener banner solo en tab services", () => {
      const { result } = renderHook(() => useQuotationStore());

      act(() => {
        result.current.openServicesModal(true);
      });

      expect(result.current.showCustomServiceBanner).toBe(true);

      act(() => {
        result.current.setActiveTab("quotation");
      });

      expect(result.current.showCustomServiceBanner).toBe(false);
    });
  });
});
