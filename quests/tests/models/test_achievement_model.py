import pytest
from django.contrib.auth.models import User
from quests.models import Quest, Achievement


@pytest.mark.django_db
def test__achievement_creation__when_valid_data__creates_with_correct_defaults(user: User) -> None:
    # Arrange
    quest = Quest.objects.create(
        user=user, title="Source Quest", planned_achievement_name="Epic Award", status="completed"
    )

    # Act
    achievement = Achievement.objects.create(user=user, quest=quest, name=quest.planned_achievement_name)

    # Assert
    assert achievement.name == "Epic Award"
    assert achievement.quest == quest
    assert achievement.icon_key == "star"
    assert achievement.user == user
