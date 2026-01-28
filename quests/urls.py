from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import QuestViewSet, AchievementViewSet

router = DefaultRouter()
router.register(r"quests", QuestViewSet, basename="quest")
router.register(r"achievements", AchievementViewSet, basename="achievement")

urlpatterns = [
    path("", include(router.urls)),
]
