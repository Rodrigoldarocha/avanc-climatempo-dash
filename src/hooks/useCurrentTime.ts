import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function useCurrentTime() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return {
    time: format(now, "HH:mm:ss"),
    date: format(now, "dd/MM/yyyy"),
    dateShort: format(now, "dd/MM"),
    dayName: format(now, "EEE", { locale: ptBR }),
    full: format(now, "EEE dd/MM HH:mm", { locale: ptBR }),
  };
}
