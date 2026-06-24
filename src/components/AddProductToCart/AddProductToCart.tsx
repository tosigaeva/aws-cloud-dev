import Typography from "@mui/material/Typography";
import { Product } from "~/models/Product";
import CartIcon from "@mui/icons-material/ShoppingCart";
import Add from "@mui/icons-material/Add";
import Remove from "@mui/icons-material/Remove";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import React from "react";
import { useCart, useInvalidateCart, useUpsertCart } from "~/queries/cart";

type AddProductToCartProps = {
  product: Product;
};

export default function AddProductToCart({ product }: AddProductToCartProps) {
  const { data = [], isFetching } = useCart();
  const { mutate: upsertCart } = useUpsertCart();
  const invalidateCart = useInvalidateCart();
  const [pendingAction, setPendingAction] = React.useState<
    "add" | "remove" | ""
  >("");
  const cartItem = data.find((i) => i.product.id === product.id);
  const isUpdating = Boolean(pendingAction);

  const addProduct = () => {
    setPendingAction("add");
    upsertCart(
      { product, count: cartItem ? cartItem.count + 1 : 1 },
      { onSuccess: invalidateCart, onSettled: () => setPendingAction("") }
    );
  };

  const removeProduct = () => {
    if (cartItem) {
      setPendingAction("remove");
      upsertCart(
        { ...cartItem, count: cartItem.count - 1 },
        { onSuccess: invalidateCart, onSettled: () => setPendingAction("") }
      );
    }
  };

  return cartItem ? (
    <>
      <IconButton
        disabled={isFetching || isUpdating}
        onClick={removeProduct}
        size="large"
      >
        {pendingAction === "remove" ? (
          <CircularProgress color="secondary" size={24} />
        ) : (
          <Remove color={"secondary"} />
        )}
      </IconButton>
      <Typography align="center">{cartItem.count}</Typography>
      <IconButton
        disabled={isFetching || isUpdating}
        onClick={addProduct}
        size="large"
      >
        {pendingAction === "add" ? (
          <CircularProgress color="secondary" size={24} />
        ) : (
          <Add color={"secondary"} />
        )}
      </IconButton>
    </>
  ) : (
    <IconButton
      disabled={isFetching || isUpdating}
      onClick={addProduct}
      size="large"
    >
      {pendingAction === "add" ? (
        <CircularProgress color="secondary" size={24} />
      ) : (
        <CartIcon color={"secondary"} />
      )}
    </IconButton>
  );
}
