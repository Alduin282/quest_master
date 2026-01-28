import pytest
from typing import Any
from rest_framework import status
from django.contrib.auth.models import User
from quests.models import Quest, Achievement


@pytest.fixture
def api_client() -> Any:
    from rest_framework.test import APIClient

    return APIClient()


@pytest.mark.django_db
class TestAchievementAPI:
    def test__achievement_list__when_user_has_achievements__returns_only_user_achievements(
        self, api_client: Any, user: User
    ) -> None:
        # Arrange
        api_client.force_authenticate(user=user)
        other_user = User.objects.create_user(username="other", password="password")

        quest1 = Quest.objects.create(user=user, title="Q1", planned_achievement_name="A1", status="completed")
        Achievement.objects.create(user=user, quest=quest1, name="A1")

        quest2 = Quest.objects.create(user=other_user, title="Q2", planned_achievement_name="A2", status="completed")
        Achievement.objects.create(user=other_user, quest=quest2, name="A2")

        # Act
        response = api_client.get("/api/achievements/")

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["name"] == "A1"
