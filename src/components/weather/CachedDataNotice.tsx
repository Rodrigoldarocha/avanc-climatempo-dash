import { History } from "lucide-react";
import { getCachedAt } from "@/services/climatempo";

/** Aviso exibido quando o cartão mostra a última previsão salva (API indisponível). */
export const CachedDataNotice = ({ data }: { data: unknown }) => {
  const cachedAt = getCachedAt(data);
  if (!cachedAt) return null;
  const when = new Date(cachedAt).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
  return (
    <div
      role="status"
      className="relative z-10 mb-3 flex items-start gap-2 rounded-xl bg-muted px-3 py-2 text-xs text-muted-foreground shadow-clay-inset"
    >
      <History className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
      <span>
        Climatempo indisponível — exibindo a última previsão salva, atualizada em{" "}
        <strong className="text-foreground">{when}</strong>.
      </span>
    </div>
  );
};
