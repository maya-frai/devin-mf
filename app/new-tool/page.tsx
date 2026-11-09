import { redirect } from "next/navigation";

// The New tool form now lives in the "+" builder, which also covers customizing a tool.
export default function NewToolPage() {
  redirect("/build?mode=new");
}
