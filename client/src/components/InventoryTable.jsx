import React, { useState, useEffect, useContext } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import {
  Box,
  CircularProgress,
  Alert,
  TablePagination,
  TableSortLabel,
} from "@mui/material";
import { getStockMovements } from "../services/inventoryService";
import { UserContext } from "../contexts/UserContext";

const columns = [
  { id: "itemName", label: "Produto" },
  { id: "price", label: "Preço de Compra" },
  { id: "quantity", label: "Quantidade" },
  { id: "category", label: "Categoria" },
  { id: "expirationDate", label: "Data de Validade/Saída" },
  { id: "type", label: "Status" },
  { id: "availability", label: "Disponibilidade" },
];

function descendingComparator(a, b, orderBy) {
  if (orderBy === "availability") {
    return a.availability.status.localeCompare(b.availability.status);
  }
  if (orderBy === "price") {
    // Remove "R$ " and parse as float, fallback to 0 if not a number
    const aPrice = parseFloat(
      (a.price || "0")
        .toString()
        .replace(/[^\d,.-]/g, "")
        .replace(",", ".")
    );
    const bPrice = parseFloat(
      (b.price || "0")
        .toString()
        .replace(/[^\d,.-]/g, "")
        .replace(",", ".")
    );
    return bPrice - aPrice;
  }
  if (typeof b[orderBy] === "number" && typeof a[orderBy] === "number") {
    return b[orderBy] - a[orderBy];
  }
  // For strings and fallback
  return (b[orderBy] || "")
    .toString()
    .localeCompare((a[orderBy] || "").toString(), "pt-BR", { numeric: true });
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function InventoryTable({ filters = {} }) {
  const { user } = useContext(UserContext);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;
  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("expirationDate");

  useEffect(() => {
    const fetchMovements = async () => {
      setLoading(true);
      try {
        const data = await getStockMovements(filters);
        const filteredData = data.filter(
          (item) => item.itemName !== "Item not found"
        );
        setMovements(filteredData);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch stock movements:", err);
        setError("Falha ao carregar os movimentos de estoque");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchMovements();
    }
  }, [user, filters]);

  useEffect(() => {
    setPage(0);
  }, [filters]);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const sortedMovements = React.useMemo(
    () => [...movements].sort(getComparator(order, orderBy)),
    [movements, order, orderBy]
  );

  const paginatedMovements = sortedMovements.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return (
      <Box textAlign="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <TableContainer sx={{ borderRadius: 0 }} component={Paper} elevation={0}>
      <Table aria-label="movimentos de estoque">
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell
                key={col.id}
                sx={{ color: "#667085", fontWeight: "bold", cursor: "pointer" }}
                sortDirection={orderBy === col.id ? order : false}
              >
                <TableSortLabel
                  active={orderBy === col.id}
                  direction={orderBy === col.id ? order : "asc"}
                  onClick={() => handleRequestSort(col.id)}
                >
                  {col.label}
                </TableSortLabel>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedMovements.length > 0 ? (
            paginatedMovements.map((item) => (
              <TableRow key={`${item.type}-${item.id}`}>
                <TableCell component="th" scope="row">
                  {item.itemName}
                </TableCell>
                <TableCell>{item.price ? "R$ " + item.price : "-"}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{item.category || "-"}</TableCell>
                <TableCell>{item.expirationDate || item.date || "-"}</TableCell>
                <TableCell
                  sx={{
                    color: item.type === "Entrada" ? "green" : "red",
                    fontWeight: "bold",
                  }}
                >
                  {item.type}
                </TableCell>
                <TableCell
                  sx={{ color: item.availability.color, fontWeight: "bold" }}
                >
                  {item.availability.status}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} align="center">
                Nenhum movimento de estoque encontrado
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <TablePagination
        sx={{ color: "#667085" }}
        component="div"
        count={movements.length}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[]}
      />
    </TableContainer>
  );
}

export default InventoryTable;
