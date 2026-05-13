export function AppThemeLoader() {
  const fallback = {
    heading: "#000000",
    description: "#444444",
    subText: "#777777",
    backgroundPrimary: "#ffffff",
    backgroundSecondary: "#f5f5f5",
    Action: "#fff",
    State: "#000",
  };

  let theme = fallback;

  try {
    const stored = localStorage.getItem("theme");
    if (stored) {
      theme = { ...fallback, ...JSON.parse(stored) };
      console.log("🚀 ~ AppThemeLoader ~ theme:", theme);
    }
  } catch (err) {
    console.warn("Invalid theme in localStorage, using fallback");
  }

  const root = document.documentElement;

  root.style.setProperty("--color-heading", theme.heading);
  root.style.setProperty("--color-description", theme.description);
  root.style.setProperty("--color-subtext", theme.subText);
  root.style.setProperty("--bg-primary", theme.backgroundPrimary);
  root.style.setProperty("--bg-secondary", theme.backgroundSecondary);
  root.style.setProperty("--action--color", theme.Action);
  root.style.setProperty("--state--color", theme.State);
}
