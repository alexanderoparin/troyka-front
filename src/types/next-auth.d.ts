import { DefaultSession, DefaultUser } from "next-auth"
import { JWT, DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: "USER" | "ADMIN"
      createdAt?: string
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    role: "USER" | "ADMIN"
    createdAt?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role: "USER" | "ADMIN"
    userId: string
  }
}
