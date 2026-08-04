# Data Fetching Pattern (Required)

Every `useEffect` that triggers an API request **must** abort in cleanup.

## Standard hook pattern

```javascript
useEffect(() => {
  const controller = new AbortController();

  (async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(url, { signal: controller.signal });
      if (!controller.signal.aborted) setData(res.data);
    } catch (err) {
      if (axios.isCancel(err) || err?.code === "ERR_CANCELED" || controller.signal.aborted) {
        return;
      }
      setError(err);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  })();

  return () => controller.abort();
}, [url]);
```

## 403 / 404 handling

- `403` with `code: "FORBIDDEN"` is handled globally in `src/api/axios.js` via `ForbiddenContext`.
- `404` with `code: "NOT_FOUND"` is a logical not-found — show a friendly message, not a crash.
- Use helpers from `src/utils/apiErrors.js`.

## PR checklist

- [ ] `AbortController` created inside `useEffect`
- [ ] `return () => controller.abort()` in cleanup
- [ ] Abort/cancel errors ignored in `catch`
- [ ] No `setState` after abort or global forbidden

## Reference implementations

- `src/modules/student-dashboard/hooks/useCousrsesDetails.js`
- `src/modules/shared-dashboard/hooks/useAttemptReview.js`
