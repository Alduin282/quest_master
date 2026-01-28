from typing import Any
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Quest, Achievement


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]


class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = ["id", "name", "icon_key", "awarded_at", "quest"]


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
