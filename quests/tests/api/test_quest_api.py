import pytest
from typing import Any
from rest_framework import status
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth.models import User
from quests.models import Quest, Achievement
from quests.views import QuestViewSet


@pytest.fixture
def api_client() -> Any:
    from rest_framework.test import APIClient

    return APIClient()


@pytest.mark.django_db
class TestQuestAPI:
    def test__quest_create__when_valid_payload__creates_and_links_to_user(self, api_client: Any, user: User) -> None:
        # Arrange
        api_client.force_authenticate(user=user)
        data = {"title": "New Quest", "description": "Desc", "planned_achievement_name": "Pro User"}

        # Act
        response = api_client.post("/api/quests/", data)

        # Assert
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["status"] == "created"
        assert Quest.objects.filter(user=user).count() == 1

    def test__quest_start__when_created_status__updates_to_active_with_times(self, api_client: Any, user: User) -> None:
        # Arrange
        api_client.force_authenticate(user=user)
        quest = Quest.objects.create(user=user, title="To Start", planned_achievement_name="Started", status="created")

        # Act
        response = api_client.post(f"/api/quests/{quest.id}/start/", {"duration_minutes": 30})

        # Assert
        assert response.status_code == status.HTTP_200_OK
        quest.refresh_from_db()
        assert quest.status == "active"
        assert quest.end_time is not None

    def test__quest_start__when_status_not_created__returns_error(self, api_client: Any, user: User) -> None:
        # Arrange
        api_client.force_authenticate(user=user)
        quest = Quest.objects.create(user=user, title="Already Active", planned_achievement_name="N/A", status="active")

        # Act
        response = api_client.post(f"/api/quests/{quest.id}/start/", {"duration_minutes": 30})

        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data["error"] == "Quest is already started or finished"

    def test__quest_start__when_duration_not_provided__uses_default_duration(self, api_client: Any, user: User) -> None:
        # Arrange
        api_client.force_authenticate(user=user)
        quest = Quest.objects.create(
            user=user, title="Default Duration", planned_achievement_name="N/A", status="created"
        )
        expected_end_time = timezone.now() + timedelta(minutes=QuestViewSet.DEFAULT_DURATION_MINUTES)

        # Act
        response = api_client.post(f"/api/quests/{quest.id}/start/", {})

        # Assert
        assert response.status_code == status.HTTP_200_OK
        quest.refresh_from_db()
        # Проверяем примерную точность времени (в пределах секунды)
        assert abs((quest.end_time - expected_end_time).total_seconds()) < 1

    def test__quest_complete__when_within_time__updates_status_and_creates_achievement(
        self, api_client: Any, user: User
    ) -> None:
        # Arrange
        api_client.force_authenticate(user=user)
        quest = Quest.objects.create(
            user=user,
            title="To Complete",
            planned_achievement_name="Champ",
            status="active",
            end_time=timezone.now() + timedelta(minutes=10),
        )

        # Act
        response = api_client.post(f"/api/quests/{quest.id}/complete/")

        # Assert
        assert response.status_code == status.HTTP_200_OK
        quest.refresh_from_db()
        assert Achievement.objects.filter(quest=quest).exists()

    def test__quest_complete__when_insane_difficulty__creates_diamond_achievement(
        self, api_client: Any, user: User
    ) -> None:
        # Arrange
        api_client.force_authenticate(user=user)
        quest = Quest.objects.create(
            user=user,
            title="Legendary Quest",
            planned_achievement_name="Godlike",
            status="active",
            difficulty="insane",
            end_time=timezone.now() + timedelta(minutes=10),
        )

        # Act
        response = api_client.post(f"/api/quests/{quest.id}/complete/")

        # Assert
        assert response.status_code == status.HTTP_200_OK
        achievement = Achievement.objects.get(quest=quest)
        assert achievement.rarity == "diamond"

    def test__quest_complete__when_status_not_active__returns_error(self, api_client: Any, user: User) -> None:
        # Arrange
        api_client.force_authenticate(user=user)
        quest = Quest.objects.create(user=user, title="Not Active", planned_achievement_name="N/A", status="created")

        # Act
        response = api_client.post(f"/api/quests/{quest.id}/complete/")

        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data["error"] == "Quest must be active to complete"

    def test__quest_complete__when_time_expired__updates_to_failed_and_returns_error(
        self, api_client: Any, user: User
    ) -> None:
        # Arrange
        api_client.force_authenticate(user=user)
        quest = Quest.objects.create(
            user=user,
            title="Late Quest",
            planned_achievement_name="Late",
            status="active",
            end_time=timezone.now() - timedelta(minutes=1),
        )

        # Act
        response = api_client.post(f"/api/quests/{quest.id}/complete/")

        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        quest.refresh_from_db()
        assert quest.status == "failed"
        assert not Achievement.objects.filter(quest=quest).exists()

    def test__quest_restart__when_status_failed__resets_to_created(self, api_client: Any, user: User) -> None:
        # Arrange
        api_client.force_authenticate(user=user)
        quest = Quest.objects.create(
            user=user,
            title="Failed Quest",
            planned_achievement_name="Try Again",
            status="failed",
            start_time=timezone.now(),
            end_time=timezone.now() - timedelta(minutes=1),
        )

        # Act
        response = api_client.post(f"/api/quests/{quest.id}/restart/")

        # Assert
        assert response.status_code == status.HTTP_200_OK
        quest.refresh_from_db()
        assert quest.status == "created"
        assert quest.start_time is None
        assert quest.end_time is None

    def test__quest_restart__when_status_not_failed__returns_error(self, api_client: Any, user: User) -> None:
        # Arrange
        api_client.force_authenticate(user=user)
        quest = Quest.objects.create(
            user=user, title="Active, Cannot Restart", planned_achievement_name="N/A", status="active"
        )

        # Act
        response = api_client.post(f"/api/quests/{quest.id}/restart/")

        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data["error"] == "Only failed quests can be restarted"
