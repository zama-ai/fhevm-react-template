import { createContext } from "react";
import { TokenContextType } from "@/types/tokenTypes";

// Create the token context with default values
const TokenContext = createContext<TokenContextType>({
  tokens: [],
  isLoading: true,
});

export default TokenContext;
