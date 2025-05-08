import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import ConnectWallet from '@/components/wallet/ConnectWallet';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Fhevm', path: '/' },
    { name: 'Docs', path: 'https://docs.zama.ai/fhevm' },
  ];

  const onNavItemClick = () => {
    setIsOpen(false);
  };

  return (
    <header
      className={`fixed top-0 border-b font-telegraf left-0 right-0 z-50 px-0 md:px-6 py-4 transition-all duration-300 ${
        scrolled
          ? 'bg-background/80 backdrop-blur-md shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="md:px-0 px-5 mx-auto font-telegraf">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex mr-5 md:mr-32 items-center space-x-2">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="w-10 h-10 bg-primary flex items-center justify-center"
            >
              <img src="/assets/zama-logo.png" alt="Zama" className="w-6 h-6" />
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={
                    location.pathname === item.path ? 'secondary' : 'ghost'
                  }
                  size="sm"
                  className="relative hover:bg-[#eeeeee] dark:hover:bg-[#5a5a5a]"
                >
                  {location.pathname === item.path && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-secondary"
                      transition={{
                        duration: 0.2,
                        type: 'spring',
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className="relative z-10">{item.name}</span>
                </Button>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden md:block">
              <ConnectWallet />
            </div>
            <ThemeToggle />

            {/* Mobile Menu */}
            <div className="md:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="top"
                  className="h-[60vh] flex justify-center w-full pt-6"
                >
                  <SheetHeader>
                    <SheetTitle></SheetTitle>
                  </SheetHeader>
                  <div className="mt-4 w-full max-w-xs flex flex-col ">
                    {navItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={onNavItemClick}
                        className="w-full"
                      >
                        <div
                          className={`${
                            location.pathname === item.path
                              ? 'bg-secondary text-secondary-foreground '
                              : ' hover:text-accent-foreground'
                          } w-full text-xl hover:bg-secondary/40 justify-left font-telegraf text-left py-4 px-4 my-2 hover:bg-[#eeeeee] dark:hover:bg-[#5a5a5a]`}
                        >
                          {item.name}
                        </div>
                      </Link>
                    ))}
                    <div className="flex mt-8 px-4 flex-col gap-4">
                      <div className="text-sm text-">Connected wallet:</div>
                      <div className="flex justify-left w-full max-w-xs">
                        <ConnectWallet />
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
