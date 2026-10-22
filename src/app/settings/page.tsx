import { getSettings } from "@/lib/data-store";
import { SettingsForm } from "@/components/settings/SettingsForm";

export const metadata = {
  title: "Nastavení – Technologio",
};

export default async function SettingsPage() {
  const settings = await getSettings();

  return <SettingsForm initialSettings={settings} />;
}
