import { Roles } from "../types/globals";
import { auth } from "@clerk/nextjs/server";

export const checkRole = (role: Roles) => {
  const { sessionClaims } = auth();
  console.log(sessionClaims);
  return sessionClaims?.metadata.role === role;
};
