// Em produção (Vercel), define VITE_API_URL nas variáveis de ambiente do projeto.
// Em desenvolvimento local, usa o servidor Go na porta 8080.
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
