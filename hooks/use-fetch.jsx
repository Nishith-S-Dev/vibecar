import { useState } from "react";
import { toast } from "sonner";

const UseFetch = (cb) => {
  const [data, setData] = useState(undefined);      // ✅ correct
  const [loading, setLoading] = useState(null); // start as false
  const [error, setError] = useState(null);

  const fn = async (...args) => {
    setLoading(true);
    setError(null);

    try {
      const response = await cb(...args);
      setData(response);
      setError(null);
    } catch (error) {
      setError(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fn, setData };
};

export default UseFetch;