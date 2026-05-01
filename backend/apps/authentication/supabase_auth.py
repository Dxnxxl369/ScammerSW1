import jwt
from jwt import PyJWKClient
from django.conf import settings
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

_jwks_client = None


def _get_jwks_client() -> PyJWKClient:
    global _jwks_client
    if _jwks_client is None:
        jwks_url = f"{settings.SUPABASE_URL}/auth/v1/.well-known/jwks.json"
        _jwks_client = PyJWKClient(jwks_url, cache_keys=True)
    return _jwks_client


class SupabaseUser:
    def __init__(self, payload: dict):
        self.id = payload.get('sub')
        self.email = payload.get('email', '')
        self.is_authenticated = True
        self.payload = payload

    def __str__(self):
        return self.email


class SupabaseAuthentication(BaseAuthentication):
    def authenticate_header(self, request):
        return 'Bearer realm="api"'

    def authenticate(self, request):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return None

        token = auth_header.split(' ', 1)[1]
        if not token:
            return None

        try:
            header = jwt.get_unverified_header(token)
            alg = header.get('alg', 'HS256')

            if alg == 'HS256' and settings.SUPABASE_JWT_SECRET:
                payload = jwt.decode(
                    token,
                    settings.SUPABASE_JWT_SECRET,
                    algorithms=['HS256'],
                    audience='authenticated',
                )
            else:
                signing_key = _get_jwks_client().get_signing_key_from_jwt(token)
                payload = jwt.decode(
                    token,
                    signing_key,
                    algorithms=['ES256', 'RS256'],
                    audience='authenticated',
                )
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token expirado. Inicia sesión nuevamente.')
        except jwt.InvalidAudienceError:
            raise AuthenticationFailed('Token inválido: audiencia incorrecta.')
        except jwt.InvalidTokenError as e:
            raise AuthenticationFailed(f'Token inválido: {e}')

        return (SupabaseUser(payload), token)
