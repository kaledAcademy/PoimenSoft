import { renderHook, act } from "@testing-library/react";
import { useCartStore } from "../cart-store";
import { Product } from "@/types";

const mockProduct1: Product = {
  id: "1",
  name: "Producto 1",
  description: "Descripción del producto 1",
  price: 100000,
  stock: 100,
  sku: "PROD001",
  images: ["/product1.jpg"],
  isActive: true,
  categoryId: "cat1",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockProduct2: Product = {
  id: "2",
  name: "Producto 2",
  description: "Descripción del producto 2",
  price: 200000,
  stock: 50,
  sku: "PROD002",
  images: ["/product2.jpg"],
  isActive: true,
  categoryId: "cat2",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("Cart Store", () => {
  beforeEach(() => {
    // Limpiar el store antes de cada test
    useCartStore.setState({
      items: [],
      total: 0,
      itemCount: 0,
    });

    // Limpiar localStorage
    localStorage.clear();
  });

  describe("Estado Inicial", () => {
    it("debe tener valores iniciales correctos", () => {
      const { result } = renderHook(() => useCartStore());

      expect(result.current.items).toEqual([]);
      expect(result.current.total).toBe(0);
      expect(result.current.itemCount).toBe(0);
    });
  });

  describe("addItem", () => {
    it("debe agregar un producto nuevo al carrito", () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem(mockProduct1, 1);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].product).toEqual(mockProduct1);
      expect(result.current.items[0].quantity).toBe(1);
      expect(result.current.total).toBe(100000);
      expect(result.current.itemCount).toBe(1);
    });

    it("debe agregar múltiples unidades de un producto", () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem(mockProduct1, 3);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].quantity).toBe(3);
      expect(result.current.total).toBe(300000);
      expect(result.current.itemCount).toBe(3);
    });

    it("debe incrementar cantidad si el producto ya existe", () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem(mockProduct1, 1);
      });

      act(() => {
        result.current.addItem(mockProduct1, 2);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].quantity).toBe(3);
      expect(result.current.total).toBe(300000);
      expect(result.current.itemCount).toBe(3);
    });

    it("debe manejar múltiples productos diferentes", () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem(mockProduct1, 1);
        result.current.addItem(mockProduct2, 2);
      });

      expect(result.current.items).toHaveLength(2);
      expect(result.current.total).toBe(500000); // 100000 + (200000 * 2)
      expect(result.current.itemCount).toBe(3);
    });

    it("debe usar cantidad por defecto de 1 si no se especifica", () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem(mockProduct1);
      });

      expect(result.current.items[0].quantity).toBe(1);
    });
  });

  describe("removeItem", () => {
    it("debe eliminar un producto del carrito", () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem(mockProduct1, 2);
        result.current.addItem(mockProduct2, 1);
      });

      act(() => {
        result.current.removeItem("1");
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].product.id).toBe("2");
      expect(result.current.total).toBe(200000);
      expect(result.current.itemCount).toBe(1);
    });

    it("debe recalcular totales después de eliminar", () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem(mockProduct1, 3);
      });

      expect(result.current.total).toBe(300000);

      act(() => {
        result.current.removeItem("1");
      });

      expect(result.current.total).toBe(0);
      expect(result.current.itemCount).toBe(0);
    });

    it("no debe hacer nada si el producto no existe", () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem(mockProduct1, 1);
      });

      const initialLength = result.current.items.length;

      act(() => {
        result.current.removeItem("999");
      });

      expect(result.current.items).toHaveLength(initialLength);
    });
  });

  describe("updateQuantity", () => {
    it("debe actualizar la cantidad de un producto", () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem(mockProduct1, 1);
      });

      act(() => {
        result.current.updateQuantity("1", 5);
      });

      expect(result.current.items[0].quantity).toBe(5);
      expect(result.current.total).toBe(500000);
      expect(result.current.itemCount).toBe(5);
    });

    it("debe eliminar el producto si la cantidad es 0", () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem(mockProduct1, 2);
      });

      act(() => {
        result.current.updateQuantity("1", 0);
      });

      expect(result.current.items).toHaveLength(0);
      expect(result.current.total).toBe(0);
      expect(result.current.itemCount).toBe(0);
    });

    it("debe eliminar el producto si la cantidad es negativa", () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem(mockProduct1, 2);
      });

      act(() => {
        result.current.updateQuantity("1", -1);
      });

      expect(result.current.items).toHaveLength(0);
    });

    it("debe recalcular totales correctamente", () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem(mockProduct1, 2);
        result.current.addItem(mockProduct2, 1);
      });

      expect(result.current.total).toBe(400000); // 200000 + 200000

      act(() => {
        result.current.updateQuantity("1", 5);
      });

      expect(result.current.total).toBe(700000); // 500000 + 200000
      expect(result.current.itemCount).toBe(6); // 5 + 1
    });
  });

  describe("clearCart", () => {
    it("debe vaciar el carrito completamente", () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem(mockProduct1, 2);
        result.current.addItem(mockProduct2, 3);
      });

      expect(result.current.items).toHaveLength(2);

      act(() => {
        result.current.clearCart();
      });

      expect(result.current.items).toEqual([]);
      expect(result.current.total).toBe(0);
      expect(result.current.itemCount).toBe(0);
    });

    it("debe funcionar correctamente si el carrito ya está vacío", () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.clearCart();
      });

      expect(result.current.items).toEqual([]);
      expect(result.current.total).toBe(0);
      expect(result.current.itemCount).toBe(0);
    });
  });

  describe("getItemQuantity", () => {
    it("debe retornar la cantidad correcta de un producto", () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem(mockProduct1, 3);
      });

      const quantity = result.current.getItemQuantity("1");
      expect(quantity).toBe(3);
    });

    it("debe retornar 0 si el producto no está en el carrito", () => {
      const { result } = renderHook(() => useCartStore());

      const quantity = result.current.getItemQuantity("999");
      expect(quantity).toBe(0);
    });

    it("debe retornar cantidad actualizada después de modificar", () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem(mockProduct1, 2);
      });

      expect(result.current.getItemQuantity("1")).toBe(2);

      act(() => {
        result.current.updateQuantity("1", 5);
      });

      expect(result.current.getItemQuantity("1")).toBe(5);
    });
  });

  describe("calculateTotal", () => {
    it("debe calcular el total correctamente con un producto", () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem(mockProduct1, 2);
      });

      expect(result.current.total).toBe(200000);
      expect(result.current.itemCount).toBe(2);
    });

    it("debe calcular el total correctamente con múltiples productos", () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem(mockProduct1, 2); // 200000
        result.current.addItem(mockProduct2, 3); // 600000
      });

      expect(result.current.total).toBe(800000);
      expect(result.current.itemCount).toBe(5);
    });

    it("debe recalcular automáticamente al agregar productos", () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem(mockProduct1, 1);
      });
      expect(result.current.total).toBe(100000);

      act(() => {
        result.current.addItem(mockProduct1, 1);
      });
      expect(result.current.total).toBe(200000);
    });

    it("debe recalcular automáticamente al eliminar productos", () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem(mockProduct1, 1);
        result.current.addItem(mockProduct2, 1);
      });
      expect(result.current.total).toBe(300000);

      act(() => {
        result.current.removeItem("1");
      });
      expect(result.current.total).toBe(200000);
    });
  });

  describe("Persistencia", () => {
    it("debe persistir items en localStorage", () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem(mockProduct1, 2);
      });

      const stored = localStorage.getItem("cart-storage");
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored!);
      expect(parsed.state.items).toHaveLength(1);
      expect(parsed.state.total).toBe(200000);
      expect(parsed.state.itemCount).toBe(2);
    });

    it("debe restaurar el carrito desde localStorage", () => {
      // Simular datos existentes en localStorage
      const mockData = {
        state: {
          items: [
            {
              product: mockProduct1,
              quantity: 3,
            },
          ],
          total: 300000,
          itemCount: 3,
        },
        version: 0,
      };

      localStorage.setItem("cart-storage", JSON.stringify(mockData));

      // Crear una nueva instancia del hook
      const { result } = renderHook(() => useCartStore());

      // Forzar rehidratación
      act(() => {
        useCartStore.persist.rehydrate();
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.total).toBe(300000);
      expect(result.current.itemCount).toBe(3);
    });
  });

  describe("Casos Edge", () => {
    it("debe manejar productos con precio 0", () => {
      const freeProduct: Product = {
        ...mockProduct1,
        price: 0,
      };

      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem(freeProduct, 5);
      });

      expect(result.current.total).toBe(0);
      expect(result.current.itemCount).toBe(5);
    });

    it("debe manejar grandes cantidades", () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem(mockProduct1, 1000);
      });

      expect(result.current.total).toBe(100000000); // 100000 * 1000
      expect(result.current.itemCount).toBe(1000);
    });

    it("debe manejar múltiples operaciones consecutivas", () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem(mockProduct1, 1);
        result.current.addItem(mockProduct2, 2);
        result.current.updateQuantity("1", 5);
        result.current.removeItem("2");
        result.current.addItem(mockProduct2, 1);
      });

      expect(result.current.items).toHaveLength(2);
      expect(result.current.total).toBe(700000); // (100000 * 5) + (200000 * 1)
    });
  });
});
