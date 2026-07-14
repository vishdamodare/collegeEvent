import { getAdminCategories } from "@/actions/admin";
import { CategoriesClient } from "./CategoriesClient";

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories();

  return <CategoriesClient initialCategories={categories} />;
}
