import { useEffect, useState } from "react";

const PHONE_QUERY = "(max-width: 767px)";
// A phone turned sideways is wider than 767px but short. The phone recipe box
// opts in so Card View survives rotation (decision 003, Card View).
const PHONE_OR_SIDEWAYS_QUERY = `${PHONE_QUERY}, (orientation: landscape) and (max-height: 500px)`;

export function usePhoneLayout({ sideways = false }: { sideways?: boolean } = {}): boolean {
  const query = sideways ? PHONE_OR_SIDEWAYS_QUERY : PHONE_QUERY;
  const [isPhone, setIsPhone] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const media = window.matchMedia(query);
    const onChange = () => {
      setIsPhone(media.matches);
    };
    setIsPhone(media.matches);
    media.addEventListener("change", onChange);
    return () => {
      media.removeEventListener("change", onChange);
    };
  }, [query]);

  return isPhone;
}
