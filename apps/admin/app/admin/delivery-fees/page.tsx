import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "../../../lib/supabase-admin";

async function createDeliveryZone(formData: FormData) {
  "use server";

  const name = String(formData.get("name") || "").trim();
  const fee = Number(formData.get("fee") || 0);

  if (!name) {
    redirect("/admin/delivery-fees?error=Location name is required");
  }

  if (Number.isNaN(fee) || fee < 0) {
    redirect("/admin/delivery-fees?error=Fee must be 0 or more");
  }

  const { error } = await supabaseAdmin.from("delivery_zones").insert({
    name,
    fee,
    is_active: true,
  });

  if (error) {
    redirect(
      `/admin/delivery-fees?error=${encodeURIComponent(error.message)}`
    );
  }

  revalidatePath("/admin");
  revalidatePath("/admin/delivery-fees");
  redirect("/admin/delivery-fees");
}

async function updateDeliveryZone(formData: FormData) {
  "use server";

  const id = String(formData.get("id") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const fee = Number(formData.get("fee") || 0);
  const isActive = formData.get("is_active") === "on";

  if (!id) {
    redirect("/admin/delivery-fees?error=Zone ID is required");
  }

  if (!name) {
    redirect("/admin/delivery-fees?error=Location name is required");
  }

  if (Number.isNaN(fee) || fee < 0) {
    redirect("/admin/delivery-fees?error=Fee must be 0 or more");
  }

  const { error } = await supabaseAdmin
    .from("delivery_zones")
    .update({
      name,
      fee,
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    redirect(
      `/admin/delivery-fees?error=${encodeURIComponent(error.message)}`
    );
  }

  revalidatePath("/admin");
  revalidatePath("/admin/delivery-fees");
  redirect("/admin/delivery-fees");
}

async function deleteDeliveryZone(formData: FormData) {
  "use server";

  const id = String(formData.get("id") || "").trim();

  if (!id) {
    redirect("/admin/delivery-fees?error=Zone ID is required");
  }

  const { error } = await supabaseAdmin
    .from("delivery_zones")
    .delete()
    .eq("id", id);

  if (error) {
    redirect(
      `/admin/delivery-fees?error=${encodeURIComponent(error.message)}`
    );
  }

  revalidatePath("/admin");
  revalidatePath("/admin/delivery-fees");
  redirect("/admin/delivery-fees");
}

export default async function DeliveryFeesPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const query = (await searchParams) ?? {};
  const errorMessage = query.error;

  const { data: zones, error } = await supabaseAdmin
    .from("delivery_zones")
    .select("id, name, fee, is_active, created_at, updated_at")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (
    <main className="admin-page">
      <div className="admin-container">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-stone-500">Operations</p>
            <h1 className="admin-title mt-2">Delivery Fee Manager</h1>
            <p className="admin-subtitle mt-3">
              Set delivery prices based on customer location.
            </p>
          </div>
        </div>

        {errorMessage ? (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {errorMessage}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="admin-card p-6">
            <h2 className="text-xl font-bold text-stone-900">Add Location</h2>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              Create a delivery zone and assign a fee for that area.
            </p>

            <form action={createDeliveryZone} className="mt-5 space-y-4">
              <div>
                <label className="admin-label mb-2 block">Location Name</label>
                <input
                  name="name"
                  className="admin-input"
                  placeholder="Lekki Phase 1"
                  required
                />
              </div>

              <div>
                <label className="admin-label mb-2 block">
                  Delivery Fee (₦)
                </label>
                <input
                  name="fee"
                  type="number"
                  min="0"
                  step="0.01"
                  className="admin-input"
                  placeholder="3500"
                  required
                />
              </div>

              <button type="submit" className="admin-btn-primary">
                Add Delivery Zone
              </button>
            </form>
          </section>

          <section className="admin-card p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-stone-900">
                  Existing Zones
                </h2>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  Edit fees, rename locations, or disable a zone.
                </p>
              </div>

              <div className="rounded-full bg-stone-100 px-4 py-2 text-sm font-semibold text-stone-700">
                {zones?.length ?? 0} zone(s)
              </div>
            </div>

            <div className="space-y-4">
              {(zones ?? []).length === 0 ? (
                <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-4 py-8 text-center text-sm text-stone-500">
                  No delivery zones added yet.
                </div>
              ) : (
                zones?.map((zone) => (
                  <form
                    key={zone.id}
                    action={updateDeliveryZone}
                    className="rounded-3xl border border-stone-200 bg-stone-50 p-4"
                  >
                    <input type="hidden" name="id" value={zone.id} />

                    <div className="grid gap-4 md:grid-cols-[1fr_180px_140px]">
                      <div>
                        <label className="admin-label mb-2 block">
                          Location
                        </label>
                        <input
                          name="name"
                          defaultValue={zone.name}
                          className="admin-input"
                          required
                        />
                      </div>

                      <div>
                        <label className="admin-label mb-2 block">
                          Fee (₦)
                        </label>
                        <input
                          name="fee"
                          type="number"
                          min="0"
                          step="0.01"
                          defaultValue={Number(zone.fee)}
                          className="admin-input"
                          required
                        />
                      </div>

                      <div className="flex items-end">
                        <label className="flex h-[50px] w-full items-center gap-3 rounded-2xl border border-stone-200 bg-white px-4">
                          <input
                            type="checkbox"
                            name="is_active"
                            defaultChecked={zone.is_active}
                            className="h-4 w-4 rounded border-stone-300"
                          />
                          <span className="text-sm font-medium text-stone-700">
                            Active
                          </span>
                        </label>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <button type="submit" className="admin-btn-primary">
                        Save Changes
                      </button>

                      <button
                        formAction={deleteDeliveryZone}
                        className="admin-btn-secondary"
                      >
                        Delete
                      </button>
                    </div>
                  </form>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}