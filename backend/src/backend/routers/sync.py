from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from backend.core.db import get_session
from backend.core.deps import CurrentUser, get_current_user
from backend.schemas.sync import SyncPullResponse, SyncPushRequest, SyncPushResponse
from backend.services import sync as sync_service

router = APIRouter(prefix="/sync", tags=["sync"])

SessionDep = Annotated[Session, Depends(get_session)]
CurrentUserDep = Annotated[CurrentUser, Depends(get_current_user)]


@router.post("/push", response_model=SyncPushResponse)
def push(
    body: SyncPushRequest,
    session: SessionDep,
    current: CurrentUserDep,
) -> SyncPushResponse:
    return sync_service.push(
        session,
        current=current,
        dispositivo_id=body.dispositivo_id,
        cambios=body.cambios,
    )


@router.get("/pull", response_model=SyncPullResponse)
def pull(
    session: SessionDep,
    current: CurrentUserDep,
    dispositivo_id: Annotated[UUID, Query()],
    desde: Annotated[int, Query(ge=0)] = 0,
    limite: Annotated[int, Query(ge=1, le=500)] = 100,
) -> SyncPullResponse:
    return sync_service.pull(
        session,
        current=current,
        dispositivo_id=dispositivo_id,
        desde=desde,
        limite=limite,
    )
