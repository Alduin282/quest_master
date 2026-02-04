import logging
import os
from typing import Any
from rest_framework import viewsets, status, decorators
from rest_framework.response import Response
from django.utils import timezone
from django.db.models.query import QuerySet
from .models import Quest, Achievement
from .serializers import QuestSerializer, AchievementSerializer
import random
from .image_generator import generate_achievement_image

logger = logging.getLogger(__name__)


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
        achievement = Achievement.objects.create(
            user=request.user, quest=quest, name=quest.planned_achievement_name, rarity=rarity
        )

        image_generated = False
        try:
            image_content = generate_achievement_image(
                quest_title=quest.title,
                quest_description=quest.description,
                achievement_name=quest.planned_achievement_name,
            )
            if image_content:
                # Сохраняем изображение с уникальным именем
                filename = f"achievement_{achievement.id}_{quest.id}.png"
                achievement.image.save(filename, image_content, save=True)
                image_generated = True
        except Exception as e:
            # Логируем ошибку, но не прерываем создание достижения
            logger.error(f"Failed to generate image for achievement {achievement.id}: {e}")

        return Response({"quest": QuestSerializer(quest).data, "image_generated": image_generated})

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

    @decorators.action(detail=True, methods=["post"])
    def regenerate_image(self, request: Any, pk: Any = None) -> Response:
        achievement = self.get_object()
        quest = achievement.quest

        try:
            new_seed = random.randint(1, 10000)
            image_content = generate_achievement_image(
                quest_title=quest.title,
                quest_description=quest.description,
                achievement_name=achievement.name,
                seed=new_seed,
            )

            if image_content:
                self._save_image(achievement, image_content)
                return Response(AchievementSerializer(achievement, context={"request": request}).data)
            else:
                logger.error(f"REGENERATE: Image generator returned None for achievement {achievement.id}")
                return Response({"error": "Failed to generate image"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        except Exception as e:
            logger.error(f"Error regenerating image for achievement {achievement.id}: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def _save_image(self, achievement: Achievement, image_content: bytes) -> None:
        if achievement.image:
            self._replace_existing_image(achievement, image_content)
        else:
            filename = f"achievement_{achievement.id}_{achievement.quest.id}.png"
            achievement.image.save(filename, image_content, save=True)

    def _replace_existing_image(self, achievement: Achievement, image_content: bytes) -> None:
        full_name = achievement.image.name
        existing_filename = os.path.basename(full_name)

        if achievement.image.storage.exists(full_name):
            achievement.image.storage.delete(full_name)
        achievement.image.save(existing_filename, image_content, save=True)
