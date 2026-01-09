import { renderHook, act } from "@testing-library/react";
import { useQuotationStore } from "../quotation-store";
import { MembershipPlan, ContractPlan, Product } from "@/types/membership";

const mockMembership: MembershipPlan = {
  id: "pro",
  name: "PRO",
  price: 960000,
  period: "COP/año",
  discount: 5,
  features: ["Feature 1", "Feature 2"],
  color: "#cc131c",
  bgGradient: "from-red-10",
  popular: true,
  detailedSpecs: {
    title: "PRO",
    description: "Test description",
    features: [],
    image: "",
    benefits: [],
  },
};

const mockContractPlan: ContractPlan = {
  id: "anual",
  name: "Plan Anual",
  duration: 12,
  discount: 10,
  description: "Contrato de 12 meses",
  isActive: true,
};

const mockProduct1: Product = {
  id: "1",
  name: "Producto Test 1",
  description: "Descripción",
  basePrice: 100000,
  category: "contable",
  features: ["Feature 1"],
  isActive: true,
  image: "",
  color: "#000",
  bgColor: "#fff",
  detailedSpecs: {
    title: "Producto 1",
    description: "",
    features: [],
    benefits: [],
    image: "",
  },
};

const mockProduct2: Product = {
  id: "2",
  name: "Producto Test 2",
  description: "Descripción",
  basePrice: 200000,
  category: "pos-restaurante",
  features: ["Feature 2"],
  isActive: true,
  image: "",
  color: "#000",
  bgColor: "#fff",
  detailedSpecs: {
    title: "Producto 2",
    description: "",
    features: [],
    benefits: [],
    image: "",
  },
};

describe("Quotation Store", () => {
  beforeEach(() => {
    // Limpiar el store
    useQuotationStore.setState({
      isOpen: false,
      activeTab: "membership",
      selectedMembership: null,
      selectedContractPlan: null,
      selectedProducts: [],
      isAuthenticated: false,
      clientData: null,
    });

    localStorage.clear();
  });

  describe("Estado Inicial", () => {
    it("debe tener valores iniciales correctos", () => {
      const { result } = renderHook(() => useQuotationStore());

      expect(result.current.isOpen).toBe(false);
      expect(result.current.activeTab).toBe("membership");
      expect(result.current.selectedMembership).toBeNull();
      expect(result.current.selectedContractPlan).toBeNull();
      expect(result.current.selectedProducts).toEqual([]);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.clientData).toBeNull();
    });
  });

  describe("openModal", () => {
    it("debe abrir el modal con membresía seleccionada", () => {
      const { result } = renderHook(() => useQuotationStore());

      act(() => {
        result.current.openModal(mockMembership);
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.activeTab).toBe("membership");
      expect(result.current.selectedMembership).toEqual(mockMembership);
      expect(result.current.selectedContractPlan).toBeNull();
      expect(result.current.selectedProducts).toEqual([]);
    });

    it("debe resetear otros estados al abrir", () => {
      const { result } = renderHook(() => useQuotationStore());

      // Setup: establecer algunos valores
      act(() => {
        result.current.setSelectedContractPlan(mockContractPlan);
        result.current.toggleProduct(mockProduct1);
      });

      // Abrir modal con nueva membresía
      act(() => {
        result.current.openModal(mockMembership);
      });

      expect(result.current.selectedContractPlan).toBeNull();
      expect(result.current.selectedProducts).toEqual([]);
    });
  });

  describe("closeModal", () => {
    it("debe cerrar el modal y resetear todo", () => {
      const { result } = renderHook(() => useQuotationStore());

      // Setup: abrir modal y configurar
      act(() => {
        result.current.openModal(mockMembership);
        result.current.setSelectedContractPlan(mockContractPlan);
        result.current.toggleProduct(mockProduct1);
      });

      // Cerrar modal
      act(() => {
        result.current.closeModal();
      });

      expect(result.current.isOpen).toBe(false);
      expect(result.current.selectedMembership).toBeNull();
      expect(result.current.selectedContractPlan).toBeNull();
      expect(result.current.selectedProducts).toEqual([]);
    });
  });

  describe("setActiveTab", () => {
    it("debe cambiar la pestaña activa", () => {
      const { result } = renderHook(() => useQuotationStore());

      act(() => {
        result.current.setActiveTab("contract");
      });

      expect(result.current.activeTab).toBe("contract");

      act(() => {
        result.current.setActiveTab("products");
      });

      expect(result.current.activeTab).toBe("products");
    });
  });

  describe("setSelectedMembership", () => {
    it("debe establecer la membresía seleccionada", () => {
      const { result } = renderHook(() => useQuotationStore());

      act(() => {
        result.current.setSelectedMembership(mockMembership);
      });

      expect(result.current.selectedMembership).toEqual(mockMembership);
    });
  });

  describe("setSelectedContractPlan", () => {
    it("debe establecer el plan de contrato", () => {
      const { result } = renderHook(() => useQuotationStore());

      act(() => {
        result.current.setSelectedContractPlan(mockContractPlan);
      });

      expect(result.current.selectedContractPlan).toEqual(mockContractPlan);
    });

    it("debe poder establecer null", () => {
      const { result } = renderHook(() => useQuotationStore());

      act(() => {
        result.current.setSelectedContractPlan(mockContractPlan);
      });

      act(() => {
        result.current.setSelectedContractPlan(null);
      });

      expect(result.current.selectedContractPlan).toBeNull();
    });
  });

  describe("toggleProduct", () => {
    it("debe agregar un producto si no está seleccionado", () => {
      const { result } = renderHook(() => useQuotationStore());

      act(() => {
        result.current.toggleProduct(mockProduct1);
      });

      expect(result.current.selectedProducts).toHaveLength(1);
      expect(result.current.selectedProducts[0]).toEqual(mockProduct1);
    });

    it("debe quitar un producto si ya está seleccionado", () => {
      const { result } = renderHook(() => useQuotationStore());

      act(() => {
        result.current.toggleProduct(mockProduct1);
      });

      expect(result.current.selectedProducts).toHaveLength(1);

      act(() => {
        result.current.toggleProduct(mockProduct1);
      });

      expect(result.current.selectedProducts).toHaveLength(0);
    });

    it("debe manejar múltiples productos", () => {
      const { result } = renderHook(() => useQuotationStore());

      act(() => {
        result.current.toggleProduct(mockProduct1);
        result.current.toggleProduct(mockProduct2);
      });

      expect(result.current.selectedProducts).toHaveLength(2);

      act(() => {
        result.current.toggleProduct(mockProduct1);
      });

      expect(result.current.selectedProducts).toHaveLength(1);
      expect(result.current.selectedProducts[0].id).toBe("2");
    });
  });

  describe("getPricing", () => {
    it("debe retornar precios en 0 sin membresía", () => {
      const { result } = renderHook(() => useQuotationStore());

      const pricing = result.current.getPricing();

      expect(pricing.subtotal).toBe(0);
      expect(pricing.membershipDiscount).toBe(0);
      expect(pricing.contractDiscount).toBe(0);
      expect(pricing.totalDiscount).toBe(0);
      expect(pricing.finalTotal).toBe(0);
    });

    it("debe calcular descuento de membresia correctamente", () => {
      const { result } = renderHook(() => useQuotationStore());

      act(() => {
        result.current.setSelectedMembership(mockMembership);
        result.current.toggleProduct(mockProduct1);
      });

      const pricing = result.current.getPricing();

      // Producto: 100000
      // Descuento membresia: 5% del PRECIO de la membresia (960000 * 0.05 = 48000)
      // Descuento contrato: 0 (no hay plan)
      // finalTotal = subtotal - contractDiscount = 100000
      expect(pricing.subtotal).toBe(100000);
      expect(pricing.membershipDiscount).toBe(48000); // 960000 * 5%
      expect(pricing.contractDiscount).toBe(0);
      expect(pricing.totalDiscount).toBe(48000);
      expect(pricing.finalTotal).toBe(100000); // subtotal sin descuento de contrato
    });

    it("debe calcular descuentos acumulables correctamente", () => {
      const { result } = renderHook(() => useQuotationStore());

      act(() => {
        result.current.setSelectedMembership(mockMembership);
        result.current.setSelectedContractPlan(mockContractPlan);
        result.current.toggleProduct(mockProduct1);
      });

      const pricing = result.current.getPricing();

      // Producto: 100000
      // Descuento membresia: 5% del precio membresia = 960000 * 0.05 = 48000
      // Descuento contrato: 10% de productos = 100000 * 0.10 = 10000
      // Total descuento: 48000 + 10000 = 58000
      // finalTotal = subtotal - contractDiscount = 100000 - 10000 = 90000
      expect(pricing.subtotal).toBe(100000);
      expect(pricing.membershipDiscount).toBe(48000);
      expect(pricing.contractDiscount).toBe(10000);
      expect(pricing.totalDiscount).toBe(58000);
      expect(pricing.finalTotal).toBe(90000);
    });

    it("debe calcular correctamente con multiples productos", () => {
      const { result } = renderHook(() => useQuotationStore());

      act(() => {
        result.current.setSelectedMembership(mockMembership);
        result.current.setSelectedContractPlan(mockContractPlan);
        result.current.toggleProduct(mockProduct1);
        result.current.toggleProduct(mockProduct2);
      });

      const pricing = result.current.getPricing();

      // Subtotal: 100000 + 200000 = 300000
      // Descuento membresia: 5% del precio membresia = 960000 * 0.05 = 48000
      // Descuento contrato: 10% de 300000 = 30000
      // Total descuento: 48000 + 30000 = 78000
      // finalTotal = subtotal - contractDiscount = 300000 - 30000 = 270000
      expect(pricing.subtotal).toBe(300000);
      expect(pricing.membershipDiscount).toBe(48000);
      expect(pricing.contractDiscount).toBe(30000);
      expect(pricing.totalDiscount).toBe(78000);
      expect(pricing.finalTotal).toBe(270000);
    });
  });

  describe("canProceedToNext", () => {
    it("debe validar correctamente la pestaña membership", () => {
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

    it("debe validar correctamente la pestaña contract", () => {
      const { result } = renderHook(() => useQuotationStore());

      act(() => {
        result.current.setActiveTab("contract");
      });

      expect(result.current.canProceedToNext()).toBe(false);

      act(() => {
        result.current.setSelectedContractPlan(mockContractPlan);
      });

      expect(result.current.canProceedToNext()).toBe(true);
    });

    it("debe validar correctamente la pestaña products", () => {
      const { result } = renderHook(() => useQuotationStore());

      act(() => {
        result.current.setActiveTab("products");
      });

      expect(result.current.canProceedToNext()).toBe(false);

      act(() => {
        result.current.toggleProduct(mockProduct1);
      });

      expect(result.current.canProceedToNext()).toBe(true);
    });

    it("debe validar completamente la pestaña quotation", () => {
      const { result } = renderHook(() => useQuotationStore());

      act(() => {
        result.current.setActiveTab("quotation");
      });

      expect(result.current.canProceedToNext()).toBe(false);

      act(() => {
        result.current.setSelectedMembership(mockMembership);
        result.current.setSelectedContractPlan(mockContractPlan);
        result.current.toggleProduct(mockProduct1);
        result.current.setAuthenticated(true);
      });

      expect(result.current.canProceedToNext()).toBe(true);
    });
  });

  describe("getTotalSelectedProducts", () => {
    it("debe contar productos seleccionados correctamente", () => {
      const { result } = renderHook(() => useQuotationStore());

      expect(result.current.getTotalSelectedProducts()).toBe(0);

      act(() => {
        result.current.toggleProduct(mockProduct1);
      });

      expect(result.current.getTotalSelectedProducts()).toBe(1);

      act(() => {
        result.current.toggleProduct(mockProduct2);
      });

      expect(result.current.getTotalSelectedProducts()).toBe(2);
    });
  });

  describe("resetQuotation", () => {
    it("debe resetear toda la cotización", () => {
      const { result } = renderHook(() => useQuotationStore());

      // Setup: configurar todo
      act(() => {
        result.current.openModal(mockMembership);
        result.current.setSelectedContractPlan(mockContractPlan);
        result.current.toggleProduct(mockProduct1);
        result.current.setAuthenticated(true);
      });

      // Reset
      act(() => {
        result.current.resetQuotation();
      });

      expect(result.current.isOpen).toBe(false);
      expect(result.current.activeTab).toBe("membership");
      expect(result.current.selectedMembership).toBeNull();
      expect(result.current.selectedContractPlan).toBeNull();
      expect(result.current.selectedProducts).toEqual([]);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.clientData).toBeNull();
    });
  });

  describe("Persistencia", () => {
    it("debe persistir solo clientData e isAuthenticated", () => {
      const { result } = renderHook(() => useQuotationStore());

      const mockClientData = {
        name: "Test Client",
        email: "test@example.com",
        phone: "123456789",
        company: "Test Company",
      };

      act(() => {
        result.current.openModal(mockMembership);
        result.current.setClientData(mockClientData);
        result.current.setAuthenticated(true);
      });

      const stored = localStorage.getItem("quotation-store");
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored!);

      // Solo debe persistir clientData e isAuthenticated
      expect(parsed.state.clientData).toEqual(mockClientData);
      expect(parsed.state.isAuthenticated).toBe(true);

      // No debe persistir el resto
      expect(parsed.state.isOpen).toBeUndefined();
      expect(parsed.state.selectedMembership).toBeUndefined();
      expect(parsed.state.selectedProducts).toBeUndefined();
    });
  });

  describe("Flujo Completo", () => {
    it("debe manejar el flujo completo de cotización", () => {
      const { result } = renderHook(() => useQuotationStore());

      // Paso 1: Abrir modal
      act(() => {
        result.current.openModal(mockMembership);
      });
      expect(result.current.isOpen).toBe(true);
      expect(result.current.canProceedToNext()).toBe(true);

      // Paso 2: Seleccionar plan
      act(() => {
        result.current.setActiveTab("contract");
        result.current.setSelectedContractPlan(mockContractPlan);
      });
      expect(result.current.canProceedToNext()).toBe(true);

      // Paso 3: Seleccionar productos
      act(() => {
        result.current.setActiveTab("products");
        result.current.toggleProduct(mockProduct1);
        result.current.toggleProduct(mockProduct2);
      });
      expect(result.current.selectedProducts).toHaveLength(2);
      expect(result.current.canProceedToNext()).toBe(true);

      // Paso 4: Verificar pricing
      const pricing = result.current.getPricing();
      expect(pricing.subtotal).toBeGreaterThan(0);
      expect(pricing.totalDiscount).toBeGreaterThan(0);
      expect(pricing.finalTotal).toBeLessThan(pricing.subtotal);

      // Paso 5: Autenticar y finalizar
      act(() => {
        result.current.setActiveTab("quotation");
        result.current.setAuthenticated(true);
      });
      expect(result.current.canProceedToNext()).toBe(true);
    });
  });
});
