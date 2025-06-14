import React from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  IconButton,
  Typography,
  Box,
} from "@mui/material";
import { Add, Remove } from "@mui/icons-material";

export default function ProductCard({
  name,
  category,
  productId,
  count,
  onIncrement = () => {},
  onDecrement = () => {},
}) {
  return (
    <Card
      sx={{
        width: 280,
        borderRadius: 2,
        boxShadow: 3,
        position: "relative",
        margin: "auto",
      }}
    >
      <CardHeader
        title={name}
        titleTypographyProps={{ variant: "subtitle1", fontWeight: 600 }}
        action={
          <Box
            sx={{
              bgcolor: "grey.100",
              borderRadius: "4px",
              width: 32,
              height: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography variant="caption">{count}</Typography>
          </Box>
        }
      />
      <CardContent sx={{ pt: 0 }}>
        <Typography variant="body2" color="text.secondary">
          {category}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          ID do produto: {productId}
        </Typography>
      </CardContent>
      <CardActions sx={{ justifyContent: "space-between", px: 1, pb: 1 }}>
        <IconButton size="small" onClick={onDecrement}>
          <Remove fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={onIncrement}>
          <Add fontSize="small" />
        </IconButton>
      </CardActions>
    </Card>
  );
}
