import pytest
from typing import Any
from rest_framework import status
from django.contrib.auth.models import User
from quests.models import Quest, Achievement
from unittest.mock import patch
from django.core.files.base import ContentFile


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

    def test__regenerate_image__when_owner__returns_200(self, api_client: Any, user: User) -> None:

        # Arrange
        api_client.force_authenticate(user=user)
        quest = Quest.objects.create(user=user, title="Q1", planned_achievement_name="A1", status="completed")
        achievement = Achievement.objects.create(user=user, quest=quest, name="A1")

        with patch("quests.views.generate_achievement_image") as mock_gen:
            mock_gen.return_value = ContentFile(b"new_image_content")

            # Act
            response = api_client.post(f"/api/achievements/{achievement.id}/regenerate_image/")

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert "image" in response.data
        achievement.refresh_from_db()
        assert achievement.image.size > 0
        mock_gen.assert_called_once()

    def test__regenerate_image__when_not_owner__returns_404(self, api_client: Any, user: User) -> None:
        # Arrange
        api_client.force_authenticate(user=user)
        other_user = User.objects.create_user(username="other_user_2", password="password")
        quest = Quest.objects.create(user=other_user, title="Q1", planned_achievement_name="A1", status="completed")
        achievement = Achievement.objects.create(user=other_user, quest=quest, name="A1")

        # Act
        response = api_client.post(f"/api/achievements/{achievement.id}/regenerate_image/")

        # Assert
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test__regenerate_image__when_generation_fails__returns_500(self, api_client: Any, user: User) -> None:

        # Arrange
        api_client.force_authenticate(user=user)
        quest = Quest.objects.create(user=user, title="Q1", planned_achievement_name="A1", status="completed")
        achievement = Achievement.objects.create(user=user, quest=quest, name="A1")

        with patch("quests.views.generate_achievement_image") as mock_gen:
            mock_gen.return_value = None

            # Act
            response = api_client.post(f"/api/achievements/{achievement.id}/regenerate_image/")

            # Assert
            assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
            assert "error" in response.data

    def test__regenerate_image__image_exist__replace_existing_image(self, api_client: Any, user: User) -> None:
        # Arrange
        api_client.force_authenticate(user=user)
        quest = Quest.objects.create(user=user, title="Q1", planned_achievement_name="A1", status="completed")
        achievement = Achievement.objects.create(user=user, quest=quest, name="A1")

        initial_content = b"initial_image"
        initial_name = f"achievement_{achievement.id}_{quest.id}.png"
        achievement.image.save(initial_name, ContentFile(initial_content), save=True)

        original_path = achievement.image.name

        with patch("quests.views.generate_achievement_image") as mock_gen:
            mock_gen.return_value = ContentFile(b"new_image_content")

            # Act
            response = api_client.post(f"/api/achievements/{achievement.id}/regenerate_image/")

        # Assert
        assert response.status_code == status.HTTP_200_OK
        achievement.refresh_from_db()
        assert achievement.image.name == original_path
