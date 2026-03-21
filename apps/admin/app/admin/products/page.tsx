import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "../../../lib/supabase-admin";

async function deleteProduct(formData: FormData) {
  "use server";

  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("clerk_user_id", userId)
    .maybeSingle();

  if (!profile || profile.role !== "admin") {
    redirect("/");
  }

  const productId = String(formData.get("product_id") ?? "").trim();

  if (!productId) {
    throw new Error("Missing product ID.");
  }

  const { error } = await supabaseAdmin
    .from("products")
    .delete()
    .eq("id", productId);

  if (error) {
    throw new Error(error.message);
  }

  redirect("/admin/products");
}

export default async function ProductsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("clerk_user_id", userId)
    .maybeSingle();

  if (!profile || profile.role !== "admin") {
    redirect("/");
  }

  const { data: products, error } = await supabaseAdmin
    .from("products")
    .select(`
      id,
      name,
      category,
      price,
      stock,
      is_available,
      created_at,
      product_images (
        id,
        image_url
      )
    `)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-stone-500">
            Catalog
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900">
            Products
          </h1>
          <p className="mt-2 text-sm text-stone-600">
            Manage all furniture items available in the showroom.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="rounded-xl bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-700"
        >
          Add Product
        </Link>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          Failed to load products: {error.message}
        </div>
      ) : !products || products.length === 0 ? (
        <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-900">
            No products yet
          </h2>
          <p className="mt-2 text-sm text-stone-500">
            Start by adding your first showroom item.
          </p>
          <Link
            href="/admin/products/new"
            className="mt-4 inline-block rounded-xl bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-700"
          >
            Add Product
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-stone-100 text-stone-600">
              <tr className="text-left">
                <th className="px-4 py-3 font-medium">Image</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {products.map((product) => {
                const firstImage = product.product_images?.[0]?.image_url ?? null;

                return (
                  <tr
                    key={product.id}
                    className="border-t border-stone-200 text-stone-700"
                  >
                    <td className="px-4 py-4">
                      {firstImage ? (
                        <img
                          src={firstImage}
                          alt={product.name}
                          className="h-14 w-14 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-stone-100 text-xs text-stone-400">
                          No image
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-4 font-medium text-stone-900">
                      {product.name}
                    </td>
                    <td className="px-4 py-4">{product.category}</td>
                    <td className="px-4 py-4">
                      ₦{Number(product.price).toLocaleString()}
                    </td>
                    <td className="px-4 py-4">{product.stock}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                          product.is_available
                            ? "bg-green-100 text-green-700"
                            : "bg-stone-200 text-stone-700"
                        }`}
                      >
                        {product.is_available ? "Available" : "Unavailable"}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:bg-stone-100"
                        >
                          Edit
                        </Link>

                        <form action={deleteProduct}>
                          <input
                            type="hidden"
                            name="product_id"
                            value={product.id}
                          />
                          <button
                            type="submit"
                            className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}