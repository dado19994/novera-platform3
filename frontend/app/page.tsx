import { AppShell } from "@/components/layout/app-shell";
import { CityMediaProvider } from "@/components/city-media/city-media-provider";
import { HomeExperience } from "@/components/demo/home-experience";

export default function HomePage() {
  return (
    <CityMediaProvider initialCity="rome">
      <AppShell>
        <HomeExperience />
      </AppShell>
    </CityMediaProvider>
  );
}
