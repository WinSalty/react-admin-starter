import { useCallback, useEffect, useState } from 'react';
import { fetchActiveNotices } from '@/services/notice';
import type { NoticeRecord } from '@/types/notice';

interface UseActiveNoticesResult {
  notices: NoticeRecord[];
  loading: boolean;
  errorMessage: string;
  reload: () => void;
}

/**
 * 获取当前生效公告，供首页和顶栏共用。
 */
export function useActiveNotices(): UseActiveNoticesResult {
  const [notices, setNotices] = useState<NoticeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchActiveNotices()
      .then((response) => {
        if (!mounted) {
          return;
        }
        if (response.code !== 0) {
          setNotices([]);
          setErrorMessage(response.message || '公告获取失败');
          return;
        }
        setNotices(response.data || []);
        setErrorMessage('');
      })
      .catch(() => {
        if (mounted) {
          setNotices([]);
          setErrorMessage('公告获取失败，请稍后重试');
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [reloadKey]);

  const reload = useCallback(() => {
    setReloadKey((value) => value + 1);
  }, []);

  return { notices, loading, errorMessage, reload };
}
