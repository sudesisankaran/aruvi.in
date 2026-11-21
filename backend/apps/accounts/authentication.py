from rest_framework.authentication import SessionAuthentication

class CsrfExemptSessionAuthentication(SessionAuthentication):
    """
    Session authentication without CSRF enforcement.
    Essential for decoupled single-page applications (React / Vite) where
    requests are authenticated via Token or across different dev/prod ports.
    """
    def enforce_csrf(self, request):
        return  # CSRF validation is exempt for API endpoints
