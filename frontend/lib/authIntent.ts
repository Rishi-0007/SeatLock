type PostAuthAction = {
  type: 'BOOK_SEATS';
  seatIds: string[];
  eventId: string;
} | null;

export function setPostAuthAction(action: PostAuthAction) {
  sessionStorage.setItem('postAuthAction', JSON.stringify(action));
}

export function getPostAuthAction(): PostAuthAction {
  const raw = sessionStorage.getItem('postAuthAction');
  if (!raw) return null;
  return JSON.parse(raw);
}

export function clearPostAuthAction() {
  sessionStorage.removeItem('postAuthAction');
}
