from typing import Any
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Quest, Achievement


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]


class AchievementSerializer(serializers.ModelSerializer):
    quest_title = serializers.CharField(source="quest.title", read_only=True)
    quest_description = serializers.CharField(source="quest.description", read_only=True)

    class Meta:
        model = Achievement
        fields = ["id", "name", "icon_key", "awarded_at", "quest", "quest_title", "quest_description", "rarity"]


class QuestSerializer(serializers.ModelSerializer):
    achievement = AchievementSerializer(read_only=True)
    is_active_expired = serializers.BooleanField(read_only=True, source="is_expired")

    class Meta:
        model = Quest
        fields = [
            "id",
            "title",
            "description",
            "planned_achievement_name",
            "difficulty",
            "status",
            "start_time",
            "end_time",
            "created_at",
            "achievement",
            "is_active_expired",
        ]
        read_only_fields = ["status", "start_time", "end_time", "created_at"]

    def create(self, validated_data: dict[str, Any]) -> Quest:
        # Автоматически привязываем квест к текущему пользователю
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)
