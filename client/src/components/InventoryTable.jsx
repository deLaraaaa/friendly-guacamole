import React, { useState, useEffect, useMemo } from "react";
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
import { useWindowSize } from "../hooks/useWindowSize";
import { CATEGORY_TRANSLATIONS } from "../constants";

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
    const aPrice = parseFloat(
      (a.price || "0")
        .toString()
        .replace(/[^\\d,.-]/g, "")
        .replace(",", ".")
    );
    const bPrice = parseFloat(
      (b.price || "0")
        .toString()
        .replace(/[^\\d,.-]/g, "")
        .replace(",", ".")
    );
    return bPrice - aPrice;
  }
  if (typeof b[orderBy] === "number" && typeof a[orderBy] === "number") {
    return b[orderBy] - a[orderBy];
  }
  return (b[orderBy] || "")
    .toString()
    .localeCompare((a[orderBy] || "").toString(), "pt-BR", { numeric: true });
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

const DEFAULT_ORDER_BY = "date";
const DEFAULT_ORDER = "desc";

function InventoryTable({ movements = [], loading }) {
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState(DEFAULT_ORDER);
  const [orderBy, setOrderBy] = useState(DEFAULT_ORDER_BY);

  const { height } = useWindowSize();
  const rowsPerPage = useMemo(() => {
    if (height === 968) return 10;
    const baseRows = Math.floor((height / 968) * 10);
    return Math.max(baseRows, 5);
  }, [height]);

  useEffect(() => {
    setPage(0);
  }, [movements]);

  const handleRequestSort = (property) => {
    if (orderBy !== property) {
      setOrder("desc");
      setOrderBy(property);
    } else if (order === "desc") {
      setOrder("asc");
    } else if (order === "asc") {
      setOrder(DEFAULT_ORDER);
      setOrderBy(DEFAULT_ORDER_BY);
    }
  };

  const sortedMovements = useMemo(() => {
    const filteredData = movements.filter(
      (item) => item.itemName !== "Item not found"
    );

    if (orderBy === "date") {
      return [...filteredData].sort(
        (a, b) => new Date(b.rawDate) - new Date(a.rawDate)
      );
    }
    return [...filteredData].sort(getComparator(order, orderBy));
  }, [movements, order, orderBy]);

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

  return (
    <TableContainer sx={{ borderRadius: 0 }} component={Paper} elevation={0}>
      <Table aria-label="movimentos de estoque">
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell
                key={col.id}
                sx={{
                  color: "#667085",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
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
                <TableCell>
                  {CATEGORY_TRANSLATIONS[item.category] || item.category || "-"}
                </TableCell>
                <TableCell>
                  {item.type === "IN"
                    ? item.expirationDate || "Não Perecível"
                    : item.expirationDate || item.date || "-"}
                </TableCell>
                <TableCell
                  sx={{
                    color: item.type === "IN" ? "green" : "red",
                    fontWeight: "bold",
                  }}
                >
                  {item.type === "IN" ? "ENTRADA" : "SAÍDA"}
                </TableCell>
                <TableCell
                  sx={{
                    color: item.availability.color,
                    fontWeight: "bold",
                  }}
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
