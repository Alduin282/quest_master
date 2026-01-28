from django.contrib import admin
from .models import Quest, Achievement


@admin.register(Quest)
class QuestAdmin(admin.ModelAdmin):
    list_display = ("title", "user", "status", "start_time", "end_time", "planned_achievement_name")
    list_filter = ("status", "user")
    search_fields = ("title", "description")


@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ("name", "user", "quest", "awarded_at")
    list_filter = ("user",)
    search_fields = ("name",)
