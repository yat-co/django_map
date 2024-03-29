import { useState, useEffect, useRef } from "react";

const useFetch = (url) => {
  const cache = useRef({});
  const [status, setStatus] = useState("idle");
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!url) return;
    const fetchData = async () => {
      setStatus("fetching");
      if (cache.current[url]) {
        console.log("Fetching from cache");
        const data = cache.current[url];
        setData(data);
        setStatus("fetched");
      } else {
        console.log("Fetching live");
        const response = await fetch(url);
        const data = await response.json();
        cache.current[url] = data; // set response in cache;
        setData(data);
        setStatus("fetched");
      }
    };

    fetchData();
  }, [url]);

  return { status, data };
};

export default useFetch;
