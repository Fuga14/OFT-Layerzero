import fs from "fs";
import { Config } from "../types";

export function readConfig(configPath: string): Config {
    try {
        const configContent = fs.readFileSync(configPath, "utf8");
        return JSON.parse(configContent) as Config;
    } catch (error) {
        console.error(`Error reading config file`);
        throw error;
    }
}
