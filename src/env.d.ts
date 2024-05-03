/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
interface ImportMetaEnv {
	readonly GH_ACCESS_TOKEN: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
