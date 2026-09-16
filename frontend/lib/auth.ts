const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function login(username: string, password: string) {
  console.log('API_URL:', API_URL);
  console.log('Đang gọi login với:', username, password);

  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  console.log('Status code:', res.status);

  if (!res.ok) {
    const errorData = await res.json();
    console.log('Lỗi trả về:', errorData);
    throw new Error('Sai username hoặc password');
  }

  const data = await res.json();
  console.log('Dữ liệu trả về:', data);

  localStorage.setItem('access_token', data.access_token);
  localStorage.setItem('user', JSON.stringify(data.user));

  return data;
}

export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}

export function logout() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user');
}