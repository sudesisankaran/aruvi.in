from django.middleware.csrf import CsrfViewMiddleware

class DisableCSRFForAPIMiddleware(CsrfViewMiddleware):
    """
    Decoupled API CSRF Middleware:
    Completely exempts all /api/* endpoints from CSRF enforcement.
    Decoupled single-page applications (React on Vercel / dev) use Token authentication
    or public access; browser cookie CSRF checks are inapplicable and cause 403 Forbidden errors.
    Standard Django admin (/admin/*) retains full CSRF protection.
    """
    def process_view(self, request, callback, callback_args, callback_kwargs):
        if request.path_info.startswith('/api/'):
            setattr(request, '_dont_enforce_csrf_checks', True)
            return None  # Whitelist all API calls completely
        return super().process_view(request, callback, callback_args, callback_kwargs)

    def __call__(self, request):
        if request.path_info.startswith('/api/'):
            setattr(request, '_dont_enforce_csrf_checks', True)
        return super().__call__(request)
