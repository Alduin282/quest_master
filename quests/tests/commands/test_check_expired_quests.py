import pytest
from django.utils import timezone
from datetime import timedelta
from django.core.management import call_command
from django.contrib.auth.models import User
from quests.models import Quest


@pytest.mark.django_db
def test__handle__when_quest_expired__updates_status_to_failed(user: User) -> None:
    # Arrange
    expired_time = timezone.now() - timedelta(hours=1)
    Quest.objects.create(
        user=user,
        title="Expired Quest",
        planned_achievement_name="N/A",
        status="active",
        end_time=expired_time,
    )

    # Act
    call_command("check_expired_quests")

    # Assert
    quest = Quest.objects.first()
    assert quest.status == "failed"


@pytest.mark.django_db
def test__handle__when_quest_not_expired__remains_active(user: User) -> None:
    # Arrange
    future_time = timezone.now() + timedelta(hours=1)
    Quest.objects.create(
        user=user,
        title="Active Quest",
        planned_achievement_name="N/A",
        status="active",
        end_time=future_time,
    )

    # Act
    call_command("check_expired_quests")

    # Assert
    quest = Quest.objects.first()
    assert quest.status == "active"


@pytest.mark.django_db
def test__handle__when_quest_is_completed_even_if_expired__remains_completed(user: User) -> None:
    # Arrange
    # It might be in the past, but it's already completed
    expired_time = timezone.now() - timedelta(hours=1)
    Quest.objects.create(
        user=user,
        title="Completed Quest",
        planned_achievement_name="N/A",
        status="completed",
        end_time=expired_time,
    )

    # Act
    call_command("check_expired_quests")

    # Assert
    quest = Quest.objects.first()
    assert quest.status == "completed"
