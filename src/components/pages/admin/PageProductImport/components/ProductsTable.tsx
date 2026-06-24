import { Link } from "react-router-dom";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import LinearProgress from "@mui/material/LinearProgress";
import CircularProgress from "@mui/material/CircularProgress";
import React from "react";
import { formatAsPrice } from "~/utils/utils";
import {
  useAvailableProducts,
  useDeleteAvailableProduct,
  useInvalidateAvailableProducts,
} from "~/queries/products";

export default function ProductsTable() {
  const { data = [], isFetching, isLoading } = useAvailableProducts();
  const { mutate: deleteAvailableProduct, isLoading: isDeleting } =
    useDeleteAvailableProduct();
  const [deletingProductId, setDeletingProductId] = React.useState("");
  const invalidateAvailableProducts = useInvalidateAvailableProducts();

  return (
    <TableContainer component={Paper}>
      {(isLoading || isFetching || isDeleting) && <LinearProgress />}
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell align="right">Description</TableCell>
            <TableCell align="right">Price</TableCell>
            <TableCell align="right">Count</TableCell>
            <TableCell align="right">Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={5} align="center">
                Loading products...
              </TableCell>
            </TableRow>
          )}
          {data.map((product) => (
            <TableRow key={product.id}>
              <TableCell component="th" scope="row">
                {product.title}
              </TableCell>
              <TableCell align="right">{product.description}</TableCell>
              <TableCell align="right">
                {formatAsPrice(product.price)}
              </TableCell>
              <TableCell align="right">{product.count}</TableCell>
              <TableCell align="right">
                <Button
                  size="small"
                  color="primary"
                  component={Link}
                  to={`/admin/product-form/${product.id}`}
                  disabled={isDeleting}
                >
                  Manage
                </Button>
                <Button
                  size="small"
                  color="secondary"
                  disabled={isDeleting}
                  startIcon={
                    deletingProductId === product.id ? (
                      <CircularProgress color="inherit" size={14} />
                    ) : undefined
                  }
                  onClick={() => {
                    if (product.id) {
                      setDeletingProductId(product.id);
                      deleteAvailableProduct(product.id, {
                        onSuccess: invalidateAvailableProducts,
                        onSettled: () => setDeletingProductId(""),
                      });
                    }
                  }}
                >
                  {isDeleting && deletingProductId === product.id
                    ? "Deleting..."
                    : "Delete"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
