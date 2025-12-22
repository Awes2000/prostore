import { notFound } from 'next/navigation';
import { getProductBySlug } from '@/lib/actions/product.actions';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ProductPrice from '@/components/shared/product/product-price';
import ProductImages from '@/components/shared/product/product-images';
import AddToCartButton from '@/components/cart/add-to-cart-button';
import { getCart } from '@/lib/cart';

type Props = {
  params: Promise<{ slug: string }>;
};

const ProductDetailsPage = async ({ params }: Props) => {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // Get cart to check if product is already in cart
  const cart = await getCart();
  const cartItem = cart?.items.find((item) => item.productId === product.id);

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
      {/* Column 1: Images */}
      <div className="col-span-2">
        <ProductImages images={product.images} />
      </div>

      {/* Column 2: Product Details */}
      <div className="col-span-2 space-y-4">
        <p className="text-sm text-muted-foreground">
          {product.brand} | {product.category}
        </p>

        <h1 className="h3">{product.name}</h1>

        <p className="text-sm">
          {product.rating} of {product.numReviews} reviews
        </p>

        <div className="flex items-center gap-2">
          <ProductPrice value={Number(product.price)} className="text-2xl" />
          <span className="rounded-full bg-green-100 text-green-700 px-3 py-1 text-sm font-medium">
            In Stock
          </span>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Description</h2>
          <p className="text-muted-foreground">{product.description}</p>
        </div>
      </div>

      {/* Column 3: Action Card */}
      <div>
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Price</span>
              <ProductPrice value={Number(product.price)} />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm">Status</span>
              {product.stock > 0 ? (
                <Badge variant="outline">In Stock</Badge>
              ) : (
                <Badge variant="destructive">Out of Stock</Badge>
              )}
            </div>

            <AddToCartButton
              productId={product.id}
              stock={product.stock}
              cartItemId={cartItem?.id}
              initialQuantity={cartItem?.quantity || 0}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
