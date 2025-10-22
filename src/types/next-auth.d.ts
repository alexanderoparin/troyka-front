import { DefaultSession, DefaultUser } from "next-auth"
import { DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  // eslint-disable-next-line no-unused-vars
  interface Session {
    user: {
      id: string
      role: "USER" | "ADMIN"
      createdAt?: string
    } & DefaultSession["user"]
  }

  // eslint-disable-next-line no-unused-vars
  interface User extends DefaultUser {
    role: "USER" | "ADMIN"
    createdAt?: string
  }
}

declare module "next-auth/jwt" {
  // eslint-disable-next-line no-unused-vars
  interface JWT extends DefaultJWT {
    role: "USER" | "ADMIN"
    userId: string
  }
}
