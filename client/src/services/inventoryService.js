import { apiRequest } from "./apiClient";

/**
 * Fetches stock entries
 * @param {Object} filters - Optional filters to apply
 * @returns {Promise<Array>} - List of stock entries
 */
export async function getStockEntries(filters = {}) {
  const queryString = new URLSearchParams(filters).toString();
  const endpoint = `/api/list_stock_entries${queryString ? `?${queryString}` : ""}`;
  return await apiRequest(endpoint, { method: "GET" });
}

/**
 * Fetches stock exits
 * @param {Object} filters - Optional filters to apply
 * @returns {Promise<Array>} - List of stock exits
 */
export async function getStockExits(filters = {}) {
  const queryString = new URLSearchParams(filters).toString();
  const endpoint = `/api/list_stock_exits${queryString ? `?${queryString}` : ""}`;
  return await apiRequest(endpoint, { method: "GET" });
}

/**
 * Adds a new stock entry
 * @param {Object} entryData - The entry data to add
 * @param {string} entryData.itemId - ID of the inventory item
 * @param {number} entryData.quantity - Quantity to add
 * @param {string} [entryData.invoiceUrl] - Optional URL to invoice
 * @param {string} [entryData.category] - Optional category
 * @param {string} [entryData.expirationDate] - Optional expiration date
 * @returns {Promise<Object>} - The created stock entry
 */
export async function addStockEntry(entryData) {
  const endpoint = "/api/stock_entry";
  return await apiRequest(endpoint, {
    method: "POST",
    body: JSON.stringify(entryData),
  });
}

/**
 * Adds a new stock exit
 * @param {Object} exitData - The exit data to add
 * @param {string} exitData.itemId - ID of the inventory item
 * @param {number} exitData.quantity - Quantity to remove
 * @param {string} exitData.destination - Destination of the items
 * @param {string} exitData.exitType - Type of exit (e.g., "USAGE", "WASTE")
 * @param {string} exitData.exitDate - Date of the exit
 * @returns {Promise<Object>} - The created stock exit
 */
export async function addStockExit(exitData) {
  const endpoint = "/api/stock_exits";
  return await apiRequest(endpoint, {
    method: "POST",
    body: JSON.stringify(exitData),
  });
}

/**
 * Gets inventory items
 * @param {Object} filters - Optional filters to apply
 * @returns {Promise<Array>} - List of inventory items
 */
export async function getInventoryItems(filters = {}) {
  const queryString = new URLSearchParams(filters).toString();
  const endpoint = `/api/inventory_items${queryString ? `?${queryString}` : ""}`;
  return await apiRequest(endpoint, { method: "GET" });
}

/**
 * Adds a new inventory item
 * @param {Object} itemData - The item data to add
 * @param {string} itemData.name - Name of the item
 * @param {string} itemData.category - Category of the item
 * @param {number} itemData.quantity - Initial quantity
 * @param {string} [itemData.expirationDate] - Optional expiration date
 * @returns {Promise<Object>} - The created inventory item
 */
export async function addInventoryItem(itemData) {
  const endpoint = "/api/add_item";
  return await apiRequest(endpoint, {
    method: "POST",
    body: JSON.stringify(itemData),
  });
}

/**
 * Adds a new movement (replaces addStockEntry and addStockExit)
 * @param {Object} movementData - The movement data
 * @param {number} movementData.itemId - ID of the inventory item
 * @param {string} movementData.type - Type of movement ("IN" or "OUT")
 * @param {number} movementData.quantity - Quantity
 * @param {number} [movementData.price] - Price (for entries)
 * @param {string} [movementData.invoiceUrl] - Invoice URL (for entries)
 * @param {string} [movementData.destination] - Destination (for exits)
 * @param {string} [movementData.offDate] - Off date
 * @returns {Promise<Object>} - The created movement
 */
export async function addMovement(movementData) {
  const endpoint = "/api/movement";
  return await apiRequest(endpoint, {
    method: "POST",
    body: JSON.stringify(movementData),
  });
}

/**
 * Gets movements from the new unified table
 * @param {Object} filters - Optional filters to apply
 * @returns {Promise<Array>} - List of movements
 */
export async function getMovements(filters = {}) {
  const queryString = new URLSearchParams(filters).toString();
  const endpoint = `/api/movements${queryString ? `?${queryString}` : ""}`;
  return await apiRequest(endpoint, { method: "GET" });
}

/**
 * Enhanced getStockMovements that uses the new Movement table
 * @param {Object} filters - Optional filters to apply
 * @returns {Promise<Object>} - Object containing movements and items
 */
export async function getStockMovements(filters = {}) {
  try {
    const movementFilters = {};
    const itemFilters = {};

    if (filters.produto) itemFilters.name = filters.produto;
    if (filters.categoria) itemFilters.category = filters.categoria;
    if (filters.dataInicio) movementFilters.dataInicio = filters.dataInicio;
    if (filters.dataFim) movementFilters.dataFim = filters.dataFim;
    if (filters.status) movementFilters.type = filters.status;

    const [movements, inventoryItems] = await Promise.all([
      getMovements(movementFilters),
      getInventoryItems(itemFilters)
    ]);

    const itemMap = {};
    inventoryItems.forEach(item => {
      const quantity = item.quantity || 0;
      let status, color;
      if (quantity > 20) {
        status = "Em Estoque";
        color = "success.main";
      } else if (quantity > 0) {
        status = "Estoque Baixo";
        color = "warning.main";
      } else {
        status = "Fora de Estoque";
        color = "error.main";
      }
      itemMap[item.id] = {
        name: item.name,
        category: item.category,
        fullQuantity: quantity,
        availability: { status, color }
      };
    });

    const formattedMovements = movements.map(movement => {
      const availability = itemMap[movement.itemId]?.availability || {
        status: "Desconhecido",
        color: "text.secondary"
      };

      if (filters.disponibilidade && filters.disponibilidade !== availability.status) {
        return null;
      }

      return {
        id: movement.id,
        itemId: movement.itemId,
        itemName: itemMap[movement.itemId]?.name || "Item not found",
        price: movement.price || "-",
        quantity: movement.quantity,
        date: new Date(movement.entryDate).toLocaleDateString("pt-BR"),
        category: itemMap[movement.itemId]?.category || "-",
        expirationDate: movement.type === "IN" ?
          (movement.offDate ? new Date(movement.offDate).toLocaleDateString("pt-BR") : "Não Perecível") :
          (movement.offDate ? new Date(movement.offDate).toLocaleDateString("pt-BR") : "-"),
        destination: movement.destination || "-",
        availability,
        type: movement.type,
        movementDate: new Date(movement.entryDate).getTime(),
        rawDate: new Date(movement.entryDate),
      };
    }).filter(Boolean);

    const sortedMovements = formattedMovements.sort(
      (a, b) => new Date(b.rawDate) - new Date(a.rawDate)
    );

    return {
      movements: sortedMovements,
      items: inventoryItems
    };
  } catch (error) {
    console.error("Error fetching stock movements:", error);
    throw error;
  }
}

export async function addMovementEntry(entryData) {
  return await addMovement({
    itemId: entryData.itemId,
    type: "IN",
    quantity: entryData.quantity,
    price: entryData.price,
    invoiceUrl: entryData.invoiceUrl,
    offDate: entryData.expirationDate,
  });
}

export async function addMovementExit(exitData) {
  return await addMovement({
    itemId: exitData.itemId,
    type: "OUT",
    quantity: exitData.quantity,
    destination: exitData.destination,
    offDate: exitData.exitDate,
  });
}

const inventoryService = {
  getInventoryItems: async (filters = {}) => {
    const queryString = new URLSearchParams(filters).toString();
    const endpoint = `/api/inventory_items${queryString ? `?${queryString}` : ""}`;
    return await apiRequest(endpoint, { method: "GET" });
  },
};

export default inventoryService;
