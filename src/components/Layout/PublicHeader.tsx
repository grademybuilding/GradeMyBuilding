import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/Layout/ThemeToggle";
import { useTheme } from "next-themes";
import { useNavigate } from "react-router-dom";
import logoWhite from "@/assets/logo-white.png";
import logoColor from "@/assets/logo-color.png";

export function PublicHeader() {
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between p-4 bg-card border-b border-border shadow-card">
      <button
        type="button"
        className="flex items-center gap-2 relative"
        onClick={() => navigate("/")}
        aria-label="Go to home"
      >
        <img
          src={logoColor}
          alt="GradeMyBuilding logo"
          className={`h-12 md:h-16 lg:h-20 w-auto object-contain transition-opacity duration-200 ${
            resolvedTheme === "dark" ? "opacity-0 absolute" : "opacity-100"
          }`}
        />
        <img
          src={logoWhite}
          alt="GradeMyBuilding logo"
          className={`h-12 md:h-16 lg:h-20 w-auto object-contain transition-opacity duration-200 ${
            resolvedTheme === "dark" ? "opacity-100" : "opacity-0 absolute"
          }`}
        />
      </button>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button variant="outline" onClick={() => navigate("/auth")}>
          Sign In
        </Button>
      </div>
    </header>
  );
}
