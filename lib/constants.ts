/**
 * Application Constants
 * @date February 12, 2026 3:29 PM
 * @author Muhammad Haykal
 */

import packageJson from "../package.json";

// APP
export const APP_NAME: string = packageJson.name;
export const APP_VERSION: string = packageJson.version;
export const APP_DESCRIPTION: string = packageJson.description;
export const APP_AUTHOR: string = packageJson.author;
export const APP_LICENSE: string = packageJson.license;
export const APP_HOMEPAGE: string = packageJson.homepage;
export const APP_REPOSITORY: string = packageJson.repository.url;
export const APP_KEYWORDS: string[] = packageJson.keywords;
export const APP_TYPE: string = packageJson.type;

// RESEND
export const RESEND_API_KEY: string | undefined = process.env.RESEND_API_KEY;
export const RESEND_MAIL_FROM: string | undefined = process.env.RESEND_MAIL_FROM;
