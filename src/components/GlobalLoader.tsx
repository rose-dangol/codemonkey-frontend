import { useIsFetching } from "@tanstack/react-query";

export const GlobalLoader = () => {
  const isFetching = useIsFetching();

  if (!isFetching) return null;

  return <div className="loader">Loading...</div>;
};
