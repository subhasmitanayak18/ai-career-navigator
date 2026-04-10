"""
Custom JWT Authentication for Django REST Framework.

This module provides:
  - JWTAuthentication: DRF BaseAuthentication subclass that validates Bearer tokens
  - create_jwt_token(user): Helper to generate signed JWT tokens for a given user
"""

import jwt
from datetime import datetime, timezone

from django.conf import settings
from django.contrib.auth import get_user_model

from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

User = get_user_model()


class JWTAuthentication(BaseAuthentication):
    """
    Custom JWT authentication backend for Django REST Framework.

    Reads an Authorization header of the form:
        Authorization: Bearer <token>

    Validates the token using the project's JWT_SECRET_KEY and JWT_ALGORITHM,
    then returns the corresponding (user, token) tuple.
    """

    def authenticate(self, request):
        """
        Attempt to authenticate the request using a JWT Bearer token.

        Returns:
            (user, token) tuple if authentication succeeds.
            None if no Authorization header is present (allows other authenticators to try).

        Raises:
            AuthenticationFailed: If the token is malformed, expired, or invalid.
        """
        auth_header = request.headers.get('Authorization', '')

        if not auth_header:
            return None  # No credentials provided; let other authenticators try

        parts = auth_header.split()

        if len(parts) != 2 or parts[0].lower() != 'bearer':
            raise AuthenticationFailed(
                'Invalid Authorization header format. Expected: Bearer <token>'
            )

        token = parts[1]

        try:
            payload = jwt.decode(
                token,
                settings.JWT_SECRET_KEY,
                algorithms=[settings.JWT_ALGORITHM],
            )
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token has expired. Please log in again.')
        except jwt.InvalidTokenError as e:
            raise AuthenticationFailed(f'Invalid token: {str(e)}')

        # Fetch the user from the database
        username = payload.get('sub')
        if not username:
            raise AuthenticationFailed('Token payload is missing the "sub" (subject) field.')

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            raise AuthenticationFailed('No user found for the provided token.')

        if not user.is_active:
            raise AuthenticationFailed('This user account has been deactivated.')

        return (user, token)

    def authenticate_header(self, request):
        """
        Return the WWW-Authenticate header value for 401 responses.
        This tells clients that Bearer token authentication is expected.
        """
        return 'Bearer realm="api"'


def create_jwt_token(user) -> str:
    """
    Generate a signed JWT token for the given user.

    The token payload contains:
      - sub (str): The user's username (subject)
      - exp (int): Expiration time as a UTC timestamp
      - iat (int): Issued-at time as a UTC timestamp

    Args:
        user: A Django User model instance.

    Returns:
        A signed JWT token string.
    """
    now = datetime.now(tz=timezone.utc)
    expiration = now + settings.JWT_EXPIRATION_DELTA

    payload = {
        'sub': user.username,
        'exp': expiration,
        'iat': now,
    }

    token = jwt.encode(
        payload,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )

    # PyJWT >= 2.0 returns str directly; older versions returned bytes
    if isinstance(token, bytes):
        token = token.decode('utf-8')

    return token
