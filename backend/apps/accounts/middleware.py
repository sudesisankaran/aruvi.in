class DisableCSRFForAPIMiddleware:
    """
    Middleware to disable CSRF checks for API requests (/api/*).
    API endpoints use Token-based authentication or public access,
    so CSRF cookie verification is neither necessary nor appropriate
    for decoupled frontend SPAs (React on Vercel / localhost).
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.path_info.startswith('/api/'):
            setattr(request, '_dont_enforce_csrf_checks', True)
        return self.get_response(request)
