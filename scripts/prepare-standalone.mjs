import { cpSync, existsSync, mkdirSync } from "fs";
import path from "path";

const standaloneDir = ".next/standalone";
const staticSrc = ".next/static";
const staticDest = path.join(standaloneDir, ".next/static");
const publicSrc = "public";
const publicDest = path.join(standaloneDir, "public");

if (!existsSync(standaloneDir)) {
    console.error("Standalone build not found. Run next build first.");
    process.exit(1);
}

mkdirSync(path.join(standaloneDir, ".next"), { recursive: true });

cpSync(staticSrc, staticDest, { recursive: true });
cpSync(publicSrc, publicDest, { recursive: true });

console.log("Standalone assets prepared.");