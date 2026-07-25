export function verificationResult(live, pagesStatus) {
  if (live) {
    return 'live';
  }

  if (pagesStatus === 'errored' || pagesStatus === 'canceled') {
    return 'failed';
  }

  return 'waiting';
}
