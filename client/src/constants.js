export const ROLE_TRANSLATIONS = {
  ADMIN: "Administrador",
  RECEPCIONIST: "Recepcionista",
  FINANCE: "Financeiro",
  COOK: "Cozinheiro",
  WAITER: "Garçom",
};

export const CATEGORY_TRANSLATIONS = {
  Vegetable: "Vegetal",
  Fruit: "Fruta",
  Meat: "Carne",
  Dairy: "Laticínios",
  Beverage: "Bebida",
  Condiment: "Condimento",
  Grain: "Grão",
  Frozen: "Congelado",
};

/**
 * Formata o ID do produto com zeros à esquerda para exibição
 * @param {string|number} id - ID do produto
 * @param {number} length - Comprimento desejado (padrão: 4)
 * @returns {string} ID formatado (ex: "0001", "0011", "0111")
 */
export const formatProductId = (id, length = 4) => {
  if (!id) return "";
  const idStr = String(id);
  return idStr.padStart(length, "0");
};
