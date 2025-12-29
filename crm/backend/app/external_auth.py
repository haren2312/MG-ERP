import httpx
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import logging
from .config import settings

logger = logging.getLogger(__name__)

AUTH_PROFILE_URL = f"{settings.AUTH_SERVICE_URL}/api/v1/auth/profile"
security = HTTPBearer()

async def get_current_user(request: Request, credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    token = credentials.credentials
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                AUTH_PROFILE_URL,
                headers={"Authorization": f"Bearer {token}"},
                timeout=5.0
            )
            if response.status_code != 200:
                logger.warning(f"Auth service returned {response.status_code}: {response.text}")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid or expired token"
                )
            user = response.json()
            if not user.get("is_active", False):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="User account is inactive"
                )
            return user
        except httpx.RequestError as e:
            logger.error(f"Auth service unavailable: {e}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Auth service unavailable"
            )
        except Exception as e:
            logger.error(f"Authentication failed: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Authentication failed: {str(e)}"
            )

# Sync-compatible dependency wrapper
def require_auth():
    async def auth_dependency(request: Request, credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
        return await get_current_user(request, credentials)
    return auth_dependency
