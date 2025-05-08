// console.log("Environment variables:", import.meta.env);

export const VITE_PAYMENT_TOKEN_CONTRACT_ADDRESS = import.meta.env
  .VITE_PAYMENT_TOKEN_CONTRACT_ADDRESS as `0x${string}`;
export const VITE_PROJECT_ID = import.meta.env.VITE_PROJECT_ID as string;
