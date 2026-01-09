/**
 * Detección de Tenant (Multi-Tenant)
 *
 * Detecta si el request viene de un subdominio que representa un tenant.
 */

import { NextRequest } from "next/server";
import { RESERVED_SUBDOMAINS, MAIN_DOMAINS } from "./config";

/**
 * Detectar si el request viene de un tenant (subdominio)
 *
 * Ejemplos:
 * - brasaybarril.amaxoft.com → "brasaybarril"
 * - www.amaxoft.com → null (dominio principal)
 * - amaxoft.com → null (dominio principal)
 * - localhost:3000 → null (desarrollo)
 *
 * @param request - El NextRequest entrante
 * @returns El slug del tenant o null si no es un tenant
 */
export function detectTenantSlug(request: NextRequest): string | null {
  const hostname = request.headers.get("host") || "";

  // Remover puerto si existe
  const hostnameWithoutPort = hostname.split(":")[0];

  // Verificar si es localhost (desarrollo sin subdominios)
  if (hostnameWithoutPort === "localhost" || hostnameWithoutPort === "127.0.0.1") {
    return null;
  }

  // Verificar si es un dominio de Vercel preview
  if (hostnameWithoutPort.endsWith(".vercel.app")) {
    // En Vercel previews, no hay subdominios
    return null;
  }

  // Extraer partes del dominio
  const parts = hostnameWithoutPort.split(".");

  // Si solo hay 2 partes (ej: amaxoft.com), no hay subdominio
  if (parts.length <= 2) {
    return null;
  }

  // El primer elemento sería el subdominio
  const subdomain = parts[0].toLowerCase();

  // Verificar si es un subdominio reservado
  if (RESERVED_SUBDOMAINS.includes(subdomain)) {
    return null;
  }

  // Verificar si el resto del dominio es uno de los principales
  const baseDomain = parts.slice(1).join(".");
  const isMainDomain = MAIN_DOMAINS.some(
    (main) => baseDomain === main || baseDomain.endsWith(`.${main}`)
  );

  if (!isMainDomain) {
    return null;
  }

  return subdomain;
}
