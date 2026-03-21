import { createCivicAuthPlugin } from "@civic/auth/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

const withCivicAuth = createCivicAuthPlugin({
  clientId: "14053725-1e38-4e54-aefb-f65d58484704",
});

export default withCivicAuth(nextConfig);
