import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  // Auto-redirect to auctions page
  useEffect(() => {
    // Use a short timeout to allow for animation to show
    const redirectTimeout = setTimeout(() => {
      navigate("/auctions");
    }, 3000);

    return () => clearTimeout(redirectTimeout);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted/30 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-3xl"
      >
        <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
          Welcome to HTTPZ
        </h1>

        <p className="text-xl text-muted-foreground mb-8">
          Discover, participate and deploy your own Dutch auctions
        </p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Button
            size="lg"
            onClick={() => navigate("/auctions")}
            className="gap-2"
          >
            Explore Auctions <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-sm text-muted-foreground mt-6"
        >
          Redirecting to auctions page...
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Index;
