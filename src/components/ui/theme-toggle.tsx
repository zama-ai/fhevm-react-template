import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeMode, useAppKitTheme } from '@reown/appkit/react';

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const { setThemeMode, setThemeVariables } = useAppKitTheme();
  const [mounted, setMounted] = useState(false);

  // Ensure theme toggle only renders on client-side to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Synchronize AppKit theme with current theme
  useEffect(() => {
    if (mounted) {
      setThemeMode(theme as ThemeMode);
    }
  }, [theme, mounted, setThemeMode, setThemeVariables]);

  if (!mounted) {
    return <Button variant="ghost" size="icon" disabled className="h-8 w-8" />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
