import pytest
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth.models import User
from quests.models import Quest


@pytest.mark.django_db
def test__is_expired__when_active_and_time_passed__returns_true(user: User) -> None:
    # Arrange
    quest = Quest.objects.create(
        user=user,
        title="Expired Quest",
        planned_achievement_name="N/A",
        status="active",
        end_time=timezone.now() - timedelta(seconds=1),
    )

    # Act
    expired = quest.is_expired

    # Assert
    assert expired is True


@pytest.mark.django_db
def test__is_expired__when_active_and_time_remaining__returns_false(user: User) -> None:
    # Arrange
    quest = Quest.objects.create(
        user=user,
        title="Fresh Quest",
        planned_achievement_name="N/A",
        status="active",
        end_time=timezone.now() + timedelta(hours=1),
    )

    # Act
    expired = quest.is_expired

    # Assert
    assert expired is False
