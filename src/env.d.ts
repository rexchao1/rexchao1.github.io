declare module "*.jpg" { const s: string; export default s; }
declare module "*.png" { const s: string; export default s; }
declare module "*.css";
interface ImportMeta { readonly env: { readonly BASE_URL: string } }
