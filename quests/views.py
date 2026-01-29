from typing import Any
from rest_framework import viewsets, status, decorators
from rest_framework.response import Response
from django.utils import timezone
from django.db.models.query import QuerySet
from .models import Quest, Achievement
from .serializers import QuestSerializer, AchievementSerializer


class QuestViewSet(viewsets.ModelViewSet):
    serializer_class = QuestSerializer
    DEFAULT_DURATION_MINUTES = 60

    def get_queryset(self) -> QuerySet[Quest]:
        # Каждый пользователь видит только свои квесты
        return Quest.objects.filter(user=self.request.user)

    @decorators.action(detail=True, methods=["post"])
    def start(self, request: Any, pk: Any = None) -> Response:
        quest = self.get_object()
        if quest.status != "created":
            return Response({"error": "Quest is already started or finished"}, status=status.HTTP_400_BAD_REQUEST)

        # Устанавливаем статус и время (например, на 24 часа, если не передано иное)
        duration_minutes = request.data.get("duration_minutes", self.DEFAULT_DURATION_MINUTES)
        quest.status = "active"
        quest.start_time = timezone.now()
        quest.end_time = quest.start_time + timezone.timedelta(minutes=int(duration_minutes))
        quest.save()

        return Response(QuestSerializer(quest).data)

    @decorators.action(detail=True, methods=["post"])
    def complete(self, request: Any, pk: Any = None) -> Response:
        quest = self.get_object()

        # Проверяем "лениво", не истек ли квест прямо сейчас
        if quest.is_expired:
            quest.status = "failed"
            quest.save()
            return Response({"error": "Quest time has expired"}, status=status.HTTP_400_BAD_REQUEST)

        if quest.status != "active":
            return Response({"error": "Quest must be active to complete"}, status=status.HTTP_400_BAD_REQUEST)

        quest.status = "completed"
        quest.save()

        # Маппинг сложности квеста в редкость ачивки
        difficulty_to_rarity = {
            "easy": "bronze",
            "medium": "silver",
            "hard": "gold",
            "insane": "diamond",
        }
        rarity = difficulty_to_rarity.get(quest.difficulty, "silver")

        # Создаем ачивку с учетом редкости
        Achievement.objects.create(user=request.user, quest=quest, name=quest.planned_achievement_name, rarity=rarity)

        return Response(QuestSerializer(quest).data)

    @decorators.action(detail=True, methods=["post"])
    def restart(self, request: Any, pk: Any = None) -> Response:
        quest = self.get_object()
        if quest.status != "failed":
            return Response({"error": "Only failed quests can be restarted"}, status=status.HTTP_400_BAD_REQUEST)

        quest.status = "created"
        quest.start_time = None
        quest.end_time = None
        quest.save()

        return Response(QuestSerializer(quest).data)


class AchievementViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AchievementSerializer

    def get_queryset(self) -> QuerySet[Achievement]:
        return Achievement.objects.filter(user=self.request.user)
