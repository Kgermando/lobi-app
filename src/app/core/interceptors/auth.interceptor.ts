import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  // Le token est déjà ajouté via query param dans les services
  // Cet intercepteur ajoute aussi le header Authorization comme fallback
  const token = localStorage.getItem('lobi_token');

  if (token && !req.url.includes('backblazeb2.com')) {
    const cloned = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    return next(cloned);
  }

  return next(req);
};
