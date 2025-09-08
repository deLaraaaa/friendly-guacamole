import { apiRequest } from "./apiClient";

/**
 * Fetches stock entries
 * @param {Object} filters - Optional filters to apply
 * @returns {Promise<Array>} - List of stock entries
 */
export async function getStockEntries(filters = {}) {
  const queryString = new URLSearchParams(filters).toString();
  const endpoint = `/list_stock_entries${queryString ? `?${queryString}` : ""}`;
  return await apiRequest(endpoint, { method: "GET" });
}

/**
 * Fetches stock exits
 * @param {Object} filters - Optional filters to apply
 * @returns {Promise<Array>} - List of stock exits
 */
export async function getStockExits(filters = {}) {
  const queryString = new URLSearchParams(filters).toString();
  const endpoint = `/list_stock_exits${queryString ? `?${queryString}` : ""}`;
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
  const endpoint = "/stock_entry";
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
  const endpoint = "/stock_exits";
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
  const endpoint = `/inventory_items${queryString ? `?${queryString}` : ""}`;
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
  const endpoint = "/add_item";
  return await apiRequest(endpoint, {
    method: "POST",
    body: JSON.stringify(itemData),
  });
}

/**
 * Combines and formats stock entries and exits for display
 * @returns {Promise<Array>} - Combined list of stock movements
 */
export async function getStockMovements(filters = {}) {
  try {
    const entryFilters = {};
    const exitFilters = {};
    const itemFilters = {};

    if (filters.produto) itemFilters.name = filters.produto;
    if (filters.categoria) itemFilters.category = filters.categoria;
    if (filters.dataInicio) {
      entryFilters.dataInicio = filters.dataInicio;
      exitFilters.dataInicio = filters.dataInicio;
    }
    if (filters.dataFim) {
      entryFilters.dataFim = filters.dataFim;
      exitFilters.dataFim = filters.dataFim;
    }

    let fetchEntries = true, fetchExits = true;
    if (filters.status === "Entrada") fetchExits = false;
    if (filters.status === "Saída") fetchEntries = false;

    const [entries, exits, inventoryItems] = await Promise.all([
      fetchEntries ? getStockEntries(entryFilters) : Promise.resolve([]),
      fetchExits ? getStockExits(exitFilters) : Promise.resolve([]),
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

    const formattedEntries = entries.map(entry => {
      const availability = itemMap[entry.itemId]?.availability || { status: "Desconhecido", color: "text.secondary" };
      if (filters.disponibilidade && filters.disponibilidade !== availability.status) return null;
      return {
        id: entry.id,
        itemId: entry.itemId,
        itemName: itemMap[entry.itemId]?.name || "Item not found",
        price: entry.price || "-",
        quantity: entry.quantity,
        date: new Date(entry.entryDate || Date.now()).toLocaleDateString("pt-BR"),
        category: itemMap[entry.itemId]?.category || entry.category || "-",
        expirationDate: entry.expirationDate && new Date(entry.expirationDate).toLocaleDateString("pt-BR"),
        availability,
        type: "Entrada",
        movementDate: entry.createdAt || Date.now(),
        rawDate: entry.entryDate ? new Date(entry.entryDate) : new Date(),
      };
    }).filter(Boolean);

    const formattedExits = exits
      .map((exit) => {
        const availability =
          itemMap[exit.itemId]?.availability || { status: "Desconhecido", color: "text.secondary" };
        if (
          filters.disponibilidade &&
          filters.disponibilidade !== availability.status
        ) {
          return null;
        }
        return {
          id: exit.id,
          itemId: exit.itemId,
          itemName: itemMap[exit.itemId]?.name || "Item not found",
          quantity: exit.quantity,
          date: new Date(exit.entryDate || Date.now()).toLocaleDateString(
            "pt-BR"
          ),
          category: itemMap[exit.itemId]?.category || "-",
          destination: exit.destination || "-",
          exitType: exit.exitType || "-",
          availability,
          type: "Saída",
          movementDate: exit.exitDate ?
            new Date(exit.exitDate).getTime() :
            Date.now(),
          rawDate: exit.entryDate ? new Date(exit.entryDate) : new Date(),
        };
      })
      .filter(Boolean);

    const movements = [...formattedEntries, ...formattedExits].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    return {
      movements,
      items: inventoryItems
    };
  } catch (error) {
    console.error("Error fetching stock movements:", error);
    throw error;
  }
}

const inventoryService = {
  getInventoryItems: async (filters = {}) => {
    const queryString = new URLSearchParams(filters).toString();
    const endpoint = `/inventory_items${queryString ? `?${queryString}` : ""}`;
    return await apiRequest(endpoint, { method: "GET" });
  },
};

export default inventoryService;
