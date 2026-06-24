import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { formatAsPrice } from "~/utils/utils";
import AddProductToCart from "~/components/AddProductToCart/AddProductToCart";
import { useAvailableProducts } from "~/queries/products";

const fallbackImageUrl =
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80";

export default function Products() {
  const { data = [], isFetching, isLoading } = useAvailableProducts();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      {isFetching && (
        <Box display="flex" justifyContent="center" mb={2}>
          <CircularProgress size={24} />
        </Box>
      )}
      <Grid container spacing={4}>
        {/* eslint-disable-next-line @typescript-eslint/no-unused-vars */}
        {data.map(({ count, ...product }) => (
          <Grid item key={product.id} xs={12} sm={6} md={4}>
            <Card
              sx={{ height: "100%", display: "flex", flexDirection: "column" }}
            >
              <CardMedia
                sx={{ pt: "56.25%" }}
                image={product.imageUrl || fallbackImageUrl}
                title={product.title}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2">
                  {product.title}
                </Typography>
                <Typography>{formatAsPrice(product.price)}</Typography>
              </CardContent>
              <CardActions>
                <AddProductToCart product={product} />
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </>
  );
}
