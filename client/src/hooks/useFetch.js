import { useCallback, useEffect, useState } from 'react';
import api, { errMsg } from '../services/api';
export default function useFetch(url, deps = []) {
  const [data, setData] = useState(null); const [error, setError] = useState(''); const [loading, setLoading] = useState(true);
  const reload = useCallback(() => { if (!url) return; setLoading(true); api.get(url).then((r) => { setData(r.data); setError(''); }).catch((e) => setError(errMsg(e))).finally(() => setLoading(false)); }, [url]);
  useEffect(reload, [reload, ...deps]);
  return { data, error, loading, reload };
}
