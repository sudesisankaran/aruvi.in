class DisableCSRFForAPIMiddleware:
    """
    Decoupled API CSRF Middleware:
    Completely exempts all /api/* endpoints from CSRF enforcement.
    Decoupled single-page applications (React on Vercel / dev) use Token authentication
    or public access; browser cookie CSRF checks are inapplicable and cause 403 Forbidden errors.
    Standard Django admin (/admin/*) retains full CSRF protection.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.path_info.startswith('/api/'):
            setattr(request, '_dont_enforce_csrf_checks', True)
        return self.get_response(request)

    def process_view(self, request, callback, callback_args, callback_kwargs):
        if request.path_info.startswith('/api/'):
            setattr(request, '_dont_enforce_csrf_checks', True)
        return None
